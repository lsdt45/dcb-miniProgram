var dateUtils = {
	UNITS: {
		'年': 31557600000,
		'月': 2629800000,
		'天': 86400000,
		'小时': 3600000,
		'分钟': 60000,
		'秒': 1000
	},
	humanize: function(milliseconds) {
		var humanize = '';
		for (var key in this.UNITS) {
			if (milliseconds >= this.UNITS[key]) {
				humanize = Math.floor(milliseconds / this.UNITS[key]) + key + '前';
				break;
			}
		}
		return humanize || '刚刚';
	},
	format: function(dateStr) {
		var date = this.parse(dateStr)
		var diff = Date.now() - date.getTime();
		if (diff < this.UNITS['天']) {
			return this.humanize(diff);
		}
		var _format = function(number) {
			return (number < 10 ? ('0' + number) : number);
		};
		return date.getFullYear() + '/' + _format(date.getMonth() + 1) + '/' + _format(date.getDate()) +
			'-' +
			_format(date.getHours()) + ':' + _format(date.getMinutes());
	},
	parse: function(str) { //将"yyyy-mm-dd HH:MM:ss"格式的字符串，转化为一个Date对象
		var a = str.split(/[^0-9]/);
		return new Date(a[0], a[1] - 1, a[2], a[3], a[4], a[5]);
	}
};
// 深拷贝的实现
function deepCopy(obj, map) {
	//判断是否是第一次调用deepCopy方法，是的话创建一个weakmap实例来装遍历过程中出现过的对象
	if (!map) {
		map = new WeakMap()
	}
	//判断传入的obj是否为对象
	if (obj === null || (typeof obj).toLowerCase() != 'object') {
		return obj
	}
	//如果map中已经存在这个对象说明出现了循环引用问题
	if (map.get(obj)) {
		return obj
	}
	//map中没有就往map中存入该对象
	map.set(obj, obj)
	//根据obj的类型来给newObj创建初始值
	let newObj = Array.isArray(obj) ? [] : {}
	//遍历obj
	for (let i in obj) {
		if (obj.hasOwnProperty(i)) { //判断当前属性是否为obj自身的属性
			if ((typeof obj[i]).toLowerCase() === 'object') { //判断当前属性是否为对象类型
				newObj[i] = deepCopy(obj[i], map) //如果是对象类型就使用该方法进行递归处理
			} else {
				newObj[i] = obj[i] //不是对象类型就直接拷贝
			}
		}
	}
	return newObj //返回拷贝完成的newObj
};

export default {
	/**
	 * @description 转时间格式
	 * @param {Object} FormatDate(date, "yyyy-MM-dd");
	 */
	FormatDate(now, mask) {
		var d = now;
		var zeroize = function(value, length) {
			if (!length) length = 2;
			value = String(value);
			for (var i = 0, zeros = ''; i < (length - value.length); i++) {
				zeros += '0';
			}
			return zeros + value;
		}

		return mask.replace(/"[^"]*"|'[^']*'|\b(?:d{1,4}|m{1,4}|yy(?:yy)?|([hHMstT])\1?|[lLZ])\b/g, function($0) {
			switch ($0) {
				case 'd':
					return d.getDate();
				case 'dd':
					return zeroize(d.getDate());
				case 'ddd':
					return ['Sun', 'Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat'][d.getDay()];
				case 'dddd':
					return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d
						.getDay()
					];
				case 'M':
					return d.getMonth() + 1;
				case 'MM':
					return zeroize(d.getMonth() + 1);
				case 'MMM':
					return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
						[
							d.getMonth()
						];
				case 'MMMM':
					return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
						'September', 'October', 'November', 'December'
					][d.getMonth()];
				case 'yy':
					return String(d.getFullYear()).substr(2);
				case 'yyyy':
					return d.getFullYear();
				case 'h':
					return d.getHours() % 12 || 12;
				case 'hh':
					return zeroize(d.getHours() % 12 || 12);
				case 'H':
					return d.getHours();
				case 'HH':
					return zeroize(d.getHours());
				case 'm':
					return d.getMinutes();
				case 'mm':
					return zeroize(d.getMinutes());
				case 's':
					return d.getSeconds();
				case 'ss':
					return zeroize(d.getSeconds());
				case 'l':
					return zeroize(d.getMilliseconds(), 3);
				case 'L':
					var m = d.getMilliseconds();
					if (m > 99) m = Math.round(m / 10);
					return zeroize(m);
				case 'tt':
					return d.getHours() < 12 ? 'am' : 'pm';
				case 'TT':
					return d.getHours() < 12 ? 'AM' : 'PM';
				case 'Z':
					return d.toUTCString().match(/[A-Z]+$/);
					// Return quoted strings with the surrounding quotes removed
				default:
					return $0.substr(1, $0.length - 2);
			}
		});
	},

	formatLocation(longitude, latitude) {
		if (typeof longitude === 'string' && typeof latitude === 'string') {
			longitude = parseFloat(longitude)
			latitude = parseFloat(latitude)
		}

		longitude = longitude.toFixed(2)
		latitude = latitude.toFixed(2)

		return {
			longitude: longitude.toString().split('.'),
			latitude: latitude.toString().split('.')
		}
	},


	/**
	 * 格式化文章生成时间
	 * @param {string} dateTime1 - 时间1.
	 * @param {string} dateTime2 - 时间2.
	 */
	formatCreateTime(dateTime1, dateTime2) {
		// 转换成秒数
		let parseDate1 = Date.parse(dateTime1);
		let parseDate2 = Date.parse(dateTime2);
		// 计算绝对差值
		let diffNum = Math.abs(parseDate1 - parseDate2);
		// 向下取整，如果为0，则小于1小时
		if (Math.floor(diffNum / (1000 * 3600)) === 0) {
			return {
				type: 'm',
				value: Math.ceil(diffNum / (1000 * 60))
			};
		} else {
			return {
				type: 'h',
				value: Math.ceil(diffNum / (1000 * 3600))
			};
		}
	},

	// *
	//  * 防抖函数
	//  * @param {function} fn - 原方法.
	//  * @param {number} delay - 延时.
	//  * 不应传入匿名函数
	
	debounce(fn, delay) {
		let timer = false;
		return function() {
		  timer && clearTimeout(timer);
		  timer = setTimeout(() => {
			fn.apply(this, arguments); // 把参数传进去
		  }, delay);
		};
	},
	// debounce(fn, delay) {
	// 	let timer = null // 声明定时器
	// 	return function() {
	// 		let context = this
	// 		let args = arguments
	// 		clearTimeout(timer)
	// 		timer = setTimeout(() => {
	// 			fn.apply(context, args)
	// 		}, delay)
	// 	}
	// },



	// 格式化报告类型名称
	formatRptType(name, type = "") {
		let fmtName = ''
		let typeReturn = ''
		if (name === '第一季度报告') {
			fmtName = '一季报'
			typeReturn = '03'
		} else if (name === '半年度报告') {
			fmtName = '半年报'
			typeReturn = '06'
		} else if (name === '第三季度报告') {
			fmtName = '三季报'
			typeReturn = '09'
		} else if (name === '年度报告') {
			fmtName = '年报'
			typeReturn = '12'
		}
		if (type === "type") {
			return typeReturn
		} else {
			return fmtName
		}

	},

	/*
	 ** randomWord 产生任意长度随机字母数字组合
	 ** randomFlag-是否任意长度 min-任意长度最小位[固定位数] max-任意长度最大位
	 ** xuanfeng 2014-08-28
	 */

	randomWord(randomFlag, min, max) {
		let str = "",
			range = min,
			arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
				'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D',
				'E',
				'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
			];
		let pos = 0
		// 随机产生
		if (randomFlag) {
			range = Math.round(Math.random() * (max - min)) + min;
		}
		for (let i = 0; i < range; i++) {
			pos = Math.round(Math.random() * (arr.length - 1));
			str += arr[pos];
		}
		return str;
	},
	/**
	 * description: 格式化指标数据
	 * @param {any} num - 源数据.
	 * @param {number} quantile - 要保留的位数.
	 * @return any
	 */
	dataFormat(num, quantile = 0) {
		return (typeof(num) == 'number' && num != 0) ? num.toFixed(quantile).replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, '$1,') : num;
	},
	/**
	 * author: ljw
	 * description: 处理NodeId，获取有效部分
	 * @param {string} id - NodeId.
	 * @return nodeId
	 * @createTime: 2022-07-01 15:15:15
	 */
	getNodeIdById(id) {
		let nodeId = null
		// 根据类型提取NodeId，如果有"_"，则只选择前面的部分
		let index = id.indexOf('_')
		if (index === -1) {
			nodeId = id
		} else {
			nodeId = id.slice(0, index)
		}
		return nodeId
	},
	deepCopy
}
