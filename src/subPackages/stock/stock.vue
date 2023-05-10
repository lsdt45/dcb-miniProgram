<template>
	<view class="stock-wrapper">
		<dcb-nav-bar :title="stockFullName" leftIconType="back" :stock-home="true" search>
		</dcb-nav-bar>
		<view class="stock-header-nav-wrapper">
			<view class="stock-header">
				<view class="stock-header-left">
					<view class="stock-header data-select time" @click="showPanel('time')">
						<text class="data-select__content">{{ curTimeStr }}</text>
						<view class="data-select__arrow"></view>
					</view>
					<view class="stock-header data-select report" @click="showPanel('report')">
						<text class="data-select__content">{{ curReportStr }}</text>
						<view class="data-select__arrow"></view>
					</view>
					<view class="iconfont icon-a-comparisoncompany" @click="showCompareIndustry()">
					</view>
				</view>
				<view class="stock-header-btns"></view>
			</view>
		</view>
		<view class="stock-content">
			<!-- 财务分析 -->
			<view class="stock-content-financial-analysis">
				<view class="financial-analysis-header">
					<view class="financial-analysis-header-left" @click="showPanel('template')">
						<view class="iconfont icon-stretch"></view>
						<text class="text">{{ curAnalysisNode.topic }}</text>
						<view class="financial-analysis-header__analysis-guide" @click.native.stop="showPanel('guide')">
							<text>分析指南</text>
						</view>
					</view>
					<view class="financial-analysis-header-right"></view>
				</view>
				<!-- 单图表显示 -->
				<scroll-view class="table-charts single-table" v-if="curAnalysisNode.type == 'single'" scroll-x="true"
					scroll-y="true">
					<table-charts :chartsInfoProp="chartsInfo" :chartsId="chartsId" :rptType="rptTypeProp"
						ref="singleTable">
					</table-charts>
				</scroll-view>
				<!-- 多图表显示 -->
				<scroll-view class="table-charts multi-table" v-else scroll-y="true" @scroll="scroll"
					:scroll-top="scrollTop.new">
					<table-charts v-for="(item, index) in chartsIdArr" :key="index" :chartsInfoProp="chartsInfo"
						:chartsId="item" :chartsType="curAnalysisNode.type" :ref="'multiTalbe' + index.toString()"
						:last-table-chart="index + 1 == chartsIdArr.length ? true : false"
						@changeScrollTop="changeScrollTop">
					</table-charts>
				</scroll-view>
			</view>
		</view>
		<!-- 模板选择面板 -->
		<view class="financial-analysis-panel-wrapper">
			<u-popup v-model="isShowPanel" mode="bottom" @close="closePanel" border-radius="40" closeable>
				<view class="panel-header">
					{{ curStock.secName + ' ' + curStock.secCode }}
				</view>
				<scroll-view scroll-y="true" class="financial-analysis-panel">
					<uni-list>
						<uni-list-item v-for="(item, index) in navigDataItemTree"
							:class="item.treeLevel==1?'parent-item': 'child-item'" :key="index" :title="item.topic"
							clickable @click="selectTemplate(item)" :border="false"></uni-list-item>
					</uni-list>
				</scroll-view>
				<view class="panel-footer" @click="closePanel('btn')">取消</view>
			</u-popup>
		</view>
		<!-- 报告类型面板 -->
		<view class="report-type-panel">
			<u-popup v-model="isShowRptType" mode="bottom" border-radius="40" closeable @close="closePanel"
				:mask-close-able="false">
				<view class="panel-header">报告类型</view>
				<u-checkbox-group :wrap="true" shape="circle">
					<u-checkbox v-for="(item, index) in rptTypeData" v-model="item.checked" :key="index"
						:name="item.name">
						{{ item.name }}
					</u-checkbox>
				</u-checkbox-group>
				<view class="panel-footer">
					<view class="panel-footer-btns">
						<u-button class="cancel" size="medium" @click="closePanel('btn', 'report')">取消</u-button>
						<u-button class="ok" type="primary" size="medium" @click="changeRptType">确定</u-button>
					</view>
				</view>
			</u-popup>
		</view>
		<!-- 分析时间面板 -->
		<view class="analy-time-panel">
			<u-popup v-model="isShowAnalyTime" mode="bottom" @close="closePanel" border-radius="40" closeable>
				<view class="panel-header">分析时间</view>
				<scroll-view scroll-y="true" class="panel-body" style="height: 60vh;">
					<u-checkbox-group :wrap="true" shape="circle">
						<u-checkbox v-for="(item, index) in anlyTimeData" v-model="item.checked" :key="index"
							:name="item.name">
							{{ item.name }}
						</u-checkbox>
					</u-checkbox-group>
				</scroll-view>
				<view class="panel-footer">
					<view class="panel-footer-btns">
						<u-button class="cancel" size="medium " @click="closePanel('btn', 'time')">取消</u-button>
						<u-button class="ok" type="primary" size="medium" @click="changeRptType('time')">确定</u-button>
					</view>
				</view>
			</u-popup>
		</view>
		<!-- 分析指南面板 -->
		<view class="analy-guide-panel">
			<u-popup v-model="isShowAnalyGuide" mode="bottom" @close="closePanel" border-radius="40" closeable>
				<view class="panel-header">分析指南</view>
				<scroll-view class="panel-body" scroll-y="true">
					<image class="image" v-if="!isHelpMsgExist" src="../../static/image/noData.png"></image>
					<view :class="guideTextClass">
						<mp-html :content="helpMsg" @linktap="linktap" :tag-style="linkStyle" />
					</view>
				</scroll-view>
				<view class="panel-footer" @click="closePanel('btn')">
					<view class="panel-footer-btns">
						<text>我知道了</text>
					</view>
				</view>
			</u-popup>
		</view>
		<!-- 横屏模式-图 -->
		<view class="tabel-charts-rotate">
			<u-mask :show="isShowRotate">
				<view :class="maskClass" v-if="isShowRotate" :style="tableChartViewHeight">
					<!-- <view class="" style="transform: rotate(90deg);"> -->
					<view style="width: 100vw; height:100vh;">
						<l-echart ref="chart"></l-echart>
					</view>
					<!-- </view> -->
				</view>
				<view class="iconfont icon-close" @click="closeRotateMode"></view>
			</u-mask>
		</view>
		<!-- 横屏模式-表 -->
		<view class="tabel-charts-rotate">
			<u-mask :show="isShowRotate_table">
				<view class="table-charts__lanscape table" :class="maskClass_table" v-if="isShowRotate_table"
					:style="tableChartViewHeight">
					<!-- <scroll-view scroll-x="true" scroll-y="true"> -->
					<dcb-table :chartsData="chartsData_lanscape" :fstTableTh="fstTableTh" :landscape="true"
						:chartsInfo="chartsInfo_lanscape"></dcb-table>
					<!-- </scroll-view> -->
				</view>
				<view class="iconfont icon-close" @click="closeRotateMode"></view>
			</u-mask>
		</view>
	</view>
</template>

<script lang="ts">
	// import ArticleColumnList from '@/pages/stock/article/article-column-list.vue'
	import ReportInfomation from '@/pages/stock/report-infomation.vue'
	import TableCharts from '@/subPackages/table-charts/table-charts.vue'
	import PdfReport from '@/pages/stock/pdf-report.vue'
	import DcbTable from '@/subPackages/table-charts/dcb-table.vue'
	import {
		testOption
	} from '../table-charts/table-charts-config'
	import {
		mapState
	} from 'vuex'
	export default {
		components: {
			TableCharts,
			// ArticleColumnList,
			ReportInfomation,
			PdfReport,
			DcbTable
		},
		data() {
			return {
				actAnalysisData: [], // 会计分析数据			
				currentTab: 0,
				curTaskInfo: [], // 当前pdf报告信息
				curTimeStr: '2022', // 当前选择的时间的集合
				curReportStr: '年报', // 当前选择的报告类型的集合
				// 最新pdf报告信息
				recentRptInfo: {
					year: '',
					type: '',
				},
				chartsData: [], // 图表数据
				chartsId: '', // 单图表Id
				chartsIdArr: [], // 多图表Id组
				chartsInfo: {
					chartsId: '',
					curStock: {
						secName: '',
						secCode: '',
					},
				},
				chartsInfo_lanscape: {},
				checkBoxFlag: true, // 判断是否对原多选框数据进行复制的flag
				clientRect: '', // 客户端菜单按钮布局信息		
				fstTableTh: '', // 表格第一列第一行的标题
				homeData: {}, // 当前股票主要数据
				isInit: false, // 是否已初始化数据
				navList: [{
						name: '财务分析',
						iconType: 'staff-filled',
					},
					{
						name: '报告导读',
						iconType: 'staff-filled',
					},
					{
						name: '会计分析',
						iconType: 'staff-filled',
					},
					{
						name: '分析报告',
						iconType: 'staff-filled',
					},
					// {
					// 	name: '资讯速递',
					// 	iconType: 'staff-filled'
					// },
				],
				option: {}, // echarts数据
				pdfViewerUrl: '/static/pdf/web/viewer.html',
				pdfUrl: '',
				isShowPdf: false,
				isShowPicker: false,
				isShowPanel: false, // 分析模板面板
				isShowRptType: false, // 报告类型面板
				isShowAnalyTime: false, // 分析时间面板
				isHelpMsgExist: true, // 分析指南是否有内容
				isShowAnalyGuide: false, // 分析指南面板
				isOptional: false, // 是否已经添加为自选股
				isPageLoad: false, // 页面是否已经加载过
				isShowTopNavTab: true, // 是否显示独立的顶部导航栏
				isShowRotate: false, // 是否为图的横屏模式
				isShowRotate_table: false, // 是否为表的横屏模式
				canvasId: '', // 画布id
				chartsData_lanscape: {}, // 横屏图表数据
				chartsShowType: 'line', // 图表类型
				opts_rotate: {}, // 横屏下的设置
				text: '搭配详情',
				searchValue: '',
				scrollTop: {
					new: 0,
					old: 0,
				}, // scroll-view的纵向滚动距离			
				timer: null, // 定时器
				testOption,
				navigData: {}, // 模板数据
				navigDataItem: [], // 模板子数据
				navigDataItemTree: [], // 模板数据格式化后的树形数据
				tempNavigDataItemTree: [],
				rptGuideData: [], // 报告导读数据


				// 当前财务分析节点
				curAnalysisNode: {
					id: '', // 节点id
					topic: '', // 节点名
					type: '', // 节点类型
				},
				customBtnStyle: {
					// 自定义按钮样式
					backgroundColor: 'white',
					color: 'black',
				},
				// 报告类型数据
				rptTypeData: [{
						name: '年报',
						type: '12',
						checked: false,
					},
					{
						name: '三季报',
						type: '09',
						checked: false,
					},
					{
						name: '半年报',
						type: '06',
						checked: false,
					},
					{
						name: '一季报',
						type: '03',
						checked: false,
					},
					{
						name: '最新',
						type: 'new',
						checked: true,
					},
				],
				rptTypeData_temp: [], // 报告类型临时数据
				rptTypeProp: {
					isChange: false,
					rptTypeData: '',
				},
				// 分析时间数据
				anlyTimeData: [],
				anlyTimeData_temp: [], // 报告类型临时数据
				timeRange: [], // 时间区间
				taskInfo: [], // pdf报告信息

				rptListData: [], // 当前股票所有报告列表
				helpMsg: '暂无数据', // 分析指南文本
				linkStyle: {
					a: 'color:#0052d9',
				},
				optionalStockData: [], // 自选股列表
			}
		},
		props: {
			// analyseNodeProp: {
			// 	type: Object,
			// 	required: true,
			// 	default: () => {},
			// },
		},
		watch: {
			userInfo(newVal) {
				if (!this.firstEnter) {
					this.changeCurStockByUserInfo(newVal)
				} else {
					this.$store.commit('updateFirstEnter', false)
				}
			},
		},
		computed: {
			...mapState(['curStock', 'navBarHeight', 'userInfo', 'firstEnter']),
			panelClass() {
				if (this.isShowPanel) {
					return 'financial-analysis-panel show'
				} else {
					return 'financial-analysis-panel'
				}
			},
			modalClass() {
				if (this.isShowPanel) {
					return 'financial-analysis-modal show'
				} else {
					return 'financial-analysis-modal'
				}
			},
			// 分析指南文本样式
			guideTextClass() {
				if (this.isHelpMsgExist) {
					return 'text'
				} else {
					return 'text-nodata'
				}
			},
			// 自选按钮的文本
			optionalStockText() {
				if (this.isOptional) {
					return '已添加'
				} else {
					return '+ 自选'
				}
			},
			stockInfo() {
				return this.curStock.secName + ' ' + this.curStock.secCode + ' ' + this.curStock.year + '年年报'
			},
			// 图表容器的高度
			tableChartViewHeight() {
				// return `height:calc(100vh - ${this.navBarHeight} - 94px);`
				return `height:100vh;`
			},
			// 股票全名
			stockFullName() {
				return this.curStock.secName + ' ' + this.curStock.secCode
			},
			// 横屏模式的遮罩层
			maskClass() {
				if (this.isShowRotate) {
					return 'mask-wrapper show'
				} else {
					return 'mask-wrapper'
				}
			},
			maskClass_table() {
				if (this.isShowRotate_table) {
					return 'mask-wrapper show table'
				} else {
					return 'mask-wrapper'
				}
			},
			// 横屏模式下的画布高度
			rotateCanvasHeight() {
				if (this.isShowRotate) {
					return `height: calc(100% - ${this.navBarHeight});`
				} else {
					return ''
				}
			},
		},
		methods: {
			// 初始化数据
			initData() {
				this.chartsInfo = {
					curStock: {
						secName: this.curStock.secName,
						secCode: this.curStock.secCode,
					},
				}
				// 初始化报告期选择
				this.rptTypeData.forEach((item, index, arr) => {
					let curReportType = this.$util.formatRptType(this.$store.state.curStock.rptType, 'type')
					arr[index].checked = item.type === curReportType || item.type === 'new'? true: false
				})
				this.curReportStr = this.setCurStr(this.rptTypeData, 'name')
				// 横屏模式画布的canvasId
				this.canvasId = this.$util.randomWord(true, 8, 8)
				this.getAnalysisTime()
				this.getTaskInfo()
				this.getActAnalysisData()
				this.getOptionalStockList()
			},
			changeTab(tab) {
				this.currentTab = tab
			},
			change(nodeId) {
				this.showPdf(nodeId)
			},
			showPdf(nodeId) {
				let param = {
					NodeId: this.$util.getNodeIdById(nodeId),
					TaskId: this.curTaskInfo.id,
				}
				this.$api.post('/Report/GetHomeData', param).then((resp) => {
					if (resp.status) {
						this.pdfUrl = resp.data.filePath
						let matchPage = ''
						if (resp.data.reportKeyInfoData) {
							matchPage = resp.data.reportKeyInfoData.matchPage
						} else {
							matchPage = '1'
						}
						// 是否登录
						let userInfo = uni.getStorageSync('UserInfo')
						let isLogin = false
						if (userInfo && userInfo.userClass != 99) {
							isLogin = true
						}
						let templateId = 0
						// 如果是报告导读
						if (this.currentTab === 1) {
							templateId = this.$config.data.ReportNavigateTemplateId
						}
						// 其余情况
						else {
							templateId = this.$config.data.AccountingAnalysisTemplateId
						}
						uni.navigateTo({
							url: '/pages/stock/webView/my-web-view?code=' +
								this.curStock.secCode +
								'&name=' +
								this.curStock.secName +
								'&pdfUrl=' +
								this.pdfUrl +
								'&nodeid=' +
								nodeId +
								'&taskid=' +
								this.curTaskInfo.id +
								'&page=' +
								matchPage +
								'&login=' +
								isLogin +
								'&templateId=' +
								templateId,
						})
					}
				})
			},
			showPicker() {
				this.isShowPicker = true
				this.text = 'test'
			},
			// 进入搜索页面
			toSearch() {
				uni.navigateTo({
					url: '/pages/stock/stock-search',
				})
			},
			// 获取模板数据
			getTemplateData() {
				let param = {
					Id: this.$config.data.FinancialAnalysisTemplateId,
				}
				this.$api
					.get('/Report/GetNavigJsonById', param)
					.then((resp) => {
						if (resp.status) {
							// let targetIndex = 0
							this.tempNavigDataItemTree = []
							this.navigDataItemTree = []
							this.navigData = resp.data
							this.navigData.NavigJson = JSON.parse(this.navigData.navigJson)
							// 财务专题分析 数据
							this.navigDataItem = this.navigData.NavigJson.children.find((item) => {
								let itemId = this.$util.getNodeIdById(item.id)
								return itemId == this.curAnalysisNode.id
							}).children			
									
							this.formatNavData(this.navigDataItem, 1)
							/* 将当前节点的所有子节点提取出来 */
							// this.tempNavigDataItemTree.forEach((item, index) => {
							// 	if(item.id == this.curAnalysisNode.id) {
							// 		targetIndex = index;
							// 		return
							// 	}
							// })
							// 先把1级加进入
							this.navigDataItemTree.push({
								id: this.curAnalysisNode.id,
								topic: this.curAnalysisNode.topic,
								treeLevel: 1
							})
							for (let i = 0; i < this.tempNavigDataItemTree.length; i++) {
								let item = this.tempNavigDataItemTree[i]
								if ((item.treeLevel > 1) && (item.treeLevel <= this.navigData.depthMaxLevel)) {
									this.navigDataItemTree.push(item);
								} else {
									break
								}
							}
							/* 提取结束 */
							this.getHomeData(this.curAnalysisNode.id)
						}
					})
					.catch((err) => {
						console.log(err)
					})
			},
			// 格式化模板数据
			formatNavData(data, treeLevel) {
				treeLevel++
				data.forEach((item) => {
					let navItemData = {}
					navItemData.topic = item.topic
					navItemData.treeLevel = treeLevel
					navItemData.id = this.$util.getNodeIdById(item.id)
					this.tempNavigDataItemTree.push(navItemData)
					if (item.children && item.children.length > 0) {
						this.formatNavData(item.children, treeLevel)
					}
				})
			},
			// 获取会计分析数据
			getActAnalysisData() {
				let param = {
					Id: this.$config.data.AccountingAnalysisTemplateId,
				}
				this.$api
					.get('/Report/GetNavigJsonById', param)
					.then((resp) => {
						if (resp.status) {
							this.actAnalysisData = JSON.parse(resp.data.navigJson).children[0].children
						}
					})
					.catch((err) => {
						console.log(err)
					})
			},
			// 显示面板
			showPanel(type) {
				if (type === 'template') {
					this.isShowPanel = true
				} else if (type === 'report') {
					this.isShowRptType = true
					this.rptTypeData_temp = this.$util.deepCopy(this.rptTypeData)
				} else if (type === 'time') {
					this.isShowAnalyTime = true
					this.anlyTimeData_temp = this.$util.deepCopy(this.anlyTimeData)
				} else if (type === 'guide') {
					this.isShowAnalyGuide = true
				}
			},
			// 关闭面板
			closePanel(act, type = '') {
				let delay = 0
				if (act === 'btn') delay = 320
				if (type === 'report') {
					this.rptTypeData = this.$util.deepCopy(this.rptTypeData_temp)
				} else if (type === 'time') {
					this.anlyTimeData = this.$util.deepCopy(this.anlyTimeData_temp)
				}
				this.isShowPanel = false
				this.isShowRptType = false
				this.isShowAnalyTime = false
				this.isShowAnalyGuide = false
				// setTimeout(() => {
				// 	uni.showTabBar()
				// }, delay)
			},
			// 选择点击的模板
			async selectTemplate(item) {
				// 获取当前模板名
				this.curAnalysisNode.topic = item.topic
				this.closePanel('btn')
				let nodeId = this.$util.getNodeIdById(item.id)
				// this.getHomeData(nodeId)

				await this.getHomeData(nodeId)
				setTimeout(() => {
					let chart = ''
					if (this.curAnalysisNode.type == 'single') {
						chart = this.$refs['singleTable']
						chart.chartContainnerHeight = 400
						chart.isShowValue = false
						chart.showValueText = '显示值'
					} else if (this.curAnalysisNode.type == 'multi') {
						this.chartsIdArr.forEach((item, index) => {
							chart = this.$refs[`multiTalbe${index}`][0]
							chart.chartContainnerHeight = 400
							chart.isShowValue = false
							chart.showValueText = '显示值'
						})
					}
				}, 500)
			},
			/**
			 * description: 关闭横屏模式
			 * @createTime: 2022-07-02 11:27:33
			 */
			closeRotateMode() {
				this.isShowRotate = false
				this.isShowRotate_table = false
				wx.setPageOrientation({
					orientation: 'portrait'
				})
			},
			// 获取股票的各项数据
			getTaskInfo() {
				let param = {
					Code: this.curStock.secCode,
				}
				this.$api.post('/Report/GetAllReportInfoByCode', param).then((resp) => {
					if (resp.status) {
						this.rptListData = resp.data
						this.curTaskInfo = this.rptListData.find((item) => {
							return this.curStock.year == item.year && this.curStock.rptType == item.name
						})
						// 初始化报告类型的初始选择
						this.recentRptInfo.year = this.curTaskInfo.year
						this.recentRptInfo.type = this.$util.formatRptType(this.curTaskInfo.name, 'type')
						this.rptListData.forEach((item, index) => {
							this.rptListData[index].isSelected = false
						})
						this.rptTypeData[this.rptTypeData.length - 1].checked = true

						// let stock = JSON.parse(JSON.stringify(this.curStock))
						// stock.rptType = this.curTaskInfo.name
						// this.$store.commit('setCurStock', stock)
						this.getTemplateData()
					}
				})
			},

			// 获取股票的各项数据
			getHomeData(nodeId) {
				let param = {
					NodeId: nodeId,
					TaskId: this.curTaskInfo.id,
				}
				return new Promise((resolve) => {
					this.$api.post('/Report/GetHomeData', param).then((resp) => {
						if (resp.status) {
							this.homeData = resp.data
							this.chartsId = ''
							this.chartsIdArr = []
							// 如果是单图表节点
							if (this.homeData.analyseNode.analyseNodeType == '2') {
								this.chartsId = this.homeData.analyseNode.dataSource
								this.curAnalysisNode.type = 'single'
							}
							// 多图表节点
							else if (this.homeData.analyseNode.analyseNodeType == '8') {
								this.chartsIdArr = this.homeData.analyseNode.linkCharts.split(',')
								this.curAnalysisNode.type = 'multi'
							} else if (this.homeData.analyseNode.analyseNodeType == '3') {
								this.curAnalysisNode.type = 'null'
							}
							this.pdfUrl = resp.data.filePath

							// 分析指南文本
							if (this.homeData.analyseNode != undefined && this.homeData.analyseNode
								.helpMsg && this.homeData.analyseNode.helpMsg != '<p><br/></p>') {
								this.isHelpMsgExist = true
								this.helpMsg = this.homeData.analyseNode.helpMsg
							} else {
								this.isHelpMsgExist = false
								this.helpMsg = '暂无数据'
							}
							resolve()
						}
					})
				})
			},
			// 获取自选股列表
			getOptionalStockList() {
				this.$api.post('/Report/GetUserStock').then((resp) => {
					if (resp.status) {
						this.optionalStockData = resp.data
						let result = this.optionalStockData.find((item) => {
							return item.seccode == this.curStock.secCode
						})
						if (result != undefined) {
							this.isOptional = true
						} else {
							this.isOptional = false
						}
					}
				})
			},
			// 添加自选股
			addOptionalStock(stock) {
				// 判断是否登录
				let userInfo = uni.getStorageSync('UserInfo')
				if (userInfo && userInfo.userClass != 99) {
					let param = {
						Seccode: stock.secCode,
					}
					this.$api
						.post('/Report/AddUserStock', param)
						.then((resp) => {
							if (resp.status) {
								uni.showToast({
									title: '已成功添加自选',
								})
								this.isOptional = true
							} else {
								uni.showToast({
									title: '已添加过该股票',
									icon: 'error',
								})
							}
						})
						.catch((err) => {
							console.log(err)
						})
				} else {
					// 若未登录则切换到登录界面
					uni.navigateTo({
						url: '/pages/ucenter/login',
					})
				}
			},
			// 跳转到自选股页面
			toOptionalStock() {
				let userInfo = uni.getStorageSync('UserInfo')
				if (userInfo && userInfo.userClass != 99) {
					uni.navigateTo({
						url: '/pages/stock/optional-stock',
					})
				} else {
					// 若未登录则切换到登录界面
					uni.navigateTo({
						url: '/pages/ucenter/login',
					})
				}
			},
			changeRptType() {
				this.isShowRptType = false
				this.isShowAnalyTime = false
				let dataFilter = {
					report: this.rptTypeData,
					time: this.anlyTimeData,
				}

				if (this.curAnalysisNode.type == 'single') {
					this.$refs.singleTable.changeRptType(dataFilter)
				} else {
					this.chartsIdArr.forEach((item, index) => {
						let temp = 'multiTalbe' + index
						this.$refs[temp][0].changeRptType(dataFilter)
					})
				}
				this.curTimeStr = this.setCurStr(this.anlyTimeData, 'year')
				this.curReportStr = this.setCurStr(this.rptTypeData, 'name')
				if(!this.curReportStr) {
					this.curReportStr = '请选择'
				}
				// setTimeout(() => {
				// 	uni.showTabBar()
				// }, 320)
			},
			// 根据用户信息改变当前股票并初始化
			changeCurStockByUserInfo(userInfo) {
				let stock = JSON.parse(JSON.stringify(this.curStock))
				if (userInfo && userInfo.userClass != 99) {
					this.$api.post('/Report/GetUserStock').then((resp) => {
						if (resp.status && resp.data.length > 0) {
							stock.secName = resp.data[resp.data.length - 1].secname
							stock.secCode = resp.data[resp.data.length - 1].seccode
						} else {
							stock.secName = '平安银行'
							stock.secCode = '000001'
						}
						this.$store.commit('setCurStock', stock)
						this.initData()
					})
				} else {
					stock.secName = '平安银行'
					stock.secCode = '000001'
					this.$store.commit('setCurStock', stock)
					this.initData()
				}
			},
			getAnalysisTime() {
				let start = this.$config.data.MaxStartTime
				let end = new Date().getFullYear()
				this.timeRange = []
				while (start <= end) {
					this.timeRange.push(end)
					end--
				}
				this.anlyTimeData = []
				this.timeRange.forEach((item, index) => {
					// 将年份转换为字符串
					this.timeRange[index] = item.toString()
					if (index < 5) {
						this.anlyTimeData.push({
							name: item + '年',
							year: item,
							checked: true,
						})
					} else {
						this.anlyTimeData.push({
							name: item + '年',
							year: item,
							checked: false,
						})
					}
				})
				this.curTimeStr = this.setCurStr(this.anlyTimeData, 'year')
			},
			/**
			 * author: ljw
			 * description: 点击分析指南中的链接进行跳转
			 * @callback {Object} e - 被点击的a标签的属性.
			 * @createTime: 2022-07-03 14:20:14
			 */
			linktap(e) {
				if (e['data-key']) {
					this.getHomeData(e['data-key'])
				} else {
					console.log('不存在对应的节点')
				}
				this.closePanel('btn')
			},
			// 显示警告框
			showAlertDiaglog() {
				this.$refs.alertDialog.open()
			},
			/**
			 * author: ljw
			 * description: 将数据中被选择的项以字符串的形式返回，原数据的子项中必须有checked键
			 * @param {arr} data - description.
			 * @return {string}
			 * @createTime: 2022-07-05 15:03:52
			 */
			setCurStr(data, returnKey) {
				let arr = []
				data.forEach((item) => {
					if (item.checked == true) {
						arr.push(item[returnKey])
					}
				})
				return arr.toString()
			},
			scroll(e) {
				this.timer && clearTimeout(this.timer)
				this.timer = setTimeout(() => {
					this.scrollTop.old = e.target.scrollTop
				}, 1000)
			},
			// 改变纵向滚动距离
			changeScrollTop() {
				this.$nextTick(() => {
					setTimeout(() => {
						this.scrollTop.new = this.scrollTop.old
					}, 100)
				})
			},
			// 返回前一个页面
			back() {
				uni.navigateBack({
					delta: 1,
				})
			},
			// 跳转到对比公司页面
			showCompareIndustry() {
				uni.navigateTo({
					url: '/subPackages/stock/compare-industry/compare-industry'
				})
			}
		},
		options: {
			styleIsolation: 'shared',
		},
		mounted() {

		},
		onLoad(options) {
			this.curAnalysisNode.id = options.id
			this.curAnalysisNode.topic = options.topic
			this.initData()
		}
	}
</script>

<style lang="scss">
	@import '@/static/scss/common/stock.scss';
</style>
