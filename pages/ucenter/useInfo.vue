<template>
	<view class="user-info-wrapper">	
		<web-view :src="url"></web-view>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex'
	export default {
		data() {
			return {
				url:""
			};
		},
		computed: {
			...mapState(['navBarHeight'])
		},
		methods: {
			// 返回前一个页面
			back() {
				uni.navigateBack({
					delta: 1
				})
			},			
		},	
		onLoad: function (option) {
			this.url=option.url
		}
	}
</script>

<style lang="scss">
.user-info-wrapper{
		width: 750rpx;
		height: 100%;
	}
</style>
