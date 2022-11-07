	import { reactive } from 'vue'
	
	interface tag {
		type: string, // 类型
		isExsit: boolean // 是否显示
		isSelected: boolean // 是否被选中
	}
	
	export let tagAnnualized: tag = reactive({
		type: 'annualized',
		isExsit: false,
		isSelected: false,
	})
	export let tagQuarterly: tag = reactive({
		type: 'quarterly',
		isExsit: false,
		isSelected: false,
	})