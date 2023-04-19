<template>
	<view class="phone-login-wrapper">
		<uni-nav-bar title="手机号登录" left-icon="left" :height="navBarHeight" backgroundColor="#2C72EC" color="#FFF"
			:fixed="true" @clickLeft="back">
		</uni-nav-bar>
		<view class="phoneLogin">
			<view class="logo-top">
				<image class="img" mode="widthFix" referrerPolicy='no-referrer' :src="logoUrl"></image>
			</view>
			<view class="inputInfo">
				<u-field v-model="mobile" label="手机号" maxlength="11" @blur="checkPhone()" @focus="resetPhoneErrorMsg()"
					@input="checkPhone()" :error-message="phoneErrorMsg" focus="true" placeholder="请填写手机号">
				</u-field>
			</view>
			<view class="inputInfo">
				<u-field v-model="code" label="验证码" maxlength="6" @blur="checkCode()" @focus="resetCodeErrorMsg()"
					@input="checkCode()" :error-message="codeErrorMsg" placeholder="请填写验证码">
					<u-button size="mini" slot="right" type="success" @click="getCode">{{codeText}}</u-button>
				</u-field>
			</view>
			<u-verification-code ref="uCode" @change="codeChange"></u-verification-code>
			<button @click="logon()" class="phoneloginBtn">登录</button>
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
				mobile: "",
				code: "",
				phoneErrorMsg: "",
				codeErrorMsg: "",
				codeText: "发送验证码",
				logoUrl: "https://infostar-2020-1301764129.file.myqcloud.com/miniProgram/static/iamge/logo.png"
			};
		},
		computed: {
			...mapState(['navBarHeight']),
		},		
		methods: {
			codeChange(text) {
				this.codeText = text;
			},
			//获取验证码
			getCode() {
				if (this.$refs.uCode.canGetCode) {
					if (!this.checkPhone()) {
						return
					}
					this.$api.get('/WX/GetVerificationCode', {
						phone: this.mobile
					}).then(res => {
						if (res.status) {
							setTimeout(() => {
								uni.hideLoading();
								// 通知验证码组件内部开始倒计时
								this.$refs.uCode.start();
							}, 1000);
						}
					}).catch(err => {
						this.$u.toast(err.description);
					})
				} else {
					this.$u.toast('倒计时结束后再发送');
				}
			},
			checkPhone() {
				var pattern = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/
				let res = pattern.test(this.mobile)
				if (!res) {
					this.phoneErrorMsg = "请输入正确的手机号"
				} else {
					this.phoneErrorMsg = ""
				}
				return res
			},
			resetPhoneErrorMsg() {
				this.phoneErrorMsg = ""
			},
			checkCode() {
				let res = this.code.length == 6
				if (!res) {
					this.codeErrorMsg = "请输入正确的验证码"
				} else {
					this.codeErrorMsg = ""
				}
				return res
			},
			resetCodeErrorMsg() {
				this.codeErrorMsg = ""
			},
			logon() {
				if (!this.checkPhone()) {
					this.checkCode()
					return
				}
				if (!this.checkCode()) {
					return
				}
				uni.login({
					success: (codeRes) => {
						if (codeRes.code) {
							this.$api.post('/WX/LoginByPhone', {
								Code: codeRes.code,
								Phone: this.mobile,
								VerificationCode: this.code
							}).then(res => {
								if (res.status) {
									uni.setStorageSync("Authorization",res.token)
									uni.setStorageSync("UserInfo",res.data)
									this.wxUerInfo = res.data
									this.$store.commit('updateUserInfo', this.wxUerInfo)
								}
								this.goback()
							}).catch(err => {
								uni.setStorageSync("Authorization",null)
								uni.setStorageSync("UserInfo",null)
								this.wxUerInfo = null
								this.goback()
							})
						}
					}
				})
			},
			goback() {
				uni.switchTab({
					url: 'ucenter'
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
	.phoneLogin {
		height: 80vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		.logo-top {
			margin-bottom: 50rpx;
		}
	}

	.inputInfo {
		width: 650rpx;
		margin-bottom: 20rpx;
	}

	.phoneloginBtn {
		width: 650rpx;
		font-size: 30rpx;
		background-color: rgb(233, 241, 253);
		color: rgb(44, 114, 436);
		border-radius: 100rpx;
	}
</style>
