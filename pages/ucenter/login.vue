<template>
	<view>
		<uni-nav-bar title="用户登录" left-icon="left" :height="navBarHeight" backgroundColor="#2C72EC" color="#FFF"
			:fixed="true" @clickLeft="back">
		</uni-nav-bar>		
		<view class="logo-top">
			<image class="img" mode="widthFix" referrerPolicy='no-referrer' :src="logoUrl"></image>
			<text class="text">真正的投资者都在使用的“读财报”</text>
		</view>
		<view class="login_btn">
			<button open-type="getPhoneNumber" @getphonenumber="getPhoneNumber" class="wx_login">微信授权登录</button>
			<button @click="goPhoneLogin()" class="phone_login">手机号登录</button>
			<text @click="goAgreement()">登录即同意<text class="privacyInfo">《隐私政策》</text></text>
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
				logoUrl: "https://infostar-2020-1301764129.file.myqcloud.com/miniProgram/static/iamge/logo.png",
				isFromPdf: false, // 是否自pdf页面跳转而来
			};
		},
		computed: {
			...mapState(['navBarHeight']),
		},		
		methods: {
			goPhoneLogin(){
				uni.navigateTo({
					url: 'phoneLogin'
				})
			},
			// 隐私申明
			goAgreement() {
				uni.navigateTo({
					url: 'privacyInfo'
				})
			},
			getPhoneNumber(e) {
				// 用户拒绝授权
				if (!e.detail.iv) {
					uni.showToast({
						icon: "none",
						title: '登录账号体验更多服务'
					})
					return
				}
				let userinfo = uni.getStorageSync("UserInfo")
				console.log(userinfo)
				if(!userinfo.openId){
					uni.showToast({
						icon: "none",
						title: '授权失败'
					})
					return
				}
				this.$api.post('/WX/DecodePhone', {
					openid: userinfo.openId,
					encryptedData: e.detail.encryptedData,
					iv: e.detail.iv
				}).then(res => {
					if (res.status) {
						uni.setStorageSync("Authorization",res.token)
						uni.setStorageSync("UserInfo",res.data)
						this.wxUerInfo = res.data
						this.$store.commit('updateUserInfo', this.wxUerInfo)
					}
					if(this.isFromPdf) {
					uni.navigateBack({
						delta: 1,
						success: () => {
							uni.$emit('update',{isLogin: true})
						}
					})
					} else {
						uni.navigateBack()
					}
				}).catch(err => {
					uni.showToast({
						icon: "none",
						title: '一键授权登录失败，请重试。'
					})
					uni.setStorageSync("Authorization",null)
					uni.setStorageSync("UserInfo",null)
					this.wxUerInfo = null
					uni.navigateBack()
				})
			},
			// 返回前一个页面
			back() {
				uni.navigateBack({
					delta: 1
				})
			},
		},
		onLoad(options) {
			if(options && options.isFromPdf) {
				this.isFromPdf = true
			} else {
				this.isFromPdf = false
			}
		}
	}
</script>

<style lang="scss">
	.logo-top {
		display: flex;
		flex-direction: column;
		justify-content: center;
		height: 500rpx;
		border-radius: 25rpx;

		.img {
			width: 400rpx;
			margin-bottom: 10rpx;
		}

		.text {
			margin-left: 50rpx;
		}
	}

	.login_btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		.wx_login {
			width: 650rpx;
			margin-bottom: 30rpx;
			font-size: 30rpx;
			background-color: rgb(44, 114, 436);
			color: #fff;
			border-radius: 100rpx !important;
		}

		.phone_login {
			width: 650rpx;
			margin-bottom: 30rpx;
			font-size: 30rpx;
			background-color: rgb(233, 241, 253);
			color: rgb(44, 114, 436);
			border-radius: 100rpx !important;
		}

		.privacyInfo {
			text-decoration: underline
		}
	}
</style>
