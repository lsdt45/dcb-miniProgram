<!-- @format -->

<template>
	<view class="compare-industry__wrapper">
		<dcb-nav-bar :title="stockFullName" leftIconType="back" search></dcb-nav-bar>
		<view class="compare-industry__header">
			<view class="text_container" @click="showTip">
				<view class="iconfont icon-documentattribute"></view>
				<text class="text">{{ `当前对比公司` }}</text>
			</view>
			<u-tag :text="`${cmpIndustryNum}个`" shape="circle" bg-color="#e9f1fd" border-color="#e9f1fd" color="#000" size="mini" class="tag-count" />
			<text class="btn" @click="clear">清空</text>
		</view>
		<view class="compare-industry__body">
			<zb-table :data="curCmpList" :columns="columns" :update="update" :fit="true" :isShowBottomText="true" @deleteTr="deleteTr"></zb-table>
		</view>
		<view class="btn-add" @click="openAddPage">
			<view class="btn-add-content">
				<text class="iconfont icon-newzoomin"></text>
				添加对比
			</view>
		</view>
	</view>
	<u-toast ref="toast" />
</template>

<script lang="ts" setup>
	import { onLoad } from '@dcloudio/uni-app'
	import { ref, computed, watch } from 'vue'
	import api from '@/common/api/api.js'
	import store from '@/store/index.js'
	import { aliasReturnCompareInfo, updateList, columns, cmpIndustryNum } from './compare-industry'
	import type { CompareInfo } from './compare-industry'
	// 提示框
	const toast = ref(null)
	// 股票全名
	const stockFullName = computed(() => {
		return store.state.curStock.secName + store.state.curStock.secCode
	})
	const stateCurCmpList = computed(() => {
		return store.state.curCmpList
	})
	// 当前对比公司列表
	let curCmpList: CompareInfo[] = aliasReturnCompareInfo(store.state.curCmpList)
	cmpIndustryNum.value = curCmpList.length
	let update = ref(false)

	watch(stateCurCmpList, (newVal) => {
		curCmpList = aliasReturnCompareInfo(newVal)
		update.value = !update.value
		cmpIndustryNum.value = curCmpList.length
	})

	function deleteTr(name) {
		curCmpList = curCmpList.filter((item) => {
			return item.name != name
		})
		update.value = !update.value
		updateList(curCmpList)
		cmpIndustryNum.value = curCmpList.length
	}
	/**
	 * description: 清除对比公司，除了主公司
	 * @return
	 * @createTime: 2022-10-27 16:21:25
	 */
	function clear() {
		curCmpList = curCmpList.filter((item) => {
			return item.name === store.state.curStock.secName
		})
		update.value = !update.value
		updateList(curCmpList)
	}
	// 点击「对比公司」文本左边的icon显示的提示语
	function showTip() {
		toast.value.show({
			title: '您可以在此自定义对比公司，最多可选8个',
		})
	}
	function openAddPage() {
		uni.navigateTo({
			url: '/subPackages/stock/compare-industry/compare-industry-add',
		})
	}
	onLoad(() => {})
</script>

<style lang="scss">
	.compare-industry__wrapper {
		height: 100vh;
		background: $page-bgcolor;

		/* #ifdef MP */
		.compare-industry__header {
			display: grid;
			grid-template-columns: 240rpx auto 2.2em;
			padding: 20px 15px;
			margin-bottom: 5px;
			background-color: #fff;

			.tag-count {
				position: relative;
			}
			.text_container {
				display: flex;
				.text {
					font-size: 16px;
				}
			}
			.icon-documentattribute {
				line-height: 1.4em;
				margin-right: 5px;
			}
		}
		/* #endif */
		/* #ifdef H5 */
		.compare-industry__header {
			display: grid;
			grid-template-columns: 240rpx auto 2.2em;
			padding: 20px 15px;
			margin-bottom: 5px;
			background-color: #fff;

			.tag-count {
				position: relative;
			}
			.text_container {
				display: flex;
				.text {
					font-size: 16px;
				}
			}
			.icon-documentattribute {
				line-height: 1.4em;
				margin-right: 5px;
			}
			.u-shape-circle {
				width: 4em;
				text-align: center;
			}
		}
		/* #endif */
		.compare-industry__body {
			background-color: #fff;
			.item-th:nth-of-type(1),
			.item-td:nth-of-type(1) {
				width: 85px !important;
				padding-left: 15px !important;
			}
			.item-th:nth-of-type(2) {
				width: 108px !important;
			}
			.item-td:nth-of-type(2) {
				width: 108px !important;
			}
		}

		.btn-add {
			width: 100%;
			padding: 20px;
			margin-top: 10px;
			color: $color-main;
			background-color: #fff;

			.btn-add-content {
				text-align: center;
			}
		}

		.btn {
			font-weight: bold;
			color: $color-main;
		}

		.btn-hover-class {
			background-color: #e9f1fd;
		}
	}
</style>
