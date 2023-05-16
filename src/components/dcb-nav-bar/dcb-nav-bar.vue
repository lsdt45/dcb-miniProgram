<!-- @format -->

<template>
	<view class="dcb-nav-bar__wrapper">
		<!-- #ifdef MP -->
		<uni-nav-bar :height="navBarHeight" backgroundColor="#2C72EC" color="#FFF" :fixed="true">
			<template v-slot:default>
				<view class="stock-home_header-title">
					<text class="stock-home_header-title-text" @click="toSearch">{{ title }}</text>
					<view class="iconfont icon-search" @click="toSearch" v-if="search"></view>
				</view>
			</template>
			<template v-slot:left>
				<view :class="leftIcon" @click="toSpecifiedPage"></view>
			</template>
		</uni-nav-bar>
		<!-- #endif -->
		<!-- #ifdef H5 -->
		<uni-nav-bar height="50px" backgroundColor="#2C72EC" color="#FFF" :fixed="true">
			<template v-slot:default>
				<view class="stock-home_header-title">
					<text class="stock-home_header-title-text" @click="toSearch">{{ title }}</text>
					<view class="iconfont icon-search" @click="toSearch" v-if="search"></view>
				</view>
			</template>
			<template v-slot:left>
				<view :class="leftIcon" @click="toSpecifiedPage"></view>
			</template>
		</uni-nav-bar>
		<!-- #endif -->
	</view>
</template>

<script>
	import { mapState } from 'vuex'
	export default {
		name: 'dcb-nav-bar',
		data() {
			return {
				dataLeftIconType: 'home', // data选项里的leftIconType
			}
		},
		props: {
			title: {
				type: String,
				default: '',
			},
			// 左侧图表的功能类型
			// 可选值:'home'，'back'
			leftIconType: {
				type: String,
				default: 'home',
			},
			// 上一个页面是否是stock-home
			stockHome: {
				type: Boolean,
				default: false,
			},
			search: {
				type: Boolean,
				default: false,
			},
			// 是否为自定义返回方法
			isCustomBack: {
				type: Boolean,
				default: false,
			},
		},
		computed: {
			...mapState(['navBarHeight']),
			// 左侧图表
			leftIcon() {
				if (this.leftIconType === 'home') {
					return 'iconfont icon-home'
				} else {
					return 'iconfont icon-left'
				}
			},
		},
		methods: {
			// 进入搜索页面
			toSearch() {
				this.search &&
					uni.navigateTo({
						url: '/pages/stock/stock-search',
					})
			},
			// 返回首页
			toSpecifiedPage() {
				if (this.isCustomBack) {
					this.customBack()
				} else {
					if (this.leftIconType === 'home') {
						uni.navigateTo({
							url: '/pages/home/home',
						})
					} else if (this.stockHome === true) {
						uni.navigateBack({
							delta: 1,
						})
					} else {
						uni.navigateBack({
							delta: 1,
						})
					}
				}
			},
			// 自定义返回方法
			customBack() {
				this.$emit('customBack')
			},
		},
		mounted() {},
	}
</script>

<style lang="scss">
	.dcb-nav-bar__wrapper {
		.stock-home_header-title {
			position: absolute;
			left: 50%;
			transform: translateX(-50%);
			font-size: 17px;
			bottom: 22rpx;

			.icon-search {
				display: inline;
				margin-left: 5px;
			}
		}

		.icon-home,
		.icon-left {
			position: absolute;
			font-size: 17px;
			bottom: 24rpx;
		}
	}
</style>
