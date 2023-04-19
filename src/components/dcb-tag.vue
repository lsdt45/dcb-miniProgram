<template>
	<view class="table-charts__toolbar">
		<uni-tag class="tag" :inverted="!inverted" type="primary" :text="text" @click="click()"></uni-tag>
	</view>
</template>

<script lang="ts">
	export default {
		data() {
			return {
				
			}
		},
		props: {
			text: {
				type: String,
				default: ''
			},
			inverted: {
				type: Boolean,
				default: false
			}
		},
		emits: ['click'],
		options: {
			styleIsolation: 'shared',
		},
		methods: {
			click() {
				this.$emit('click')
			}
		}
	}
</script>

<style lang="scss">
	.table-charts__toolbar {
		.tag {
			margin-right: 40rpx;
			text-align: center;
			@include myUniTagStyle;
		}
	}
</style>
