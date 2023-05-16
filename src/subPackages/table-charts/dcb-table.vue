<!-- @format -->

<template>
	<view class="dcb-table__wrapper lanscape" v-if="doubleTh">
		<uni-table :border="false" emptyText="暂无更多数据" :landscape="landscape">
			<uni-tr @trClick="showThFullName()">
				<uni-th :landscape="landscape" @landscapeClick="landscapeClick()">{{ fstTableTh }}</uni-th>
				<uni-th v-for="(item, index) in chartsDataProp.categories" :key="index" :width="props.thWidth">
					<view class="first-th">{{ item.name }}</view>
					<view class="second-th">{{ props.formatMethod(item.type) }}</view>
				</uni-th>
				<!-- <view class="uni-table-td__tooltip" :class="{ show: isShowThFullName }" style="top: 0">{{ fstTableTh }}</view> -->
			</uni-tr>
			<uni-tr v-for="(item, index_tr) in chartsDataProp.series" :key="index_tr" @trClick="showFullName(index_tr)">
				<uni-td :isBold="tdClass(index_tr)">{{ item.name }}</uni-td>
				<uni-td :class="negativeStyle(data)" v-for="(data, index) in item.data" :key="index" :color="data < 0 ? 'red' : ''" align="right">
					{{ tableCellData(data) }}
				</uni-td>
				<view class="uni-table-td__tooltip" :class="{ show: curClickTd == index_tr }" :style="tooltipOffset(index_tr)">{{ item.name }}</view>
			</uni-tr>
		</uni-table>
	</view>

	<view class="dcb-table__wrapper lanscape" v-else>
		<uni-table :border="false" emptyText="暂无更多数据" :landscape="landscape">
			<uni-tr @trClick="showThFullName()">
				<uni-th :landscape="landscape" @landscapeClick="landscapeClick()">{{ fstTableTh }}</uni-th>
				<uni-th v-for="(item, index) in chartsDataProp.categories" :key="index">
					{{ item }}
				</uni-th>
				<view class="uni-table-td__tooltip" :class="{ show: isShowThFullName }" style="top: 0">{{ fstTableTh }}</view>
			</uni-tr>
			<uni-tr v-for="(item, index_tr) in chartsDataProp.series" :key="index_tr" @trClick="showFullName(index_tr)">
				<uni-td :isBold="tdClass(index_tr)">{{ item.name }}</uni-td>
				<uni-td :class="negativeStyle(data)" v-for="(data, index) in item.data" :key="index" :color="data < 0 ? 'red' : ''" align="right">
					{{ tableCellData(data) }}
				</uni-td>
				<view class="uni-table-td__tooltip" :class="{ show: curClickTd == index_tr }" :style="tooltipOffset(index_tr)">{{ item.name }}</view>
			</uni-tr>
		</uni-table>
	</view>
</template>

<script lang="ts">
	export default {
		options: {
			styleIsolation: 'shared',
		},
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
		toRef,
		// defineProps
	} from 'vue'
	import type { Ref } from 'vue'
	import $util from '@/common/util'
	import { props_dcb_table } from './table-charts-config'
	import type { ChartsInfo, ReportChartsIndex, ReportStandardIndex } from './table-charts-config'
	// import DcbTableTool from './dcb-table-tool.vue'
	let curClickTd = ref(null) // 当前被选中的单元格
	let isShowThFullName = ref(false)

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
				return $util.dataFormat(data, 2)
			} else {
				return $util.dataFormat(data)
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
			} else if (reportStandardIndexList.value && reportStandardIndexList.value.length > 0) {
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
			return `top:${(index + 1) * 56}px`
		}
	})

	const tdStyle = computed(() => {
		return (data: any) => {
			return data < 0 ? 'red' : ''
		}
	})
	watch(
		() => props.chartsData,
		() => {}
	)
	// 点击单元格显示完整指标名
	function showFullName(index: number) {
		if (curClickTd.value == index) {
			curClickTd.value = null
		} else {
			curClickTd.value = index
		}
	}

	// 显示表头全名
	function showThFullName() {
		isShowThFullName.value = !isShowThFullName.value
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

	function runFormatMethod(type: string) {
		if (typeof props.formatMethod === 'function') {
			let temp = props.formatMethod(type)
			console.log(temp)

			return props.formatMethod(type)
		}
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
		.uni-table-tr:nth-of-type(n + 2) {
			height: 4em;
			.uni-table-td {
				line-height: 20px;
			}
		}
		.uni-table-td {
			vertical-align: middle;
		}
		.uni-table-td:first-of-type .uni-table-td__slot {
			@include TextEllipsis;
			white-space: normal;
		}
		.second-th {
			transform: scale(0.8);
			position: relative;
			left: -8px;
		}
		.uni-table-td__tooltip {
			position: absolute;
			left: 0;
			z-index: 3;
			word-break: break-all;
			white-space: pre-wrap;
			width: 150px;
			padding: 2px;
			border: 0;
			opacity: 0;
			overflow: hidden;
			color: #fff;
			background: #757575;
			transition: opacity 0.3s ease-in-out;

			&.show {
				height: auto;
				opacity: 1;
				transition: opacity 0.3s ease-in-out;
			}
		}
		/* #ifdef H5 */
		:deep(.uni-table-th-content) {
			width: 110px !important;
			flex-wrap: wrap;
		}
		:deep(.uni-table) {
			table-layout: fixed;
		}
		.uni-table .uni-table-tr:first-child {
			:deep(.uni-table-th),
			:deep(.uni-table-td) {
				background-color: $table-odd-td-bgcolor;
			}
		}
		.uni-table .uni-table-tr:not(:first-child) {
			:deep(.uni-table-th),
			:deep(.uni-table-td) {
				background-color: #fff;
			}
		}
		.second-th {
			left: -11px;
		}
		:deep(.uni-table-th:first-child),
		:deep(.uni-table-td:first-child) {
			position: sticky;
			left: 0;
			z-index: 2;
			width: 150px !important;
			@include SingleTextEllipsis;
		}
		.bold {
			font-weight: bold;
		}
		.negative {
			color: red;
		}
		/* #endif */
	}
</style>
