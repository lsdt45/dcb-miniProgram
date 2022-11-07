<template>
	<scroll-view class="article-column-list-wrapper" scroll-y="true" @scrolltolower="reachBottom">
		<view class="article-list">
			<uni-list class="article">
				<uni-list-item v-for="item in articleData" :key="item.id"
					@click="toArticle(item.id)" :clickable="true" :border="false">
					<template v-slot:header>
						<view class="article-header">
							<view class="article-header-title">
								{{item.articleTitle}}
							</view>
							<view class="article-header-createtime" v-if="!item.isLessThanOneDay">
								<text>{{ item.date }}</text>
								<text>{{ ' ' + item.time }}</text>
							</view>
							<view class="article-header-createtime format-time" v-else>
								<text>{{ item.formatCreateTime }}</text>
							</view>
						</view>
					</template>
					<template v-slot:footer>
						<image :src="item.coverPath" mode="widthFix"></image>
					</template>
				</uni-list-item>
			</uni-list>
			<view class="nodata">
				<image class="image" v-if="!isArticleExist" src="../../static/image/noData.png"></image>
				<uni-load-more :status="status" :contentText="{contentnomore: '暂无数据'}"></uni-load-more>
			</view>
		</view>
	</scroll-view>
</template>

<script>
	export default {
		props: {
			curStock: {
				type: Object,
				default: {
					secName: '',
					secCode: '',
				}
			},
			parent: {
				type: String,
				default: () => 'AnalysisRpt'
			}
		},
		data() {
			return {
				articleData: [], // 列表数据
				status: 'nomore', // 加载更多
				pageIndex: 1, // 页数
				pageSize: 10, // 每次加载的个数
				searchFlag: false, // 是否显示的是搜索结果
				keyword: '', // 搜索关键词
				isArticleExist: true, // 文章是否存在
			}
		},
		options: {
			styleIsolation: 'shared', // 
		},
		mounted() {
			if (this.parent != 'tabBarRpt') {
				this.getListData()
			}
		},
		methods: {
			getListData() {
				if (this.searchFlag) {
					this.articleData = []
				}
				this.searchFlag = false
				let param = {
					IsPublish: true,
					IsSimple: false,
					SearchKey: this.curStock.secName,
					PageSize: this.pageSize,
					PageIndex: this.pageIndex
				}
				this.$api.post('/Article/GetAnalysisArticles', param).then(resp => {
					if (resp.status && resp.data.length > 0) {
						let articleData = []
						let data = resp.data
						data.forEach(item => {
							this.setArrData(articleData, item)
						})
						// 判断文章长度，如果为0则直接赋值，否则连接上次的列表
						if (this.articleData.length === 0) {
							this.articleData = articleData
						} else {
							this.articleData = this.articleData.concat(articleData)
						}
						// 返回的长度不为0，显示加载更多
						this.status = 'more'
					} else {
						// 如果返回的长度为0，且文章列表不为空，则显示无更多数据
						if (this.articleData.length > 0) {
							this.status = 'nomore'
						} else {
							this.isArticleExist = false
						}
					}

				}).catch(err => {
					this.pageIndex--
				})
			},
			// 处理从接口获取的数据
			setArrData(arr, item) {
				let createTime = new Date(item.createTime);
				let curTime = new Date();
				// 格式化文章生成时间
				let timeObj = this.$util.formatCreateTime(curTime, createTime);
				// 根据时间类别显示不同的时间类型
				if (timeObj.type === 'h') {
					if (timeObj.value < 24) {
						item.formatCreateTime = timeObj.value + '小时前';
						item.isLessThanOneDay = true;
					}

				} else if (timeObj.type === 'm') {
					item.formatCreateTime = timeObj.value + '分钟前';
					item.isLessThanOneDay = true;
				}
				arr.push({
					id: item.id,
					articleTitle: item.articleTitle,
					articleHttpUrl: item.articleHttpUrl ? item.articleHttpUrl : '',
					articleAbstract: item.articleAbstract,
					articlePath: item.articlePath,
					articleType: item.articleType,
					coverPath: item.coverPath,
					date: this.$util.FormatDate(new Date(item.createTime), 'yyyy-MM-dd'),
					time: this.$util.FormatDate(new Date(item.createTime), 'HH:MM'),
					formatCreateTime: item.formatCreateTime,
					isLessThanOneDay: item.isLessThanOneDay,
				})
			},
			toArticle(id) {
				uni.navigateTo({
					url: '/pages/stock/article/article-detail?id=' + id
				})
			},
			// 触底触发
			reachBottom() {
				this.pageIndex++
				// 是否有更多文章
				if (this.status === 'more') {
					// 是否是搜索结果，是：继续调用搜索方法 否：调用获取列表方法
					if (this.searchFlag) {
						this.searchArticle(this.keyword)
					} else {
						this.getListData()
					}
				}
			},
			/**
			 *	搜索文章
			 * @param {string} key - 搜索关键字.
			 */
			searchArticle(key) {
				if (!this.searchFlag) {
					this.articleData = []
				}
				this.keyword = key
				let date = '';
				// 如果日期不为NaN，则格式化
				if (!isNaN(this.date)) {
					date = this.$util.FormatDate(this.date, 'yyyy-MM-dd');
				}
				let param = {
					IsPublish: true,
					IsSimple: false,
					SearchKey: key, //搜索关键字
					PageSize: 10,
					PageIndex: this.pageIndex
				}
				this.$api.post('/Article/GetAnalysisArticles', param).then((resp) => {
					if (resp.status && resp.data.length > 0) {
						let articleData = []
						let data = resp.data
						data.forEach(item => {
							this.setArrData(articleData, item)
						})
						if (this.articleData.length === 0) {
							this.articleData = articleData
						} else {
							this.articleData = this.articleData.concat(articleData)
						}
						this.status = 'more'
						// 现在显示的是搜索结果
						this.searchFlag = true
					} else {
						this.status = 'nomore'
					}
				})
			},
		}
	}
</script>

<style lang="scss">
	@import '@/static/scss/common/article-column-list.scss';
</style>
