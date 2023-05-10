<template>
	<view class="comapre-industry-add__wrapper">
		<dcb-nav-bar :title="stockFullName" leftIconType="back" search :isCustomBack="true" @customBack="backPdfPage">
		</dcb-nav-bar>
		<view class="comapre-industry-add__current">
			<!-- 当前对比公司 -->
			<view class="text_container" @click="showTip">
				<view class="iconfont icon-documentattribute"></view>
				<text class="text">{{ `当前对比公司` }}</text>
			</view>
			<u-tag :text="`${cmpIndustryNum}个`" shape="circle" bg-color="#e9f1fd" border-color="#e9f1fd" color="#000"
				size="mini" class="tag-count" />
			<text class="btn" @click="clear">清空</text>
			<!-- 搜索框 -->
			<view class="comapre-industry-search">
				<u-search class="search" placeholder="请输入股票代码/名称/简拼" v-model="searchKeyWord" shape="square"
					:show-action="false" input-align="center" @change="getSearchStockInfo(searchKeyWord)">
				</u-search>
				<scroll-view class="search-result-list" scroll-y="true" v-if="isShowResult">
					<uni-list>
						<uni-list-item class="list-item" clickable v-for="(item, index) in allStockSearch"
							:key="item.seccode" :border="false" @click="searchItemClick(item, index)">
							<template v-slot:header>
								<view>
									<text class="text">{{ item.secname }}</text>
								</view>
							</template>
						</uni-list-item>
					</uni-list>
				</scroll-view>
			</view>

			<view class="current-compare">
				<view class="current-compare-item" v-for="(item, index) in curCmpList" :key="index">
					<view class="stock-name">{{ item.name }}</view>
					<view class="stock-code">{{ item.code }}</view>
				</view>
			</view>
		</view>
		<!-- 行业tab页 -->
		<view class="comapre-industry-add__body">
			<u-tabs :isScroll="false" :list="list" badgeColor="#000" badgeBgColor="#e9f1fd" v-model="currentTab"
				@change="changeTab"></u-tabs>
			<view class="industry-selector">
				<!-- 行业选择器 -->
				<view class="industry-data-picker">
					<uni-data-picker :localdata="industryPickerTree" :isShowBottomText="true" v-model="curIndustryId"
						:clearIcon="false" :onlyShowLast="true" :placeholder="`当前行业：${curIndustryName}`" preText="当前行业:"
						:noShow="currentTab==0?true:false" @change="changeIndustry" ref="dataPicker">
					</uni-data-picker>
					<view class="data-select__arrow" v-if="currentTab!=0"></view>
				</view>
				<!-- 日期选择器 -->
				<view class="enddate-select">
					<uni-data-select v-model="curSelectDate" :clear="false" :localdata="endDateList"
						@change="changeEndDate">
					</uni-data-select>
				</view>
			</view>
			<view class="industry-info-table">
				<zb-table :data="tableData" :columns="columns" :update="update" :fit="true" :isShowBottomText="true"
					:loadMore="currentTab==0?false: true" @loadmore="loadMore" @toggleRowSelection="toggleRowSelection"
					ref="table">
				</zb-table>
				<view class="iconfont icon-stretch" @click="showIndexSelector"></view>
			</view>
		</view>
		<dcb-popup-panel type="list" v-model:data="listData" :isShowPanel="isShowPanel"
			@update:isShowPanel="val=>isShowPanel=val" title="指标显示设置" @itemClick="updateTableIndex">
		</dcb-popup-panel>
		<u-toast ref="toast" />
	</view>
</template>

<script lang="ts" setup>
	import {
		computed,
		reactive,
		ref,
		watch,
		onMounted,
		nextTick,
		// defineProps
	} from 'vue'
	import {
		onLoad,
		onUnload
	} from '@dcloudio/uni-app'
	import api from '@/common/api/api.js'
	import store from '@/store/index.js'
	import util from '@/common/util'
	import type {
		IndustryTree
	} from '@/types/CommonTypes'
	import DcbPopupPanel from '@/components/dcb-popup-panel/dcb-popup-panel.vue'
	import config from '@/common/data/index.js'
	import {
		list,
		aliasReturnCompareInfo,
		cmpIndustryNum,
		updateList,
		listData,
	} from './compare-industry'
	import type { CompareInfo, IndustryBaseInfo, IndustryPickerDataTree, SearchStockInfo } from './compare-industry'
	import type{
		ListData
	} from '../../../components/dcb-popup-panel/dcb-popup-panel'
	let columns = ref(([{
		type: 'selection',
		width: 58
	}, {
		name: 'name',
		label: '股票',
		width: 90,
	}, {
		name: 'mainBusinessIncome',
		label: '主营业务收入(万元)',
		width: 140,
		align: 'right',
		sorter: true,
		defaultSort: true,
	}]))
	// 股票全名
	const stockFullName = computed(() => {
		return store.state.curStock.secName + store.state.curStock.secCode;
	})
	// 表格组件实例
	const table = ref(null)
	// 提示框组件实例
	const toast = ref(null)
	// 行业选择器组件实例
	const dataPicker = ref(null)
	// 所有股票信息-搜索框
	let allStockSearch = ref < SearchStockInfo[] > ()
	// 用于获取报告期列表
	let chartsId = ''
	// 当前对比公司列表
	let curCmpList = ref < CompareInfo[] > (aliasReturnCompareInfo(store.state.curCmpList))
	// 当前行业信息
	let curIndustryClassification = ref < IndustryTree > ()
	// 当前行业基本信息
	let curIndustryBaseInfo: IndustryBaseInfo = {} as IndustryBaseInfo
	// 当前行业名
	let curIndustryName = ref('')
	// 当前行业id
	let curIndustryId = ref(0)
	// 当前tab页
	let currentTab = ref(0)
	// 当前选择的日期
	let curSelectDate = ref(0)
	// 当前表格页数
	let curTableIndex = ref(1)
	// 默认对比公司
	let defaultIndustyList = ref < CompareInfo[] > (aliasReturnCompareInfo(store.state.defaultIndustyList))
	let endDateList = ref([])
	// 所有行业树结构
	let otherIndustriesTree = ref < IndustryTree[] > ([])
	// 当前行业树结构
	let identicalIndustriesTreeList = ref < IndustryTree[] > ([])
	// 行业选择器数据
	let industryPickerTree = ref < IndustryPickerDataTree[] > ([])
	// 是否显示设置面板
	let isShowPanel = ref(false)
	// 是否显示搜索结果
	let isShowResult = ref(false)
	// 是否来自pdf页面
	let isFromPdf = ref('')
	// 每次获取数据的个数
	let pageSize = ref(65)
	// 搜索框关键词
	let searchKeyWord = ref('')
	// 表格数据
	let tableData = ref < CompareInfo[] > (util.deepCopy(defaultIndustyList.value))
	// 时间跨度
	let timeRange = []
	let update = ref(false)
	// 初始化数据
	function initData() {
		setCurTabBadge(defaultIndustyList.value.length)
		curIndustryName.value = store.state.curStock.industry
		cmpIndustryNum.value = curCmpList.value.length
		store.state.endDateList.forEach((item, index) => {
			endDateList.value.push({
				value: index,
				text: item
			})
		})
	}
	/**
	 * description: 清除对比公司，除了主公司
	 * @createTime: 2022-10-27 16:21:25
	 */
	function clear() {
		curCmpList.value = curCmpList.value.filter((item) => {
			return item.name === store.state.curStock.secName
		})
		update.value = !update.value
		updateList(curCmpList.value)
	}
	// 弹出行业选择器
	function showIndustrySelector() {
		if (currentTab.value != 0) {
			dataPicker.value.show()
		}
	}
	// 弹出表格指标选择器
	function showIndexSelector() {
		isShowPanel.value = true
	}
	// 点击「对比公司」文本左边的icon显示的提示语
	function showTip() {
		toast.value.show({
			title: '您可以在此自定义对比公司，最多可选8个'
		})
	}
	/**
	 * description: 切换tab页的回调
	 * @param index - tab页的索引.
	 * @createTime: 2022-11-07 21:50:38
	 */
	function changeTab(index: number) {
		// 判断是否为系统默认分类，是：赋值默认对比公司列表。否：通过接口获取列表。
		// 将是否已排序的标识设为false，以便排序
		table.value.isSorted = false
		if (index === 0) {
			tableData.value = defaultIndustyList.value
			nextTick(() => {
				setCurTabBadge(defaultIndustyList.value.length)
			})
			initItemChecked()
		} else {
			let name = ''
			list.value.forEach((item, listIndex) => {
				if (index === listIndex) {
					name = item.fullName
				}
			})
			// 筛选当前行业信息
			identicalIndustriesTreeList.value.forEach((item) => {
				if (item.name === name) {
					curIndustryClassification.value = item
				}
			})
			// 重新获取当前行业的表格数据
			dataPicker.value.clear()
			tableData.value = []
			curTableIndex.value = 1
			getCurIndustryInfo()
		}

	}
	/**
	 * description: 改变当前报告期后重新获取数据
	 */
	function changeEndDate(val) {
		if (currentTab.value == 0) {
			let date = null
			for (let index in endDateList.value) {
				if (val == index) {
					date = endDateList.value[index].text
					break
				}
			}
			getDefaultCompareList(date)
		} else {
			tableData.value = []
			curTableIndex.value = 1
			getCurIndustryInfo()
		}
	}
	/**
	 * description: 选择完行业后重新获取数据
	 * @param e - 选择完毕的回调参数
	 */
	function changeIndustry(e) {
		if (e.detail.value.length == 0) return
		let item = e.detail.value[e.detail.value.length - 1]
		tableData.value = []
		curTableIndex.value = 1
		curIndustryName.value = item.text
		getCurIndustryCompany(item.value)
	}
	/**
	 * description: 获取报告期列表
	 * @createTime: 2022-11-09 09:06:40
	 */
	function getAnalysisTime() {
		let start = config.data.MaxStartTime
		let end = new Date().getFullYear()
		timeRange = []
		while (start <= end) {
			timeRange.push(end.toString())
			end--
		}
	}
		/**
		 * description: 获取行业分类信息
		 * @return 
		 * @createTime: 2022-11-01 16:59:49
		 */
		function getIndustryClassificationInfo() {
			api.post("/Compare/IndustryClassificationTree").then((resp) => {
				if (resp.data) {
					identicalIndustriesTreeList.value = resp.data.identicalIndustriesTree
					otherIndustriesTree.value = resp.data.otherIndustriesTree
					industryPickerTree.value = getIndustryPickerData(otherIndustriesTree.value)
				}
			})
		}
	/**
	 * description: 获取当前行业分类下的股票信息
	 * @createTime: 2022-11-01 16:59:49
	 */
	function getCurIndustryCompany(code = null) {
		let industryCode = null
		let reportData = null
		for (let item of endDateList.value) {
			if (item.value == curSelectDate.value) {
				reportData = curSelectDate.value > 0 ? item.text : null
				break
			}
		}
		industryCode = code ? code : curIndustryBaseInfo.industryCode
		let param = {
			Code: store.state.curStock.secCode,
			IndustryCode: industryCode,
			IndustryName: curIndustryClassification.value.typeName,
			pageIndex: curTableIndex.value,
			pageSize: pageSize.value,
			ReportDate: reportData,
		}
		api.post('/Compare/GetIndustryAndFinance', param).then((resp) => {
			if (resp.data) {
				let tempData = aliasReturnCompareInfo(resp.data)
				tableData.value = tableData.value.concat(tempData)
				setCurTabBadge(resp.totalCount)
				initItemChecked()
				// 如果返回的数据少于pageSize，则表示没有更多。
				if (resp.data.length < pageSize.value) {
					table.value.status = 'nomore'
				} else {
					table.value.status = 'loadmore'
				}
			}
		})
	}
	/**
	 * description: 获取当前行业的信息
	 * @param industryNameParam - 行业名。不传则默认为当前tab页的行业分类。
	 * @createTime: 2022-11-01 16:59:49
	 */
	function getCurIndustryInfo(industryNameParam = null) {
		let industryName = ''
		industryName = industryNameParam ? industryNameParam :
			curIndustryClassification.value.typeName
		let param = {
			Code: store.state.curStock.secCode,
			IndustryName: industryName,
		}
		api.post('/Compare/GetSameIndustryByCode', param).then((resp) => {
			if (resp.data) {
				curIndustryBaseInfo = resp.data
				curIndustryName.value = curIndustryBaseInfo.industryName
				getCurIndustryCompany()
			}
		})
	}

	function getChartsData() {
		let param = {
			ChartsId: chartsId,
			MainCode: store.state.curStock.secCode,
			MainTime: store.state.curStock.year,
			TimeList: timeRange,
			Granularity: '季',
			ChartsType: '',
			LoadIndustryList: [],
			CodeList: [],
			BenchCodeList: [],
			ReportType: null,
		}
		api.post('/Report/GetChartsData', param).then((resp) => {
			if (resp.status) {
				console.log(resp)
				// 获取日期列表
				let timePeriodTemp = resp.data.codeDataList[0].data.calculationAllData.slice(1);
				let timePeriod = []
				timePeriodTemp.forEach(item => {
					if (item && item.length > 0) {
						timePeriod.unshift(item[0]);
					}
				})
				timePeriod.unshift('最新日期');
				timePeriod.forEach((item, index) => {
					endDateList.value.push({
						value: index,
						text: item
					})
				})				
			}
		})
	}
	/**
	 * description: 初始化表格选择
	 * @createTime: 2022-11-07 17:04:38
	 */
	function initItemChecked() {
		tableData.value.forEach((item, index, arr) => {
			let result = curCmpList.value.find((yItem, yIndex) => {
				return item.code === yItem.code
			})
			if (result) {
				arr[index].checked = true
				table.value.checkboxSelected({
					checked: true,
					data: arr[index]
				}, arr[index], false)
			}
		})
	}
	// 点击加载更多
	function loadMore() {
		curTableIndex.value++
		getCurIndustryInfo()
	}
	/**
	 * description: 切换表格多选框后的回调。控制增加/删除当前对比公司列表
	 * @param {boolean} selected - 是否选中.
	 * @param {object} item - 当前操作的成员对象.
	 * @createTime: 2022-11-02 10:51:07
	 */
	function toggleRowSelection(selected, item) {
		if (selected) {
			let result = curCmpList.value.find((xItem) => {
				return xItem.code === item.code
			})
			if (result) {
				toast.value.show({
					title: '股票已存在！',
					type: 'warning'
				})
				setTimeout(() => {
					table.value.checkboxSelected({
						checked: false,
						data: item
					}, item, false)
				}, 10)
				return
			}
			if (curCmpList.value.length >= 8) {
				toast.value.show({
					title: '最多可选8个对比公司，请先删除后再添加！',
					type: 'warning'
				})
				setTimeout(() => {
					table.value.checkboxSelected({
						checked: false,
						data: item
					}, item, false)
				}, 10)
				return
			}
			curCmpList.value.push(item)
			updateList(curCmpList.value)
		} else {
			let result = curCmpList.value.filter((xItem, index) => {
				return item.code !== xItem.code
			})
			if (result.length > 0) {
				curCmpList.value = result
				updateList(curCmpList.value)
			} else {
				return
			}
		}
		cmpIndustryNum.value = curCmpList.value.length
	}
	/**
	 * description: 设置当前tab页显示的徽标数
	 * @param num - 目标数.
	 * @createTime: 2022-11-02 15:40:21
	 */
	function setCurTabBadge(num: number) {
		list.value.forEach((item, index) => {
			item.count = item.index === currentTab.value ? num : null
		})
	}
	// 从接口返回的数据初始化行业选择器数据
	function getIndustryPickerData(data: IndustryTree[]): IndustryPickerDataTree[] {
		let industryDataArr: IndustryPickerDataTree[] = []
		data.forEach((item, index) => {
			let industryData: IndustryPickerDataTree = {
				text: item.name,
				value: item.id,
				disable: false,
				selected: false,
			}
			if (item.children.length > 0) {
				industryData.children = getIndustryPickerData(item.children)
			}
			industryDataArr.push(industryData)
		})
		return industryDataArr
	}

	function getDefaultCompareList(date) {
		let param = {
			Code: store.state.curStock.secCode,
			ReportDate: date
		}
		api.post('/Compare/GetToCompareList_CompanyAndFinance', param)
			.then((res: any) => {
				// store.commit('updateCurCmpList', res.data.defaultCompareList)
				// store.commit('updateDefaultIndustyList', res.data.defaultCompareList)
				tableData.value = aliasReturnCompareInfo(res.data.defaultCompareList)
				initItemChecked()
			})
			.catch((err: Error) => console.log(err));
	}
	// 获取所有股票信息，用于搜索
	const getSearchStockInfo = util.debounce((val) => {
		// 接口入参
		let pattern = /^[a-zA-Z]+$/g
		let isPureLetter = pattern.test(val)
		val = isPureLetter ? val.toUpperCase() : val
		let param = {
			search: val.toString(),
		};
		if (val) {
			api.get("/Report/GetStockInfoSearch", param).then((resp: any) => {
				if (resp.status) {
					allStockSearch.value = resp.data;
					// 是否有搜索结果
					if (allStockSearch.value.length != 0) {
						isShowResult.value = true;
						// isResultExit = true;
					} else {
						isShowResult.value = false;
						// isResultExit = false;
					}
				}
			});
		}
	}, 1000)
	// 点击搜索结果列表中的项
	function searchItemClick(item, index) {
		let result = curCmpList.value.find((xItem) => {
			return xItem.code === item.seccode
		})
		if (result) {
			toast.value.show({
				title: '股票已存在！',
				type: 'warning'
			})
			isShowResult.value = false
			return
		}
		if (curCmpList.value.length >= 8) {
			toast.value.show({
				title: '最多可选8个对比公司，请先删除后再添加！',
				type: 'warning'
			})
			isShowResult.value = false
			return
		}
		curCmpList.value.push({
			name: item.secname,
			code: item.seccode,
			mainBusinessIncome: null,
			netProfit: null,
			totalAssets: null,
			endDate: '',
			ROE: null,
			listingDate: null,
			isCurCompare: false,
			checked: false
		})
		updateList(curCmpList.value)
		initItemChecked()
		cmpIndustryNum.value = curCmpList.value.length
		isShowResult.value = false
	}

	// 更新表格指标
	function updateTableIndex(item: ListData) {
		columns.value[2].name = item.name
		columns.value[2].label = item.text
	}
	// 返回pdf页面
	function backPdfPage() {
		uni.navigateBack({
			delta: 1
		})
	}
	
	onMounted(() => {
		initData()
		getIndustryClassificationInfo()
		initItemChecked()
	})
	onLoad((options) => {
		// 如果是从pdf详情页跳转过来的，则需要单独获取一下报告期列表数据
		isFromPdf.value = options.isFromPdf
		if(isFromPdf) {
			chartsId = options.chartsId
			getAnalysisTime()
			getChartsData()		
		}
	})
	onUnload(() => {
		// 如果是从pdf详情页跳转过来的，返回之后进行额外处理
		if(isFromPdf.value) {
			uni.$emit('updateCompareList', {
				isLogin: true
			})
		}
	})
</script>

<style lang="scss">
	@import '@/static/scss/common/compare-industry.scss';
</style>
