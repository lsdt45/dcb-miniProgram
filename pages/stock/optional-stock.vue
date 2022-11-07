<template>
	<view class="optional-stock-wrapper">
		<uni-nav-bar title="读财报" left-icon="left" :height="navBarHeight" backgroundColor="#2C72EC" color="#FFF"
			:fixed="true" @clickLeft="back">
		</uni-nav-bar>
		<view class="optional-stock__header">
			<uni-list :border="false">
				<!-- 表头 -->
				<uni-list-item :border="false">
					<template v-slot:body>
						<view class="list-wrapper header">
							<view class="list-item">股票</view>
							<view class="list-item">代码</view>
							<view class="list-item__last">行业</view>
						</view>
					</template>
				</uni-list-item>
				<uni-swipe-action>
					<uni-swipe-action-item :right-options="options" v-for="(item, index) in optionalStockData"
						:key="index" @click="deleteStock(item)">
						<uni-list-item clickable :border="false" @click="toSpecifyStock(item)">
							<template v-slot:body>
								<view class="list-wrapper">
									<view class="list-item">{{ item.secname }}</view>
									<view class="list-item">{{ item.seccode }}</view>
									<view class="list-item__last">{{ item.industry }}</view>
								</view>
							</template>
						</uni-list-item>
					</uni-swipe-action-item>
				</uni-swipe-action>
			</uni-list>
			<view class="btn-add-stock" @click="toSearch">
				+ 添加自选
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex'
	
	export default {
		data() {
			return {
				optionalStockData: [], // 自选股数据
				// 滑动按钮数据
				options: [{
					text: '删除',
					style: {
						backgroundColor: '#dd524d'
					}
				}]
			}
		},
		computed: {
			...mapState(['navBarHeight'])
		},
		onLoad() {
			this.initData()
		},
		methods: {
			// 初始化数据
			initData() {
				this.getOptionalStockList()
			},
			getOptionalStockList() {
				this.$api.post('/Report/GetUserStock').then(resp => {
					if (resp.status) {
						this.optionalStockData = resp.data
					}
				})
			},
			// 进入搜索页面
			toSearch() {
				uni.navigateTo({
					url: '/pages/stock/stock-search',
				})
			},
			// 进入指定股票页面
			toSpecifyStock(stock) {
				// 是否登录
				let userInfo = uni.getStorageSync("UserInfo");
				let isLogin = false;
				if (userInfo && userInfo.userClass != 99) {
					isLogin = true;
				}
				if(!isLogin) {
					return
				}
				uni.reLaunch({
					url: `/pages/stock/stock?reload=true`,
					success: (resp) => {
						let stock_temp = {
							secName: stock.secname,
							secCode: stock.seccode
						}
						// 更新当前股票信息
						this.$store.commit('setCurStock', stock_temp)
					}
				})
			},
			/**
			 * author: ljw
			 * description: 删除选择的股票
			 * @param {string} item - 所选股票的信息.
			 * @return 
			 * @createTime: 2022-07-01 17:50:23
			 */
			deleteStock(item) {
				let param = {
					Seccode: item.seccode
				}
				this.$api.post('/Report/RemoveUserStock', param, {}, false).then(resp => {
					if (resp.status) {
						uni.showToast({
							title: '成功删除!',
							icon: 'success',
							success: () => {
								this.optionalStockData = this.optionalStockData.filter(data => {
									return data.seccode != item.seccode
								})
							}
						})
					} else {
						uni.showToast({
							title: '删除失败!',
							icon: 'error'
						})
					}
				})
			},
			// 返回前一个页面
			back() {
				uni.navigateBack({
					delta: 1
				})
			},
		}
	}
</script>

<style lang="scss">
	.optional-stock-wrapper {
		height: 100vh;
		background-color: $page-bgcolor;
		
		.uni-list-item {
			.uni-list-item__container {
				border-bottom: $border-normal-div;
			}
		}
		.uni-table {
			min-width: 100% !important;

			.uni-table-td {
				padding: 20px 15px;
				color: $font-color-black;
				font-size: $font-size-text-medium;
			}

			.uni-table-th {
				padding: 12px 16px;
				color: $color-333;
				opacity: 0.5;
				font-weight: normal;
				font-size: $font-size-text-small;
			}
		}

		// 添加自选 按钮
		.btn-add-stock {
			background-color: white;
			height: 100rpx;
			line-height: 100rpx;
			font-size: $font-size-text-medium;
			color: $font-color-black;
			text-align: center;
		}

		.list-wrapper {
			display: flex;
			width: 100%;

			.list-item {
				flex-basis: 24%;
				font-size: $size34;
			}

			&.header {

				.list-item,
				.list-item__last {
					font-size: $size28;
					color: $color-999;
				}
			}

			.list-item__last {
				flex: 1;
			}
		}
	}
</style>
