<!-- @format -->

<template>
	<scroll-view class="report-information-wrapper" scroll-y="true" show-scrollbar="true" @scrolltolower="reachBottom">
		<view class="report-list">
			<uni-list class="report">
				<uni-list-item class="list-item" v-for="(item, index) in reportInfoData" :key="index" :clickable="true" @click="toReport(item.url)">
					<template v-slot:header>
						<view class="report-header">
							<view class="report-header-title">
								{{ item.title }}
							</view>
							<view class="report-header-body">
								{{ item.content }}
							</view>
							<view class="report-header-footer">
								<text class="report-url">{{ item.url }}</text>
								<text class="report-createtime">{{ '| ' + item.createTime }}</text>
							</view>
						</view>
					</template>
				</uni-list-item>
			</uni-list>
			<uni-load-more :status="status"></uni-load-more>
		</view>
	</scroll-view>
</template>

<script>
export default {
	data() {
		return {
			status: 'more', // 加载更多
			pageIndex: 1, // 页数
			mainCode: '600100', // 当前股票代码
			reportInfoData: [], // 资讯数据
		}
	},
	onReady() {
		console.log('report-infomation ready')
		if (this.status === 'more') {
			this.getNewsPage()
		}
	},
	// onReachBottom() {
	// 	console.log('到底了！')
	// 	this.pageIndex++
	// 	if (this.status === 'more') {
	// 		this.getNewsPage()
	// 	}
	// },
	methods: {
		//获取第一页资讯
		getNewsPage() {
			this.$api
				.post('/Report/GetInformation', {
					SecCode: this.mainCode,
					PageIndex: this.pageIndex,
				})
				.then((resp) => {
					if (!resp.data || resp.data.length == 0) {
						this.status = 'nomore'
					} else {
						this.reportInfoData = this.reportInfoData.concat(resp.data)
						this.reportInfoData.forEach((item) => {
							item.createTime = this.$util.FormatDate(new Date(item.createTime), 'yyyy-MM-dd')
						})
					}
				})
				.catch((err) => {
					this.pageIndex--
					this.status = 'nomore'
				})
		},
		toReport(url) {
			uni.navigateTo({
				url: '/pages/report/report-web-view?url=' + 'https://ducaibao.com.cn/static/container.html&address=' + url,
			})
		},
		reachBottom() {
			console.log('到底了！')
			this.pageIndex++
			if (this.status === 'more') {
				this.getNewsPage()
			}
		},
	},
}
</script>

<style lang="scss">
// @import '@/static/scss/common/report-infomation.scss';
</style>
