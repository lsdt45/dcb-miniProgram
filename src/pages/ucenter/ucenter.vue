<!-- @format -->

<template>
	<view class="ucenter-wrapper">
		<uni-nav-bar title="读财报" :height="navBarHeight" backgroundColor="#2C72EC" color="#FFF" :fixed="true"></uni-nav-bar>
		<!-- #ifdef MP -->
		<view class="logo" @click="goLogin()">
			<image class="logo-img" referrerPolicy="no-referrer" :src="wxUerInfo && wxUerInfo.userClass != 99 ? loginAvatarUrl : avatarUrl"></image>
			<view>
				<text v-if="wxUerInfo && wxUerInfo.userClass != 99" class="uer-name">欢迎 {{ wxUerInfo.userName }}</text>
				<text v-else class="uer-name">点击登录</text>
				<br />
				<text v-if="!wxUerInfo || wxUerInfo.userClass == 99" class="uer-desc">登录账号体验更多服务</text>
				<text v-else class="uer-desc">有效期至：{{ $util.FormatDate(new Date(wxUerInfo.endTime), 'yyyy-MM-dd') }}</text>
			</view>
		</view>
		<!-- #endif -->
		<view class="menu-list-wrapper">
			<view class="menu-list">
				<view @click="feedback()" class="menuInfo radiusTop">
					<view class="menuInfo_left">
						<view class="iconfont icon-feedback icon"></view>
						<text class="list-text">意见反馈</text>
					</view>
					<view class="iconfont icon-right"></view>
				</view>
				<!-- #ifdef MP -->
				<view @click="goUse()" class="menuInfo">
					<view class="menuInfo_left">
						<view class="iconfont icon-help2 icon"></view>
						<text class="list-text">使用说明</text>
					</view>
					<view class="iconfont icon-right"></view>
				</view>
				<view @click="goAgreement()" class="menuInfo">
					<view class="menuInfo_left">
						<view class="iconfont icon-documentattribute icon"></view>
						<text class="list-text">服务协议&隐私声明</text>
					</view>
					<view class="iconfont icon-right"></view>
				</view>
				<!-- #endif -->
				<view @click="contactMe()" :class="wxUerInfo && wxUerInfo.userClass != 99 ? 'menuInfo' : 'menuInfo radiusBottom'">
					<view class="menuInfo_left">
						<view class="iconfont icon-a-customerservice icon"></view>
						<text class="list-text">联系我们</text>
					</view>
					<view class="iconfont icon-right"></view>
				</view>
				<view v-if="wxUerInfo && wxUerInfo.userClass != 99" class="transition"></view>
				<view @click="logOut()" v-if="wxUerInfo && wxUerInfo.userClass != 99" class="logout radiusBottom">
					<text class="list-text">退出登录</text>
					<!-- <view class="menuInfo_left">
						<view class="iconfont icon-quit icon"></view>
						<text class="list-text">退出</text>
					</view>
					<view class="iconfont icon-right"></view> -->
				</view>
				<view class="desktop-ad">
					<view class="contact-logo2">
						<img
							class="contact-logo2__img"
							referrerPolicy="no-referrer"
							src="https://ducaibao.com.cn/miniProgram/static/iamge/PC_access.png"
							alt="" />
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { mapState } from 'vuex'
	export default {
		data() {
			return {
				avatarUrl: '/static/image/avatar.png',
				loginAvatarUrl: 'https://infostar-2020-1301764129.file.myqcloud.com/miniProgram/static/iamge/user.png',
				wxUerInfo: uni.getStorageSync('UserInfo'),
			}
		},
		computed: {
			...mapState(['navBarHeight']),
		},
		// onLoad: () => {
		// 	this.wxUerInfo=uni.getStorageSync("UserInfo")
		// },
		onShow: function () {
			this.wxUerInfo = uni.getStorageSync('UserInfo')
		},
		methods: {
			// 使用说明
			goUse() {
				uni.navigateTo({
					url: 'useDesc',
				})
			},
			// 意见反馈
			feedback() {
				uni.navigateTo({
					url: 'feedback',
				})
			},
			// 联系我们
			contactMe() {
				uni.navigateTo({
					url: 'contactMe',
				})
			},
			// 隐私申明
			goAgreement() {
				uni.navigateTo({
					url: 'privacyInfo',
				})
			},
			clearUserInfo() {
				uni.setStorageSync('Authorization', null)
				uni.setStorageSync('UserInfo', null)
				;(this.wxUerInfo = uni.getStorageSync('UserInfo')), (this.avatarUrl = '/static/image/avatar.png')
				this.$api.onLogin()
			},
			// 退出登录
			logOut() {
				if (this.wxUerInfo && this.wxUerInfo.userClass != 99) {
					uni.login({
						success: (codeRes) => {
							if (codeRes.code) {
								this.$api
									.get('/wx/LogOut', {
										code: codeRes.code,
									})
									.then((res) => {
										this.clearUserInfo()
										// this.$store.commit('updateUserInfo', '')
									})
									.catch((err) => {
										this.clearUserInfo()
									})
							}
						},
						fail() {
							this.clearUserInfo()
						},
					})
				}
			},
			goLogin() {
				// #ifdef MP
				if (this.wxUerInfo && this.wxUerInfo.userClass != 99) {
					return
				}
				uni.navigateTo({
					url: 'login',
				})
				// #endif
			},
		},
	}
</script>

<style lang="scss">
	// 去除用户中心里顶部导航栏的下边框
	.ucenter-wrapper {
		.uni-navbar--border {
			border-bottom-style: none !important;
		}
		.contact-logo2 {
			display: flex;
			justify-content: center;
			position: relative;
			.contact-logo2__img {
				margin-top: 1em;
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
						color: #ef6250;
					}
				}
			}
		}
	}

	page {
		background-color: #f8f8f8;
	}

	.logo {
		text-align: center;
		width: 750rpx;
		padding: 60rpx 0rpx 120rpx 0rpx;
		background-color: #fff;
		flex-direction: row;
		align-items: center;
		border-bottom: 1px solid $border-color-table;
		background-color: #2c72ec;
	}

	.logo-img {
		width: 120rpx;
		height: 120rpx;
		border-radius: 120rpx;
		background: white;
	}

	.uer-name {
		font-size: 32rpx;
		color: #fff;
	}

	.uer-desc {
		font-size: 28rpx;
		color: #fff;
	}

	.menu-list {
		width: 680rpx;
		margin: 0 auto;

		.radiusTop {
			border-radius: 20rpx 20rpx 0rpx 0rpx;
		}

		.radiusBottom {
			border-radius: 0rpx 0rpx 20rpx 20rpx;
		}

		.logout {
			height: 100rpx;
			background-color: #fff;
			border-bottom: 1px solid $border-color-table;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 32rpx;
		}
		.transition {
			height: 30rpx;
			background-color: #fff;
			border-bottom: 1px solid $border-color-table;
		}
		.menuInfo {
			background-color: #fff;
			height: 100rpx;
			display: flex;
			align-items: center;
			justify-content: space-between;
			border-bottom: 1px solid $border-color-table;
			padding: 40rpx;
			font-size: 32rpx;

			.menuInfo_left {
				display: flex;
				align-items: center;
				justify-content: space-between;

				.icon {
					margin-right: 20rpx;
					color: #2c72ec;
				}
			}
		}
	}
	/* #ifdef MP */
	.menu-list-wrapper {
		width: 100%;
		position: relative;
		top: -70rpx;
	}
	/* #endif */
	/* #ifdef H5 */
	.ucenter-wrapper {
		.contact-logo2__text-bottom {
			left: 0 !important;
			font-size: 16px !important;
		}
		.contact-logo2 {
			margin-top: 2em;
		}
	}
	.menu-list-wrapper {
		width: 100%;
		position: relative;
		top: 1em;
	}
	/* #endif */
</style>
