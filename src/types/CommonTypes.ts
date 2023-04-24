// 对比公司接口
export interface CompareInfo {
	name: string,
	code: number,
	mainBusinessIncome: number, // 主营业务收入
	netProfit: number, // 净利润
	totalAssets: number, // 总资产
	endDate: string, // 报告期
	ROE: number, // ROE
	listingDate: number, // 上市日期
	isCurCompare: boolean, // 是否是当前公司
}
// 行业分类接口
export interface IndustryTree {
	children: IndustryTree[],
	id: string,
	indexId: string,
	name: string,
	parentId: string,
	type: number,
	typeId: string,
	typeName: string
}

export type LocalData = {
	value: number,
	text: string
}