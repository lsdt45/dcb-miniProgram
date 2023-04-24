import utils from '@/common/util'
import store from '@/store/index.js'
import {
	reactive,
	ref
} from 'vue'
export interface CompareInfo {
	name: string,
	code: number,
	mainBusinessIncome: string, // 主营业务收入
	netProfit: string, // 净利润
	totalAssets: string, // 总资产
	endDate: string, // 报告期
	ROE: number, // ROE
	listingDate: string, // 上市日期
	isCurCompare: boolean, // 是否是当前公司
	checked: boolean, // 是否被选中
}
export interface IndustryPickerDataTree {
	text: string,
	value: string,
	disable: boolean,
	selected: boolean,
	children?: IndustryPickerDataTree[]
}

export interface IndustryBaseInfo {
	industryCode: string,
	industryName: string
}
export interface SearchStockInfo {
	secname: string,
	seccode: string,
}
export let cmpIndustryNum = ref(0)

export let list = ref([{
	name: '系统',
	index: 0,
	fullName: '系统',
	count: null
}, {
	name: '证监会',
	fullName: '证监会行业分类',
	index: 1,
	count: null
}, {
	name: '申银万国',
	fullName: '申银万国行业分类',
	index: 2,
	count: null
}, {
	name: '全球',
	fullName: '全球行业分类（GICS）',
	index: 3,
	count: null
}, {
	name: '中信',
	fullName: '中信行业分类',
	index: 4,
	count: null
}])

export const columns = [{
	name: 'name',
	label: '股票',
	fixed: true
}, {
	name: 'listingDate',
	label: '上市日期',
	sorter: true,
	width: 120,
	align: 'right'
}, {
	name: 'mainBusinessIncome',
	label: '主营业务收入(万元)',
	sorter: true,
	defaultSort: true,
}, {
	name: 'netProfit',
	label: '净利润(万元)',
	sorter: true,
}, {
	name: 'totalAssets',
	label: '总资产(万元)',
	sorter: true,
}, {
	name: 'ROE',
	label: 'ROE',
	sorter: true,	
}, {
	name: 'endDate',
	label: '报告期',
	sorter: true,	
}]
// 表格指标分类
export let listData = ref([{
			text: '主营业务收入(万元)',
			name: 'mainBusinessIncome',
			checked: true
		}, {
			text: '净利润(万元)',
			name: 'netProfit',
			checked: false
		}, {
			text: '总资产(万元)',
			name: 'totalAssets',
			checked: false
		}, {
			text: 'ROE',
			name: 'ROE',
			checked: false
		}, {
			text: '上市日期',
			name: 'listingDate',
			checked: false
		}, {
			text: '报告期',
			name: 'endDate',
			checked: false
		}])
/**
 * description: 将接口返回的数据重新命名、赋值
 * @return 当前对比公司列表
 * @createTime: 2022-10-27 17:26:29
 */
function aliasReturnCompareInfo(data: any): CompareInfo[] {
	let curCmpList: CompareInfo[] = []
	data.forEach((item: any) => {
		let mainBusinessIncome = utils.dataFormat(item.comp007_006, 2),
				netProfit = utils.dataFormat(item.comp007_027, 2),
				totalAssets = utils.dataFormat(item.comp009_038, 2)
		let tempItem: CompareInfo = {
			name: item.comp004_OrgName,
			code: item.comp004_Seccode,
			mainBusinessIncome: mainBusinessIncome? mainBusinessIncome: '--',
			netProfit: netProfit? netProfit: '--',
			totalAssets: totalAssets? totalAssets: '--',
			endDate: utils.FormatDate(new Date(item.endDate), "yyyy-MM-dd"),
			ROE: Number(item.index003_001),
			listingDate: utils.FormatDate(new Date(item.pub009_007), "yyyy-MM-dd"),
			isCurCompare: item.comp004_OrgName === store.state.curStock.secName ? true : false,
			checked: false
		} as CompareInfo
		curCmpList.push(tempItem);
	})
	return curCmpList
}

function updateList(list: CompareInfo[]) {
	let curCmpList: any[] = []
	list.forEach((item: any) => {
		let tempItem = {
			comp004_OrgName: item.name,
			comp004_Seccode: item.code,
			comp007_006: item.mainBusinessIncome,
			comp007_027: item.netProfit,
			comp007_038: item.totalAssets,
			endDate: item.endDate,
			comp007_001: item.ROE,
			pub009_007: item.listingDate,
			isCurCompare: false
		}
		curCmpList.push(tempItem);
	})
	store.commit('updateCurCmpList', curCmpList)
}
// 添加对比公司前的验证规则
// function checkAddRule(list: CompareInfo[]) {
	
// }

export { aliasReturnCompareInfo, updateList }
