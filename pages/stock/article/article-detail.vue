<template>
	<view>
		<uni-nav-bar title="读财报" left-icon="left" :height="navBarHeight" backgroundColor="#2C72EC" color="#FFF"
			:fixed="true" @clickLeft="back">
		</uni-nav-bar>
		<view class="article-detail-wrapper">
			<view class="article-title">
				<text class="article-title-content">{{this.articleData.articleTitle}}</text>
			</view>
			<image class="article-cover" :src="articleData.coverPath" mode=""></image>
			<view class="article-content" v-if="articleData.articleType==2">
				<video :src="articleData.articlePath"></video>
			</view>
			<!-- <view class="article-content" v-else v-html="articleData.content"> -->
			<view class="article-content" v-else>
				<mp-html :content="articleData.content" style="width: 100%;"/>
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
				articleId: null, // 文章id
				articleData: '', // 文章数据
			}
		},
		computed: {
			...mapState(['navBarHeight'])
		},
		onLoad(option) {
			this.articleId = option.id
			this.getArticleData()
		},
		methods: {
			getArticleData() {
				let param = {
					Id: this.articleId
				};
				this.$api.get('/Article/GetArticleById', param).then(resp => {
					if(resp.status) {
						this.articleData = resp.data
					}
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
	.article-detail-wrapper {
		padding: 30rpx 40rpx 0;
		// 单行标题居中，多行标题左对齐
		// 当行标题时，子元素宽度小于父元素，因此居中；多行时，子元素宽度等于父元素，因此左对齐。需要设置子元素为inlie-block
		.article-title {
			font-size: 44rpx;
			word-break: break-all;
			text-align: center;
			&-content {
				display: inline-block;
				text-align: left;
			}
		}
		.article-cover {
			margin-top: 80rpx;
		}
		.article-content {
			display: flex;
			justify-content: center;
			rich-text {
				width: 100%;
			}
		}
	}
</style>
