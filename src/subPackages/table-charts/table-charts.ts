import util from '@/common/util'
import type { TableCharts } from '@/types/TableCharts'
// 重置数据
function resetData(self: any) {
	for (let item in self.baseData) {
		self.baseData[item] = []
	}
}



// 获取单位名称
function getUnitName(indexList, index) {
	// 定义一些常量
	const PERCENTAGE = '百分比'
	const ORIGINAL_VALUE = '原始值'
	let unit = ''
	try {
		if (index < indexList.length && indexList[index].unitName) {
			unit = indexList[index].unitName // 获取单位名称
			if (unit == PERCENTAGE) {
				unit = '%'
			} else if (unit == ORIGINAL_VALUE) {
				unit = ''
			}
			if (unit) {
				unit = '(' + unit + ')' // 单位加括号
			}
		}
	} catch (e) {
		console.log(e)
	}
	return unit
}

// 处理空值
function handleEmptyValue(data: any, nullIndex: string[], index: number) {
	const EMPTY_VALUE = '--'
	if (nullIndex.includes(typeof (index) == 'string' ? index : index.toString())) { // 如果是虚指标，用空字符串代替
		data = ''
	} else if (data == null || data == '') { // 如果是空值，用'--'代替
		data = EMPTY_VALUE
	} else { // 否则，保留两位小数并转换为数字类型
		data = Number(Number(data).toFixed(2))
	}
	return data
}

export default {
	getBaseData(self: TableCharts.Data) {
		resetData(self)
		// 如果没有数据，直接返回
		if (self.allChartsTableData_origin.length == 0) return
		// 从数据中筛选出当前对比公司的数据
		let codeData: any[] = [] // 当前公司的数据
		let nullIndex: any[] = [] // 虚指标
		self.allChartsTableData_origin.codeDataList.forEach((item: any, index: number) => {
			if (item.code == self.curSelectCompany) {
				codeData = item.data.codeData // 找到当前公司的数据
			}
		})

		if (codeData && codeData.length > 0) {
			let formulaData = codeData[0].slice(2) // 公式数据，去掉第一个元素（时间）和第二个元素（cType）
			self.baseData.codeData = codeData.slice(1) // 更新基础数据的公司数据
			formulaData.forEach((item: any, index: number) => {
				let unit = getUnitName(self.chartsInfo.reportChartsIndexList, index) // 获取单位名称
				if (self.chartsInfo.reportChartsIndexList[index] && self.chartsInfo.reportChartsIndexList[index].linkKey) {
					formulaData[index] = item + unit // 公式数据加上单位
				} else {
					// nullIndex.push(index) // 如果没有linkKey，说明是虚指标，记录下标
				}
			})
			self.baseData.formulaData = formulaData // 更新基础数据的公式数据
			// 初始化数据
			self.baseData.formulaData.forEach((item: any, index: number) => {
				self.baseData.tableData[index] = [] // 基础数据的表格数据按照公式数据的长度初始化为空数组
			})
			codeData.slice(1).forEach((item, index) => { // 遍历除了公式数据之外的其他数据（时间和数值）
				self.baseData.timeData.push({
					name: item[0],
					type: item[1]
				}) // 将时间数据添加到基础数据的时间数据中
				let tableRow = item.slice(2) // 表格的一行数据，去掉时间和cType
				if (tableRow.length == 0) { // 如果表格的一行数据为空，说明没有数值，需要用null填充
					for (let i in self.baseData.formulaData) { // 按照公式数据的长度填充null
						tableRow.push(null)
					}
				}
				tableRow.forEach((data: any[], index: number) => { // 遍历表格的一行数据
					data = handleEmptyValue(data, nullIndex, index) // 处理空值
					self.baseData.tableData[index].push(data) // 将处理后的数据添加到基础数据的表格数据中
				})
			})
		}
	},
	/**
	 * description: 获取默认图表的展现形式
	 * @param {object} _this - vue实例.
	 * @createTime: 2022-10-8 17:19:19
	 */
	getDefaultTableType(_this: TableCharts.Data) {
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
	handleAnnualized(self: TableCharts.Data, type: string) {
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
	updateOptions(self: TableCharts.Datav) {
		self.option.xAxis.data = self.chartsData.categories
		self.option.series = self.chartsData.series
		self.$refs['chart'].setOption(self.option)
	},
	/**
	 * description: 更新当前图表类型
	 * @param {object} self - vue实例.
	 * @createTime: 2022-10-18 11:13:22
	 */
	setChartType(self: TableCharts.Data, type = 'init') {
		switch (self.chartsShowType) {
			case 'line':
				self.option.series.forEach((item, index, arr) => {
					arr[index].type = 'line'
				})
				break
			case 'bar':
				self.option.series.forEach((item, index, arr) => {
					arr[index].type = 'bar'
					arr[index].stack = ''
				})
				break
			case 'stack':
				self.option.series.forEach((item, index, arr) => {
					arr[index].type = 'bar'
					arr[index].stack = 'stack'
				})
				break
		}
		if (type === 'update') {
			self.$refs['chart'].setOption(self.option)
		}
	},
	// 获取无指标id的指标名所对应的index数组
	getNotIdIndex(self: TableCharts.Data) {
		self.notIdIndex = []
		if (self.chartsInfo.reportChartsIndexList.length > 0) {
			self.chartsInfo.reportChartsIndexList.forEach((item, index) => {
				if (!item.fieldId) {
					self.notIdIndex.push(index)
				}
			})
		} else if (self.chartsInfo.reportStandardIndexList.length > 0) {
			self.chartsInfo.reportStandardIndexList.forEach((item, index) => {
				if (!item.fieldId) {
					self.notIdIndex.push(index)
				}
			})
		}
	},
	// 设置Code页面类型的图表数据和表格标题
	setCodeChartData(self: TableCharts.Data) {
		let series: any[] = []
		let res = {}
		let { tableData, timeData } = this.getTableDataByReportType(self)
		self.baseData.formulaData.forEach((item, index) => {
			series.push({
				name: item,
				data: tableData[index],
				label: {
					formatter: function (param: any) {
						return util.dataFormat(param.value, 2)
					},
				},
			})
		})
		res = {
			categories: timeData,
			series: series,
		}
		let stockName = self.$store.state.curCmpList.find((item) => {
			return item.comp004_Seccode === self.curSelectCompany
		})
		self.fstTableTh = stockName != -1 ? stockName.comp004_OrgName : self.curStock.secName
		return res
	},

	// 设置Formula页面类型的图表数据和表格标题
	setFormulaChartData(self: TableCharts.Data) {
		let series = []
		let res = {}
		let { tableData, timeData } = this.getTableDataByReportType(self)
		// 只取第一个公式数据作为图表数据和表格标题
		series.push({
			name: self.curStock.secName,
			data: tableData[0],
			label: {
				formatter: function (param) {
					return util.dataFormat(param.value, 2)
				},
			},
		})
		self.fstTableTh = self.baseData.formulaData[0]
		res = {
			categories: timeData,
			series: series,
		}
		return res
	},

	// 判断是否需要显示滚动条
	isScrollShow(self: TableCharts.Data) {
		if (self.chartsData.series.length > 0 && self.chartsData.series[0].data.length <= self.opts.xAxis.itemCount) {
			return false
		} else {
			return true
		}
	},
	// 移除不需要显示的指标
	removeNotIdIndex(self: TableCharts.Data) {
		let series_chartsData = self.chartsData.series
		let series_option = []
		for (let i = 0; i < series_chartsData.length; i++) {
			if (!self.notIdIndex.includes(i)) {
				series_option.push(series_chartsData[i])
			} else {
				series_chartsData[i].data.forEach((dataItem, dataIndex, dataArr) => {
					dataArr[dataIndex] = ''
				})
			}
		}
		self.option.series = series_option
	},
	// 筛选并返回当前已选择的报表类型
	getCurSelectReportTypeList(self: TableCharts.Data) {
		return self.financialReportType.filter((item) => item.checked == true)
	},
	// 根据已选择的报告类型，从timeData中筛选出对应的时间数据
	getTimeDataByReportType(self: TableCharts.Data) {
		let reportTypeList = this.getCurSelectReportTypeList(self)
		let timeData: any[] = []
		self.baseData.timeData.forEach((timeDataItem: any, index: number) => {
			reportTypeList.forEach((typeListItem: any) => {
				if (timeDataItem.type == typeListItem.value) {
					timeData.push(timeDataItem)
				}
			})
		})
		return timeData
	},
	// 从tableData和timeData中，根据当前已选择的报告类型，筛选出对应的数据
	getTableDataByReportType(self: TableCharts.Data) {
		let curSelectReportTypeList = this.getCurSelectReportTypeList(self)
		let curReportTypeIndex: any[] = []
		let timeData: any[] = []
		let tableData: any[] = []
		// 根据已选择的报告类型，从timeData中筛选出对应的下标
		self.baseData.timeData.forEach((timeDataItem: any, index: number) => {
			curSelectReportTypeList.forEach(typeListItem => {
				if (timeDataItem.type == typeListItem.value) {
					curReportTypeIndex.push(index)
					timeData.push(timeDataItem)
				}
			})
		})
		// 然后根据下标，从tableData中筛选出对应的数据
		// 将所有指标对应的数据进行筛选
		self.baseData.tableData.forEach((item: any, index: number) => {
			let tempData: any[] = []
			curReportTypeIndex.forEach((item2) => {
				tempData.push(item[item2]);
			});
			tableData.push(tempData)
		})
		return { tableData, timeData }
	},
	// 根据类型数字返回对应的报表类型文本
	getCTypeText(type: string) {
		let result = ''
		switch (type) {
			case '1':
				result = '合并报表(调整后)'
				break
			case '2':
				result = '合并报表(调整前)'
				break
			case '3':
				result = '母公司报表(调整后)'
				break
			case '4':
				result = '母公司报表(调整前)'
				break
			default:
				result = ''
		}
		return result
	},
}
