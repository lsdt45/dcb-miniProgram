<template>
	<!-- <dcb-table-tool :chartsInfo="chartsInfo" @handleTableData="emitLog"></dcb-table-tool> -->
	<!-- <scroll-view scroll-y="true" scroll-x="true"> -->
		<view class="dcb-table__wrapper lanscape">
			<uni-table :border="false" emptyText="暂无更多数据" :landscape="landscape">
				<uni-tr>
					<uni-th :landscape="landscape" @landscapeClick="landscapeClick()">{{ fstTableTh  }}</uni-th>
					<uni-th v-for="(item, index) in chartsDataProp.categories" :key="index">{{ item }}</uni-th>
				</uni-tr>
				<uni-tr v-for="(item, index_tr) in chartsDataProp.series" :key="index_tr"
					@trClick="showFullName(index_tr)">
					<uni-td :isBold="tdClass(index_tr)">{{ item.name }}</uni-td>
					<uni-td :class="negativeStyle(data)" v-for="(data, index) in item.data" :key="index"
						:color="data < 0 ? 'red' : ''">
						{{ tableCellData(data) }}
					</uni-td>
					<view class="uni-talbe-td__tooltip" :class="{show: curClickTd == index_tr}"
						:style="tooltipOffset(index_tr)">{{ item.name }}</view>
				</uni-tr>
			</uni-table>
		</view>
	<!-- </scroll-view> -->
</template>

<script lang="ts">
	export default {
		options: {
			styleIsolation: 'shared',
		}
	}
</script>

<script lang="ts" setup>
	import {
		computed,
		ref,
		getCurrentInstance,
		onMounted,
		onUnmounted,
		watch,
		toRef
	} from 'vue'
	import type { Ref } from 'vue'
	import $util from '@/common/util.js'
	import { props_dcb_table } from './table-charts-config'
	import type {
		ChartsInfo,
		ReportChartsIndex,
		ReportStandardIndex,
	} from './table-charts-config'
	// import DcbTableTool from './dcb-table-tool.vue'
	let curClickTd = ref(null); // 当前被选中的单元格
	const instance = getCurrentInstance()
	const props = defineProps(props_dcb_table)
	const chartsDataProp = toRef(props, 'chartsData')
	const reportChartsIndexList = computed<ReportChartsIndex[]>(() => props.chartsInfo.reportChartsIndexList)
	const reportStandardIndexList = computed<ReportStandardIndex[]>(() => props.chartsInfo.reportStandardIndexList)
	const emit = defineEmits(['handleTableData', 'landscapeClick'])
	// 表格数据为负数时，显示红色
	const negativeStyle = computed(() => {
		return (val: number) => {
			if (val < 0) {
				return 'negative'
			} else {
				return ''
			}
		}
	})
	// 单元格数据
	const tableCellData = computed(() => {
		return (data: object) => {
			if (data == null || data.toString().indexOf('.') != -1) {
				return $util.dataFormat(data, 2);
			} else {
				return $util.dataFormat(data);
			}
		}
	})
	// 单元格样式
	const tdClass = computed(() => {
		return (index: number) => {
			if (reportChartsIndexList.value && reportChartsIndexList.value.length > 0) {
				let item = reportChartsIndexList.value[index]
				if (item && item.isBold === true) {
					return true
				} else {
					return false
				}
			} 
			else if (reportStandardIndexList.value && reportStandardIndexList.value.length > 0) {
				let item = reportStandardIndexList.value[index]
				if (item != undefined && item.isBold === true) {
					return true
				} else {
					return false
				}
			}
		}
	})
	const tooltipOffset = computed(() => {
		return (index: number) => {
			return `top:${(index + 1) * 56 }px`
		}
	})


	watch(
		() => props.chartsData,
		() => {

		}
	)
	// 点击单元格显示完整指标名
	function showFullName(index: number) {
		if (curClickTd.value == index) {
			curClickTd.value = null
		} else {
			curClickTd.value = index
		}
	}

	function emitLog(type: string) {
		if (type === 'annualized') {
			emit('handleTableData', 'annualized')
		} else if (type === 'quarterly') {
			emit('handleTableData', 'quarterly')
		} else if (type === 'restore') {
			emit('handleTableData', 'restore')
		}
	}
	function landscapeClick() {
		emit('landscapeClick')
	}
	
	onMounted(() => {
			// instance?.proxy?.$Bus.on('on-num', (num) => {
			// 		console.log(num,'===========>B')
			// })
		}),
	onUnmounted(() => {
			// instance?.proxy?.$Bus.off('on-num', (num) => {
			// 		console.log(num,'===========>B')
			// })		
		})
</script>

<style lang="scss">
	.dcb-table__wrapper {
		.uni-table-tr:nth-of-type(n+2) {
			height: 4em;
			.uni-table-td {
				line-height: 20px;
			}
		}
		.uni-table-td {
			vertical-align: middle;
		}
		.uni-table-td:first-of-type .uni-table-td__slot{
			@include TextEllipsis;
			white-space: normal;
		}
	}
</style>
