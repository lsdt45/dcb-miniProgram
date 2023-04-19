<template>
	<view class="stock-search-bar__wrapprer">
		<view class="stock-search-header">
			<u-search placeholder="请输入股票代码/名称/简拼" shape="square" v-model="searchKeyWord" clearabled
				@search="searchStock">
			</u-search>
		</view>
		<view class="search-result" v-if="isShowResult">
			<uni-transition :mode-class="['fade', 'zoom-in']" :show="isResultExit">
				<uni-list>
					<uni-list-item v-for="item in searchResultData" :key="item.seccode" clickable
						@click="toSpecifyStock(item, 'search')">
						<template v-slot:header>
							{{item.secname + '(' + item.seccode + ')'}}
						</template>
					</uni-list-item>
				</uni-list>
			</uni-transition>
			<view class="search-result-non" v-show="!isResultExit">
				暂无数据
			</view>
		</view>
	</view>
	<view class="stock-search-bar_mask" v-if="isShowResult" @click="closeResultList">
	</view>
</template>

<script>
	export default {
		data() {
			return {
				searchKeyWord: '', // 搜索关键词
				searchResultData: '', // 搜索结果的数据
				isShowResult: false, // 是否显示搜索结果
				isResultExit: true, // 是否存在搜索结果				
			}
		},
		methods: {
			// 开始搜素
			searchStock(val) {
				// 接口入参
				let param = {
					search: val.toString()
				}
				if (val) {
					this.$api.get('/Report/GetStockInfoSearch', param).then(resp => {
						if (resp.status) {
							this.searchResultData = resp.data
							// 是否有搜索结果
							if (this.searchResultData.length != 0) {
								this.isShowResult = true
								this.isResultExit = true
							} else {
								this.isShowResult = false
								this.isResultExit = false
							}
						}
					})
				}
			},
			closeResultList() {
				this.isShowResult = false
				this.isResultExit = false
			}
		}
	}
</script>

<style lang="scss">
	.stock-search-bar__wrapprer {

		// 搜索页面头部
		.stock-search-header {
			// padding: 20rpx 40rpx;
			border-bottom: $border3;
		}

		// 搜索结果
		.search-result {
			position: relative;
			z-index: 99;
			.search-result-non {
				text-align: center;
			}
		}

		// 历史搜索
		.search-history {
			display: flex;
			flex-direction: column;
			padding: 60rpx 30rpx 0;

			// 历史搜索头部
			.search-history-header {
				display: flex;
				justify-content: space-between;
				font-size: $font-size-text-medium;
				margin-bottom: 20rpx;

				.iconfont {
					display: flex;
					align-items: center;
					color: $color-333;
					font-size: 32rpx;
				}
			}
		}
	}
	.stock-search-bar_mask {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		z-index: 98;
	}
</style>
