<!-- @format -->

<script lang="ts" setup>
import store from '@/store'
import api from '@/common/api/api'
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
function callback(e: any) {
	if (e === 401) {
		onLogin()
	}
}
function onLogin() {
	api.onLogin()
}
// 获取需要的设备信息
function getSystemInfo() {
	let clientRect = uni.getMenuButtonBoundingClientRect()
	let topNavBarHeight = ''
	uni.getSystemInfo({
		success: function (res) {
			// 获取顶部导航区域的高度
			topNavBarHeight = `${clientRect.bottom! + clientRect.top! - res.statusBarHeight!}px`
			store.commit('updateNavBarHeight', topNavBarHeight)
			// 获取当前设备类型
			store.commit('updateSystemInfo', res)
		},
	})
}

onLaunch(() => {
	// 监听401，当api发生401时，应触发回调，重新login
	onLogin()
	getSystemInfo()
})

onShow(() => {})

onHide(() => {})
</script>

<style lang="scss">
/* 每个页面公共css */
@import './uni_modules/vk-uview-ui/index.scss';
/* 图标字体 */
@import '@/static/iconfont/iconfont.css';
</style>
