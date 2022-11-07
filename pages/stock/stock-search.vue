<template>
  <view class="stock-search-wrapper">
    <uni-nav-bar
      title="股票搜索"
      left-icon="left"
      :height="navBarHeight"
      backgroundColor="#2C72EC"
      color="#FFF"
      :fixed="true"
      @clickLeft="back"
    >
    </uni-nav-bar>
    <view class="stock-search__body">
      <view class="stock-search-header">
        <u-search
          placeholder="股票"
          v-model="keyWord"
          shape="square"
          action-text="取消"
          @change="startSearch"
          :clearabled="false"
          @custom="handleResultShow"
        >
        </u-search>
      </view>
      <view class="search-result" v-if="isShowResult">
        <uni-transition :mode-class="['fade', 'zoom-in']" :show="isResultExit">
          <uni-list :border="false">
            <uni-list-item
              v-for="item in searchResultData"
              :key="item.seccode"
              :border="false"
              clickable
              @click="toSpecifyStock(item, 'search')"
            >
              <template v-slot:header class="search-result__item-name">
                {{ item.secname + "(" + item.seccode + ")" }}
              </template>
              <template v-slot:footer>
                <button class="add-stock-btn" type="default" size="mini" @click.stop="addOptionalStock(item)">
                  {{ addBtnText(item) }}
                </button>
              </template>
            </uni-list-item>
          </uni-list>
        </uni-transition>
        <view class="search-result-non" v-show="!isResultExit"> 暂无数据 </view>
      </view>
      <view class="search-history" v-else>
        <view class="search-history-header">
          <text class="header-text">历史搜索</text>
          <view class="iconfont icon-delete" @click="clearSearchHistory"></view>
        </view>
        <view class="search-history-label">
          <u-tag
            class="tag"
            v-for="(item, index) in historyResult"
            :key="index"
            :text="item.secname"
            @click="toSpecifyStock(item, 'tag')"
            bg-color="#f2f2f2"
            border-color="#f2f2f2"
            color="#797979"
          />
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { mapState } from "vuex";
interface stockIntrfc {
  secname: string;
  seccode: string;
  isAdded: boolean;
}
export default {
  data() {
    return {
      keyWord: "", // 股票名或股票代码
      timer: null, // 定时器
      searchResultData: "", // 搜索结果的数据
      isShowResult: false, // 是否显示搜索结果
      isResultExit: true, // 是否存在搜索结果
      historyResult: [], // 历史搜索结果
      isSearching: false, // 是否正在搜索
      optionalStockList: [], // 自选股数据
    };
  },
  computed: {
    ...mapState(["navBarHeight"]),
    addBtnText() {
      return (item) => {
        if (item.isAdded) {
          return "已添加";
        } else {
          return "添加";
        }
      };
    },
  },
  onReady() {
    this.initData();
  },
  methods: {
    // 初始化数据
    initData() {
      uni.getStorage({
        key: "historyResult",
        success: (res) => {
          this.historyResult = res.data;
        },
      });
      this.getOptionalStock();
    },
    // 搜索用方法
    searchStock(val: string) {
      // 接口入参
      let pattern = /^[a-zA-Z]+$/g
      let isPureLetter = pattern.test(val)
      val = isPureLetter? val.toUpperCase(): val
      let param = {
        search: val.toString(),
      };      
      if (val) {
        this.$api.get("/Report/GetStockInfoSearch", param).then((resp: any) => {
          if (resp.status) {
            this.searchResultData = resp.data;
            // 是否有搜索结果
            if (this.searchResultData.length != 0) {
              this.isShowResult = true;
              this.isResultExit = true;
            } else {
              this.isShowResult = false;
              this.isResultExit = false;
            }
            let userInfo = uni.getStorageSync("UserInfo");
            if (userInfo && userInfo.userClass != 99) {
              this.searchResultData.forEach((item, index, obj) => {
                let result = this.optionalStockList.find((it) => {
                  return it.secname === item.secname;
                });
                if (result) {
                  obj[index].isAdded = true;
                } else {
                  obj[index].isAdded = false;
                }
              });
            } 
          }
        });
      }
    },
    // 获取自选股列表
    getOptionalStock() {
      this.$api.post("/Report/GetUserStock", {}, {}, false).then((resp) => {
        if (resp.status) {
          resp.data.forEach((t) => {
            this.optionalStockList = resp.data;
          });
        }
      });
    },
    // 开始搜索
    startSearch(val) {
      // 防抖处理
      clearTimeout(this.timer);
      let context = this;
      let args = arguments;
      this.timer = setTimeout(() => {
        this.searchStock.apply(context, args);
      }, 1000);
    },
    // 显示或隐藏搜索结果
    handleResultShow() {
      this.isShowResult = false;
      // 如果隐藏搜索结果，则置空搜索关键词
      if (!this.isShowResult) {
        this.keyWord = "";
      }
    },
    // 进入指定股票的近期报告首页
    toSpecifyStock(stock, type) {
      uni.navigateTo({
        url: `/pages/home/home?code=${stock.seccode}&name=${stock.secname}`,
        success: () => {
          let result = "";
          // 查找目标股票是否已经搜索过
          if (this.historyResult) {
            result = this.historyResult.find((item) => {
              return item.secname == stock.secname;
            });
          }
          // 历史记录中不存在且进入类型为search的时候，存入本地缓存
          if (result == undefined && type === "search") {
            this.historyResult.push({
              secname: stock.secname,
              seccode: stock.seccode,
            });
            uni.setStorage({
              key: "historyResult",
              data: this.historyResult,
            });
          }
        },
      });
    },
    // 添加自选股
    addOptionalStock(stock) {
      // 判断是否登录
      let userInfo = uni.getStorageSync("UserInfo");
      if (userInfo && userInfo.userClass != 99) {
        let param = {
          Seccode: stock.seccode,
        };
        this.$api
          .post("/Report/AddUserStock", param)
          .then((resp) => {
            if (resp.status) {
              uni.showToast({
                title: "已成功添加自选",
              });
              stock.isAdded = true;
              this.getOptionalStock();
            } else {
              uni.showToast({
                title: "已添加过该股票",
                icon: "error",
              });
            }
          })
          .catch((err) => {
            console.log(err);
          });
      	} else {
			uni.navigateTo({
				url: '/pages/ucenter/login'
			})
		}
	//   else {
    //     // 若未登录则添加至缓存
    //     let stockTemp: stockIntrfc = {
    //       secname: stock.secname,
    //       seccode: stock.seccode,
    //       isAdded: false,
    //     };
    //     let stockList: stockIntrfc[] = [];
    //     let optStockStorage = uni.getStorageSync("optionalStock");
    //     if (optStockStorage) {
    //       stockList = optStockStorage;
    //       let result: stockIntrfc | number | undefined;
    //       result = optStockStorage.forEach((item: stockIntrfc) => {
    //         return item.seccode === stockTemp.seccode;
    //       });
    //       debugger;
    //       if (result != -1 || result != undefined) {
    //         uni.showToast({
    //           title: "已添加过该股票",
    //           icon: "error",
    //         });
    //       } else {
    //         stockList.push(result);
    //         uni.setStorageSync("optionalStock", stockList);
    //       }
    //     } else {
    //       stockList.push(stockTemp);
    //       uni.setStorageSync("optionalStock", stockList);
    //     }
    //   }
    },
    // 清除历史记录
    clearSearchHistory() {
      this.historyResult = [];
      uni.removeStorage({
        key: "historyResult",
      });
    },
    // 返回前一个页面
    back() {
      uni.navigateBack({
        delta: 1,
      });
    },
  },
};
</script>

<style lang="scss">
.stock-search-wrapper {
  // 搜索页面头部
  .stock-search-header {
    padding: 20rpx 40rpx;
    border-bottom: $border3;
  }

  .stock-search__body {
    .add-stock-btn {
      overflow: initial;
      padding: 0 0.84em !important;
      background: #fff;
      border-radius: 2px !important;
      border-color: $color-border-main !important;
      color: $color-main;
    }
  }

  // 搜索结果
  .search-result {
    .search-result-non {
      text-align: center;
    }
    .uni-list-item__container {
      border-bottom: $border-normal-div;
    }
    .search-result__item-name {
      position: relative;
      top: 3px;
    }
  }

  // 历史搜索
  .search-history {
    display: flex;
    flex-direction: column;
    padding: 60rpx 30rpx 0;

    // 历史搜索头部
    .search-history-header {
      display: flex;
      justify-content: space-between;
      font-size: $font-size-text-medium;
      margin-bottom: 20rpx;

      .iconfont {
        display: flex;
        align-items: center;
        color: $color-333;
        font-size: 32rpx;
      }
    }

    // 历史搜索标签
    .search-history-label {
      font-size: 28rpx;

      .tag {
        margin-right: 20rpx;
      }

      .u-tag {
        margin-top: 20rpx;
      }
    }

    // 标签的默认样式
    .u-size-default {
      font-size: 28rpx;
    }
  }
}
</style>
