<template>
	<view class="ucenter-wrapper">
		<uni-nav-bar title="读财报" :height="navBarHeight" backgroundColor="#2C72EC" color="#FFF" :fixed="true"></uni-nav-bar>
		<view class="logo" @click="goLogin()">
			<image class="logo-img" referrerPolicy='no-referrer' :src="(wxUerInfo && wxUerInfo.userClass!=99)?loginAvatarUrl:avatarUrl"></image>
			<view>
				<text v-if="wxUerInfo && wxUerInfo.userClass!=99" class="uer-name">欢迎 {{wxUerInfo.userName}}</text>
				<text v-else class="uer-name">点击登录</text>
				<br>
				<text v-if="!wxUerInfo || wxUerInfo.userClass==99" class="uer-desc">登录账号体验更多服务</text>
				<text v-else
					class="uer-desc">有效期至：{{$util.FormatDate(new Date(wxUerInfo.endTime), "yyyy-MM-dd")}}</text>
			</view>
		</view>
		<view class="menu-list-wrapper">
			<view class="menu-list">
				<view @click="feedback()"  class="menuInfo radiusTop">
					<view class="menuInfo_left">
						<view class="iconfont icon-feedback icon"></view>
						<text class="list-text">意见反馈</text>
					</view>
					<view class="iconfont icon-right"></view>
				</view>
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
				<view @click="contactMe()" :class="(wxUerInfo && wxUerInfo.userClass != 99)?'menuInfo':'menuInfo radiusBottom'">
					<view class="menuInfo_left">
						<view class="iconfont icon-a-customerservice icon"></view>
						<text class="list-text">联系我们</text>
					</view>
					<view class="iconfont icon-right"></view>
				</view>
				<view v-if="wxUerInfo && wxUerInfo.userClass != 99" class="transition">
					
				</view>
				<view @click="logOut()" v-if="wxUerInfo && wxUerInfo.userClass != 99" class="logout radiusBottom">
					
					<text class="list-text">退出登录</text>
					<!-- <view class="menuInfo_left">
						<view class="iconfont icon-quit icon"></view>
						<text class="list-text">退出</text>
					</view>
					<view class="iconfont icon-right"></view> -->
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
				avatarUrl: "/static/image/avatar.png",
				loginAvatarUrl: "https://infostar-2020-1301764129.file.myqcloud.com/miniProgram/static/iamge/user.png",
				wxUerInfo: uni.getStorageSync("UserInfo")
			}
		},
		computed: {
			...mapState(['navBarHeight']),
		},
		// onLoad: () => {
		// 	this.wxUerInfo=uni.getStorageSync("UserInfo")
		// },
		onShow: function() {
			this.wxUerInfo = uni.getStorageSync("UserInfo")
		},
		methods: {
			// 使用说明
			goUse(){
				uni.navigateTo({
					url: 'useDesc'
				})
			},
			// 意见反馈
			feedback(){
				uni.navigateTo({
					url: 'feedback'
				})
			},
			// 联系我们
			contactMe() {
				uni.navigateTo({
					url: 'contactMe'
				})
			},
			// 隐私申明
			goAgreement() {
				uni.navigateTo({
					url: 'privacyInfo'
				})
			},
			clearUserInfo() {
				uni.setStorageSync("Authorization",null)
				uni.setStorageSync("UserInfo",null)
				this.wxUerInfo = uni.getStorageSync("UserInfo"),
				this.avatarUrl = "/static/image/avatar.png"
				this.$api.onLogin();
			},
			// 退出登录
			logOut() {
				if (this.wxUerInfo && this.wxUerInfo.userClass != 99) {
					uni.login({
						success: (codeRes) => {
							if (codeRes.code) {
								this.$api.get('/wx/LogOut', {
									code: codeRes.code
								}).then(res => {
									this.clearUserInfo()
									// this.$store.commit('updateUserInfo', '')
								}).catch(err => {
									this.clearUserInfo()
								})
							}
						},
						fail() {
							this.clearUserInfo()
						}
					})
				}
			},
			goLogin() {
				if (this.wxUerInfo && this.wxUerInfo.userClass != 99) {
					return
				}
				// this.avatarUrl="/static/image/user.png"
				uni.navigateTo({
					url: 'login'
				})
			}
		}
	}
</script>

<style lang="scss">
	// 去除用户中心里顶部导航栏的下边框
	.ucenter-wrapper {
		.uni-navbar--border {
			border-bottom-style: none !important;
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
		background-color: #2C72EC
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

		.radiusTop{
			border-radius: 20rpx 20rpx 0rpx 0rpx;
		}
		
		.radiusBottom{
			border-radius: 0rpx 0rpx 20rpx 20rpx;
		}
		
		.logout{
			height: 100rpx;
			background-color: #fff;
			border-bottom: 1px solid $border-color-table;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 32rpx;
		}
		.transition{
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
					color: #2C72EC;
				}

			}
		}
		
	}
	.menu-list-wrapper {
		width: 100%;
		position: relative;
		top: -70rpx;
	}
</style>
