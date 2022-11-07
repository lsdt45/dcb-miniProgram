<template>
  <view class="stock-market-wrapper">
    <uni-nav-bar title="自选股" :height="navBarHeight" backgroundColor="#2C72EC" color="#FFF" :fixed="true"
      left-icon="left" @clickLeft="back">
    </uni-nav-bar>
    <view class="selfSelectStock">
      <uni-row :width="730">
        <view class="selfSelectStockHead">
          <uni-col :span="8">
            <view>股票</view>
          </uni-col>
          <uni-col :span="8">
            <view class="selfSelectStockNumHead">
              <text class="selfSelectStock-new">最新</text>
            </view>
          </uni-col>
          <uni-col :span="8">
            <view class="selfSelectStockNumHead">涨幅</view>
          </uni-col>
        </view>
      </uni-row>
      <view class="stock-market__body">
        <uni-swipe-action>
          <uni-swipe-action-item v-for="(item, index) in userStock" :key="index" :right-options="options"
            @click="deleteStock(item)">
            <uni-row :width="730">
              <view class="selfSelectStockBody" @click="selfSelectStockClick(item)">
                <uni-col :span="8">
                  <view>
                    <text class="selfSelectStockSecName">{{  item.f14  }}</text>
                    <br />
                    <text class="selfSelectStockSecCode">{{  item.f12  }}</text>
                  </view>
                </uni-col>
                <uni-col :span="8">
                  <view :class="newTextClass(item)">
                    {{  formatDataFixed(item.f2, 2) == null ? item.f18 : formatDataFixed(item.f2, 2)  }}
                  </view>
                </uni-col>
                <uni-col :span="8">
                  <view class="stock-market__fluctuation">
                    <text :class="fluctuationClass(item)">
                      {{  fluctuationText(item)  }}
                    </text>
                  </view>
                </uni-col>
              </view>
            </uni-row>
          </uni-swipe-action-item>
        </uni-swipe-action>
      </view>
    </view>
    <view class="addSelfSelectStock" @click="toSearch">
      <view class="iconfont .icon-newzoomin icon"></view>
      <text>添加自选</text>
    </view>
  </view>
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      keyWord: "", // 股票名或股票代码
      timeObj: "",
      indexData: [],
      userStock: [],
      userStockStr: "",
      // 滑动按钮数据
      options: [
        {
          text: "删除",
          style: {
            backgroundColor: "#dd524d",
          },
        },
      ],
    };
  },
  computed: {
    ...mapState(["navBarHeight"]),
    // 涨跌幅文字样式
    fluctuationClass() {
      return (item) => {
        if (item.f4 > 0) {
          return "index-fluctuation-up selfSelectStockNum";
        } else if (item.f4 == 0) {
          return "index-fluctuation-nochange selfSelectStockNum";
        } else if (item.f4 == "-") {
          return "index-fluctuation-nodata selfSelectStockNum";
        } else {
          return "index-fluctuation-down selfSelectStockNum";
        }
      };
    },
    // 涨跌幅文本
    fluctuationText() {
      return (item) => {
        let result = "";
        if (item.f4 == "-") {
          result = "--";
        } else {
          if (item.f4) {
            result = this.formatDataFixed(item.f3, 2) + "%";
          } else if (this.formatDataFixed(item.f3, 2) == null) {
            result = "0.00%";
          } else {
            result = "--";
          }
        }
        return result;
      };
    },
    // 【最新】文字样式
    newTextClass() {
      return (item) => {
        return item.f4 >= 0
          ? item.f4 > 0
            ? "index-new-up selfSelectStockNum"
            : "selfSelectStockNum"
          : item.f4 == "-"
            ? "selfSelectStockNum"
            : "index-new-down selfSelectStockNum";
      };
    },
  },
  methods: {
    getStockQuotesBaseDayInfo(Secids, type) {
      this.$api
        .post(
          "/Report/GetStockQuotesBaseDayInfo",
          {
            Secids: Secids,
          },
          {},
          false
        )
        .then((res) => {
          if (res.status) {
            if (type == 0) this.indexData = res.data;
            if (type == 1) this.userStock = res.data;
          }
        })
        .catch((err) => {
          if (type == 0) this.indexData = [];
          if (type == 1) this.userStock = [];
        });
    },
    getUserStockThirdParty() {
      this.userStockStr = "";
      this.$api
        .post("/Report/GetUserStock", {}, {}, false)
        .then((res) => {
          if (res.status) {
            res.data.forEach((t) => {
              this.userStockStr = this.userStockStr + (t.market == "SH" ? "1." + t.seccode : "0." + t.seccode) + ",";
            });
          }
        })
        .catch((err) => {
          this.userStockStr = [];
        });
    },
    getStockData() {
      setTimeout(() => {
        this.getStockQuotesBaseDayInfo(this.userStockStr, 1);
      }, 1000);
    },
    selfSelectStockClick(item) {
      let userInfo = uni.getStorageSync("UserInfo");
      if (userInfo && userInfo.userClass != 99) {
        uni.navigateTo({
          url: `/pages/home/home?code=${item.f12}&name=${item.f14}&isJump=true`,
        });
      }
    },
    formatDataFixed(num, index) {
      let res = (num * 1.0).toFixed(index);
      return res;
    },
    /**
     * author: ljw
     * description: 删除选择的股票
     * @param {string} item - 所选股票的信息.
     * @return
     * @createTime: 2022-07-01 17:50:23
     */
    deleteStock(item) {
      let param = {
        Seccode: item.f12,
      };
      this.$api.post("/Report/RemoveUserStock", param, {}, false).then((resp) => {
        if (resp.status) {
          uni.showToast({
            title: "成功删除!",
            icon: "success",
            success: () => {
              this.userStock = this.userStock.filter((data) => {
                return data.f12 != item.f12;
              });
              this.getUserStockThirdParty();
            },
          });
        } else {
          uni.showToast({
            title: "删除失败!",
            icon: "error",
          });
        }
      });
    },
    // 进入搜索页面
    toSearch() {
      uni.navigateTo({
        url: "/pages/stock/stock-search",
      });
    },
    // 显示或隐藏搜索结果
    handleResultShow() { },
    // 返回前一个页面
    back() {
      uni.navigateBack({
        delta: 1,
      }),
        clearInterval(this.timeObj);
      this.timeObj = "";
    },
  },
  onShow() {
    this.getUserStockThirdParty();
    if (!this.timeObj) {
      this.getStockData();
      this.timeObj = setInterval(() => {
        this.getStockData();
      }, 10000);
    }
  },
  onHide() {
    clearInterval(this.timeObj);
    this.timeObj = "";
  },
};
</script>

<style lang="scss">
.stock-market-wrapper {
  height: 100%;
  background: $page-bgcolor;

  .stock-market__body {
    background-color: #fff;

    .stock-market__fluctuation {
      text-align: center;
    }
  }

  .index-new-up {
    color: #f92f3d;
  }

  .index-new-down {
    color: #1cbf7c;
  }

  .index-fluctuation-up,
  .index-fluctuation-down,
  .index-fluctuation-nochange {
    color: #fff;
    padding: 3px 11px;
  }

  .index-fluctuation-up {
    background-color: #f92f3d;
  }

  .index-fluctuation-down {
    background-color: #1cbf7c;
  }

  .index-fluctuation-nochange {
    background-color: #9e9e9e;
  }

  .index-fluctuation-nodata {
    background-color: #fff;
  }

  .icondown {
    width: 0;
    height: 0;
    border-top: 5px solid green;
    border-right: 5px solid transparent;
    border-left: 5px solid transparent;
  }

  .iconup {
    width: 0;
    height: 0;
    border-bottom: 5px solid red;
    border-right: 5px solid transparent;
    border-left: 5px solid transparent;
  }

  // 搜索页面头部
  .stock-search-header {
    padding: 20rpx 40rpx;
    border-bottom: $border3;
  }

  .indexQuotes {
    margin: 10rpx 0rpx;
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;

    .indexQuotesItem {
      display: flex;
      flex-direction: column;
      align-items: center;

      .indexQuotesItemNum {
        display: flex;
        flex-direction: row;
        align-items: center;
        font-size: 40rpx;
        margin-top: 5rpx;
      }

      .indexQuotesItemQuoteChange {
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-around;
        font-size: 26rpx;
        margin-top: 5rpx;
      }
    }
  }

  .selfSelectStock {
    .selfSelectStockHead {
      height: 80rpx;
      padding: 20rpx;
      color: $color-999;
      background-color: #f8fbfe;
      border: 1px solid $color-border-main;
    }

    .selfSelectStockBody {
      height: 125rpx;
      padding: 20rpx;
      border-bottom: 1px solid $color-border-main;
    }

    .selfSelectStockNum {
      display: inline-block;
      position: relative;
      top: 5px;
      left: 13px;
      width: 80px;
      height: 30px;
      line-height: 30px;
      padding: 0;
      border-radius: 2px;
      font-size: $size34;
      text-align: center;
    }

    .selfSelectStockNumHead {
      text-align: center;
    }

    .selfSelectStockSecName {
      font-size: $size34;
      font-weight: bold;
    }

    .selfSelectStockSecCode {
      position: relative;
      top: 5px;
      font-size: 26rpx;
      color: $color-666;
    }

    .selfSelectStock-new {
      position: relative;
      left: -7px;
    }
  }

  .addSelfSelectStock {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    height: 120rpx;
    margin-top: 10px;
    color: $color-main;
    background-color: #fff;
  }
}
</style>
