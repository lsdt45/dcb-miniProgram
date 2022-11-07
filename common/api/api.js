import config from '@/common/data/index.js'
import store from '@/store/index.js'

function request(url, options) {
	return new Promise((resolve, reject) => {
		if(options.load) {
			uni.showLoading({
				title: '加载中',
			});
		}

		let header = options.header
		if (url.toLowerCase().indexOf("/wx/") != -1) {
			url = config.data.API_ROOT_AUTH + url
		} else {
			url = config.data.API_ROOT_ZJZT + url
		}
		header.authorization = "Bearer " + wx.getStorageSync("Authorization")
		uni.request({
			url: url,
			method: options.method,
			data: options.data,
			header: header,
			success: (res) => {
				if (res.statusCode === 401) {
					//抛出全局错误401
					//uni.$emit('errCode', 401);
					// 页面重载
					if(!isLogin){
						onLogin()
					}
				}
				if (res.statusCode === 200) {
					resolve(JSON.parse(JSON.stringify(res.data)))
				}
			},
			fail: (err) => {
				console.log("fail:" + err.statusCode)
				reject(err.data)
			},
			complete: () => {
				if(options.load) {
					uni.hideLoading();
				}
			}
		})
	})
}

var isLogin = false;

function get(url, options = {}, header = {}, load=true) {
	return request(url, {
		method: 'GET',
		data: options,
		header: header,
		load: load
	})
}

function post(url, options, header = {}, load=true) {
	return request(url, {
		method: 'POST',
		data: options,
		header: header,
		load: load
	})
}

function onLogin() {
	uni.login({
		success: (codeRes) => {
			if (codeRes.code) {
				get('/WX/onLogin', {
					code: codeRes.code
				}).then(res => {
					if (res.status) {
						uni.setStorageSync("Authorization",res.token)
						uni.setStorageSync("UserInfo",res.data)
						
						let userinfo = uni.getStorageSync("UserInfo")
						// if(!store.state.firstEnter) {
							store.commit('updateUserInfo', res.data)
						// }
						isLogin = true;
						store.commit('updateLoginStatus', isLogin)
						// 页面重载
						const pages = getCurrentPages()
						// 声明一个pages使用getCurrentPages方法
						const curPage = pages[pages.length - 1]
						curPage.onLoad(curPage.options) // 传入参数
						curPage.onShow()
						curPage.onReady()
						
					}
				}).catch(err => {
					uni.setStorageSync("Authorization",null)
					uni.setStorageSync("UserInfo",null)
					isLogin = false;
				})
			}
		},
		fail() {
			isLogin = false;
		}
	})
}


export default {
	get,
	post,
	onLogin
}
