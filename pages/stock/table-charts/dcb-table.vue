<template>
	<!-- <dcb-table-tool :chartsInfo="chartsInfo" @handleTableData="emitLog"></dcb-table-tool> -->
	<scroll-view scroll-y="true" scroll-x="true" style="height: 390px;">
		<view>
			<uni-table :border="false" emptyText="暂无更多数据">
				<uni-tr>
					<uni-th>{{ fstTableTh  }}</uni-th>
					<uni-th v-for="(item, index) in chartsDataChild.categories" :key="index">{{ item  }}</uni-th>
				</uni-tr>
				<uni-tr v-for="(item, index_tr) in chartsDataChild.series" :key="index_tr"
					@trClick="showFullName(index_tr)">
					<uni-td>{{ item.name  }}</uni-td>
					<uni-td :class="negativeStyle(data)" v-for="(data, index) in item.data" :key="index"
						:color="data < 0 ? 'red' : ''">
						{{ tableCellData(data)  }}
					</uni-td>
					<view class="uni-talbe-td__tooltip" :class="{show: curClickTd == index_tr}"
						:style="tooltipOffset(index_tr)">{{ item.name }}</view>
				</uni-tr>
			</uni-table>
		</view>
	</scroll-view>
</template>

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
	import $util from '@/common/util.js'
	import DcbTableTool from './dcb-table-tool.vue'
	let curClickTd = ref(null); // 当前被选中的单元格
	const instance = getCurrentInstance()
	const props = defineProps({
		chartsData: Object,
		fstTableTh: String,
		chartsInfo: {
			type: Object,
			default: {}
		}
	})
	const emit = defineEmits(['handleTableData'])
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

	const tooltipOffset = computed(() => {
		return (index: number) => {
			return `top:${(index + 1) * 40 + 1}px`
		}
	})

	const chartsDataChild = toRef(props, 'chartsData')

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

<style>
</style>
