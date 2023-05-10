import type { LocalData } from "./CommonTypes";

export namespace TableCharts {
  type Range = {
    value: number;
    text: string;
  };

  type BaseData = {
    formulaData: any[];
    codeData: any[];
    timeData: {
      name: string,
      type: number
    }[];
    tableData: any[];
  };
  // 图表最终显示的数据类型
  type ChartsData = {
    categories: string[],
    series: any[],
    type: number,
    typeName: string,
  }
  // 图表处理后的数据类型
  type AllChartsData = {
    stockName: string,
    stockCode: string,
    chartsData: ChartsData[],
  }
  type Tag = {
    type: string;
    isExsit: boolean;
    isSelected: boolean;
  };

  type Option = {
    tooltip: {
      show: boolean;
      trigger: string;
      renderMode: string;
      confine: boolean;
      enterable: boolean;
      textStyle: {
        width: number;
      };
      extraCssText: string;
    };
    legend: {
      type: string;
    };
    grid: {
      left: string;
      right: string;
      bottom: string;
      containLabel: boolean;
    };
    xAxis: {
      type: string;
      data: string[];
    };
    yAxis: {
      type: string;
    };
    series: any[];
    dataZoom: {
      type: string;
    };
    color: string[];
  };

  type Opts = {
    padding?: number[];
    legend?: {
      float?: string;
      lineHeight?: number;
      itemGap?: number;
      margin?: number;
      position?: string;
      isShowAllLegend?: boolean;
      isReload?: boolean;
    };
    color?: string[];
    dataLabel?: boolean;
    enableScroll?: boolean;
    touchMoveLimit?: number;
    rotate?: boolean;
    xAxis?: {
      disableGrid?: boolean;
      itemCount?: number;
      fontSize?: number;
      rotateLabel?: boolean;
      scrollShow?: boolean;
    };
    yAxis?: {
      data?: any[];
      [key: string]: any;
    };
    [key: string]: any;
  };


  export type Data = {
    allChartsTableData: AllChartsData[];
    allChartsTableData_origin: {
      [key: string]: any
    };
    baseData: BaseData;
    chartContainnerHeight: number;
    chartsData: any;
    chartsDataOri: any;
    chartsData_beforeConver: any;
    chartsData_rotate: any;
    chartsData_categories: any;
    chartsInfo: any;
    chartsShowType: string;
    chartsTitle: string;
    chartsTypeList: any[];
    curSelectChartType: string;
    canvasId: string,
    canvasId_rotate: string,
    compareCompanyList: any[];
    curSelectCompany: string;
    curSelect: number;
    curReportTypeObj: LocalData
    fstTableTh: string;
    financialReportType: any[];
    DataProcessText: string;
    dataProcessList: any[];
    deleteDataProcess: {
      value: null | number,
      text: string
    },
    isCurCmpListUpdate: boolean;
    isReload: boolean;
    isShowRotate: boolean;
    isShowValue: boolean;
    isWatchOpts: boolean;
    isShowPanel: boolean;
    notIdIndex: number[];
    notQuarterly: any[];
    option: Option;
    opts: Opts;
    opts_rotate: Opts;
    pixelRatio: number | undefined;
    parent: any;
    range: Range[];
    reloadChart: boolean;
    showValueText: string;
    tagAnnualized: Tag;
    tagQuarterly: Tag;
    tapLegendResult: any;
    testOption: any;
    timePeriod: any[];
    timeList: any[];
    tableTypeList: any[];
    unit: string;
    value: number;
  };
}


