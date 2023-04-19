<template>
	<view class="table-hover-button__wrapper">
		<view class="table-hover-button__body" v-show="isShowHoverBtnProp" :style="`left:${offsetLeftProp}px;`"
			@click.stop="deleteTr()">
			<text class="btn-text">删除</text>
			<view class="table-hover-button-triangle">
			</view>			
		</view>

	</view>
</template>

<script lang="ts" setup>
	import {
		// defineProps,
		toRef,
		watch,
		computed,
		defineEmits
	} from 'vue'
	const props = defineProps({
		offsetLeft: {
			type: Number,
			default: 0
		},
		isShowHoverBtn: {
			type: Boolean,
			default: false
		},
		triggerUpdate: {
			type: Boolean,
			default: false
		},
		trInfo: {
			type: Object,
			default: () => {}
		}
	})
	const emit = defineEmits(['delete'])
	const isShowHoverBtnProp = toRef(props, 'isShowHoverBtn')
	const offsetLeftProp = toRef(props, 'offsetLeft')
	const trInfo = toRef(props, 'trInfo')

	watch(isShowHoverBtnProp, (newVal) => {
		// console.log(`isShowHoverBtnProp=${newVal}`)
	})
	// watch(offsetLeftProp, (newVal) => {
	// })

	// 删除目标行
	function deleteTr() {
		emit('delete', trInfo.value.name)
	}
</script>

<style lang="scss">
	.table-hover-button__wrapper {
		.table-hover-button__body {
			position: absolute;
			top: -2.3em;
			left: 0;
			width: 3.3em;
			height: 2.2em;
			z-index: 99;
			text-align: center;
			line-height: 2em;
			background-color: #333;

			.btn-text {
				color: white;
			}
		}
		.table-hover-button-triangle {
			width: 0;
			heig: 0;
			height: 0;
			border: 4px solid #333;
			border-bottom-width: 0;
			border-left-color: transparent;
			border-right-color: transparent;
			position: relative;
			left: 0.8em;
			top: 3px;
		}
	}
</style>
