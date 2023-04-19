<template>
	<view class="report-wrapper">
		<!-- 自定义顶部导航栏 -->
		<uni-nav-bar title="读财报" :height="navBarHeight" backgroundColor="#2C72EC" color="#FFF" :fixed="true"></uni-nav-bar>
		<uni-search-bar v-model="keyword" radius="100" placeholder="搜索" clearButton="auto" cancelButton="always"
			@confirm="search" @cancel="reset"/>
		<view class="report-list">
			<article-column-list ref="articleList" parent="tabBarRpt"></article-column-list>
		</view>
	</view>
</template>

<script>
	import ArticleColumnList from '@/pages/stock/article/article-column-list.vue'
	import {
		mapState
	} from 'vuex'
	export default {
		components: {
			ArticleColumnList
		},
		data() {
			return {
				keyword: '', // 搜索关键字
			}
		},
		onShow() {
			this.$refs.articleList.getListData()
		},
		computed: {
			...mapState(['navBarHeight']),
		},
		methods: {
			search(e) {
				this.$refs.articleList.searchArticle(e.value)
			},
			// 重置搜索，显示全部文章列表
			reset() {
				this.$refs.articleList.getListData()
			},
			getAnalysisArticles() {

			}
		}
	}
</script>

<style lang="scss">
	@import '@/static/scss/common/report.scss'
</style>
