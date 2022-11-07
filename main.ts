import App from './App'
import uView from './uni_modules/vk-uview-ui';

import util from '@/common/util.js'
import api from '@/common/api/api.js'
import config from '@/common/data/index.js'
import store from './store'
// #ifndef VUE3
// import Vue from 'vue'
// Vue.config.productionTip = false
// App.mpType = 'app'
// const app = new Vue({
//     ...App
// })
// app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import mitt from 'mitt'

//创建Mitt实例
const Mit = mitt();
// Typescript 注册
// 由于必须要扩展ComponentCustomProperties类型才能获取类型提示
declare module 'vue' {
	interface ComponentCustomProperties {
		$Bus: typeof Mit
	}
}

export function createApp() {
	const app = createSSRApp(App)
	app.use(uView)
	app.use(store)
	app.config.globalProperties.$util = util
	app.config.globalProperties.$api = api;
	app.config.globalProperties.$config = config
	app.config.globalProperties.$Bus = Mit
	app.provide('$util', util)
	app.provide('$api', api)
	app.provide('$config', config)
	return {
		app
	}
}


// #endif