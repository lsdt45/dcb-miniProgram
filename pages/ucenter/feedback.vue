<template>
	<view class="feedback-wrapper">
		<uni-nav-bar title="意见反馈" left-icon="left" :height="navBarHeight" backgroundColor="#2C72EC" color="#FFF"
			:fixed="true" @clickLeft="back">
		</uni-nav-bar>
		<view class="feedbackMain">
			<view class="feedbackContent">
				<uni-easyinput class="feedbackContentInput" type="textarea" focus v-model="Content" maxlength="1000"
					placeholder="请具体描述您遇到的问题"
					placeholder-style="font-size:14px;font-family:'PingFang-SC-Regular','PingFang SC',sans-serif;"
					:clearable="false"></uni-easyinput>
			</view>
			<view class="feedbackPbone">
				<uni-easyinput v-model="ContactInfo" maxlength="11" placeholder="为快速解决问题,请输入您的手机号"
					placeholder-style="font-size:14px;font-family:'PingFang-SC-Regular';">
				</uni-easyinput>
			</view>
			<view>
				<button class="feedbackBtn" @click="submit()">提交</button>
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
				Content: "",
				ContactType: 1,
				ContactInfo: ""
			};
		},
		computed: {
			...mapState(['navBarHeight']),
		},
		methods: {
			submit() {
				// if (!this.checkPhone()) {
				// 	this.$u.toast('为快速解决问题,请输入正确的手机号');
				// 	return
				// }
				if (!this.Content) {
					this.$u.toast('请具体描述您遇到的问题');
					return
				}
				this.$api.post('/Report/AddAnalyseFeedbackCommon', {
					Content: this.Content,
					ContactType: this.ContactType,
					ContactInfo: this.ContactInfo
				}).then(res => {
					if (res.status) {
						this.$u.toast("反馈成功，我们会尽快进行处理！");
						uni.navigateBack()
					} else {
						this.$u.toast("反馈失败，请稍后再试！");
					}
				}).catch(err => {
					this.$u.toast(err.description);
				})
			},
			checkPhone() {
				var pattern = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/
				let res = pattern.test(this.ContactInfo)
				return res
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
	.feedback-wrapper {
		height: 70vh;
	}
	.plackholderClass {
		font-size: 14px;
		font-family: 'PingFang-SC-Regular', 'PingFang SC', sans-serif;
	}

	.feedbackMain {
		height: 100%;
		padding: 40rpx;

		.feedbackContent {
			height: 100%;
			margin-bottom: 40rpx;

			.feedbackContentInput {
				height: 100%;

				.uni-easyinput {
					height: 100%;

					.uni-easyinput__content {
						height: 100%;
						.uni-easyinput__content-textarea {
							height: 100%;
							padding-top: 20px;
						}
					}
				}
			}

		}

		.feedbackPbone {
			margin-bottom: 40rpx;
			.content-clear-icon {
				padding: 7px;
			}
		}

		.feedbackBtn {
			background-color: rgb(44, 114, 236);
			color: #fff;
			border-radius: 100rpx;
		}
		.uni-easyinput__content {
			border-color: $btn-border-color !important;
		}
	}
</style>
