export interface ListData {
	text: string, // 列表内容
	name: string, // 指标名
	checked?: boolean, // 是否被选中
}
export let propsObj = {
	isShowPanel: {
		type: Boolean,
		default: false
	},
	type: {
		type: String,
		default: 'list'
	},
	data: {
		type: Array,
		default: () => [],
		require: true
	},
	title: {
		type: String,
		default: ''
	}
}