const data = new Map([
	['comp004_006', {
		name: '所属行业',
		value: '',
		unit: ''
	}],
	['comp007_027', {
		name: '净利润',
		value: '',
		unit: '万'
	}],
	['comp007_006', {
		name: '主营业务收入',
		value: '',
		unit: '万'
	}],
	['index000_002', {
		name: '基本每股收益',
		value: '',
		unit: '元'
	}],
	['index003_001', {
		name: 'ROE',
		value: '',
		unit: ''
	}],
	['index003_002', {
		name: 'ROA',
		value: '',
		unit: ''
	}],
	['pE_LAR', {
		name: '市盈率',
		superior: '静',
		value: '',
		unit: ''
	}],
	['pB_MRQ', {
		name: '市净率',
		value: '',
		unit: ''
	}],
	['totaL_SHARES', {
		name: '总股本',
		value: '',
		unit: '万'
	}],
	['totaL_MARKET_CAP', {
		name: '总市值',
		value: '',
		unit: '万'
	}],
	['freE_SHARES_A', {
		name: '流通股本',
		value: '',
		unit: '万'
	}],
	['notlimiteD_MARKETCAP_A', {
		name: '流通市值',
		value: '',
		unit: '万'
	}],
])

const iconStyleArr = [
	{
		type: 'iconfont icon-stack',
		color: '#b17a5b;'
	},
	{
		type: 'iconfont icon-line',
		color: '#5b8ff9;'
	},
	{
		type: 'iconfont icon-a-businessincome',
		color: '#e86452;'
	},
	{
		type: 'iconfont icon-a-totalasset',
		color: '#ff9845;'
	},
	{
		type: 'iconfont icon-pie',
		color: '#f6bd16;'
	},
	{
		type: 'iconfont icon-a-rightsandinterests',
		color: '#6dc8ec;'
	},
	{
		type: 'iconfont icon-a-netprofit',
		color: '#a688ff;'
	},
	{
		type: 'iconfont icon-a-cashflow',
		color: '#e8ab68;'
	},
	{
		type: 'iconfont icon-a-setasdefault',
		color: '#5470c6;'
	},
	{
		type: 'iconfont icon-apply',
		color: '#ff99c3;'
	}
]


export default {
	data,
	iconStyleArr
}
