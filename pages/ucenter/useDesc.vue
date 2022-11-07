<template>
	<view class="user-desc-wrapper">
		<uni-nav-bar title="读财报" left-icon="left" :height="navBarHeight" backgroundColor="#2C72EC" color="#FFF"
			:fixed="true" @clickLeft="back">
		</uni-nav-bar>
		<view class="useDescMain">
			<text>想要探索读财报更多功能，以下内容即可点击阅读~</text>
			<view v-for="(item,index) in HelpTree" :key="index" class="info">
				<view class="info_title">{{item.name}}</view>
				<view class="info_body" v-for="(childItem,childIndex) in item.children" :key="childIndex"  @click="selectUseItem(childItem.url)">{{childItem.name}}</view>
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
				HelpTree:[],
				url:""
			};
		},
		computed: {
			...mapState(['navBarHeight'])
		},
		onShow: function() {
			this.getHelpTree()
		},
		methods:{
			selectUseItem(url){
				if(url){
					uni.navigateTo({
						url: 'useInfo?url='+url
					})
				}
			},
			getHelpTree(){
				this.$api.post('/Report/GetHelpTree',{
					IsNeedUrl:true,
					SysTypeId:'4'
				}).then(res => {
					if (res.status) {
						this.HelpTree=res.data
					}else{
						this.HelpTree=[]
					}
				}).catch(err => {
					this.HelpTree=[]
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
	page {
		background-color: #f8f8f8;
	}
	.useDescMain{
		padding: 40rpx;
		.info{
			margin-top: 40rpx;
			background-color: #fff;
			padding: 40rpx;
			.info_title{
				height: 100rpx;
				line-height: 100rpx;
				font-size: 38rpx;
				font-weight: 900;
				border-bottom: $border3;
				margin-bottom: 40rpx;
			}
			.info_body{
				height:50rpx;
				line-height: 50rpx;
				color: #007AFF;
			}
		}
	}
</style>
