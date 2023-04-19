<template>
	<view class="body">
		<web-view :src="url"></web-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				url:this.$config.data.PrivacyInfoUrl
			};
		}
	}
</script>

<style lang="scss">
.body{
	width: 750rpx;
	height: 100%;
}
</style>
