<template>
	<view class="dcb-popup-panel__wrapper">
		<view class="dcb-popup-panel__selector" v-if="type==='selector'">
			<u-popup v-model="isShowPanel" mode="bottom" border-radius="40" closeable :mask-close-able="false"
				@close="closePanel()">
				<view class="panel-header">{{ title }}</view>
				<u-checkbox-group :wrap="true" shape="circle">
					<u-checkbox v-for="(item, index) in listData" v-model="item.checked" :key="index" :name="item.text">
						{{ item.text }}
					</u-checkbox>
				</u-checkbox-group>
				<view class="panel-footer">
					<view class="panel-footer-btns">
						<u-button class="cancel" size="medium">取消</u-button>
						<u-button class="ok" type="primary" size="medium">确定</u-button>
					</view>
				</view>
			</u-popup>
		</view>
		<view class="dcb-popup-panel__list" v-else-if="type==='list'">
			<u-popup v-model="isShowPanel" mode="bottom" border-radius="40" closeable :mask-close-able="false"
				@close="closePanel()">
				<view class="panel-title">
					{{ title }}
				</view>
				<uni-list>
					<uni-list-item class="list-item" :class="{ selected: curSelectIndex == index }"
						v-for="(item, index) in listData" :key="index" clickable :border="false" @click="itemClick(item)">
						<template v-slot:header>
							<text class="text">{{ item.text }}</text>
						</template>
					</uni-list-item>
				</uni-list>
				<view class="panel-footer" @click="closePanel()">
					<view class="panel-footer-btns">
						<text>取消</text>
					</view>
				</view>
			</u-popup>
		</view>
	</view>
</template>

<script lang="ts">
	export default {
		options: {
			styleIsolation: 'shared',
		}
	}
</script>

<script lang="ts" setup>
	import {
		// defineProps,
		// defineEmits,
		computed,
		ref,
		onMounted
	} from 'vue'

	import {
		ListData,
		propsObj,
	} from './dcb-popup-panel'

	const props = defineProps(propsObj)
	const emit = defineEmits(['update:data', 'update:isShowPanel', 'itemClick'])
	const listData = computed < ListData[] > ({
		get() {
			return props.data as ListData[]
		},
		set(newVal) {
			emit('update:data', newVal)
		}
	})
	const isShowPanel = computed({
		get() {
			return props.isShowPanel
		},
		set(newVal) {
			emit('update:isShowPanel', newVal)
		}
	})
	// 当前被选择的行
	let curSelectIndex = ref(0)

	function itemClick(item: ListData) {
		listData.value.forEach((listDataItem, index, arr) => {
			if(listDataItem.text === item.text) {
				arr[index].checked = true
				curSelectIndex.value = index
			} else {
				arr[index].checked = false
			}
		})
		closePanel()
		emit('itemClick', item)
	}

	function closePanel() {
		isShowPanel.value = false
	}

</script>

<style lang="scss">
	.dcb-popup-panel__wrapper {
		.dcb-popup-panel__list {
			.list-item {
				border-bottom: $border3;
				&.selected .uni-list-item {
					background: #e9f1fd;
					color: #2c72ec;
				}
			}
		}
		.list-item {
			border-bottom: $border3;
			&.selected{
				.uni-list-item {
					background: #e9f1fd !important;
					color: #2c72ec !important;
				}
			}
		}

		// 面板的头部样式
		.panel-title {
			height: 116rpx;
			line-height: 116rpx;
			text-align: left;
			font-weight: bold;
			font-size: $font-size-text-medium;
			padding-left: 28rpx;
			border-bottom: $border2;
		}

		.panel-body {
			// padding: 20rpx 30rpx;
		}

		.panel-footer {
			display: flex;
			height: 128rpx;
			align-items: center;
			justify-content: center;
			border-top: $border-footer-div;
			
			.panel-footer-btns {
				font-size: 16px;
				font-weight: bold;
			}
			
			.cancel,
			.ok {
				flex: 1;
			}

			.cancel {
				margin-right: $margin40rpx;

				.u-btn {
					background-color: $btn-color-f2;
					color: $color-main;
				}
			}

			.ok {
				button {
					border-color: $btn-ok-color;
					background-color: $btn-ok-color;
				}
			}

			.u-btn {
				padding: 0 128rpx;
				border-radius: 5px !important;
				font-weight: 650;
			}
		}
	}
</style>
