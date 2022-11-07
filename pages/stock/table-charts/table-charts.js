// 重置数据
function resetData(self) {
	for (let item in self.baseData) {
		self.baseData[item] = []
	}
}

export default {
	getBaseData(self) {
		resetData(self)
		let codeData = self.allChartsTableData.codeDataList[0].data.codeData
		let tableData = []
		let unit = ''
		if (codeData && codeData.length > 0) {
			if (self.chartsInfo.unit) {
				unit = '(' + self.chartsInfo.unit + ')'
			}
			let formulaData = codeData[0].slice(1)
			formulaData.forEach((item, index) => {
				formulaData[index] = item + unit
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


			tableData.forEach(item => {
				item.forEach((data, index) => {
					self.baseData.tableData[index].push(Number(Number(data).toFixed(2)))
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
			let tempChartsData = JSON.parse(JSON.stringify(self.chartsData_beforeConver))
			self.chartsData = tempChartsData
			// pass
		} else if (type === 'annualized') {
			let tempChartsData = JSON.parse(JSON.stringify(self.chartsData_beforeConver))
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
			let tempChartsData_after = JSON.parse(JSON.stringify(self.chartsDataOri))
			let tempChartsData_before = JSON.parse(JSON.stringify(self.chartsDataOri))
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
			// 筛选数据、覆盖数据
			self.chartsData = self.chartsDataFilter(tempChartsData_after)
		}






		// self.allDataListAlways.forEach(t => {
		// 	let codeDataFirst = t.data.codeData;
		// 	codeDataFirst.forEach(itemArr => {
		// 		//排除指标行
		// 		if (itemArr[0] != 'Time') {
		// 			//拿到时间
		// 			let splitDate = itemArr[0].split('-');
		// 			if (splitDate.length >= 2) {
		// 				splitDate = splitDate[1];
		// 			}
		// 			//确定倍数
		// 			let doublevalue = splitDate == 3 ? 4.00 : splitDate == 6.00 ? 2 : splitDate == 9 ?
		// 				4 /
		// 				3 : 1;
		// 			if (doublevalue != 1) {
		// 				itemArr.forEach((value, index) => {
		// 					//首个是时间，排除掉,值为空或0不计算
		// 					if (index > 0 && value != null && value != '' && value != '0' &&
		// 						value != '0.0000') {
		// 						let decimalNumber = value.indexOf('.') == -1 ? 0 : self
		// 							.decimalNumber;
		// 						if (decimalNumber == 0) {
		// 							console.log(value)
		// 						}
		// 						itemArr[index] = (parseFloat(value) * doublevalue).toFixed(
		// 							decimalNumber)
		// 					}
		// 				})
		// 			}
		// 		}
		// 	})
		// })
		// return self.allDataListAlways
	}
}
