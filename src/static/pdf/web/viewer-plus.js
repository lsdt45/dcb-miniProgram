var $ = mdui.$;

window.onload = () => {
	let url = window.location.href;
	let siteInfo = getAddress();
	let token = getQueryVariable('auth')
	let param = {
		NodeId: "20200824151057501100",
		TaskId: "20220510172305566001",
	}

	let pdfViewer = $('.pdfViewer');
	pdfViewer.on('click', () => {
		if ($('.tab-bar')[0].className.indexOf('show') != -1) {
			$('.tab-bar')[0].classList.remove('show');
		} else {
			$('.tab-bar')[0].classList.add('show');
		}
	})
	window.history.pushState({ page: 1 }, "title", "#");
	setTimeout(() => {
		window.addEventListener('popstate', function (e) {
			console.log('popstate')
			wx.miniProgram.navigateBack();
		}, 10);
	})
	// 返回按钮，点击返回小程序
	// let backBtn = document.querySelector('#goback')
	// backBtn.addEventListener('click', () => {
	// wx.miniProgram.navigateTo({
	//     url: '/pages/stock-market/stock-market',
	//     success: (resp) => {
	//         console.log('跳转成功')
	//     }
	// })
	// wx.miniProgram.switchTab({
	//     url: '/pages/stock/pdf-report',
	//     success: (resp) => {
	//         console.log('跳转成功')
	//     },
	//     fail: (err) => {
	//         console.log('跳转失败');
	//         console.log(err);
	//     }
	// })        
	// })

}

window.onmessage = function (event) {
	if (
		event.data &&
		typeof event.data === 'string' &&
		window.self !== window.top
	) {
		console.log(event.data);
	}
}

function getAddress() {
	let siteInfo = {}
	if (returnCitySN) {
		siteInfo.LoginIP = returnCitySN['cip']
		siteInfo.LoginCName = returnCitySN['cname']
		//防止地址太具体
		if (siteInfo.LoginCName.indexOf('省') != -1) {
			siteInfo.LoginCName = siteInfo.LoginCName.substring(0, siteInfo.LoginCName.indexOf('省') + 1)
		} else if (siteInfo.LoginCName.indexOf('市') != -1) {
			siteInfo.LoginCName = siteInfo.LoginCName.substring(0, siteInfo.LoginCName.indexOf('市') + 1)
		} else if (siteInfo.LoginCName.indexOf('自治区') != -1) {
			siteInfo.LoginCName = siteInfo.LoginCName.substring(0, siteInfo.LoginCName.indexOf('自治区') + 3)
		} else if (siteInfo.LoginCName.indexOf('行政区') != -1) {
			siteInfo.LoginCName = siteInfo.LoginCName.substring(0, siteInfo.LoginCName.indexOf('行政区') + 3)
		}
	}
	return siteInfo;
}

// 获取查询字符串
function getQueryVariable(variable) {
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		if (pair[0] == variable) { return pair[1]; }
	}
	return (false);
}

const main = {
	data() {
		return {
			test: 'hello vue',
			chartsId: '',
			dialogVisible: false,
			isShowOutlineDialog: false, // 是否显示目录对话框
			isShowHistoryDialog: false, // 是否显示历史报告对话框
			isShowGuideDialog: false, // 是否显示分析指南弹窗
			isShowCompareDialog: false, // 是否显示对比公司弹窗
			isLogin: 'false', // 是否登录，字符串类型
			isAdd: false, // 当前股票是否已加入自选股
			rptGuideData: {}, // 报告导读数据
			rptCatalog: {}, // 报告导读目录
			token: '', // 认证用token
			taskId: '',
			templateId: '', // 模板id
			// 目标股票信息
			targetStock: {
				code: '',
				name: ''
			},
			helpMsg: '', // 分析指南文本
			historyRpt: [], // 历史报告
			historyTitle: '', // 历史报告弹窗标题
			historyIcon: '', // 历史报告页面右侧的图标类型
			pageNumData: [], // 匹配页码数据
			optionalStockList: [], // 自选股列表
			curPage: '', // 当前页数
			curStock: {
				secName: '',
				secCode: ''
			},
			compareList: [], // 对比公司
			mainReport: {
				stockName: '',
				stockCode: '',
				nodeId: '',
				taskId: ''
			},
			newPdfUrl: '', // 新pdf的文件路径
			preUrl: 'https://ducaibao.com.cn/test/wxapp/beta/pdf/web/viewer.html?file=', // pdf预览器
			apiUrl: 'https://dev.ducaibao.cn',
			loading: false, // 正在加载
		}
	},
	computed: {
		customClass() {
			if (this.dialogVisible) {
				return 'show'
			} else {
				return ''
			}
		},
		outlineDialogClass() {
			if (this.isShowOutlineDialog) {
				return 'dialog show'
			} else {
				return 'dialog'
			}
		},
		historyDialogClass() {
			if (this.isShowHistoryDialog) {
				return 'dialog show'
			} else {
				return 'dialog'
			}
		},
		guideDialogClass() {
			if (this.isShowGuideDialog) {
				return 'dialog show'
			} else {
				return 'dialog'
			}
		},
		compareDialogClass() {
			if (this.isShowCompareDialog) {
				return 'dialog show'
			} else {
				return 'dialog'
			}
		},
		// 股票全名，包括当前报告名 
		stockFullName() {
			return this.curStock.secName + "(" + this.curStock.secCode + ")" + " " + this.curStock.year + '年' + this.curStock.fileName

		},
		stockName() {
			return this.curStock.secName + "(" + this.curStock.secCode + ")"
		},
		historyStockName() {
			return (item) => {
				return item.year + '年' + item.name
			}
		},
		// 对比公司列表右侧图表样式
		compareItemIconTypeClass() {
			return (item) => {
				let className = item.isMain ? 'company-main' : 'company-compare'
				return className
				// if(name == this.curStock.secName) {
				//     return className + ' ' + 'selected'
				// } else {
				//     return className
				// }
			}
		},
		// 对比公司列表选中样式
		compareItemTypeClass() {
			return (item) => {
				let index = item.name.indexOf('(')
				let name = item.name.slice(0, index)
				return name == this.curStock.secName ? 'selected' : ''
			}
		},
		// 返回匹配目录的页码
		matchPage() {
			return (index) => {
				if (this.pageNumData.length > 0) {
					return this.pageNumData[index].matchPage
				}
			}
		}
	},
	methods: {
		// 初始化参数
		initData() {
			this.curStock.secName = decodeURI(getQueryVariable('name'))
			this.curStock.secCode = getQueryVariable('code')
			this.token = getQueryVariable('auth')
			this.nodeId = getQueryVariable('nodeid')
			this.taskId = getQueryVariable('taskid')
			this.curPage = getQueryVariable('page')
			this.isLogin = getQueryVariable('login')
			this.templateId = getQueryVariable('templateId')
			this.mainReport.stockName = decodeURI(getQueryVariable('mainName'))
			this.mainReport.stockCode = getQueryVariable('mainCode')
			this.mainReport.nodeId = getQueryVariable('mainNodeid')
			this.mainReport.taskId = getQueryVariable('mainTaskid')
			this.chartsId = getQueryVariable('chartsId')
			// 初始化对比公司列表 start
			this.oriCompareList = getQueryVariable('compareList')
			this.compareList = decodeURI(getQueryVariable('compareList')).split(',')
			this.browserName = getQueryVariable('browserName')
			let newArr = []
			this.compareList.forEach((item, index, arr) => {
				let result = item.indexOf(this.mainReport.stockCode)
				newArr.push({
					name: item,
					isMain: result != -1 ? true : false
				})
			})
			this.compareList = newArr
			// 初始化对比公司列表 end
			if (this.curPage != '-1') {
				$("#initPage")[0].innerHTML = this.curPage
			} else {
				$("#initPage")[0].innerHTML = 1
			}

			$("#changePage")[0].click();

			this.getOptionalStock();
			this.back()
		},
		// 返回到之前的页面
		back() {
			let backFun = () => { }
			let self = this
			if (this.browserName) {
				backFun = this.backToBrowser
			} else {
				backFun = this.backToMiniProgram
			}
			document.addEventListener('UniAppJSBridgeReady', function () {
				// uni.postMessage({
				// 	data: {
				// 		content: 'hello world'
				// 	}
				// });
				uni.getEnv(function (res) {
					console.log('当前环境：' + JSON.stringify(res));
				});
				document.querySelector('#goback').addEventListener('click', function (evt) {
					self.postMessage('switchTab', '/pages/stock/pdf-report')
					// let target = evt.target
					// if(target.tagName == 'BUTTON') {
					// 	let action = target.getAttribute('data-action')
					// 	uni.webView.navigateTo({
					// 		url: '/pages/stock/pdf-report',
					// 	})
					// }
				});
			});



			// // 返回按钮，点击返回小程序
			// let backBtn = document.querySelector('#goback')
			// let backFun = () => { }
			// // 根据url中是否有browserName来决定返回的页面
			// if (this.browserName) {
			// 	backFun = this.backToBrowser
			// } else {
			// 	backFun = this.backToMiniProgram
			// }
			// backBtn.addEventListener('click', backFun)
		},
		// 返回小程序
		backToMiniProgram() {
			wx.miniProgram.switchTab({
				url: '/pages/stock/pdf-report',
				success: (resp) => {
					console.log('跳转成功')
				},
				fail: (err) => {
					console.log('跳转失败');
					console.log(err);
				}
			})
		},
		// 返回浏览器之前的页面
		backToBrowser() {
			uni.navigateTo({
				url: '/pages/stock/pdf-report',
			})
			// uni.navigateBack({
			//     delta: 2
			// })
		},
		postMessage(action, url) {
			window.parent.postMessage({ action, url }, '*')
		},
		showOutline() {
			this.isShowOutlineDialog = true
		},
		showHistory() {
			this.isShowHistoryDialog = true
		},
		showGuide() {
			this.isShowGuideDialog = true
		},
		showCompareIndustry() {
			this.isShowCompareDialog = true
		},
		closeDialog(type) {
			if (type === 'outline') {
				this.isShowOutlineDialog = false
			} else if (type === 'history') {
				this.isShowHistoryDialog = false
			} else if (type === 'guide') {
				this.isShowGuideDialog = false
			} else if (type === 'compare') {
				this.isShowCompareDialog = false
			} else if (type === 'all') {
				this.isShowOutlineDialog = false
				this.isShowHistoryDialog = false
				this.isShowGuideDialog = false
				this.isShowCompareDialog = false
			}

		},
		// 页面跳转
		pageTo(nodeId) {
			let param = {
				NodeId: this.getNodeIdById(nodeId),
				TaskId: this.taskId
			}
			this.loading = true;
			$.ajax({
				method: 'POST',
				url: this.apiUrl + '/Report/GetHomeData',
				headers: {
					'Authorization': 'Bearer ' + this.token
				},
				contentType: 'application/json',
				data: JSON.stringify(param),
				success: (resp) => {
					this.loading = false;
					let data = JSON.parse(resp).data
					this.isShowOutlineDialog = false
					this.curPage = data.reportKeyInfoData.matchPage;
					if (this.curPage != '-1') {
						$("#initPage")[0].innerHTML = this.curPage;
					} else {
						$("#initPage")[0].innerHTML = 1;
					}
					$("#changePage")[0].click();
				},
			})

		},
		getNavigJson() {
			let param = {
				Id: this.templateId
			}
			$.ajax({
				method: 'GET',
				url: this.apiUrl + '/Report/GetNavigJsonById',
				headers: {
					'Authorization': 'Bearer ' + this.token
				},
				contentType: 'application/json',
				data: param,
				success: (resp) => {
					this.rptGuideData = JSON.parse(resp).data;
					this.rptCatalog = JSON.parse(this.rptGuideData.navigJson).children;
					this.curStock.year = this.rptGuideData.createTime.split('-')[0]
				},
			})
		},
		// 通过code获取报告的信息
		getRptInfoByCode(code = 0) {
			return new Promise((resolve, inject) => {
				let codeParam = 0
				codeParam = code != 0 ? code : this.curStock.secCode
				let param = {
					Code: codeParam
				}
				$.ajax({
					method: 'POST',
					url: this.apiUrl + '/Report/GetAllReportInfoByCode',
					headers: {
						'Authorization': 'Bearer ' + this.token
					},
					contentType: 'application/json',
					data: JSON.stringify(param),
					success: (resp) => {
						let respData = JSON.parse(resp).data
						this.historyRpt = respData
						resolve()
					},
				})
			})
		},
		// 历史报告跳转
		changeRpt(id) {
			this.taskId = id
			let param = {
				NodeId: this.nodeId,
				TaskId: this.taskId
			}
			$.ajax({
				method: 'POST',
				url: this.apiUrl + '/Report/GetHomeData',
				headers: {
					'Authorization': 'Bearer ' + this.token
				},
				contentType: 'application/json',
				data: JSON.stringify(param),
				success: (resp) => {
					this.newPdfUrl = JSON.parse(resp).data.filePath
					history.pushState({ page: 1 }, null, window.location.href);
					window.open(this.preUrl + this.newPdfUrl + '&auth=' + this.token + '&code=' + this.targetStock.code
						+ '&name=' + this.targetStock.name + '&nodeid=' + this.nodeId + '&mainCode=' + this.mainReport.stockCode
						+ '&mainName=' + this.mainReport.stockName + '&mainNodeid=' + this.mainReport.nodeId + '&mainTaskid=' + this.mainReport.taskId
						+ '&taskid=' + this.taskId + '&login=' + this.isLogin + '&templateId=' + this.templateId + '&compareList=' + this.oriCompareList + '&chartsId=' + this.chartsId + '&browserName=' +
						this.browserName, '_self');
				},
			})
		},
		getGuideText() {
			let param = {
				NodeId: this.nodeId,
				TaskId: this.taskId
			}
			$.ajax({
				method: 'POST',
				url: this.apiUrl + '/Report/GetHomeData',
				headers: {
					'Authorization': 'Bearer ' + this.token
				},
				contentType: 'application/json',
				data: JSON.stringify(param),
				success: (resp) => {
					let data = JSON.parse(resp).data
					this.helpMsg = data.analyseNode.helpMsg
					// this.curStock.fileName = this.formatRptType(data.fileName)
					this.curStock.fileName = data.fileName
					this.curStock.year = data.year

					// 根据当前报告给历史报告列表中匹配的行加上选中的样式
					this.historyRpt.forEach((item, index) => {
						if (item.year == this.curStock.year && item.name == this.curStock.fileName) {
							this.$refs['historyItem' + index].className = 'history-li-select'
						}
					})

					// 给titleBar设上标题
					let titleBarDom = document.querySelector('#titleBar .text')
					titleBarDom.innerText = this.stockFullName
				},
			})
		},
		getNodeIdById(id) {
			let nodeId = null
			// 根据类型提取NodeId，如果有"_"，则只选择前面的部分
			let index = id.indexOf('_')
			if (index === -1) {
				nodeId = id
			} else {
				nodeId = id.slice(0, index)
			}
			return nodeId
		},
		// 添加自选股
		addOptionalStock() {
			let param = {
				Seccode: this.curStock.secCode
			}
			$.ajax({
				method: 'POST',
				url: this.apiUrl + '/Report/AddUserStock',
				headers: {
					'Authorization': 'Bearer ' + this.token
				},
				contentType: 'application/json',
				data: JSON.stringify(param),
				success: (resp) => {
					if (this.isLogin == 'true') {
						let parseResp = JSON.parse(resp);
						if (parseResp.status) {
							ElementPlus.ElMessage({
								message: '已成功添加股票',
								type: 'success',
							})
							this.isAdd = true;
						} else {
							ElementPlus.ElMessage({
								message: '该股票已存在',
								type: 'warning',
							})
						}
					} else {
						wx.miniProgram.navigateTo({
							url: '/pages/ucenter/login?isFromPdf=true',
							success: (resp) => {
								history.pushState({ page: 1 }, null, window.location.href);
								console.log('跳转成功')
							}
						})
						// ElementPlus.ElMessage({
						//     message: '请先登录',
						//     type: 'warning',
						// })                        
					}
				},
			})

		},
		// 跳转到自选股页面
		toOptionalStock() {
			wx.miniProgram.navigateTo({
				url: '/pages/stock/optional-stock',
				success: (resp) => {
					console.log('跳转成功')
				}
			})
		},
		toOptionalStock_1() {
			ElementPlus.ElMessage({
				message: 'success',
				type: 'success',
			})
			wx.miniProgram.switchTab({
				url: '/pages/home/home',
				success: (resp) => {
					console.log('跳转成功')
				},
				fail: (err) => {
					console.log('跳转失败');
					console.log(err);
				}
			})
		},
		// 格式化报告类型名称
		formatRptType(name) {
			let fmtName = ''
			if (name === '第一季度报告') {
				fmtName = '一季报'
			} else if (name === '半年度报告') {
				fmtName = '半年报'
			} else if (name === '第三季度报告') {
				fmtName = '三季报'
			} else if (name === '年度报告') {
				fmtName = '年报'
			}
			return fmtName
		},
		// 获取页码信息
		getReportPageNum() {
			let param = {
				TaskId: this.taskId,
				TemplateId: this.templateId
			}
			$.ajax({
				method: 'POST',
				url: this.apiUrl + '/Report/GetMatchList',
				headers: {
					'Authorization': 'Bearer ' + this.token
				},
				contentType: 'application/json',
				data: JSON.stringify(param),
				success: (resp) => {
					// 处理返回的数据，map化
					let dataMap = new Map()
					let data = JSON.parse(resp).data
					data.forEach(item => {
						dataMap.set(item.id, {
							analyseNodeName: item.analyseNodeName,
							matchPage: item.matchPage
						})
					})
					// 获取匹配的页码
					this.rptCatalog.forEach(item => {
						let id = this.getNodeIdById(item.id)
						let value = dataMap.get(id)
						this.pageNumData.push({
							topic: item.topic,
							matchPage: value.matchPage
						})
					})
				},
			})
		},
		// 获取自选股列表
		getOptionalStock() {
			let param = {}
			$.ajax({
				method: 'POST',
				url: this.apiUrl + '/Report/GetUserStock',
				headers: {
					'Authorization': 'Bearer ' + this.token
				},
				contentType: 'application/json',
				data: JSON.stringify(param),
				success: (resp) => {
					this.optionalStockList = JSON.parse(resp).data
					// 判断当前股票是否已经添加至自选股
					if (Array.isArray(this.optionalStockList)) {
						let result = this.optionalStockList.find((item) => {
							return item.seccode === this.curStock.secCode;
						})
						if (result != -1 && result != undefined) {
							this.isAdd = true;
						} else {
							this.isAdd = false;
						}
					} else {
						this.isAdd = false;
					}

				},
			})
		},
		// 跳转到历史报告页面
		async toReportChangePage(item) {
			let index = item.name.indexOf('(')
			let code = item.name.slice(index + 1, -1)
			let name = item.name.slice(0, index)
			await this.getRptInfoByCode(code)
			this.historyTitle = item.name
			this.targetStock.code = code
			this.targetStock.name = name
			this.historyIcon = item.isMain ? 'main' : 'compare'
			this.showHistory()
		},
		// 跳转到对比公司添加界面
		toCompareAddPage() {
			this.postMessage('navigateTo', `/subPackages/stock/compare-industry/compare-industry-add?isFromPdf=true&chartsId=${this.chartsId}`)
			// wx.miniProgram.navigateTo({
			// 	url: `/subPackages/stock/compare-industry/compare-industry-add?isFromPdf=true&chartsId=${this.chartsId}`,
			// 	success: (resp) => {
			// 		console.log('跳转成功')
			// 	}
			// })
		},
		// 切换回主报告
		toMainReport() {
			let param = {
				NodeId: this.mainReport.nodeId,
				TaskId: this.mainReport.taskId
			}
			$.ajax({
				method: 'POST',
				url: this.apiUrl + '/Report/GetHomeData',
				headers: {
					'Authorization': 'Bearer ' + this.token
				},
				contentType: 'application/json',
				data: JSON.stringify(param),
				success: (resp) => {
					this.newPdfUrl = JSON.parse(resp).data.filePath
					history.pushState({ page: 1 }, null, window.location.href);
					window.open(this.preUrl + this.newPdfUrl + '&auth=' + this.token + '&code=' + this.mainReport.stockCode
						+ '&name=' + this.mainReport.stockName + '&nodeid=' + this.mainReport.nodeId + '&mainCode=' + this.mainReport.stockCode
						+ '&mainName=' + this.mainReport.stockName + '&mainNodeid=' + this.mainReport.nodeId + '&mainTaskid=' + this.mainReport.taskId + '&taskid=' + this.mainReport.taskId + '&login=' +
						this.isLogin + '&templateId=' + this.templateId + '&compareList=' + this.oriCompareList + '&chartsId=' + this.chartsId)
				},
			})
		}
	},
	mounted() {
		this.initData()
		this.getNavigJson()
		this.getRptInfoByCode()
		this.getGuideText()
		this.getReportPageNum()
	}
}

const app = Vue.createApp(main);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
	app.component(key, component)
}
app.use(ElementPlus);
app.mount('#app');
