<template>
  <view class="stock-trend-wrapper">
    <!-- <uni-nav-bar title="读财报" :height="navBarHeight" backgroundColor="#2C72EC" color="#FFF" :fixed="true">
		</uni-nav-bar> -->
    <dcb-nav-bar :title="stockFullName" search></dcb-nav-bar>
    <view class="indexQuotes">
      <view :class="indexUpBkColor(item)" v-for="(item, index) in indexData" :key="index">
        <view>{{ item.f14 }}</view>
        <view :class="item.f4 >= 0 ? (item.f4 > 0 ? 'indexUp indexQuotesItemNum' : 'indexQuotesItemNum') : 'indexDown indexQuotesItemNum'">
          <view v-if="item.f4 > 0" class="iconup"></view>
          <view v-else-if="item.f4 < 0" class="icondown"></view>
          <view>{{ formatDataFixed(item.f2, 2) }}</view>
        </view>
        <view
          :class="
            item.f4 >= 0
              ? item.f4 > 0
                ? 'indexUp indexQuotesItemQuoteChange'
                : 'indexQuotesItemQuoteChange'
              : 'indexDown indexQuotesItemQuoteChange'
          "
        >
          <view>{{ formatDataFixed(item.f4, 2) }}</view>
          <view>{{ item.f4 > 0 ? "+" + formatDataFixed(item.f3, 2) : formatDataFixed(item.f3, 2) }}%</view>
        </view>
      </view>
    </view>
    <view class="stock-info">
      <view class="stock-info__header" :class="StockInfo.f4 >= 0 ? (StockInfo.f4 > 0 ? 'indexUp' : '') : 'indexDown'">
        <view class="stock-info__header-left">
          <view class="stock-info__current-value" style="font-size: 60rpx">
            {{ StockInfo.f2 }}
          </view>
          <view class="stock-info__time" style="color: #000">
            {{ $util.FormatDate(new Date(), "MM-dd HH:mm:ss") }}
          </view>
        </view>
        <view class="stock-info__header-right">
          <view class="stock-info__current-change-value">
            {{ StockInfo.f4 >= 0 ? "+" + formatDataFixed(StockInfo.f4, 2) : formatDataFixed(StockInfo.f4, 2) }}
          </view>
          <view class="stock-info__current-change-per">
            {{ StockInfo.f4 >= 0 ? "+" + formatDataFixed(StockInfo.f3, 2) : formatDataFixed(StockInfo.f3, 2) }}%   
          </view>
        </view>
      </view>
      <view class="trading-data-container">
        <view class="trading-data">
          <view class="trading-data-item">
            <text class="trading-data__title"> 今开 </text>
            <text class="trading-data__value">
              {{ formatDataFixed(StockInfo.f17, 2) }}
            </text>
          </view>
          <view class="trading-data-item">
            <text class="trading-data__title"> 最高 </text>
            <text class="trading-data__value">
              {{ formatDataFixed(StockInfo.f15, 2) }}
            </text>
          </view>
          <view class="trading-data-item" v-if="StockInfo.f5 > 10000000">
            <text class="trading-data__title"> 成交量 </text>
            <text class="trading-data__value"> {{ formatDataFixed(StockInfo.f5 / 100000000, 2) }}亿手 </text>
          </view>
          <view class="trading-data-item" v-else>
            <text class="trading-data__title"> 成交量 </text>
            <text class="trading-data__value"> {{ formatDataFixed(StockInfo.f5 / 10000, 2) }}万手 </text>
          </view>
        </view>
        <view class="trading-data">
          <view class="trading-data-item">
            <text class="trading-data__title"> 昨收 </text>
            <text class="trading-data__value">
              {{ formatDataFixed(StockInfo.f18, 2) }}
            </text>
          </view>
          <view class="trading-data-item">
            <text class="trading-data__title"> 最低 </text>
            <text class="trading-data__value">
              {{ formatDataFixed(StockInfo.f16, 2) }}
            </text>
          </view>
          <view class="trading-data-item" v-if="StockInfo.f6 > 10000000">
            <text class="trading-data__title"> 成交额 </text>
            <text class="trading-data__value"> {{ formatDataFixed(StockInfo.f6 / 100000000, 2) }}亿元 </text>
          </view>
          <view class="trading-data-item" v-else>
            <text class="trading-data__title"> 成交额 </text>
            <text class="trading-data__value"> {{ formatDataFixed(StockInfo.f6 / 10000, 2) }}万元 </text>
          </view>
        </view>
        <view class="trading-data">
          <view class="trading-data-item">
            <text class="trading-data__title"> 市盈率 </text>
            <text class="trading-data__value">
              {{ formatDataFixed(StockInfo.f9, 2) }}
            </text>
          </view>
          <view class="trading-data-item">
            <text class="trading-data__title"> 市净率 </text>
            <text class="trading-data__value">
              {{ formatDataFixed(StockInfo.f23, 2) }}
            </text>
          </view>
          <view class="trading-data-item" v-if="StockInfo.f20 > 10000000">
            <text class="trading-data__title"> 总市值 </text>
            <text class="trading-data__value"> {{ formatDataFixed(StockInfo.f20 / 100000000, 2) }}亿元 </text>
          </view>
          <view class="trading-data-item" v-else>
            <text class="trading-data__title"> 总市值 </text>
            <text class="trading-data__value"> {{ formatDataFixed(StockInfo.f20 / 10000, 2) }}万元 </text>
          </view>
        </view>        
      </view>
    </view>
    <view class="button-sp-area">
      <span
        :class="CheckType == 'M1' ? 'check_btn  operate_btn' : ' operate_btn'"
        @click.stop="ChangeMinutePeriod(MINUTE_PERIOD_ID.MINUTE_ID)"
        >分时</span
      >
      <span
        :class="CheckType == 'M5' ? 'check_btn  operate_btn' : ' operate_btn'"
        @click.stop="ChangeMinutePeriod(MINUTE_PERIOD_ID.MINUTE_5DAY_ID)"
        >5日</span
      >
      <span
        :class="CheckType == 'K0' ? 'check_btn  operate_btn' : ' operate_btn'"
        @click.stop="ChangeKLinePeriod(KLINE_PERIOD_ID.KLINE_DAY_ID)"
        >日线</span
      >
      <span
        :class="CheckType == 'K1' ? 'check_btn  operate_btn' : ' operate_btn'"
        @click.stop="ChangeKLinePeriod(KLINE_PERIOD_ID.KLINE_WEEK_ID)"
        >周线</span
      >
      <span
        :class="CheckType == 'K2' ? 'check_btn  operate_btn' : ' operate_btn'"
        @click.stop="ChangeKLinePeriod(KLINE_PERIOD_ID.KLINE_MONTH_ID)"
        >月线</span
      >
    </view>
    <view class="kline-chart">
      <canvas
        id="kline2"
        canvas-id="kline2"
        class="kline2"
        v-bind:style="{ width: ChartWidth + 'px', height: ChartHeight + 'px' }"
        @touchstart="KLineTouchStart"
        @touchmove="KLineTouchMove"
        @touchend="KLineTouchEnd"
      ></canvas>
    </view>
  </view>
</template>

<script>
import { mapState } from "vuex";

// // #ifdef H5
// import HQChart from 'static/umychart.uniapp.h5/umychart.uniapp.h5.js'
// // #endif

// // #ifndef H5
// import {
// 	JSCommon
// } from 'pages/stock-trend/static/umychart.uniapp/umychart.umychart.wechat.3.0.js'
// import {
// 	JSCommonHQStyle
// } from 'pages/stock-trend/static/umychart.uniapp/umychart.style.wechat.js'
// // #endif

// // #ifdef H5
// import HQChart from '../../umychart_uniapp_h5/umychart.uniapp.h5.js'
// // #endif

import { HQData as EastMoney } from "@/pages/stock-trend/HQData.js";

// #ifdef H5
import HQChart from "@/pages/stock-trend/static/umychart.uniapp.h5/umychart.uniapp.h5.js";
// #endif

// #ifndef H5
import { JSCommon } from "@/pages/stock-trend/static/umychart.uniapp/umychart.wechat.3.0.js";
import { JSCommonHQStyle } from "@/pages/stock-trend/static/umychart.uniapp/umychart.style.wechat.js";
// #endif

function DefaultData() {}

DefaultData.GetKLineOption = function () {
  let data = {
    Type: "历史K线图",

    //窗口指标
    Windows: [
      {
        Index: "MA",
        Modify: false,
        Change: false,
        IsShowIndexName: false,
        IndexParamSpace: 10,
      },
      {
        Index: "VOL",
        Modify: false,
        Change: false,
        IsShowIndexName: false,
        IndexParamSpace: 10,
      },
      /*
            { 
				Index:'多线段指标',Modify: false, Change: false,
				API: 
				{
					Name:'多线段指标',
					Script:null,
					Args:null, 
					Url:'http://127.0.0.1:18080/api/jsindex' 
				} 
			}
			*/
    ],

    IsCorssOnlyDrawKLine: true,
    CorssCursorTouchEnd: true,

    IsClickShowCorssCursor: true,
    CorssCursorInfo: {
      Left: 2,
      Right: 2,
      Bottom: 1,
      IsShowCorss: true,
    }, //十字光标刻度设置
    //IsFullDraw:true,

    //边框
    Border: {
      Left: 2,
      Right: 2, //右边间距
      Top: 4,
      Bottom: 4,
      AutoLeft: {
        Blank: 10,
        MinWidth: 30,
      },
      AutoRight: {
        Blank: 10,
        MinWidth: 30,
      },
    },
    KLine: {
      DragMode: 1,
      Right: 1, //复权 0 不复权 1 前复权 2 后复权
      Period: 0, //周期: 0 日线 1 周线 2 月线 3 年线
      PageSize: 30,
      IsShowTooltip: false,
      RightSpaceCount: 0,
      // DrawType: 0,
      // DataWidth: 10
    },
    KLineTitle: {
      IsShowName: false,
      IsShowSettingInfo: false,
    },

    ExtendChart: [
      {
        Name: "KLineTooltip",
      }, //开启手机端tooltip
    ],

    //子框架设置
    Frame: [
      {
        SplitCount: 4,
        IsShowLeftText: false,
        IsShowRightText: false,
      },
      {
        SplitCount: 2,
        IsShowLeftText: false,
        IsShowRightText: false,
      },
    ],
  };

  return data;
};

DefaultData.GetMinuteOption = function () {
  var option = {
    Type: "分钟走势图", //创建图形类型

    //窗口指标
    Windows: [],
    IsAutoUpdate: true, //是自动更新数据
    DayCount: 1, //1 最新交易日数据 >1 多日走势图
    IsShowRightMenu: false, //是否显示右键菜单
    CorssCursorTouchEnd: true,
    //IsFullDraw:true,

    MinuteLine: {
      //IsDrawAreaPrice:false,      //是否画价格面积图
    },

    //边框
    Border: {
      Left: 2,
      Right: 2, //右边间距
      Top: 4,
      Bottom: 4,
      AutoLeft: {
        Blank: 10,
        MinWidth: 30,
      },
      AutoRight: {
        Blank: 10,
        MinWidth: 30,
      },
    },

    //子框架设置
    Frame: [
      {
        SplitCount: 3,
        IsShowIndexTitle: false,
      },
      {
        SplitCount: 0,
        IsShowLeftText: false,
        IsShowRightText: false,
      },
    ],

    //扩展图形
    ExtendChart: [
      {
        Name: "MinuteTooltip",
      }, //手机端tooltip
    ],
  };

  return option;
};

//周期枚举
var KLINE_PERIOD_ID = {
  KLINE_DAY_ID: 0,
  KLINE_WEEK_ID: 1,
  KLINE_MONTH_ID: 2,
  KLINE_YEAR_ID: 3,

  KLINE_MINUTE_ID: 4,
  KLINE_5MINUTE_ID: 5,
  KLINE_15MINUTE_ID: 6,
  KLINE_30MINUTE_ID: 7,
  KLINE_60MINUTE_ID: 8,
};

//周期枚举
var MINUTE_PERIOD_ID = {
  MINUTE_ID: 1,
  MINUTE_2DAY_ID: 2,
  MINUTE_3DAY_ID: 3,
  MINUTE_4DAY_ID: 4,
  MINUTE_5DAY_ID: 5,
};

var g_JSChart = null;

export default {
  data() {
    let data = {
      StockInfo: "",
      indexData: [],
      timeObj: "",

      Symbol: "",
      EmSymbol: "",

      CheckType: "K0",

      ChartWidth: 350,
      ChartHeight: 500,
      KLine: {
        Period: 0,
        Right: 0,
      },
      Minute: {
        Days: 1,
      },

      MINUTE_PERIOD_ID: MINUTE_PERIOD_ID,
      KLINE_PERIOD_ID: KLINE_PERIOD_ID,
      TestData: "测试测试",
    };

    return data;
  },
  computed: {
    ...mapState(["navBarHeight", "curStock"]),
    indexUpBkColor() {
      return (item) => {
        if (item.f4 > 0) {
          return "indexQuotesItem index-up-bk-color";
        } else if (item.f4 == 0) {
          return "indexQuotesItem index-nochange-bk-color";
        } else {
          return "indexQuotesItem index-down-bk-color";
        }
      };
    },
		// 股票全名
		stockFullName() {
			return this.curStock.secName + ' ' + this.curStock.secCode
		},		
  },

  onShow: function (option) {
    this.Symbol = this.curStock.secCode + "." + this.curStock.market.toLowerCase();

    this.EmSymbol = this.curStock.market.toLowerCase() == "sh" ? "1." + this.curStock.secCode : "0." + this.curStock.secCode;

    this.CheckType = "K0";

    uni.getSystemInfo({
      success: (res) => {
        var width = res.windowWidth;
        var height = res.windowHeight;
        this.ChartWidth = width;
        let num = this.navBarHeight.replace(/px/g, "");
        console.log(`num=${num}`);
        this.ChartHeight = height - num / 2 - 350;
        this.$nextTick(() => {
          this.ChangeSize();
          this.CreateKLineChart();
        });
      },
    });

    if (!this.timeObj) {
      this.getIndexData();
      this.getStockData();
      this.timeObj = setInterval(() => {
        this.getIndexData();
        this.getStockData();
      }, 10000);
    }
  },

  onReady() {},

  onLoad() {},

  onHide() {
    console.log("onHide");
    clearInterval(this.timeObj);
    this.timeObj = "";
    this.ClearChart();
  },

  onUnload() {
    console.log("onUnload");
    clearInterval(this.timeObj);
    this.timeObj = "";
    this.ClearChart();
  },

  methods: {
    // 返回前一个页面
    back() {
      this.StockInfo = "";
      uni.navigateBack({
        delta: 1,
      });
    },
    ClearChart() {
      if (g_JSChart) {
        g_JSChart.StopAutoUpdate();
        g_JSChart = null;
      }
    },

    ClearDivDOM() {
      var kline = this.$refs.kline;
      while (kline.hasChildNodes()) {
        kline.removeChild(kline.lastChild);
      }
    },

    OnSize() {},

    CreateKLineChart_app() {
      this.ClearChart();

      var element = new JSCommon.JSCanvasElement();
      element.IsUniApp = true; //canvas需要指定下 是uniapp的app
      element.ID = "kline2";
      element.Height = this.ChartHeight; //高度宽度需要手动绑定!!
      element.Width = this.ChartWidth;

      var blackStyle = JSCommonHQStyle.GetStyleConfig(JSCommonHQStyle.STYLE_TYPE_ID.BLACK_ID);
      //blackStyle.DefaultTextColor='rgb(255,0,255)';

      JSCommon.JSChart.SetStyle(blackStyle);

      var chart = JSCommon.JSChart.Init(element);
      var option = DefaultData.GetKLineOption();
      option.NetworkFilter = this.NetworkFilter;
      option.Symbol = this.Symbol;
      option.Right = this.KLine.Right;
      option.Period = this.KLine.Period;
      option.IsClickShowCorssCursor = true;
      option.IsFullDraw = true; //每次手势移动全屏重绘
      chart.SetOption(option);
      //chart.AddEventCallback( { event:JSCommon.JSCHART_EVENT_ID.RECV_INDEX_DATA, callback:this.OnRecvHistoryData });
      chart.AddEventCallback({
        event: JSCommon.JSCHART_EVENT_ID.ON_TITLE_DRAW,
        callback: this.OnTitleDraw,
      });

      g_JSChart = chart;
    },

    CreateKLineChart() {
      this.CreateKLineChart_app();
    },

    IsKLineChart(jsChart) {
      var className = jsChart.JSChartContainer.ClassName;
      if (className == "KLineChartContainer" || className == "KLineChartHScreenContainer") return true;

      return false;
    },

    //K线周期切换
    ChangeKLinePeriod: function (period) {
      this.CheckType = "K" + period;
      this.KLine.Period = period;
      if (!g_JSChart) {
        this.CreateKLineChart();
      } else {
        if (this.IsKLineChart(g_JSChart)) {
          g_JSChart.ChangePeriod(period);
        } //类型不对 删了重建
        else {
          this.CreateKLineChart();
        }
      }
    },

    CreateMinuteChart_h5() {
      //创建日线图
      this.ClearChart();
      this.ClearDivDOM();

      var blackStyle = HQChart.HQChartStyle.GetStyleConfig(HQChart.STYLE_TYPE_ID.BLACK_ID);
      HQChart.JSChart.SetStyle(blackStyle);
      this.$refs.kline.style.backgroundColor = blackStyle.BGColor; //div背景色设置黑色

      var chart = HQChart.JSChart.Init(this.$refs.kline);
      var option = DefaultData.GetMinuteOption();
      option.Symbol = this.Symbol;
      option.NetworkFilter = this.NetworkFilter;
      option.DayCount = this.Minute.Days;
      chart.SetOption(option);
      chart.AddEventCallback({
        event: HQChart.JSCHART_EVENT_ID.ON_TITLE_DRAW,
        callback: this.OnTitleDraw,
      });

      g_JSChart = chart;
    },

    CreateMinuteChart_app() {
      this.ClearChart();

      var element = new JSCommon.JSCanvasElement();
      // #ifdef APP-PLUS
      element.IsUniApp = true; //canvas需要指定下 是uniapp的app
      // #endif
      element.ID = "kline2";
      element.Height = this.ChartHeight; //高度宽度需要手动绑定!!
      element.Width = this.ChartWidth;

      //用黑色风格
      var blackStyle = JSCommonHQStyle.GetStyleConfig(JSCommonHQStyle.STYLE_TYPE_ID.BLACK_ID);
      JSCommon.JSChart.SetStyle(blackStyle);
      //var testttt=JSCommon.MARKET_SUFFIX_NAME.GetSHODecimal();
      //JSCommon.MARKET_SUFFIX_NAME.GetSHODecimal=(symbol)=>{ return 4; };	//设置期权代码

      var chart = JSCommon.JSChart.Init(element);
      var option = DefaultData.GetMinuteOption();
      option.NetworkFilter = this.NetworkFilter;
      option.Symbol = this.Symbol;
      option.DayCount = this.Minute.Days;
      option.IsFullDraw = true; //每次手势移动全屏重绘
      chart.SetOption(option);
      chart.AddEventCallback({
        event: JSCommon.JSCHART_EVENT_ID.ON_TITLE_DRAW,
        callback: this.OnMinuteTitleDraw,
      });

      g_JSChart = chart;
    },

    CreateMinuteChart() {
      // #ifdef H5
      this.CreateMinuteChart_h5();
      // #endif

      // #ifndef H5
      this.CreateMinuteChart_app();
      // #endif
    },

    //走势图多日切换
    ChangeMinutePeriod: function (period) {
      this.CheckType = "M" + period;
      this.Minute.Days = period;
      if (!g_JSChart) {
        //不存在创建
        this.CreateMinuteChart();
      } else {
        if (this.IsKLineChart(g_JSChart)) {
          //类型不对 删了重建
          this.CreateMinuteChart();
        } else {
          g_JSChart.ChangeDayCount(period);
        }
      }
    },

    //切换指标 windowId=窗口索引 name=指标名字
    ChangeKLineIndex: function (windowId, name) {
      if (!g_JSChart) return;
      if (this.IsKLineChart(g_JSChart)) g_JSChart.ChangeIndex(windowId, name);
    },

    //切换股票
    ChangeSymbol: function (symbol) {
      this.Symbol = symbol;
      if (g_JSChart) g_JSChart.ChangeSymbol(symbol);
    },

    NetworkFilter: function (data, callback) {
      data.PreventDefault = true; //设置hqchart不请求数据
      switch (data.Name) {
        //最新分时数据
        case "MinuteChartContainer::RequestMinuteData":
          EastMoney.RequestMinuteData(data, callback, this);
          //this.RequestMinuteData(data,callback)
          break;
        //5日分时数据
        case "MinuteChartContainer::RequestHistoryMinuteData":
          EastMoney.RequestMinuteDaysData(data, callback, this);
          //this.RequestMinuteDaysData(data,callback)
          break;
        //日K数据、周线
        case "KLineChartContainer::RequestHistoryData":
          EastMoney.RequestHistoryData(data, callback, this);
          break;
        //1分钟K线数据
        // case "KLineChartContainer::ReqeustHistoryMinuteData":
        // 	EastMoney.RequestHistoryMinuteData(data, callback,this);
        // 	break;
      }
    },

    OnRecvHistoryData(e, data, obj) {
      var period = data.HistoryData.Period;
      this.TestData = `${data.Stock.Name}, ${data.Stock.Symbol} 周期=${period}`;
    },

    OnTitleDraw(
      event,
      data,
      obj //K线信息
    ) {
      if (!data.Draw) {
        this.TestData = "隐藏";
      } else {
        var item = data.Draw;
        this.TestData = `日期:${item.Date} 收:${item.Close}`;
      }
    },

    OnMinuteTitleDraw(
      event,
      data,
      obj //分时图信息
    ) {
      if (!data.Draw) {
        this.TestData = "隐藏";
      } else {
        var item = data.Draw;
        this.TestData = `时间:${item.Time} 价格:${item.Close}`;
      }
    },

    ///////////////////////////////////////////////
    //手势事件 app/小程序才有
    //KLine事件
    KLineTouchStart: function (event) {
      if (g_JSChart) g_JSChart.OnTouchStart(event);
    },

    KLineTouchMove: function (event) {
      if (g_JSChart) g_JSChart.OnTouchMove(event);
    },

    KLineTouchEnd: function (event) {
      if (g_JSChart) g_JSChart.OnTouchEnd(event);
    },

    ChangeSize() {
      this.ChangeSize_app();
    },

    ChangeSize_app() {
      if (g_JSChart) {
        //把画布大小设置到hqchart
        g_JSChart.OnSize({
          Width: this.ChartWidth,
          Height: this.ChartHeight,
          Type: 1,
        }); //重新绘制
      }
    },

    //获取指数行情基础信息数据
    getIndexData() {
      this.getStockQuotesBaseDayInfo("1.000001,0.399001,0.399006", 0);
    },
    //获取股票行情基础信息数据

    getStockData() {
      this.getStockQuotesBaseDayInfo(this.EmSymbol, 1);
    },

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
            if (type == 1) this.StockInfo = res.data[0];
          }
        })
        .catch((err) => {
          if (type == 0) this.indexData = [];
          if (type == 1) this.StockInfo = "";
        });
    },

    formatDataFixed(num, index) {
      let res = (num * 1.0).toFixed(index);
      if (res) return res;
      else return "-";
    },
  },
};
</script>

<style lang="scss">
.stock-trend-wrapper {
  height: 100%;
  background: #f4f4f4;
  .kline-chart {
    background: #fff;
  }
}
.indexUp {
  color: red;
}

.indexDown {
  color: green;
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

.indexQuotes {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  padding: 15px 8px;
  background: #fff;
  margin-bottom: 7px;  
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

.stock-info {
  font-size: 26rpx;
  padding: 5px 15px;
  background: #fff;
  .stock-info__header {
    display: flex;
    .stock-info__header-right {
      position: relative;
      left: 33px;      
      display: flex;
      align-items: center;
      font-size: 14px;
      .stock-info__current-change-per {
        margin-left: 20px;
      }
    }
  }
  .trading-data-container {
    position: relative;
    top: 5px;
    .trading-data {
      display: flex;
      justify-content: space-between;
      .trading-data-item {
        display: flex;
        justify-content: space-between;
        flex-basis: 30%;
        margin-bottom: 5px;
        .trading-data__title {
          color: #888;
        }
      }
    }    
  }
}

.button-sp-area {
	display: flex;
	justify-content: space-around;
  padding: 10rpx;
  border-top: 1px solid $btn-border-color;
  border-bottom: 1px solid $btn-border-color;
  background: #fff;
}

.operate_btn {
  margin-right: 50rpx;
}

.check_btn {
  color: skyblue;
  border-bottom: 5rpx solid skyblue;
}

.index-up-bk-color, .index-down-bk-color, .index-nochange-bk-color {
  padding: 12px;
  border-radius: 10px;
}
.index-up-bk-color {
  background: linear-gradient(180deg, #ffeced, transparent);
}
.index-down-bk-color {
  background: linear-gradient(180deg, #e7f8ed, transparent);
}
.index-nochange-bk-color {
  background: linear-gradient(180deg, #9e9e9e, transparent);
}
</style>
