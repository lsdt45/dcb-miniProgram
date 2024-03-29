interface tag {
	type: string, // 类型
	isExsit: boolean // 是否显示
	isSelected: boolean // 是否被选中
}
// 图表指标数据
interface ReportIndex {
	isBold: boolean
}

export interface ChartsInfo {
	reportChartsIndexList: ReportChartsIndex[],
	reportStandardIndexList: ReportStandardIndex[]
}
export type ReportChartsIndex = ReportIndex
// 标准图表指标数据
export type ReportStandardIndex = ReportIndex

export let testOption = {
	tooltip: {
		trigger: 'axis'
	},
	legend: {
		data: ['邮件营销', '联盟广告', '视频广告', '直接访问', '搜索引擎']
	},
	grid: {
		left: '3%',
		right: '4%',
		bottom: '3%',
		containLabel: true
	},
	xAxis: {
		type: 'category',
		boundaryGap: false,
		data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
	},
	yAxis: {
		type: 'value'
	},
	series: [
		{
			name: '邮件营销',
			type: 'line',
			stack: '总量',
			data: [120, 132, 101, 134, 90, 230, 210]
		},
		{
			name: '联盟广告',
			type: 'line',
			stack: '总量',
			data: [220, 182, 191, 234, 290, 330, 310]
		},
		{
			name: '视频广告',
			type: 'line',
			stack: '总量',
			data: [150, 232, 201, 154, 190, 330, 410]
		},
		{
			name: '直接访问',
			type: 'line',
			stack: '总量',
			data: [320, 332, 301, 334, 390, 330, 320]
		},
		{
			name: '搜索引擎',
			type: 'line',
			stack: '总量',
			data: [820, 932, 901, 934, 1290, 1330, 1320]
		}
	]
}

export let option = {
	tooltip: {
		trigger: 'axis',
		renderMode: 'richText',
		confine: true,
		enterable: true,//滚动条
		extraCssText: "overflow: y;width:120px; height:300px;white-space:pre-wrap; ",//滚动条
	},
	legend: {
		data: ['']
	},
	grid: {
		left: '3%',
		right: '4%',
		bottom: '3%',
		containLabel: true
	},
	xAxis: {
		type: 'category',
		boundaryGap: false,
		data: ['']
	},
	yAxis: {
		type: 'value'
	},
	series: [{}]
}

export let props_dcb_table = {
	chartsData: {
		type: Object,
		default: () => { },
		require: true
	},
	fstTableTh: String,
	chartsInfo: {
		type: Object,
		default: {},
		require: true
	},
	landscape: {
		type: Boolean,
		default: false
	},
	// 是否为双行表头
	doubleTh: {
		type: Boolean,
		default: false
	},
	// 格式化方法
	formatMethod: {
		type: Function,
		default: (type: string) => type
	},
	thWidth: {
		type: String,
		default: '100'
	}
}