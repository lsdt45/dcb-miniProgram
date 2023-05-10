<template>
	<!-- #ifdef H5 -->
	<td class="uni-table-td" :rowspan="rowspan" :colspan="colspan" :class="{'table--border':border, 'bold': isBold}" :style="{width:width + 'px','text-align':align}">
		<slot></slot>
	</td>
	<!-- #endif -->
	<!-- #ifndef H5 -->
	<!-- :class="{'table--border':border}"  -->
	<view class="uni-table-td" :class="{'table--border':border, 'bold': isBold}" :style="{width:width + 'px','text-align':align, 'color': color}" @click="tdClick">
		<view :class="bottomText?'td-text': 'td-text align-center'" v-if="extraMode">
			<view class="uni-table-td__slot">
				<slot></slot>
			</view>
		</view>
		<view v-else>
			<view class="uni-table-td__slot">
				<slot></slot>
			</view>
		</view>
		<view class="bottom-text" v-if="extraMode">
			{{ bottomText }}
		</view>
	</view>
	
	<!-- #endif -->
	
</template>

<script>
	/**
	 * Td 单元格
	 * @description 表格中的标准单元格组件
	 * @tutorial https://ext.dcloud.net.cn/plugin?id=3270
	 * @property {Number} 	align = [left|center|right]	单元格对齐方式
	 */
	export default {
		name: 'uniTd',
		options: {
			virtualHost: true
		},
		emits: ['tdClick'],
		props: {
			width: {
				type: [String, Number],
				default: ''
			},
			align: {
				type: String,
				default: 'left'
			},
			rowspan: {
				type: [Number,String],
				default: 1
			},
			colspan: {
				type: [Number,String],
				default: 1
			},
			color: {
				type: String,
				default: ''
			},
			isBold: {
				type: Boolean,
				default: false
			},
			bottomText: {
				type: String,
				default: ''
			},
			extraMode: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				border: false
			};
		},
		created() {
			this.root = this.getTable()
			this.border = this.root.border
		},
		methods: {
			/**
			 * 获取父元素实例
			 */
			getTable() {
				let parent = this.$parent;
				let parentName = parent.$options.name;
				while (parentName !== 'uniTable') {
					parent = parent.$parent;
					if (!parent) return false;
					parentName = parent.$options.name;
				}
				return parent;
			},
			tdClick() {
				this.$emit('tdClick');
			}
		}
	}
</script>

<style lang="scss">
	$border-color:#EBEEF5;

	.uni-table-td {
		display: table-cell;
		padding: 8px 10px;
		font-size: 14px;
		border-bottom: 1px $border-color solid;
		font-weight: 400;
		color: #606266;
		line-height: 1.1em;
		box-sizing: border-box;
		.td-text {
			font-size: 16px;
			color: black;
			&.align-center {
				position: relative;
				top: 0.5em;
			}
		}
		.bottom-text {
			font-size: 12px;
		}
	}

	.table--border {
		border-right: 1px $border-color solid;
	}

</style>
