<template>
	<view class="contact-wrapper">
		<uni-nav-bar title="联系我们" left-icon="left" :height="navBarHeight" backgroundColor="#2C72EC" color="#FFF"
			:fixed="true" @clickLeft="back">
		</uni-nav-bar>
		<view class="contact-body">
			<!-- <view class="logo-top">
				<image class="img" mode="aspectFit" referrerPolicy='no-referrer' :src="logoUrl"></image>
				<text>还原一个真实的企业</text>
			</view> -->
			<view class="qr-code">
				<image class="img" mode="aspectFit" show-menu-by-longpress="true" referrerPolicy='no-referrer' :src="qrCodeUrl"></image>
				<text>长按识别图中二维码，联系我们</text>
			</view>
			<view class="contact-logo2">
				<img class="contact-logo2__img" referrerPolicy='no-referrer' src="https://infostar-2020-1301764129.file.myqcloud.com/miniProgram/static/iamge/ContactUs.png" alt="">
				<view class="contact-logo2__text">
					<text class="contact-logo2__text-top">读财报小程序全新上线</text>
					<text class="contact-logo2__text-bottom">
						<text class="contact-logo2__text-bottom intro">如需体验更多功能，请使用</text>
						<text class="contact-logo2__text-bottom url">ducaibao.com.cn</text>
					</text>
				</view>
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
				logoUrl:"https://infostar-2020-1301764129.file.myqcloud.com/miniProgram/static/iamge/logo.png",
				qrCodeUrl:"https://infostar-2020-1301764129.file.myqcloud.com/miniProgram/static/iamge/weixin.png"
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
		}
	}
</script>

<style lang="scss">
	page {
		background-color: #f8f8f8;
	}
	.logo-top{
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 200rpx;
		margin: 40rpx;
		background-color: #fff;
		border-radius: 25rpx;
		.img{
			height: 80rpx;
			margin-bottom: 10rpx;
		}
	}
	.qr-code{
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 600rpx;
		margin: 40rpx;
		background-color: #fff;
		border-radius: 25rpx;
		.img{
			height: 400rpx;
		}
	}
	.contact-logo2 {
		display: flex;
		justify-content: center;
		position: relative;
		.contact-logo2__img {
			width: 680rpx;
			height: 240rpx;
		}
		.contact-logo2__text {
			display: flex;
			flex-direction: column;
			position: absolute;
			left: 80rpx;
			top: 60rpx;
			font-size: 20px;
			font-weight: bold;
			color: $color-main;
			.contact-logo2__text-bottom {
				position: relative;
				left: 20rpx;
				top: 10rpx;
				font-weight: normal;
				font-size: 12px;
				&.url {
					color: #EF6250;
				}
			}
		}
	}
</style>
