<!-- @format -->

<template>
	<view class="home-wrapper">
		<uni-nav-bar title="读财报" :height="navBarHeight" backgroundColor="#2C72EC" color="#FFF" :fixed="true"></uni-nav-bar>
		<view class="home-main">
			<view class="home-main__header">
				<u-search
					:placeholder="placeholderText"
					shape="square"
					action-text="自选股"
					:action-style="{ color: '#2C72EC' }"
					:disabled="true"
					input-align="center"
					@click="toSearch"
					@custom="toStockMarket"></u-search>
				<view class="iconfont-wrapper" v-if="isShowCloseBtn" @click.stop="clearSearchBar">
					<view class="iconfont icon-close"></view>
				</view>
			</view>
			<view class="home-main__filter">
				<text class="filter-text">近期财报更新</text>
				<view class="div"></view>
				<view class="filter-body">
					<uni-tag
						class="filter-body__select"
						v-for="(item, index) in filterList"
						:key="index"
						:inverted="!item.select"
						type="primary"
						:text="item.type == 'all' ? item.name : $util.formatRptType(item.name)"
						@click="tagClick(item.id, item.name)"></uni-tag>
				</view>
			</view>
			<scroll-view class="home-main__report-scroll-wrapper" scroll-y="true" :style="stockCardAreaHeight">
				<view class="home-main__report">
					<view class="report-card" v-for="(item, index) in reportInfo" :key="index" @click="toAnalsisPage(item)">
						<uni-card :is-shadow="false">
							<template v-slot:title>
								<view class="report-card__header">
									<view class="title-text">
										<text class="stock-name">{{ item.stockName }}</text>
										<text class="stock-code">{{ item.code }}</text>
									</view>
									<image class="title-img" referrerPolicy="no-referrer" :src="setImgSrc(index)" mode=""></image>
								</view>
							</template>
							<view class="report-card__footer">
								<text class="report-type">{{ item.year + item.typeName }}</text>
								<text class="report-announcementTime">{{ '披露日期:' + item.announcementTime }}</text>
							</view>
						</uni-card>
					</view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script lang="ts">
	import { mapState } from 'vuex'
	import StockSearchBar from '@/pages/home/stock-search-bar.vue'
	import type HomeType from '@/types/home'
	import api from '@/common/api/api'
	export default {
		components: {
			StockSearchBar,
		},
		data: (): HomeType.Home.Data => ({
			// 报告类型
			filterList: [
				{
					id: 0,
					type: 'all',
					name: '全部',
					select: true,
				},
				{
					id: 1,
					type: '012',
					name: '年度报告',
					select: false,
				},
				{
					id: 2,
					type: '09',
					name: '第三季度报告',
					select: false,
				},
				{
					id: 3,
					type: '06',
					name: '半年度报告',
					select: false,
				},
				{
					id: 4,
					type: '03',
					name: '第一季度报告',
					select: false,
				},
			],
			reportInfo: [],
			headerHeight: 0, // 头部区高度
			filterHeight: 0, // 筛选区高度
			isJumpToPage: false, // 是否是从其它页面跳转过来的
			isInitFinished: false, // 是否已初始化完毕
			isShowCloseBtn: false, // 是否显示搜索框的清空按钮
			curSearchCode: '', // 当前搜索的股票代码
			curSearchName: '', // 当前搜索的股票名称
		}),
		computed: {
			...mapState(['navBarHeight', 'curStock']),
			placeholderText() {
				if (this.curSearchCode == undefined || !this.curSearchCode) {
					return '请输入股票代码/名称/简拼'
				} else {
					return this.curSearchName + '(' + this.curSearchCode + ')'
				}
			},
			// 卡片区域的高度
			stockCardAreaHeight() {
				return `height:calc(100vh - ${this.headerHeight}px - ${this.filterHeight}px - ${this.navBarHeight} - 16px);`
			},
		},
		methods: {
			initData() {
				this.setCardAreaHeight()
				this.isInitFinished = true
			},
			/**
			 * author: ljw
			 * description: 点击报告类型后的回调，切换对应的类型
			 * @createTime: 2022-08-03 10:06:09
			 */
			tagClick(id: number, name: string) {
				this.filterList.forEach((item, index) => {
					if (item.id === id) {
						this.filterList[index].select = true
					} else {
						this.filterList[index].select = false
					}
				})
				let stockInfo = {
					code: this.curSearchCode,
					name: '',
				}
				if (name != '全部') {
					stockInfo.name = name
				}
				if (this.isJumpToPage) {
					stockInfo.code = this.curStock.secCode
				}
				this.getRecentStockInfo(stockInfo)
			},
			/**
			 * author: ljw
			 * description: 获取最新报告信息
			 * @param {object} stockInfo - 可选。不传：获取最近的报告列表。
			 * 传：根据传入的name或code获取该股票最近的报告列表.
			 * @createTime: 2022-08-04 10:48:15
			 */
			getRecentStockInfo(
				stockInfo = {
					code: '',
					name: '',
				}
			) {
				this.reportInfo = []
				let param = {
					code: stockInfo.code,
					name: stockInfo.name,
				}
				this.$api.post('/Report/GetRecentReports', param).then((resp: any) => {
					if (resp.status) {
						let data = resp.data
						data.forEach((item: any, index: number) => {
							this.reportInfo.push({
								stockName: item.stockName,
								code: item.code,
								year: item.year,
								market: item.market,
								typeName: this.$util.formatRptType(item.name),
								typeFullName: item.name,
								announcementTime: this.$util.FormatDate(new Date(item.announcementTime), 'yyyy-MM-dd'),
							})
						})
						this.$nextTick(() => {})
					}
				})
			},
			// 动态设置卡片中的背景图
			setImgSrc(index: number) {
				let imgIndex = 0
				if (index > 3) {
					imgIndex = (index % 4) + 1
				} else {
					imgIndex = index + 1
				}
				return `https://infostar-2020-1301764129.file.myqcloud.com/miniProgram/static/iamge/home-card/r${imgIndex}.png`
			},
			// 根据屏幕大小设置卡片区域的高度
			setCardAreaHeight() {
				this.$nextTick(() => {
					let query = uni.createSelectorQuery().in(this)
					query
						.select('.home-main__header')
						.boundingClientRect((data) => {
							this.headerHeight = data.height
						})
						.exec()
					query
						.select('.home-main__filter')
						.boundingClientRect((data) => {
							this.filterHeight = data.height
						})
						.exec()
				})
			},
			// 进入搜索页面
			toSearch() {
				uni.navigateTo({
					url: '/pages/stock/stock-search',
				})
			},
			// 进入自选股界面
			toStockMarket() {
				uni.navigateTo({
					// url: "/pages/stock-market/stock-market",
					url: '/pages/stock/optional-stock',
				})
			},
			// 跳转到分析首页
			toAnalsisPage(stockInfo: any) {
				uni.switchTab({
					url: '/pages/stock/pdf-report',
				})
				let stock = {
					secName: stockInfo.stockName,
					secCode: stockInfo.code,
					year: stockInfo.year,
					market: stockInfo.market,
					rptType: stockInfo.typeFullName,
				}
				this.$store.commit('setCurStock', stock)
			},
			// 清空搜索条内容
			clearSearchBar() {
				this.curSearchCode = ''
				this.curSearchName = ''
				this.isShowCloseBtn = false
				this.filterList.forEach((item, index, obj) => {
					if (index === 0) {
						obj[index].select = true
					} else {
						obj[index].select = false
					}
				})
				this.getRecentStockInfo()
			},
		},
		onLoad(options: any) {
			// 从搜索页或自选股页跳转过来后，显示对应的近期报告
			let stock = {
				code: options.code,
				name: '',
			}
			if (this.$store.state.isLogin || options.code || options.name) {
				this.curSearchCode = options.code
				this.curSearchName = options.name
				if (this.curSearchCode && this.curSearchName) {
					this.isShowCloseBtn = true
				} else {
					this.isShowCloseBtn = false
				}
				this.initData()
				this.getRecentStockInfo(stock)
			}
		},
	}
</script>

<style lang="scss">
	@import '@/static/scss/common/home.scss';
</style>
