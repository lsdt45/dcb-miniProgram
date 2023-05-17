<!-- @format -->

<template>
	<view class="table-charts-wrapper" :style="[wrapperStyleA, wrapperStyleB]">
		<view class="charts-header">
			<view class="charts-title">
				<text>{{ chartsTitle }}</text>
			</view>
		</view>
		<view class="global-table-toolbar">
			<!-- 对比公司选择 -->
			<view class="compare-company-select">
				<uni-data-select v-model="curSelectCompany" :clear="false" :localdata="compareCompanyList"></uni-data-select>
			</view>
			<!-- 展现形式选择 -->
			<view class="charts-mode-select">
				<uni-data-select v-model="curSelect" :clear="false" :localdata="tableTypeList" @change="sectionChange"></uni-data-select>
			</view>
			<!-- 数据处理 -->
			<view class="data-process-select" v-if="tagAnnualized.isExsit">
				<uni-data-select placeholder="数据处理" :clear="false" :localdata="dataProcessList" :fixedText="true" @change="dataProcess"></uni-data-select>
			</view>
			<!-- 报表类型切换 -->
			<view class="data-select report-type" @click="changeReportType">
				<text class="data-select__content">{{ curReportTypeObj.text }}</text>
				<view class="data-select__arrow"></view>
			</view>
		</view>
		<view class="table-charts charts" v-show="curSelect == 0 || curSelect == 2" :style="`height:${chartContainnerHeight}px;}`">
			<view class="table-charts__toolbar">
				<view class="table-charts__toolbar left">
					<!-- 图表类型切换 -->
					<uni-data-select v-model="curSelectChartType" :clear="false" :localdata="chartsTypeList" @change="changeChartType"></uni-data-select>
				</view>
				<view class="table-charts__toolbar right">
					<uni-tag class="table-charts__toolbar tag" :inverted="!isShowValue" type="primary" :text="showValueText" @click="tagClick_showValue"></uni-tag>
				</view>
			</view>
			<view style="width: 100%; height: 720rpx">
				<l-echart ref="chart"></l-echart>
			</view>
			<!-- <view class="rotate-mode-btn iconfont icon-a-appenlarge" @click="rotateMode"></view> -->
		</view>
		<view class="table-charts table" :class="{ ios: $store.state.systemInfo.osName == 'ios' }" v-show="curSelect == 1 || curSelect == 2">
			<dcb-table
				:chartsData="chartsData"
				:fstTableTh="fstTableTh"
				:chartsInfo="chartsInfo"
				:formatMethod="formatMethod"
				thWidth="110"
				doubleTh
				@handleTableData="handleData"
				@landscapeClick="rotateMode_table()"></dcb-table>
		</view>
		<dcb-popup-panel
			type="selector"
			multiple
			v-model:data="financialReportType"
			:isShowPanel="isShowPanel"
			title="合并报表类型"
			@itemClick="itemClickReportType"
			@update:isShowPanel="(val: boolean) => (isShowPanel = val)"
			@updateCurSelect="updateCurSelect"></dcb-popup-panel>
	</view>
</template>

<script lang="ts">
	import { mapState } from 'vuex'
	import tableChartsUtil from './table-charts'
	import DcbTable from './dcb-table.vue'
	import util from '@/common/util'
	import { testOption } from './table-charts-config'
	import DcbPopupPanel from '@/components/dcb-popup-panel/dcb-popup-panel.vue'
	/***** echarts *****/
	import * as echarts from './echarts/core'
	import { LineChart, BarChart } from './echarts/charts'
	import {
		TitleComponent,
		TooltipComponent,
		GridComponent,
		DatasetComponent,
		TransformComponent,
		LegendComponent,
		DataZoomComponent,
	} from './echarts/components'
	// 标签自动布局，全局过渡动画等特性
	import { LabelLayout, UniversalTransition } from './echarts/features'
	// 引入 Canvas 渲染器，注意引入 CanvasRenderer 是必须的一步
	import { CanvasRenderer } from './echarts/renderers'
	import type TableChartsTypes from '@/types/TableCharts'
	import tableCharts from './table-charts.js'
	import type { LocalData } from '@/types/CommonTypes'
	echarts.use([
		LegendComponent,
		TitleComponent,
		TooltipComponent,
		GridComponent,
		DatasetComponent,
		TransformComponent,
		DataZoomComponent,
		LineChart,
		BarChart,
		LabelLayout,
		UniversalTransition,
		CanvasRenderer,
	])
	/***** echarts *****/
	export default {
		emits: ['changeScrollTop'],
		components: {
			DcbTable,
		},
		props: {
			// 图表Id
			chartsId: {
				type: String,
				require: true,
				default: '',
			},
			// 传递过来的图表属性
			chartsInfoProp: {
				type: Object,
				require: true,
				default: () => {
					curStock: () => {}
				},
			},
			// 图表类型。single:单图表，multi:多图表
			chartsType: {
				type: String,
				default: 'single',
			},
			rptType: {
				type: Object,
				default: () => {},
			},
			// 是否为最后一个组件
			lastTableChart: {
				type: Boolean,
				default: false,
			},
		},
		computed: {
			...mapState(['dataFilter', 'curStock', 'curCmpList']),
			maskClass() {
				if (this.isShowRotate) {
					return 'mask-wrapper show'
				} else {
					return 'mask-wrapper'
				}
			},
			// wrapper层级
			wrapperStyleA() {
				if (this.isShowRotate) {
					return 'z-index:2;'
				} else {
					return ''
				}
			},
			wrapperStyleB() {
				if (this.lastTableChart) {
					return 'margin-bottom:0;'
				} else {
					return ''
				}
			},

			tdIndex() {
				return (index) => {
					return `uni-td-${index}`
				}
			},
		},
		onLoad() {
			// this.initData()
		},
		data: (): TableChartsTypes.TableCharts.Data => ({
			value: 0,
			range: [
				{
					value: 0,
					text: '篮球',
				},
				{
					value: 1,
					text: '足球',
				},
				{
					value: 2,
					text: '游泳',
				},
			],
			allChartsTableData_origin: [], // 所有的原始图表数据
			allChartsTableData: [], // 处理后的所有的图表数据
			// 使用中的图表数据
			chartsData: {},
			chartsData_beforeConver: {}, // 转化前的数据
			chartsInfo: {},
			chartsData_rotate: {},
			// 原始图表数据
			chartsDataOri: {},
			curSelectCompany: '', // 当前选择的对比公司
			// 当前选择的报表类型
			curReportTypeObj: {
				value: 1,
				text: '合并报表(调整后)',
			}, // 当前选择的报表类型
			compareCompanyList: [], // 对比公司列表
			// 处理后的基础数据
			baseData: {
				formulaData: [], // 指标数据
				codeData: [],
				timeData: [], // 时间数据
				tableData: [], // 图表数据
			},
			chartsTitle: '', // 图表标题
			chartsShowType: 'line', // 图表类型
			DataProcessText: '数据处理', // 数据处理文本
			fstTableTh: '', // 表格第一列第一行的标题
			// 财务报表类型
			financialReportType: [
				{
					value: 1,
					text: '合并报表(调整后)',
					checked: true,
				},
				{
					value: 2,
					text: '合并报表(调整前)',
					checked: false,
				},
				{
					value: 3,
					text: '母公司报表(调整后)',
					checked: false,
				},
				{
					value: 4,
					text: '母公司报表(调整前)',
					checked: false,
				},
			],
			isShowRotate: false, // 是否为横屏模式
			isShowValue: false, // 是否显示值
			isShowPanel: false, // 是否显示合并报表选择面板
			isReload: false, // 是否重新加载
			isWatchOpts: true, // 是否开启opts的监听
			isCurCmpListUpdate: false, // 对比公司是否更新过
			showValueText: '显示值', // 【显示值】按钮的文本
			chartContainnerHeight: 400, // 图表容器高度
			notQuarterly: [],
			notIdIndex: [], // 无指标id的指标名所对应的index数组
			reloadChart: true, // 重新加载图表
			pixelRatio: 1, // 设备像素比
			parent: {}, // 父组件
			tapLegendResult: {}, // 点击下拉按钮返回的数据
			timePeriod: [], // 日期列表
			unit: '', // 单位
			tagAnnualized: {
				type: 'annualized',
				isExsit: false,
				isSelected: false,
			},
			tagQuarterly: {
				type: 'quarterly',
				isExsit: false,
				isSelected: false,
			},
			testOption,
			option: {
				tooltip: {
					show: true,
					trigger: 'axis',
					renderMode: 'richText',
					confine: true,
					enterable: true, //滚动条
					textStyle: {
						width: 200,
					},
					// formatter: function(params) {
					// 	console.log('formatter')
					// 	var arr = ''
					// 	params.forEach((item) => {
					// 		arr += item.seriesName + (item.data) + '$' + "\n"
					// 	})
					// 	return arr
					// },
					extraCssText: 'width:100px;white-space: normal; word-break: break-all;background:red;', //滚动条
				},
				legend: {
					type: 'scroll',
				},
				grid: {
					left: '3%',
					right: '4%',
					bottom: '3%',
					containLabel: true,
				},
				xAxis: {
					type: 'category',
					data: [''],
				},
				yAxis: {
					type: 'value',
				},
				series: [{}],
				dataZoom: {
					type: 'inside',
				},
				color: [
					'#E86452',
					'#5B8FF9',
					'#F6BD16',
					'#5AD8A6',
					'#5D7092',
					'#6DC8EC',
					'#945FB9',
					'#FF9845',
					'#1E9493',
					'#FF99C3',
					'#5470C6',
					'#C6E800',
					'#3E8149',
					'#FDCC96',
					'#07487F',
					'#A688FF',
					'#804F00',
					'#94F387',
					'#9D9B58',
					'#D5E09C',
				],
			},
			// 图表设置
			opts: {
				padding: [15, 10, 10, 0],
				legend: {
					float: 'left',
					lineHeight: 20,
					itemGap: 20,
					margin: 10,
					position: 'top',
					isShowAllLegend: false,
					isReload: false,
				},
				color: [],
				dataLabel: false,
				enableScroll: true,
				touchMoveLimit: 60,
				rotate: false,
				xAxis: {
					disableGrid: true,
					itemCount: 10,
					fontSize: 12,
					rotateLabel: true,
					scrollShow: false,
				},
				yAxis: {
					data: [
						{
							format: 'formatYAxisData',
						},
					],
				},
				extra: {
					line: {
						type: 'straight',
						width: 3,
					},
					column: {
						type: 'group',
						width: 30,
						activeBgColor: '#000000',
						activeBgOpacity: 0.08,
						seriesGap: 2,
						categoryGap: 3,
						barBorderCircle: false,
						linearType: 'none',
						linearOpacity: 1,
						colorStop: 0,
						meterBorder: 1,
						meterFillColor: '#FFFFFF',
					},
					tooltip: {
						showCategory: true,
						xAxisLabel: false,
					},
				},
			},
			opts_rotate: {
				padding: [],
				legend: {},
				color: [],
				dataLabel: false,
				enableScroll: true,
			}, // 横屏下的设置
			// 图表切换栏数据
			tableTypeList: [
				{
					value: 0,
					text: '图',
				},
				{
					value: 1,
					text: '表',
				},
				{
					value: 2,
					text: '图表',
				},
			],
			// 数据处理选项
			dataProcessList: [],
			// 被删除的数据处理选项
			deleteDataProcess: {
				value: null,
				text: '',
			},
			// 图表类型列表
			chartsTypeList: [
				{
					id: 0,
					value: 'line',
					text: '折线图',
					select: false,
				},
				{
					id: 1,
					value: 'bar',
					text: '柱状图',
					select: false,
				},
				{
					id: 2,
					value: 'stack',
					text: '堆叠图',
					select: false,
				},
			],
			curSelectChartType: 'bar', // 当前选中的图表类型
			curSelect: 0, // 当前选中的图表类型
			timeList: ['2017', '2018', '2019', '2020', '2021'], // 时间区间
			chartsData_categories: [], // 存放经过特殊处理的日期数据便于区分报告类型
			canvasId: '', // 图表id
			canvasId_rotate: '', // 横屏图表id
		}),
		watch: {
			chartsId(newVal) {
				if (this.chartsType != 'null') {
					this.getChartsInfo()
				}
			},
			chartsInfoProp(newVal) {
				this.getChartsInfo()
			},
			curCmpList(newVal) {
				newVal.forEach((item: any) => {
					this.compareCompanyList = []
					this.$store.state.curCmpList.forEach((item: any) => {
						this.compareCompanyList.push({
							text: item.comp004_OrgName,
							value: item.comp004_Seccode,
						})
					})
				})
				this.isCurCmpListUpdate = true
			},
			curSelectCompany(newVal) {
				if (this.baseData.tableData.length == 0) return
				this.chartsDataProcess()
				this.handleData('', true)
			},
		},
		options: {
			styleIsolation: 'shared',
		},
		methods: {
			/**
			 * author: ljw
			 * description: 页面数据初始化
			 * @createTime: 2022-06-30 15:38:44
			 */
			initData() {
				// #ifdef H5
				this.parent = this?.$parent?.$parent?.$parent?.$parent?.$parent
				// #endif
				// #ifdef MP-WEIXIN
				this.parent = this.$parent
				// #endif
				if (this.chartsId && this.chartsType != 'null') {
					this.getChartsInfo()
				}
				this.pixelRatio = uni.getSystemInfoSync().pixelRatio

				this.canvasId = this.$util.randomWord(true, 8, 8)
				this.canvasId_rotate = this.canvasId + 'rotate'
				// 初始化时间区间
				this.timeList = [...this.parent.timeRange].slice(0, 5)
				// 初始化类型选择
				let dataFilter = {
					report: [],
					time: [],
				}
				// 选中的报告类型
				let checkedRptData = (this.parent as any).rptTypeData.filter((item) => {
					return item.checked == true
				})
				checkedRptData.forEach((item: any) => {
					dataFilter.report.push(item.type)
				})
				// 选中的分析时间
				let anlyTimeData = (this.parent as any).anlyTimeData.filter((item) => {
					return item.checked == true
				})
				anlyTimeData.forEach((item) => {
					dataFilter.time.push(item.year)
				})

				// 横屏模式下的设置
				this.opts_rotate = this.$util.deepCopy(this.opts)
				this.opts_rotate.rotate = true
				this.opts_rotate.xAxis.rotateLabel = true
				this.opts_rotate.xAxis.itemCount = 20

				this.$store.commit('updateDataFilter', dataFilter)
				// 初始化对比公司列表
				this.$store.state.curCmpList.forEach((item: any) => {
					this.compareCompanyList.push({
						text: item.comp004_OrgName,
						value: item.comp004_Seccode,
					})
				})
				this.curSelectCompany = this.$store.state.curStock.secCode
			},

			// 图表类型切换时触发
			sectionChange(val: number) {
				this.curSelect = val
				if (val === 0 || val === 2) {
					this.$refs.chart.resize()
				}
			},
			/**
			 * author: ljw
			 * description: 获取图表设置数据
			 * @createTime: 2022-07-03 15:39:19
			 */
			getChartsInfo() {
				let param = {
					Id: this.chartsId,
				}
				this.$api.post('/Report/GetReportCharts', param).then((resp: any) => {
					if (resp.status) {
						this.chartsInfo = resp.data[0]
						this.chartsTitle = this.chartsInfo.chartName
						// 设置图表类型
						// 分组柱状图
						this.chartsTypeList.forEach((item, index) => {
							this.chartsTypeList[index].select = false
						})
						if (this.chartsInfo.defaultChart === 'bar') {
							this.curSelectChartType = 'bar'
							this.chartsTypeList[1].select = true
						}
						// 堆叠柱状图
						else if (this.chartsInfo.defaultChart === 'stack') {
							this.curSelectChartType = 'stack'
							this.chartsTypeList[2].select = true
						}
						// 折线图
						else if (this.chartsInfo.defaultChart === 'line') {
							this.curSelectChartType = 'line'
							this.chartsTypeList[0].select = true
						} else {
						}
						// 获取数据处理的选项
						let value = 0
						if (this.chartsInfo.isAnnualized) {
							this.dataProcessList.push({
								value,
								text: '年化数据',
							})
							value++
						}
						if (this.chartsInfo.isQuarterly) {
							this.dataProcessList.push({
								value,
								text: '单季化数据',
							})
						}
						tableChartsUtil.getDefaultTableType(this)
						tableChartsUtil.getNotIdIndex(this)
						// 获取图表数据
						this.getChartsData()
						this.iniTagStatus(this.chartsInfo)
					}
				})
			},
			/**
			 * author: ljw
			 * description: 获取图表数据
			 * @createTime: 2022-07-03 15:39:48
			 */
			getChartsData() {
				this.timePeriod = []
				let BenchCodeList: any[] = []
				this.$store.state.curCmpList.forEach((item: any) => {
					if (item.comp004_Seccode != this.curStock.secCode) {
						BenchCodeList.push(item.comp004_Seccode)
					}
				})
				let param = {
					ChartsId: this.chartsId,
					// ChartsId: '20200812152934384100',
					MainCode: this.chartsInfoProp.curStock.secCode,
					MainTime: this.$store.state.curStock.year,
					TimeList: this.timeList,
					Granularity: '季',
					ChartsType: '',
					LoadIndustryList: [],
					CodeList: [],
					BenchCodeList,
					ReportType: this.$store.state.curStock.rptType,
				}

				this.$api.post('/Report/GetChartsData', param).then((resp: any) => {
					if (resp.status) {
						this.allChartsTableData_origin = resp.data
						this.chartsDataProcess() // 处理图表数据
						// 获取日期列表
						let timePeriod = resp.data.codeDataList[0].data.calculationAllData.slice(1)
						timePeriod.forEach((item: any) => {
							if (item && item.length > 0) {
								this.timePeriod.unshift(item[0])
							}
						})
						// 去重
						this.timePeriod = [...new Set(this.timePeriod)]
						this.timePeriod.unshift('最新日期')
						this.$store.commit('updateEndDateList', this.timePeriod)
					}
				})
			},
			// 改变报告类型
			changeRptType(data: any) {
				// 存放临时数据
				let data_temp = {
					categories: [],
					data: [],
					year: [],
					index: [],
				}
				// 数据筛选临时obj
				let dataFilter = {
					report: [],
					time: [],
				}
				// 筛选出选中的项
				let checkedRptData = data.report.filter((item: any) => {
					return item.checked == true
				})
				// 将改变后的条件作为之后的筛选条件
				checkedRptData.forEach((item: any) => {
					dataFilter.report.push(item.type)
				})

				// 筛选报告类型
				for (let i = 0; i < this.baseData.timeData.length; i++) {
					for (let j = 0; j < checkedRptData.length; j++) {
						let type = this.baseData.timeData[i].name.split('-')[1]
						let year = this.baseData.timeData[i].name.split('-')[0]
						if (type == checkedRptData[j].type) {
							data_temp.categories.push(this.baseData.timeData[i])
							data_temp.year.push(year)
							data_temp.index.push(i)
							break
						}
					}
				}

				let checkedTimeList = data.time.filter((item: any) => {
					return item.checked == true
				})
				// 将改变后的条件作为之后的筛选条件
				checkedTimeList.forEach((item: any) => {
					dataFilter.time.push(item.year)
				})
				this.$store.commit('updateDataFilter', dataFilter)
				// 判断是否选中了最新，是：将最新报告的信息push进数组
				let result = dataFilter.report.find((item) => {
					return item == 'new'
				})

				if (result != undefined) {
					let lastTime = this.baseData.timeData[this.baseData.timeData.length - 1]
					let isExist = data_temp.categories.find((item) => {
						return item == lastTime
					})
					if (isExist == undefined) {
						data_temp.categories.push(lastTime)
						data_temp.year.push(lastTime.name.split('-')[0])
						data_temp.index.push(this.baseData.timeData.length - 1)
					}
				}

				let categories = []
				let index = []
				// 筛选分析时间
				for (let i = 0; i < data_temp.categories.length; i++) {
					for (let j = 0; j < checkedTimeList.length; j++) {
						if (data_temp.year[i] == checkedTimeList[j].year) {
							categories.push(data_temp.categories[i])
							index.push(data_temp.index[i])
							break
						}
					}
				}
				data_temp.categories = categories
				data_temp.index = index

				let data_temp_series = []
				this.chartsData.categories = categories
				this.chartsDataOri.series.forEach((item, seriesIndex) => {
					data_temp_series = []
					index.forEach((data) => {
						if (item.data[data] != undefined) {
							data_temp_series.push(item.data[data])
						} else {
							data_temp_series.push(null)
						}
					})
					this.chartsData.series[seriesIndex].data = data_temp_series
				})
				this.chartsDataProcess()

				// 判断数据数量是否不大于图表配置中的单屏显示数量，是：不显示滚动条。否：显示
				if (this.chartsData.series.length > 0 && this.chartsData.series[0].data.length <= this.opts.xAxis.itemCount) {
					this.opts.xAxis.scrollShow = false
				} else {
					this.opts.xAxis.scrollShow = true
				}
				this.chartsData_beforeConver = this.$util.deepCopy(this.chartsData)
				this.handleData('', true)
				tableChartsUtil.updateOptions(this)
			},
			// 改变合并报表类型
			changeReportType() {
				// 显示合并报表类型的底部面板
				this.isShowPanel = true
			},
			// 改变当前对比公司
			changeCompareCompany(e) {
				this.chartsDataProcess()
			},
			/**
			 * description:  改变时间范围
			 */
			changeTimeRange(data: any) {
				// 数据筛选临时obj
				let dataFilter: any = {
					report: this.dataFilter.report,
					time: [],
				}
				let checkedTimeList = data.time.filter((item: any) => {
					return item.checked == true
				})
				// 将改变后的条件作为之后的筛选条件
				checkedTimeList.forEach((item: any) => {
					dataFilter.time.push(item.year.toString())
				})
				this.$store.commit('updateDataFilter', dataFilter)
				// 更新timeList，然后重新获取数据
				this.timeList = dataFilter.time
				this.getChartsData()
			},
			// 筛选出默认报告类型和分析时间的数据
			chartsDataFilter(res: any) {
				let data_temp = {
					categories: [],
					data: [],
					year: [],
					index: [],
				}
				let curSelectTimeData = tableChartsUtil.getTimeDataByReportType(this)
				let resData: any[] = []
				// 筛选报告类型
				for (let i = 0; i < curSelectTimeData.length; i++) {
					for (let j = 0; j < this.dataFilter.report.length; j++) {
						let type = curSelectTimeData[i].name.split('-')[1]
						let year = curSelectTimeData[i].name.split('-')[0]
						if (type == this.dataFilter.report[j]) {
							data_temp.categories.push(curSelectTimeData[i])
							data_temp.year.push(year)
							data_temp.index.push(i)
							break
						}
					}
				}
				// 判断是否选中了最新，是：将最新报告的信息push进数组
				let result = this.dataFilter.report.find((item) => {
					return item == 'new'
				})
				if (result != undefined) {
					let lastTime = curSelectTimeData[curSelectTimeData.length - 1]
					let isExist = data_temp.categories.find((item) => {
						return item == lastTime.name
					})
					if (isExist == undefined) {
						data_temp.categories.push(lastTime)
						data_temp.year.push(lastTime.name.split('-')[0])
						data_temp.index.push(curSelectTimeData.length - 1)
					}
				}

				let categories = []
				let index: any[] = []
				// 筛选分析时间
				for (let i = 0; i < data_temp.categories.length; i++) {
					for (let j = 0; j < this.dataFilter.time.length; j++) {
						if (data_temp.year[i] == this.dataFilter.time[j]) {
							categories.push(data_temp.categories[i])
							index.push(data_temp.index[i])
							break
						}
					}
				}

				res.categories = categories
				res.series.forEach((item: any, seriesIndex: number) => {
					resData = []
					index.forEach((data) => {
						resData.push(item.data[data])
					})
					res.series[seriesIndex].data = resData
					// res.series[seriesIndex].format = 'seriesFormat'
					res.series[seriesIndex].type = 'line'
				})
				return res
			},
			// 改变图表类型
			changeChartType(val: string) {
				this.curSelectChartType = val
				tableChartsUtil.setChartType(this, 'update')
			},
			// 处理获得的图表数据
			chartsDataProcess() {
				this.chartsData_categories = []
				tableChartsUtil.getBaseData(this)
				let res = {}
				// 根据不同的页面类型，设置不同的图表数据和表格标题
				switch (this.chartsInfo.defaultPageType) {
					case 'Code':
						res = tableChartsUtil.setCodeChartData(this)
						break
					case 'Formula':
						res = tableChartsUtil.setFormulaChartData(this)
						break
				}
				// 深拷贝原始图表数据
				this.chartsDataOri = this.$util.deepCopy(res)
				// 筛选出默认报告类型和分析时间的数据
				this.chartsDataFilter(res)
				// 深拷贝筛选后的图表数据
				this.chartsData = this.$util.deepCopy(res)
				// 判断数据数量是否不大于图表配置中的单屏显示数量，是：不显示滚动条。否：显示
				this.opts.xAxis.scrollShow = tableChartsUtil.isScrollShow(this)
				// 深拷贝转换前的图表数据
				this.chartsData_beforeConver = this.$util.deepCopy(this.chartsData)
				// 设置x轴的类目数据
				tableChartsUtil.setXAxisData(this)
				// 如果有不需要显示的指标，将其数据置为空字符串，并从图表系列中移除
				if (this.notIdIndex.length > 0) {
					tableChartsUtil.removeNotIdIndex(this)
				} else {
					// 如果没有不需要显示的指标，直接将图表数据赋值给图表系列
					this.option.series = this.chartsData.series
				}

				tableChartsUtil.setChartType(this)
				// 初始化图表并设置图表选项
				this.$refs['chart'].init(echarts, (chart) => {
					chart.setOption(this.option)
				})
			},
			/**
			 * description: 横屏模式
			 * @createTime: 2022-07-02 09:37:35
			 */
			rotateMode(): void {
				// 将该图表的数据复制给横屏图表
				// let opts_rotate =
				// 	(this.$util.deepCopy(this.opts)(this.$parent as any).isShowRotate == true ?
				// 	(this.$parent as any).chartsShowType = this.curSelectChartType)
				// 切换为横屏
				wx.setPageOrientation({
					orientation: 'landscape',
				})
				let tempOption = this.$util.deepCopy(this.option)
				// 获取胶囊按钮的宽度，用以设置图例距离右侧的距离
				let menu = uni.getMenuButtonBoundingClientRect()
				// 当图例数量大于等于5时，设置右侧距离
				if (tempOption.series.length >= 5) {
					tempOption.legend.right = menu.width + 15
					tempOption.legend.top = 10
				}
				// 设置1s延时，避免渲染出错
				setTimeout(() => {
					;(this.parent as any).$refs.chart.init(echarts, (chart) => {
						chart.setOption(tempOption)
					})
				}, 1000)
				setTimeout(() => {
					;(this.parent as any).$refs.chart.resize()
				}, 1100)
			},
			/**
			 * description: 横屏模式-表格
			 * @createTime: 2022-10-10 15:55:30
			 */
			rotateMode_table(): void {
				// 将该图表的数据复制给横屏表格
				// (this.$parent as any).chartsShowType =
				// 	this.curSelectChartType(this.$parent as any).fstTableTh =
				// 	this.fstTableTh(this.$parent as any).chartsData_lanscape =
				// 	this.$util.deepCopy(this.chartsData)(this.$parent as any).chartsInfo_lanscape =
				// 	this.$util.deepCopy(this.chartsInfo)(this.$parent as any).isShowRotate_table =
				// 		true
				// wx.setPageOrientation({
				// 	orientation: 'landscape',
				// })
			},
			/**
			 * author: ljw
			 * description: 关闭横屏模式
			 * @createTime: 2022-07-02 11:27:33
			 */
			closeRotateMode() {
				;(this.parent as any).isShowRotate = false
				this.chartsData_rotate = {}
			},
			/**
			 * author: ljw
			 * description: 点击图表类型后的回调，切换样式和对应的图表类型
			 * @param id - 图表类型的id.
			 * @createTime: 2022-07-29 11:01:57
			 */
			tagClick(id: any) {
				this.chartsTypeList.forEach((item, index) => {
					if (item.id === id) {
						this.chartsTypeList[index].select = true
					} else {
						this.chartsTypeList[index].select = false
					}
				})
				let result = this.chartsTypeList.find((item) => {
					return item.id === id
				})
				switch (result.type) {
					case 'line':
						this.chartsShowType = 'line'
						break
					case 'column':
						this.chartsShowType = 'bar'
						break
					case 'stack':
						this.chartsShowType = 'stack'
						break
					default:
						this.chartsShowType = 'line'
				}
				tableChartsUtil.setChartType(this, 'update')
			},
			// 点击【显示值】之后的回调
			tagClick_showValue() {
				this.isShowValue = !this.isShowValue
				if (this.isShowValue) {
					this.showValueText = '隐藏值'
					this.option.series.forEach((item, index, arr) => {
						arr[index].label.show = true
						arr[index].label.position = 'top'
					})
				} else {
					this.showValueText = '显示值'
					this.option.series.forEach((item, index, arr) => {
						arr[index].label.show = false
					})
				}
				this.$refs['chart'].setOption(this.option)
			},
			updateCurSelect(val: any[]) {
				this.financialReportType = val
				this.chartsDataProcess()
			},
			showMyTooltip(e: any) {
				let legendHeight = e.opts.chartData.legendData.area.wholeHeight / this.pixelRatio
				this.opts.legend.isReload = false
				if (e.opts.chartData.legendData.isPullDownClicked && legendHeight > 200) {
					if (e.opts.chartData.legendData.isShowAllLegend) {
						this.chartContainnerHeight = 400 + legendHeight + 50
						this.opts.legend.isShowAllLegend = true
					} else {
						this.chartContainnerHeight = 400
						this.$emit('changeScrollTop')
						this.opts.legend.isShowAllLegend = false
					}
				} else if (e.opts.chartData.legendData.isPullDownClicked) {
					if (e.opts.chartData.legendData.isShowAllLegend) {
						this.opts.legend.isShowAllLegend = true
					} else {
						this.opts.legend.isShowAllLegend = false
					}
				}
			},
			dataProcess(val: any) {
				if (this.chartsData_beforeConver.series) {
					this.chartsData_beforeConver.series.forEach((item, index, arr) => {
						arr[index].type = this.curSelectChartType
					})
				}
				if (this.chartsDataOri.series) {
					this.chartsDataOri.series.forEach((item, index, arr) => {
						arr[index].type = this.curSelectChartType
					})
				}
				if (val) {
					switch (val.text) {
						case '年化数据':
							this.tagAnnualized.isSelected = true
							this.dataProcessList[0].text = '取消年化'
							this.deleteDataProcess = this.dataProcessList.splice(1, 1)[0]
							this.handleData('annualized')
							break
						case '单季化数据':
							this.tagQuarterly.isSelected = true
							this.dataProcessList[1].text = '取消单季化'
							this.deleteDataProcess = this.dataProcessList.splice(0, 1)[0]
							this.handleData('quarterly')
							break
						case '取消年化':
							this.tagAnnualized.isSelected = false
							this.dataProcessList[0].text = '年化数据'
							this.dataProcessList.push({
								value: this.deleteDataProcess.value,
								text: this.deleteDataProcess.text,
							})
							this.handleData('restore')
							break
						case '取消单季化':
							this.tagQuarterly.isSelected = false
							this.dataProcessList.unshift({
								value: this.deleteDataProcess.value,
								text: this.deleteDataProcess.text,
							})
							this.dataProcessList[1].text = '单季化数据'
							this.handleData('restore')
							break
					}
				}
			},
			formatMethod(type: string) {
				return tableChartsUtil.getCTypeText(type)
			},
			// 处理年化和季化
			handleData(type: string, optionChange: boolean = false) {
				if (!optionChange && type === 'annualized') {
					tableChartsUtil.handleAnnualized(this, 'annualized')
				} else if (type === 'quarterly') {
					tableChartsUtil.handleAnnualized(this, 'quarterly')
				} else if (type === 'restore') {
					tableChartsUtil.handleAnnualized(this, 'restore')
				} else if (optionChange) {
					if (this.tagAnnualized.isSelected) {
						tableChartsUtil.handleAnnualized(this, 'annualized')
					} else if (this.tagQuarterly.isSelected) {
						tableChartsUtil.handleAnnualized(this, 'quarterly')
					} else {
						tableChartsUtil.handleAnnualized(this, 'restore')
					}
				}
			},
			/**
			 * description: 初始化tag的状态
			 */
			iniTagStatus(chartsInfo: any) {
				if (chartsInfo.isAnnualized) {
					this.tagAnnualized.isExsit = true
				} else {
					this.tagAnnualized.isExsit = false
				}
				if (chartsInfo.isQuarterly) {
					this.tagQuarterly.isExsit = true
				} else {
					this.tagQuarterly.isExsit = false
				}
			},
			itemClickReportType(val: LocalData) {
				this.curReportTypeObj = val
			},
		},
		mounted() {
			this.initData()
		},
		onShow() {
			// 如果对比公司更新过，则重新获取图表数据
			if (this.isCurCmpListUpdate) {
				this.getChartsData()
			}
		},
	}
</script>

<style lang="scss">
	@import '@/static/scss/common/table-charts.scss';
	/* #ifdef H5 */
	.tag {
		margin-right: 40rpx;
	}
	@include myUniTagStyle;
	/* #endif */
</style>
