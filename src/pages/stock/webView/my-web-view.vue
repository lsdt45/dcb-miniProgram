<!-- @format -->

<template>
	<div class="web-view-wrapper">
		<!-- <uni-nav-bar title="读财报" :height="navBarHeight" backgroundColor="#2C72EC" color="#FFF" :fixed="true"> -->
		<!-- </uni-nav-bar> -->
		<web-view id="pdf-viewer" :src="pdfUrl"></web-view>
	</div>
</template>

<script>
	import { mapState } from 'vuex'
	import util from '@/common/util'
	export default {
		data() {
			return {
				pdfUrl: '',
				preUrl: '',
				options: {}, // 路由参数
			}
		},
		computed: {
			...mapState(['navBarHeight']),
		},
		methods: {
			// 监听pdf html页面的消息，跳转到pdf报告页面
			listenMessage() {
				window.addEventListener(
					'message',
					(e) => {
						// uni[`${e.data.action}`]({
						// 	url: e.data.url,
						// })
						if (e.data.action == 'switchTab') {
							uni.switchTab({
								url: e.data.url,
							})
						} else if(e.data.action == 'navigateTo') {
							uni.navigateTo({
								url: e.data.url,
							})
						}
					},
					false
				)
			},
		},
		onLoad(options) {
			let auth = null
			let chartsId = '20201107083344707001'
			this.preUrl = this.$config.data.PdfViewerUrl
			this.options = util.deepCopy(options)
			// 定义一个对象，包含跳转页面所需的所有参数
			let optionsObj = {
				auth: auth,
				code: options.code,
				name: options.name,
				nodeid: options.nodeid,
				taskid: options.taskid,
				page: options.page,
				login: options.login,
				templateId: options.templateId,
				compareList: options.compareList,
				browserName: options.browserName,
			}
			// 将optionsObj转化为一个二维数组，且每个数组成员的value值为字符串
			// let optionsArr = Object.entries(optionsObj).map(([key, value]) => [key, String(value)])
			// 使用URLSearchParams类来将optionsObj转化为查询字符串，避免手动拼接参数
			// let params = new URLSearchParams(optionsArr).toString()
			uni.getStorage({
				key: 'Authorization',
				success: (res) => {
					auth = res.data
					// this.pdfUrl = this.preUrl + options.pdfUrl + '&' + params
					this.pdfUrl =
						this.preUrl +
						options.pdfUrl +
						'&auth=' +
						auth +
						'&code=' +
						options.code +
						'&name=' +
						options.name +
						'&nodeid=' +
						options.nodeid +
						'&taskid=' +
						options.taskid +
						'&mainCode=' +
						options.code +
						'&mainName=' +
						options.name +
						'&mainNodeid=' +
						options.nodeid +
						'&mainTaskid=' +
						options.taskid +
						'&page=' +
						options.page +
						'&login=' +
						options.login +
						'&templateId=' +
						options.templateId +
						'&compareList=' +
						options.compareList +
						'&chartsId=' +
						chartsId +
						'&browserName=' +
						options.browserName
				},
			})
			this.listenMessage()
		},
		onShow() {
			const options = this.$route.query
			console.log('options', options);
			uni.$once('update', function (data) {
				if (data.isLogin) {
					// this.options.login = true
					// 页面重载
					const pages = getCurrentPages()
					// 声明一个pages使用getCurrentPages方法
					const curPage = pages.find((item) => {
						return item.route.indexOf('my-web-view') != -1
					})
					curPage.$vm.options.login = true
					curPage.onLoad(curPage.$vm.options)
				} else {
					this.options.login = false
				}
			})
			uni.$once('updateCompareList', function (data) {
				if (data) {
					// 页面重载
					const pages = getCurrentPages()
					// 声明一个pages使用getCurrentPages方法
					const curPage = pages.find((item) => {
						return item.route.indexOf('my-web-view') != -1
					})
					// 获取并格式化对比公司列表
					let compareList = []
					curPage.$vm.$store.state.curCmpList.forEach((item, index) => {
						let listItem = `${item.comp004_OrgName}(${item.comp004_Seccode})`
						compareList.push(listItem)
					})
					curPage.$vm.options.compareList = compareList.join(',')
					// #ifdef MP
					curPage.onLoad(curPage.$vm.options)
					// #endif
					// #ifdef H5
					uni.navigateTo({
						url: '/pages/stock/webView/my-web-view?test=test',
					})
					// #endif
				}
			})
		},
	}
</script>

<style></style>
