<template>
	<view class="">
		{{url}}
		<web-view :src="url"></web-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				url: '',
			}
		},
		onLoad(option) {
			this.url = option.url+'?url='+option.address
		}
	}
	
</script>

<style>
</style>