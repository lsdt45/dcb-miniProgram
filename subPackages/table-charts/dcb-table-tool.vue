<template>
	<view class="dcb-table-tool__wrapper">
		<dcb-tag v-if="tagAnnualized.isExsit" :inverted="tagAnnualized.isSelected" text="年化数据" @click="tagClick('年化')">
		</dcb-tag>
		<dcb-tag v-if="tagQuarterly.isExsit" :inverted="tagQuarterly.isSelected" text="单季化数据" @click="tagClick('季化')">
		</dcb-tag>
	</view>

</template>

<script lang="ts" setup>
	// 	import DcbTag from '@/components/dcb-tag.vue'
	// import mitt from 'mitt'
	// 	export default {
	// 		data() {
	// 			return {
	// 				tagAnnualized: {
	// 					type: 'annualized',
	// 					isExsit: false,
	// 					isSelected: false,					
	// 				},
	// 				tagQuarterly: {
	// 					type: 'annualized',
	// 					isExsit: false,
	// 					isSelected: false,					
	// 				},				
	// 			}
	// 		},
	// 		components: {
	// 			DcbTag
	// 		},
	// 		emits:['dataChange'],
	// 		watch: {
	// 			chartsInfo(newVal) {
	// 				this.iniTagStatus(newVal)
	// 			}
	// 		},
	// 		props: {
	// 			chartsData: Object,
	// 			chartsInfo: {
	// 				type: Object,
	// 				default: {}
	// 			}			
	// 		},
	// 		methods: {
	// 		// 点击tag的回调
	// 			tagClick(type: string) {
	// 				this.$store.commit('updateTableHandle', {
	// 					handleAnnualized: true
	// 				})
	// 				this.$emit('dataChange')
	// 				uni.$emit('handleAnnualized')
	// 				mitt().emit('test')
	// 				if (type === '年化') {
	// 					this.tagAnnualized.isSelected = !this.tagAnnualized.isSelected

	// 				} else if (type === '季化') {
	// 					this.tagQuarterly.isSelected = !this.tagQuarterly.isSelected
	// 				}
	// 			},
	// 			// 初始化tag的状态
	// 			iniTagStatus(chartsInfo: any) {
	// 				if (chartsInfo.isAnnualized) {
	// 					this.tagAnnualized.isExsit = true
	// 				} else {
	// 					this.tagAnnualized.isExsit = false
	// 				}
	// 				if (chartsInfo.isQuarterly) {
	// 					this.tagQuarterly.isExsit = true
	// 				} else {
	// 					this.tagQuarterly.isExsit = false
	// 				}
	// 			}			
	// 		}
	// 	}

	import {
		reactive,
		inject,
		ref,
		onMounted,
		watch,
		getCurrentInstance
	} from 'vue'
	import DcbTag from '@/components/dcb-tag.vue'
	import store from '@/store/index.js'
	import mitt from 'mitt';
	import {tagAnnualized, tagQuarterly} from './table-charts-config'
	// import mitt from 'mitt';
	const instance = getCurrentInstance()

	const props = defineProps({
		chartsData: Object,
		chartsInfo: {
			type: Object,
			default: {}
		}
	})

	const emit = defineEmits(['handleTableData'])


	watch(
		() => props.chartsInfo,
		() => {
			iniTagStatus(props.chartsInfo)
		}
	)


	// 点击tag的回调
	function tagClick(type: string) {
		// store.commit('updateTableHandle', {
		// 	handleAnnualized: true
		// })
		// mitt().emit('test')
		// uni.$emit('handleAnnualized')
		if (type === '年化') {
			tagAnnualized.isSelected = !tagAnnualized.isSelected
			tagQuarterly.isSelected = false
			tagAnnualized.isSelected ? emit('handleTableData', 'annualized') : emit('handleTableData', 'restore')
		} else if (type === '季化') {
			tagQuarterly.isSelected = !tagQuarterly.isSelected
			tagAnnualized.isSelected = false
			tagQuarterly.isSelected ? emit('handleTableData', 'quarterly') : emit('handleTableData', 'restore')
		}
	}
	// 初始化tag的状态
	function iniTagStatus(chartsInfo: any) {
		if (chartsInfo.isAnnualized) {
			tagAnnualized.isExsit = true
		} else {
			tagAnnualized.isExsit = false
		}
		if (chartsInfo.isQuarterly) {
			tagQuarterly.isExsit = true
		} else {
			tagQuarterly.isExsit = false
		}
	}
</script>

<style lang="scss">
	.dcb-table-tool__wrapper {
		display: grid;
		grid-template-columns: 25% 25%;
		margin-bottom: 20rpx;
	}
</style>
