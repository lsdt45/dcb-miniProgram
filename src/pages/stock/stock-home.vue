<template>
	<view class="stock-home__wrapper">
		<dcb-nav-bar :title="stockFullName" :leftIconType="leftIconType" :stock-home="true" search></dcb-nav-bar>
		<view class="stock-home__baseinfo-wrapper" v-if="!isShowDetail">
			<view class="baseinfo-item" v-for="(item, index) in baseInfoData.values()" :key="index">
				<text class="baseinfo-item__name"> {{ item.name }} </text>
				<text class="baseinfo-item__value"> {{ item.value + item.unit}} </text>
			</view>
		</view>
		<view class="stock-home__menu" v-if="!isShowDetail">
			<view class="stock-home__menu-card" v-for="(item,index) in navigMenuData" :key="index"	@click="toStock(item)">
				<view >
					<image referrerPolicy='no-referrer' class="stock-home__menu-card-img" :src="setImgUrl(index)"
						mode="scaleToFill"></image>
					<view class="stock-home__menu-card-content">
						<text :class="menuIconType(index)" :style="menuIconColor(index)"></text>
						<text class="stock-home__menu-card-topic"> {{ item.topic }} </text>
					</view>
				</view>
			</view>
		</view>
		<!-- 		<view class="stock-home__stock-detail" v-else>
			<stock :analyseNodeProp="analyseNodeProp"></stock>
		</view> -->
	</view>
</template>

<script lang="ts">
	import {
		mapState
	} from 'vuex'
	// import stock from "@/pages/stock/stock.vue"
	import DcbNavBar from "@/components/dcb-nav-bar/dcb-nav-bar.vue"
	import stockHomeData from "@/common/data/stock-home.js"
	export default {
		data() {
			return {
				navigDataItem: [], // 模板子数据
				navigDataItemTree: [], // 模板数据格式化后的树形数据
				navigMenuData: [], // 主页导航菜单
				isShowDetail: false, // 是否显示财务分析详情页
				analyseNodeProp: {}, // 传递给stock组件的当前选中的节点信息
				value: 0,
				range: [{
						value: 0,
						text: "篮球"
					},
					{
						value: 1,
						text: "足球"
					},
					{
						value: 2,
						text: "游泳"
					},
				],
				imgSrc: '', // 背景图路径
				imgIndex: 0, // 当前背景图的index
				baseInfoData: new Map(), // 基础指标信息
				indexData: [],
				userStock: [],
				userStockStr: "",
				userInfo:"",
				serverTime:""
			}
		},
		components: {
			// stock,
			DcbNavBar
		},
		computed: {
			...mapState(['navBarHeight', 'curStock']),
			// 股票全名
			stockFullName() {
				return this.curStock.secName + ' ' + this.curStock.secCode
			},
			// 左侧图标功能类型
			leftIconType() {
				if (this.isShowDetail) {
					return 'back'
				} else {
					return 'home'
				}
			},
			// 导航菜单小图标的类型
			menuIconType() {
				return (index) => {
					let typeIndex = 0
					if (index > 9) {
						typeIndex = index % 10
					} else {
						typeIndex = index
					}
					return stockHomeData.iconStyleArr[typeIndex].type
				}
			},
			menuIconColor() {
				return (index) => {
					let typeIndex = 0
					if (index > 9) {
						typeIndex = index % 10
					} else {
						typeIndex = index
					}
					return 'background-color:' + stockHomeData.iconStyleArr[typeIndex].color
				}
			}
			// 导航菜单小图标的颜色
		},
		methods: {
			// 初始化数据
			initData() {
				this.getTemplateData()
				this.getStockBaseInfo()
				this.getUserStockThirdParty()
			},
			// 获取模板数据
			getTemplateData() {
				this.navigMenuData = []
				let param = {
					Id: this.$config.data.FinancialAnalysisTemplateId
				}
				this.$api.get('/Report/GetNavigJsonById', param).then(resp => {
					if (resp.status) {
						let navigData = resp.data
						navigData.NavigJson = JSON.parse(navigData.navigJson)
						// 财务专题分析 数据
						// this.navigDataItem = navigData.NavigJson.children[0].children
						this.navigDataItem = navigData.NavigJson.children
						this.formatNavData(this.navigDataItem, 0)
						// 获取一级模板作为首页导航菜单，并去掉id中"_"后面的数据
						
						this.navigDataItem.forEach((item, index) => {
							let userClass=new Date(this.userInfo.endTime)>this.serverTime?this.userInfo.userClass:this.userInfo.userDegradeClass
							let info =item.userClassAuth.filter(t=>t.userClass==userClass)[0]
							if(info && info.detailedAuth==0 && item.isShow){
								item.id = this.$util.getNodeIdById(item.id)
								this.navigMenuData.push(item)
								//this.navigMenuData[index].id = this.$util.getNodeIdById(this.navigMenuData[index].id)
							}
						})
					}
				}).catch(err => {
					console.log(err)
				})
			},
			// 获取当前股票的基础指标信息
			getStockBaseInfo() {
				this.baseInfoData = stockHomeData.data;
				let param = {
					QueryList: [{
						code: this.curStock.secCode,
						year: this.curStock.year,
						name: this.curStock.rptType
					}]
				}
				this.$api.post('/Report/GetRecentStockBaseInfo', param).then(resp => {
					if (resp.status) {
						let dataMap = new Map(Object.entries(resp.data[0]))
						for (let [key, value] of this.baseInfoData.entries()) {
							let result = dataMap.get(key)
							let value_temp = {
								name: value.name,
								value: this.$util.dataFormat(result, 2),
								unit: value.unit
							}
							if (result != undefined) {
								this.baseInfoData.set(key, value_temp)
							}
						}
					}
				})
			},
			// 获取k线数据
			getStockQuotesBaseDayInfo(Secids, type) {
				this.$api.post('/Report/GetStockQuotesBaseDayInfo', {
					Secids: Secids,
				}, {}, false).then(res => {
					if (res.status) {
						if (type == 0)
							this.indexData = res.data
						if (type == 1)
							this.userStock = res.data
					}
				}).catch(err => {
					if (type == 0)
						this.indexData = []
					if (type == 1)
						this.userStock = []
				})
			},
			getUserStockThirdParty() {
				this.$api.post('/Report/GetUserStock', {}, {}, false).then(res => {
					if (res.status) {
						res.data.forEach(t => {
							this.userStockStr = this.userStockStr + (t.market == "SH" ? "1." + t.seccode :
								"0." + t.seccode) + ","
						})
						this.getStockData()
					}
				}).catch(err => {
					this.userStockStr = []
				})
			},
			// 获取指数行情基础信息数据
			getIndexData() {
				this.getStockQuotesBaseDayInfo("1.000001,0.399001,0.399006", 0)
			},
			getStockData() {
				setTimeout(() => {
					this.getStockQuotesBaseDayInfo(this.userStockStr, 1)
				}, 1000)
			},
			// 格式化模板数据
			formatNavData(data, treeLevel) {
				treeLevel++
				data.forEach((item, index) => {
					let navItemData = {}
					navItemData.topic = item.topic
					navItemData.treeLevel = treeLevel
					navItemData.id = this.$util.getNodeIdById(item.id)
					this.navigDataItemTree.push(navItemData)
					if (item.children && item.children.length > 0) {
						this.formatNavData(item.children, treeLevel)
					}
				})
			},
			// 显示财务分析页toStock
			toStock(item) {
				this.analyseNodeProp = {
					id: item.id,
					topic: item.topic
				}
				// this.isShowDetail = true
				// uni.hideTabBar()
				uni.navigateTo({
					url: `/subPackages/stock/stock?id=${item.id}&topic=${item.topic}`
				})
			},
			// 返回前一个页面
			back() {
				uni.navigateBack({
					delta: 1,
					fail: () => {
						this.isShowDetail = false
					}
				})
			},
			// 循环设置背景图
			setImgUrl(index) {
				let imgIndex = 0
				if (index > 9) {
					imgIndex = index % 10 + 1
				} else {
					imgIndex = index + 1
				}
				return `https://infostar-2020-1301764129.file.myqcloud.com/miniProgram/static/iamge/stock-home/menu-bg${imgIndex}.png`
			},
			/**
			 * description: 获取默认对比公司列表
			 * @createTime: 2022-10-25 17:35:56
			 */
			getDefaultCompareList() {
				let param = {
					Code: this.$store.state.curStock.secCode,
					ReportDate: null
				}
				this.$api.post('/Compare/GetToCompareList_CompanyAndFinance', param)
					.then((res: any) => {
						this.$store.commit('updateCurCmpList', res.data.defaultCompareList)
						this.$store.commit('updateDefaultIndustyList', res.data.defaultCompareList)
						let industryName = ''
						let curStock = {...this.$store.state.curStock}
						this.$config.data.IndustryTree.forEach((industry) => {
							let result = res.data.compareIndustry.find((compareIndustry) => {
								return compareIndustry.comp004_002 == industry
							})
							if(result) {
								if(result.comp004_006) {
									industryName = result.comp004_006
								}
							}
						})
						curStock.industry = industryName
						this.$store.commit('setCurStock', curStock)
					})
					.catch((err: Error) => console.log(err));
			},
		},
		onShow() {
			this.initData();
			this.getDefaultCompareList();
			this.userInfo=uni.getStorageSync("UserInfo")
			this.serverTime =uni.getStorageSync("serverTime")
		}
	}
</script>

<style lang="scss">
	$margin-left: 15px;
	$margin: 7.5px;

	.stock-home__wrapper {
		height: 100%;
		background: $page-bgcolor;

		.stock-home__baseinfo-wrapper {
			display: flex;
			flex-wrap: wrap;
			padding: 10px 15px 10px;
			background-color: #fff;

			.baseinfo-item {
				display: flex;
				justify-content: space-between;
				@include SingleTextEllipsis;
				margin-bottom: 5px;

				.baseinfo-item__name {
					color: $color-999;
				}

				.baseinfo-item__value {
					color: black;
				}

				&:nth-child(even) {
					flex-basis: calc(50% - $margin);
					margin-left: 7.5px;
					// margin-left: $margin-left;
				}

				&:nth-child(odd) {
					flex-basis: calc(50% - $margin);
					margin-right: 7.5px;
					// flex-basis: calc(50% - $margin-left);
				}

				&:nth-child(3),
				&:nth-child(4) {
					.baseinfo-item__name {
						font-size: 12px;
					}
				}
			}
		}

		.stock-home__menu {
			display: flex;
			justify-content: space-between;
			flex-wrap: wrap;
			position: relative;
			top: -3px;
			margin-top: 15px;
			padding: 0 13px;

			.stock-home__menu-card {
				display: flex;
				align-items: center;
				position: relative;
				z-index: 2;
				width: 340rpx;
				height: 112rpx;
				margin-bottom: 10px;

				.uni-card {
					border: 0;
					margin: 30rpx 5rpx 0 30rpx !important;
					padding: 5px 10px !important;
					background-color: transparent;

					.uni-card__content {
						@include SingleTextEllipsis;
					}
				}

				.stock-home__menu-card-content {
					display: inline-block;
					margin-left: 18px;
					width: 100%;
				}

				.iconfont {
					position: relative;
					z-index: 2;
					margin-right: 3px;
					color: #fff;
					border: 1px solid transparent;
					border-radius: 13px;
					padding: 3px;
					font-size: 13px;
				}

				.stock-home__menu-card-img {
					position: absolute;
					z-index: 1;
					top: 0;
					left: 0;
					height: 114rpx;
					width: 100%;
					height: 100%;
				}

				&-topic {
					position: absolute;
					z-index: 1;
					width: 73%;
					@include SingleTextEllipsis;
				}
			}
		}
	}
</style>
