import util from '@/common/util.js'
import { log } from 'console'
// 重置数据
function resetData(self) {
	for (let item in self.baseData) {
		self.baseData[item] = []
	}
}

export default {
	getBaseData(self) {
		resetData(self)
		// 从数据中筛选出当前对比公司的数据
		let codeData = []
		let nullIndex = [] // 虚指标
		if(self.allChartsTableData.length == 0) return
		self.allChartsTableData.codeDataList.forEach((item, index) => {
			if(item.code == self.curSelectCompany) {
				codeData = item.data.codeData
			}
		})
		// let codeData = self.allChartsTableData.codeDataList[tarIndex].data.codeData
		let tableData = []
		// let unionUnit = self.chartsInfo.unit
		// let unit = ''
		if (codeData && codeData.length > 0) {
			let formulaData = codeData[0].slice(1)
			// if(unionUnit) unit = `(${unionUnit})`
			
			
			formulaData.forEach((item, index) => {
				let unit = ''
				// if(!unionUnit && self.chartsInfo.reportChartsIndexList[index].unitName) {
				try {
					if(index < self.chartsInfo.reportChartsIndexList.length && self.chartsInfo.reportChartsIndexList[index].unitName) {
						unit = self.chartsInfo.reportChartsIndexList[index].unitName
						if(unit == '百分比') {
							unit = '%'
						} else if(unit == '原始值') {
							unit = ''
						}
						if (unit) {
							unit = '(' + unit + ')'
						}						
					}					
				} catch(e) {
					console.log(e)
				}
				if(self.chartsInfo.reportChartsIndexList[index].linkKey) {
					formulaData[index] = item + unit
				} else {
					nullIndex.push(index)
				}
			})
			self.baseData.formulaData = formulaData
			// 初始化数据
			self.baseData.formulaData.forEach((item, index) => {
				self.baseData.tableData[index] = []
			})
			codeData.slice(1).forEach((item, index) => {
				self.baseData.timeData.push(item[0])
				tableData.push(item.slice(1))
			})
			// 如果有长度为0的成员，则依据指标长度，将其全部置空
			tableData.forEach((item, index) => {
				if(item.length == 0) {
					for(let i in self.baseData.formulaData) {
						item.push(null)
					}
				}
			})

			tableData.forEach(item => {
				item.forEach((data, index) => {
					let result = nullIndex.find((item) => {
						return item == index
					})
					if(result!=undefined) {
						self.baseData.tableData[index].push('')
					} else if(data == null || data == '') {
						self.baseData.tableData[index].push('--')
					} else {
						self.baseData.tableData[index].push(Number(Number(data).toFixed(2)))
					}
				})
			})
			// console.dir(self.baseData.formulaData)
		}
	},
	/**
	 * description: 获取默认图表的展现形式
	 * @param {object} _this - vue实例.
	 * @createTime: 2022-10-8 17:19:19
	 */
	getDefaultTableType(_this) {
		if (!_this.chartsInfo.displayed) {
			return
		}
		switch (_this.chartsInfo.displayed) {
			case '图':
				_this.curSelect = 0
				break
			case '表':
				_this.curSelect = 1
				break
			case '图表':
				_this.curSelect = 2
				break
			default:
				_this.curSelect = 0
		}
	},
	/**
	 * description: 年化、单季化处理
	 * @param {object} self - vue实例.
	 * @param {string} type - 处理类型
	 * @createTime: 2022-10-12 16:37:07
	 */	
	handleAnnualized(self, type) {
		if (type === 'restore') {
			let tempChartsData = util.deepCopy(self.chartsData_beforeConver)
			self.chartsData = tempChartsData
			// pass
		} else if (type === 'annualized') {
			let tempChartsData = util.deepCopy(self.chartsData_beforeConver)
			tempChartsData.categories.forEach((item, categoriesIndex) => {
				//拿到时间
				let splitDate = item.split('-');
				if (splitDate.length >= 2) {
					splitDate = splitDate[1];
				}
				//确定倍数
				let doublevalue = splitDate == 3 ? 4.00 : splitDate == 6.00 ? 2 : splitDate == 9 ?
					4 /
					3 : 1;
				if (doublevalue != 1) {
					tempChartsData.series.forEach((seriesItem, seriesIndex, seriesArr) => {
						let item = tempChartsData.series[seriesIndex].data[categoriesIndex]
						if (item > 0 && item != null && item != '' && item != '0' &&
							item != '0.0000') {
							tempChartsData.series[seriesIndex].data[categoriesIndex] = (parseFloat(
								item) * doublevalue).toFixed(2)
						}
					})
				}
			})
			self.chartsData = tempChartsData
		} else if (type === 'quarterly') {
			let tempChartsData_after = util.deepCopy(self.chartsDataOri)
			let tempChartsData_before = util.deepCopy(self.chartsDataOri)
			tempChartsData_after.categories.forEach((item, categoriesIndex) => {
				//拿到时间
				let splitDate = item.split('-');
				let year = splitDate[0]
				if (splitDate.length >= 2) {
					splitDate = splitDate[1];
				}
				//一季度数据不计算
				if (splitDate != 3) {
					let beforeArr = tempChartsData_before.categories[categoriesIndex - 1]
					//当前年度和上一数据年度不一致，说明没有上一个季度数据无法被季化
					if (beforeArr.split('-')[0] != year && self.notQuarterly.indexOf(item) == -1) {
						self.notQuarterly.push(item)
						return;
					}
					//先用原始数据季化
					tempChartsData_after.series.forEach((seriesItem, seriesIndex, seriesArr) => {
						let beforeValue = tempChartsData_before.series[seriesIndex].data[
							categoriesIndex - 1]
						let value = tempChartsData_after.series[seriesIndex].data[categoriesIndex]
						//都为空时不处理，直接按空算
						if ((value == null || value == '') && (beforeValue == null || beforeValue ==
								''))
							return;
						//单个数据为空时按0算
						if (value == null || value == '')
							value = '0.00'
						if (beforeValue == null || beforeValue == '')
							beforeValue = '0.00'
						let decimalNumber = value.toString().indexOf('.') == -1 ? 0 : 2;
						tempChartsData_after.series[seriesIndex].data[categoriesIndex] = Number((
							parseFloat(value) - parseFloat(beforeValue)).toFixed(
							decimalNumber))
					})
				}
			})
			// 筛选数据、覆盖数据。
			self.chartsData = self.chartsDataFilter(tempChartsData_after)
			// 还原为当前选择的图表类型
			self.chartsData.series.forEach((item, index, arr) => {
				arr[index].type = self.chartsShowType
			})
		}
		this.updateOptions(self)
	},
		updateOptions(self) {
				self.option.xAxis.data = self.chartsData.categories
				self.option.series = self.chartsData.series
				self.$refs['chart'].setOption(self.option)
		},
	/**
	 * description: 更新当前图表类型
	 * @param {object} self - vue实例.
	 * @createTime: 2022-10-18 11:13:22
	 */			
		setChartType(self, type='init') {
			switch(self.chartsShowType) {
				case 'line':
					self.option.series.forEach((item, index, arr) =>{
						arr[index].type = 'line'
					})
				break
				case 'bar':
					self.option.series.forEach((item, index, arr) =>{
						arr[index].type = 'bar'
						arr[index].stack = ''
					})
					break
				case 'stack':
					self.option.series.forEach((item, index, arr) =>{
						arr[index].type = 'bar'
						arr[index].stack = 'stack'
					})
				break
			}
			if(type === 'update') {
				self.$refs['chart'].setOption(self.option)
			}
		},
		// 获取无指标id的指标名所对应的index数组
		getNotIdIndex(self) {
			self.notIdIndex = []
			if(self.chartsInfo.reportChartsIndexList.length > 0) {
				self.chartsInfo.reportChartsIndexList.forEach((item, index) => {
					if(!item.fieldId) {
						self.notIdIndex.push(index)
					}
				})
			} else if(self.chartsInfo.reportStandardIndexList.length > 0) {
				self.chartsInfo.reportStandardIndexList.forEach((item, index) => {
					if(!item.fieldId) {
						self.notIdIndex.push(index)
					}
				})	
			}
		}
}
