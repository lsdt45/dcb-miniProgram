import { createStore } from 'vuex'
import dataIndex from '@/common/data/index.js'
// var dataIndextemp = dataIndex

const store = createStore({
	state: {
		config: '',
		// 当前股票的基本信息
		curStock: {
			secName: '',
			secCode: '',
			market: '',
			year: '',
			rptType: '',
			industry: ''
		},
		curCmpList: [], // 当前对比公司列表
		defaultIndustyList: [], // 系统默认对比公司列表
		// 默认的报告类型和分析时间
		dataFilter: {
			report: [],
			time: [],
		},
		// 报告日期列表
		endDateList: [], 
		// 顶部导航栏高度
		navBarHeight: '120rpx',
		userInfo: {}, // 用户登录信息
		firstEnter: true, // 是否是第一次进入
		isLogin: false, // 是否登录成功
		systemInfo: {}, // 设备信息
		// 图表相关状态
		tableHandle: {
			handleAnnualized: false, // 年化
			handleQuarterly: false, // 季化			
		}
	},
	mutations: {
		setConfig(state, config) {
			state.config = config
		},
		setCurStock(state, curStock) {
			state.curStock.secName = curStock.secName
			state.curStock.secCode = curStock.secCode
			state.curStock.market = curStock.market
			state.curStock.industry = curStock.industry
			if(curStock.year) {
				state.curStock.year = curStock.year
			} else {
				state.curStock.year = ''
			}
			if(curStock.rptType) {
				state.curStock.rptType = curStock.rptType
			} else {
				state.curStock.rptType = ''
			}
		},
		updateSystemInfo(state, data) {
			state.systemInfo = data
		},
		updateDataFilter(state, data) {
			state.dataFilter = data
		},
		updateNavBarHeight(state, height) {
			state.navBarHeight = height
		},
		updateUserInfo(state, userInfo) {
			state.userInfo = userInfo
		},
		updateFirstEnter(state, firstEnter) {
			state.firstEnter = firstEnter
		},
		updateLoginStatus(state, status) {
			state.isLogin = status
		},
		updateTableHandle(state, data) {
			state.tableHandle.handleAnnualized = data.handleAnnualized
			state.tableHandle.handleQuarterly = data.handleQuarterly
		},
		updateCurCmpList(state, data) {
			state.curCmpList = data
		},
		updateDefaultIndustyList(state, data) {
			state.defaultIndustyList = data
		},
		updateEndDateList(state, data) {
			state.endDateList = data
		}
	},
	getters: {
		
	},
	actions: {
		// lazy loading openid
	}
})

export default store