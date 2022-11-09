<template>
	<view class="web-view-wrapper">
		<!-- <uni-nav-bar title="读财报" :height="navBarHeight" backgroundColor="#2C72EC" color="#FFF" :fixed="true"> -->
		<!-- </uni-nav-bar> -->
		<web-view :src="pdfUrl"></web-view>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex'
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
		onLoad(options) {
			let auth = null
			let chartsId = '20201107083344707001'
			this.preUrl = this.$config.data.PdfViewerUrl
			this.options = JSON.parse(JSON.stringify(options))
			 uni.getStorage({
				key: 'Authorization',
				success: (res) => {
					auth = res.data
					this.pdfUrl = this.preUrl + options.pdfUrl + '&auth=' + auth + '&code=' + options.code + 
						'&name=' + options.name + '&nodeid=' + options.nodeid + '&taskid=' + options.taskid + '&mainCode=' + options.code + 
						'&mainName=' + options.name + '&mainNodeid=' + options.nodeid + '&mainTaskid=' + options.taskid + '&page=' + options.page
						+ '&login=' + options.login + '&templateId=' + options.templateId + '&compareList=' + options.compareList + '&chartsId=' + chartsId
				}
			})
		},
		onShow() {
			uni.$once('update', function(data) {
				if(data.isLogin) {
					// this.options.login = true
					// 页面重载
					const pages = getCurrentPages()
					// 声明一个pages使用getCurrentPages方法
					const curPage = pages[pages.length - 1]
					curPage.$vm.options.login = true
					curPage.onLoad(curPage.$vm.options)					
				} else {
					this.options.login = false
				}
			})
			uni.$once('updateCompareList', function(data) {
				if(data) {
					// 页面重载
					const pages = getCurrentPages()
					// 声明一个pages使用getCurrentPages方法
					const curPage = pages[pages.length - 1]
					// 获取并格式化对比公司列表
					let compareList = []
					curPage.$vm.$store.state.curCmpList.forEach((item, index) => {
						let listItem = `${item.comp004_OrgName}(${item.comp004_Seccode})`
						compareList.push(listItem)
					})					
					curPage.$vm.options.compareList = compareList.join(',')
					curPage.onLoad(curPage.$vm.options)		
				}
			})
		}
	}
</script>

<style>
</style>