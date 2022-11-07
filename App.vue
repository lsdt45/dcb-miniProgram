<script>
	import store from './store'
	export default {
		methods: {
			callback(e) {
				if (e === 401) {
					this.onLogin()
				}
			},
			onLogin() {
				this.$api.onLogin();
			},
			getNavBarHeight() {
				let clientRect = uni.getMenuButtonBoundingClientRect()
				let topNavBarHeight = ''
				uni.getSystemInfo({
					success: function(res) {
						topNavBarHeight =
							`${clientRect.bottom + clientRect.top - res.statusBarHeight}px`
						store.commit('updateNavBarHeight', topNavBarHeight)
					}
				});
			}
		},
		onLaunch: function() {
			// 监听401，当api发生401时，应触发回调，重新login
			// uni.$on("errCode",this.callback)
			// if(!uni.getStorageSync("Authorization") || !uni.getStorageSync("UserInfo")){
			this.onLogin()
			this.getNavBarHeight()
			// }
		},

		onShow: function() {

		},
		onHide: function() {}
	}
</script>

<style lang="scss">
	/* 每个页面公共css */
	@import "./uni_modules/vk-uview-ui/index.scss";
	/* 图标字体 */
	@import "@/static/iconfont/iconfont.css"
</style>
