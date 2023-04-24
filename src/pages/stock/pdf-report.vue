<!-- @format -->

<template>
	<view class="pdf-report">
		<dcb-nav-bar :title="stockFullName" search></dcb-nav-bar>
		<view class="report-wrapper">
			<view class="report-index-main">
				<image
					class="report-wrapper__bg-img"
					referrerPolicy="no-referrer"
					src="https://infostar-2020-1301764129.file.myqcloud.com/miniProgram/static/iamge/ReportGuide111.png"></image>
				<view class="report-header">
					<view class="report-header__report-change">
						<view class="report-header__year-type" @click="handlePanelShow">
							<text>{{ rptFullName }}</text>
							<view class="report-header__triangle"></view>
						</view>
						<view :class="panelClass">
							<scroll-view class="report-header__scroll-view" :style="scrollStyle" scroll-y="true" @transitionend="hanldeTransition">
								<uni-list>
									<uni-list-item
										class="list-item"
										:class="{ selected: curSelectIndex == index }"
										v-for="(item, index) in rptListData"
										:key="item.id"
										clickable
										:border="false"
										@click="changeReport(item)">
										<template v-slot:header>
											<view>
												<text class="text">{{ item.year + '年' + $util.formatRptType(item.name) }}</text>
											</view>
										</template>
									</uni-list-item>
								</uni-list>
							</scroll-view>
						</view>
					</view>
					<view class="report-header__enter" @click="showPdf(listIndexData[0].id)">
						<text class="report-header__enter-text">进入</text>
						<text class="iconfont icon-right"></text>
					</view>
				</view>
				<view class="report-body">
					<view class="report-body__index">
						<text class="label-left">目录</text>
					</view>
					<view class="report-body__content">
						<scroll-view class="report-list-view" scroll-y="true" :style="rptContentHeight">
							<view class="report-list">
								<uni-list :border="false">
									<uni-list-item
										class="list-main-item"
										v-for="(item, index) in showIndexData"
										:key="item.id"
										:border="false"
										clickable
										@click="toPdfView(item.id)">
										<template v-slot:header>
											<view class="list-main-item header">
												<text class="list-main-item__topic" :class="childrenIndexClass(item.level)">{{ item.topic }}</text>
												<text class="list-main-item__pagenum">{{ matchPage(index) }}</text>
											</view>
										</template>
									</uni-list-item>
								</uni-list>
							</view>
						</scroll-view>
					</view>
					<view :class="overlayClass"></view>
				</view>
			</view>
		</view>
	</view>
</template>

<script lang="ts">
import { mapState } from 'vuex'
import type { indexDataType } from './pdf-report-type'
export default {
	data() {
		return {
			rectData: '',
			isShowPanel: false, // 报告选择面板的显示
			scrollStyle: 'display: none;', // 面板内联样式
			bodyHeight: 0, // report-body的高度
			curSelectIndex: 0, // 当前选中的行
			pageNumData: [], // 匹配页码数据
			listIndexData: [], // 报告导读目录
			showIndexData: [],
			rptListData: [], // 当前股票所有报告列表
			curTaskInfo: [], // 当前pdf报告信息
			// 计算用高度
			calUseHeight: {
				headerHeight: 0,
				indexHeight: 0,
			},
			userInfo: '',
			serverTime: '',
		}
	},
	props: {},
	computed: {
		...mapState(['curStock', 'navBarHeight']),
		// 动态设置内容区的高度以自适应
		rptContentHeight() {
			return `height: calc(100vh - ${this.calUseHeight.headerHeight}px - ${this.calUseHeight.indexHeight}px - ${this.navBarHeight} - 40rpx);`
		},
		// 面板样式切换
		panelClass() {
			if (this.isShowPanel) {
				return 'report-header__panel show'
			} else {
				return 'report-header__panel'
			}
		},
		rptFullName() {
			let name = this.$util.formatRptType(this.curStock.rptType)
			return this.curStock.year + '年' + name
		},
		overlayClass() {
			if (this.isShowPanel) {
				return 'overlay show'
			} else {
				return 'overlay'
			}
		},
		matchPage() {
			return (index: number) => {
				if (this.pageNumData.length > 0) {
					return this.pageNumData[index].matchPage
				}
			}
		},
		// 股票全名
		stockFullName() {
			return this.curStock.secName + ' ' + this.curStock.secCode
		},
		// 子级缩进样式
		childrenIndexClass() {
			return (level: number) => {
				if (level == 2) {
					return 'children-index'
				}
			}
		},
	},
	onShow() {
		// 获取内置组件的布局信息
		const query = uni.createSelectorQuery().in(this)
		query
			.select('.report-wrapper')
			.boundingClientRect((data) => {
				this.rectData = data
			})
			.exec()

		query
			.select('.report-body')
			.boundingClientRect((data) => {
				this.bodyHeight = data.height - 89
			})
			.exec()
		this.initData()
		this.getDefaultCompareList()
		this.userInfo = uni.getStorageSync('UserInfo')
		this.serverTime = uni.getStorageSync('serverTime')
	},
	methods: {
		initData() {
			this.changeCurSelectIndex()
			this.getRptGuideData()
			this.getTaskInfo()
			setTimeout(this.getlistBodyHeight, 0)
		},
		toPdfView(nodeId: number) {
			this.showPdf(nodeId)
		},
		// 控制显示报告选择面板
		handlePanelShow() {
			if (this.isShowPanel) {
				this.isShowPanel = !this.isShowPanel
			} else {
				this.scrollStyle = 'display:block;'
				setTimeout(() => {
					this.isShowPanel = !this.isShowPanel
				}, 20)
			}
		},
		showPdf(nodeId: number) {
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
					// 获取对比公司列表
					let compareList = []
					this.$store.state.curCmpList.forEach((item, index) => {
						let listItem = `${item.comp004_OrgName}(${item.comp004_Seccode})`
						compareList.push(listItem)
					})
					if (userInfo && userInfo.userClass != 99) {
						isLogin = true
					}
					let templateId = this.$config.data.ReportNavigateTemplateId
					uni.navigateTo({
						url:
							'/pages/stock/webView/my-web-view?code=' +
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
							templateId +
							'&compareList=' +
							compareList.join(','),
					})
				}
			})
		},
		// 切换当前报告
		changeReport(item) {
			this.curTaskInfo.id = item.id
			let stock = JSON.parse(JSON.stringify(this.curStock))
			stock.rptType = item.name
			stock.year = item.year
			this.$store.commit('setCurStock', stock)
			this.getReportPageNum()
			this.changeCurSelectIndex()
			this.isShowPanel = false
		},
		// 获取页码信息
		getReportPageNum() {
			let templateId = 0
			this.pageNumData = []
			templateId = this.$config.data.ReportNavigateTemplateId
			let param = {
				TaskId: this.curTaskInfo.id,
				TemplateId: templateId,
			}
			this.$api.post('/Report/GetMatchList', param).then((resp) => {
				if (resp.status) {
					// 处理返回的数据，map化
					let dataMap = new Map()
					resp.data.forEach((item) => {
						dataMap.set(item.id, {
							analyseNodeName: item.analyseNodeName,
							matchPage: item.matchPage,
						})
					})
					// 获取匹配的页码
					this.showIndexData.forEach((item) => {
						let id = this.$util.getNodeIdById(item.id)
						let value = dataMap.get(id)
						this.pageNumData.push({
							topic: item.topic,
							matchPage: value.matchPage,
						})
					})
				}
			})
		},
		// 获取报告导读数据
		getRptGuideData() {
			this.showIndexData = []
			let param = {
				Id: this.$config.data.ReportNavigateTemplateId,
			}
			this.$api
				.get('/Report/GetNavigJsonById', param)
				.then((resp) => {
					if (resp.status) {
						this.listIndexData = JSON.parse(resp.data.navigJson).children
						let result = this.processingIndexData(JSON.parse(resp.data.navigJson).children, 0)
						this.getSpecifiedLevelIndex(result, 2)
					}
				})
				.catch((err) => {
					console.log(err)
				})
		},
		// 获取当前股票报告列表
		getTaskInfo() {
			let param = {
				Code: this.curStock.secCode,
			}
			this.$api.post('/Report/GetAllReportInfoByCode', param).then((resp) => {
				if (resp.status) {
					this.rptListData = resp.data
					// 选择当前时间和报告类型的taskinfo
					let result = this.rptListData.find((item) => {
						return item.year === this.curStock.year && item.name === this.curStock.rptType
					})
					this.curTaskInfo = JSON.parse(JSON.stringify(result))
					// this.rptListData.forEach((item, index) => {
					//   this.rptListData[index].isSelected = false;
					// });
					this.getReportPageNum()
				}
			})
		},
		getlistBodyHeight() {
			let query = uni.createSelectorQuery().in(this)
			query
				.select('.report-header')
				.boundingClientRect((data) => {
					this.calUseHeight.headerHeight = data.height
				})
				.exec()
			query
				.select('.report-body__index')
				.boundingClientRect((data) => {
					this.calUseHeight.indexHeight = data.height
				})
				.exec()
		},
		/**
		 * description: 获取默认对比公司列表
		 * @createTime: 2022-10-25 17:35:56
		 */
		getDefaultCompareList() {
			let param = {
				Code: this.$store.state.curStock.secCode,
				ReportDate: null,
			}
			this.$api
				.post('/Compare/GetToCompareList_CompanyAndFinance', param)
				.then((res: any) => {
					this.$store.commit('updateCurCmpList', res.data.defaultCompareList)
					this.$store.commit('updateDefaultIndustyList', res.data.defaultCompareList)
					let industryName = ''
					let curStock = { ...this.$store.state.curStock }
					this.$config.data.IndustryTree.forEach((industry) => {
						let result = res.data.compareIndustry.find((compareIndustry) => {
							return compareIndustry.comp004_002 == industry
						})
						if (result) {
							if (result.comp004_006) {
								industryName = result.comp004_006
							}
						}
					})
					curStock.industry = industryName
					this.$store.commit('setCurStock', curStock)
				})
				.catch((err: Error) => console.log(err))
		},
		// 改变当前选中的行
		changeCurSelectIndex() {
			this.rptListData.forEach((item, index) => {
				if (this.curStock.rptType == item.name && item.year == this.curStock.year) {
					this.curSelectIndex = index
				}
			})
		},
		// 处理从接口处返回的目录数据
		processingIndexData(src: indexDataType[], level: number): indexDataType[] {
			let result: indexDataType[] = []
			src.forEach((item, index) => {
				result.push(item)
				result[index].level = level + 1
				if (item.children && item.children.length > 0) {
					this.processingIndexData(item.children, result[index].level)
				}
			})
			return result
		},
		// 获取指定层级的目录
		getSpecifiedLevelIndex(src: indexDataType[], level: number) {
			// let result: indexDataType[] = []
			src.forEach((item) => {
				//v-if="item.userClassAuth.filter(t=>t.userClass==(new Date(userInfo.endTime)>serverTime?userInfo.userClass:0))[0] && item.userClassAuth.filter(t=>t.userClass==(new Date(userInfo.endTime)>serverTime?userInfo.userClass:0))[0].detailedAuth==0"
				if (level < item.level) return
				let userClass = new Date(this.userInfo.endTime) > this.serverTime ? this.userInfo.userClass : 0
				let info = item.userClassAuth.filter((t) => t.userClass == userClass)[0]
				if (info && info.detailedAuth == 0 && item.isShow) {
					this.showIndexData.push(item)
				}
				if (item.children && item.children.length > 0) {
					this.getSpecifiedLevelIndex(item.children, level)
				}
			})
		},
	},
}
</script>

<style lang="scss">
// @import "@/static/scss/common/pdf-report.scss";
</style>
