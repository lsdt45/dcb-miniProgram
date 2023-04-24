// declare const util: Util
// interface Util {
//   formatRptType(name: string, type: string): string
// }

export type Util = {
  formatRptType(name: string, type?: string): string,
  FormatDate(now: Date, mask: string): string,
  formatLocation(longitude: number | string, latitude: number | string): { longitude: string[], latitude: string[] },
  formatCreateTime(dateTime1: string, dateTime2: string): { type: string, value: number },
  debounce(fn: Function, delay: number): Function,
  formatRptType(name: string, type = ""): string,
  randomWord(randomFlag: boolean, min: number, max: number): string,
  dataFormat(num: any, quantile = 0): string,
  getNodeIdById(id: string): string,
  deepCopy(obj: any, map?: any): any,
}

