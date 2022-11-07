var $ = mdui.$;

window.onload = () => {
    console.log('returnCitySN=' + returnCitySN);
    let url = window.location.href;
    let siteInfo = getAddress();
    let token = getQueryVariable('auth')
    let param = {
        NodeId:"20200824151057501100",
        TaskId:"20220510172305566001",
    }

    let pdfViewer = $('.pdfViewer');
    pdfViewer.on('click', ()=> {
        if($('.tab-bar')[0].className.indexOf('show') != -1) {
            $('.tab-bar')[0].classList.remove('show');
        } else {
            $('.tab-bar')[0].classList.add('show');
        }
    })
    window.history.pushState({page: 1}, "title", "#");
    setTimeout(()=> {
        window.addEventListener('popstate', function(e) {
            console.log('popstate')
            wx.miniProgram.navigateBack();
        }, 10);             
    })       
    // 返回按钮，点击返回小程序
    // let backBtn = document.querySelector('#goback')
    // backBtn.addEventListener('click', () => {
        // wx.miniProgram.navigateTo({
        //     url: '/pages/stock-market/stock-market',
        //     success: (resp) => {
        //         console.log('跳转成功')
        //     }
        // })
        // wx.miniProgram.switchTab({
        //     url: '/pages/stock/pdf-report',
        //     success: (resp) => {
        //         console.log('跳转成功')
        //     },
        //     fail: (err) => {
        //         console.log('跳转失败');
        //         console.log(err);
        //     }
        // })        
    // })
    
}

window.onmessage = function(event) {
    if (
      event.data &&
      typeof event.data === 'string' &&
      window.self !== window.top
    ) {
       console.log(event.data);
    }
}

function getAddress() {
    let siteInfo={}
    if(returnCitySN){
        siteInfo.LoginIP = returnCitySN['cip']
        siteInfo.LoginCName = returnCitySN['cname']
        //防止地址太具体
        if(siteInfo.LoginCName.indexOf('省')!=-1)
        {
        siteInfo.LoginCName = siteInfo.LoginCName.substring(0,siteInfo.LoginCName.indexOf('省')+1)
        }else if(siteInfo.LoginCName.indexOf('市')!=-1){
        siteInfo.LoginCName = siteInfo.LoginCName.substring(0,siteInfo.LoginCName.indexOf('市')+1)
        }else if(siteInfo.LoginCName.indexOf('自治区')!=-1){
            siteInfo.LoginCName = siteInfo.LoginCName.substring(0,siteInfo.LoginCName.indexOf('自治区')+3)
        }else if(siteInfo.LoginCName.indexOf('行政区')!=-1){
            siteInfo.LoginCName = siteInfo.LoginCName.substring(0,siteInfo.LoginCName.indexOf('行政区')+3)
        }
    }
    return siteInfo;
}

// 获取查询字符串
function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}

const main = {
    data() {
        return {
            test: 'hello vue',
            dialogVisible: false,
            isShowOutlineDialog: false, // 是否显示目录对话框
            isShowHistoryDialog: false, // 是否显示历史报告对话框
            isShowGuideDialog: false, // 是否显示分析指南弹窗
            isShowCompareDialog: false, // 是否显示对比公司弹窗
            isLogin: 'false', // 是否登录，字符串类型
            isAdd: false, // 当前股票是否已加入自选股
            rptGuideData: {}, // 报告导读数据
            rptCatalog: {}, // 报告导读目录
            token: '', // 认证用token
            taskId: '',
            templateId: '', // 模板id
            helpMsg: '', // 分析指南文本
            historyRpt: [], // 历史报告
            pageNumData: [], // 匹配页码数据
            optionalStockList: [], // 自选股列表
            curPage: '', // 当前页数
            curStock: {
                secName: '',
                secCode: ''
            },
            newPdfUrl: '', // 新pdf的文件路径
            preUrl: 'https://report.ducaibao.com.cn/test/wxapp/beta/pdf/web/viewer.html?file=', // pdf预览器
            apiUrl: 'https://dev.ducaibao.cn',
            loading: false, // 正在加载
        }
    },
    computed: {
        customClass() {
            if(this.dialogVisible) {
                return 'show'
            } else {
                return ''
            }
        },
        outlineDialogClass() {
            if(this.isShowOutlineDialog) {
                return 'dialog show'
            } else {
                return 'dialog'
            }
        },
        historyDialogClass() {
            if(this.isShowHistoryDialog) {
                return 'dialog show'
            } else {
                return 'dialog'
            }
        },
        guideDialogClass() {
            if(this.isShowGuideDialog) {
                return 'dialog show'
            } else {
                return 'dialog'
            }
        },
        compareDialogClass() {
            if(this.isShowCompareDialog) {
                return 'dialog show'
            } else {
                return 'dialog'
            }
        },        
        stockFullName() {
            return this.curStock.secName + "(" + this.curStock.secCode + ")" + " "+ this.curStock.year + '年' + this.curStock.fileName
        },
        historyStockName() {
            return (item)=> {
                return item.year + '年' + item.name
            }
        },
        // 返回匹配目录的页码
        matchPage() {
            return (index) => {
                if(this.pageNumData.length > 0) {
                    return this.pageNumData[index].matchPage
                }
            }
        }        
    },
    methods: {
        // 初始化参数
        initData() {
            this.curStock.secName = decodeURI(getQueryVariable('name'))
            this.curStock.secCode = getQueryVariable('code')
            this.token = getQueryVariable('auth')
            this.nodeId = getQueryVariable('nodeid')
            this.taskId = getQueryVariable('taskid')
            this.curPage = getQueryVariable('page')
            this.isLogin = getQueryVariable('login')
            this.templateId = getQueryVariable('templateId')
            this.compareList = decodeURI(getQueryVariable('compareList')).split(',')
            if(this.curPage != '-1') {
                $("#initPage")[0].innerHTML = this.curPage
            } else {
                $("#initPage")[0].innerHTML = 1
            }
            
            $("#changePage")[0].click();
            
            // 返回按钮，点击返回小程序
            let backBtn = document.querySelector('#goback')
            backBtn.addEventListener('click', () => {
                wx.miniProgram.switchTab({
                    url: '/pages/stock/pdf-report',
                    success: (resp) => {
                        console.log('跳转成功')
                    },
                    fail: (err) => {
                        console.log('跳转失败');
                        console.log(err);
                    }
                })        
            })
            this.getOptionalStock();
        },
        showOutline() {
            this.isShowOutlineDialog = true
        },
        showHistory() {
            this.isShowHistoryDialog = true
        },
        showGuide() {
            this.isShowGuideDialog = true
        },
        showCompareIndustry() {
            this.isShowCompareDialog = true
        },
        closeDialog(type) {
            if(type === 'outline') {
                this.isShowOutlineDialog = false
            } else if(type === 'history') {
                this.isShowHistoryDialog = false
            } else if(type === 'guide') {
                this.isShowGuideDialog = false
            } else if(type === 'compare') {
                this.isShowCompareDialog = false
            }
            
        },
        // 页面跳转
        pageTo(nodeId) {
            let param = {
                NodeId: this.getNodeIdById(nodeId),
                TaskId: this.taskId
            }
            this.loading = true;
            $.ajax({
                method: 'POST',
                url: this.apiUrl + '/Report/GetHomeData',
                headers: {
                    'Authorization': 'Bearer ' + this.token
                },
                contentType: 'application/json',
                data: JSON.stringify(param),
                success: (resp)=> {
                    this.loading = false;
                    let data = JSON.parse(resp).data
                    this.isShowOutlineDialog = false
                    this.curPage = data.reportKeyInfoData.matchPage;
                    if(this.curPage != '-1') {
                        $("#initPage")[0].innerHTML = this.curPage;
                    } else {
                        $("#initPage")[0].innerHTML = 1;
                    }
                    $("#changePage")[0].click();
                },
            })
           
        },
        getNavigJson() {
            let param = {
                Id: this.templateId
            }
            $.ajax({
                method: 'GET',
                url: this.apiUrl + '/Report/GetNavigJsonById',
                headers: {
                    'Authorization': 'Bearer ' + this.token
                },
                contentType: 'application/json',
                data: param,
                success: (resp)=> {
                    this.rptGuideData = JSON.parse(resp).data;
                    this.rptCatalog =  JSON.parse(this.rptGuideData.navigJson).children;
                    this.curStock.year = this.rptGuideData.createTime.split('-')[0]
                },
            })
        },
        // 通过code获取报告的信息
        getRptInfoByCode() {
            let param = {
                Code: this.curStock.secCode
            }
            $.ajax({
                method: 'POST',
                url: this.apiUrl + '/Report/GetAllReportInfoByCode',
                headers: {
                    'Authorization': 'Bearer ' + this.token
                },
                contentType: 'application/json',
                data: JSON.stringify(param),
                success: (resp)=> {
                    let respData = JSON.parse(resp).data
                    this.historyRpt = respData
                },
            })
        },
        // 历史报告跳转
        changeRpt(id) {
            this.taskId = id
            let param = {
                NodeId: this.nodeId,
                TaskId: this.taskId
            }
            $.ajax({
                method: 'POST',
                url: this.apiUrl + '/Report/GetHomeData',
                headers: {
                    'Authorization': 'Bearer ' + this.token
                },
                contentType: 'application/json',
                data: JSON.stringify(param),
                success: (resp)=> {
                    this.newPdfUrl = JSON.parse(resp).data.filePath
                    history.pushState({page: 1}, null, window.location.href);
                    window.open(this.preUrl + this.newPdfUrl + '&auth=' + this.token + '&code=' + this.curStock.secCode 
                        + '&name=' + this.curStock.secName + '&nodeid=' + this.nodeId + '&taskid=' + this.taskId + '&login=' + 
                        this.isLogin + '&templateId=' + this.templateId, '_self' )
                },
            })
        },
        getGuideText() {
            let param = {
                NodeId: this.nodeId,
                TaskId: this.taskId
            }
            $.ajax({
                method: 'POST',
                url: this.apiUrl + '/Report/GetHomeData',
                headers: {
                    'Authorization': 'Bearer ' + this.token
                },
                contentType: 'application/json',
                data: JSON.stringify(param),
                success: (resp)=> {
                    let data = JSON.parse(resp).data
                    this.helpMsg = data.analyseNode.helpMsg
                    // this.curStock.fileName = this.formatRptType(data.fileName)
                    this.curStock.fileName = data.fileName
                    this.curStock.year = data.year

                    // 根据当前报告给历史报告列表中匹配的行加上选中的样式
                    this.historyRpt.forEach((item, index) => {
                        if(item.year == this.curStock.year && item.name == this.curStock.fileName) {
                            this.$refs['historyItem'+index].className = 'history-li-select'
                        }
                    })

                    // 给titleBar设上标题
                    let titleBarDom = document.querySelector('#titleBar .text')
                    titleBarDom.innerText = this.stockFullName
                },
            })
        },
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
        // 添加自选股
        addOptionalStock() {
            let param = {
                Seccode: this.curStock.secCode
            }
            $.ajax({
                method: 'POST',
                url: this.apiUrl + '/Report/AddUserStock',
                headers: {
                    'Authorization': 'Bearer ' + this.token
                },
                contentType: 'application/json',
                data: JSON.stringify(param),
                success: (resp)=> {
                    if(this.isLogin == 'true') {
                        let parseResp = JSON.parse(resp);
                        if(parseResp.status) {
                            ElementPlus.ElMessage({
                                message: '已成功添加股票',
                                type: 'success',
                            })
                            this.isAdd = true;                     
                        } else {
                            ElementPlus.ElMessage({
                                message: '该股票已存在',
                                type: 'warning',
                            })                        
                        }
                    } else {
                        wx.miniProgram.navigateTo({
                            url: '/pages/ucenter/login?isFromPdf=true', 
                            success: (resp) => {
                                history.pushState({page: 1}, null, window.location.href);
                                console.log('跳转成功')
                            }
                        })                         
                        // ElementPlus.ElMessage({
                        //     message: '请先登录',
                        //     type: 'warning',
                        // })                        
                    }
                },
            })
            
        },
        // 跳转到自选股页面
        toOptionalStock() {
            // wx.miniProgram.switchTab({
            //     url: '/pages/home/home',
            //     success: (resp) => {
            //         console.log('跳转成功')
            //     },
            //     fail: (err) => {
            //         console.log('跳转失败');
            //         console.log(err);
            //     }
            // })                
            // if(this.isLogin == 'true') {
            wx.miniProgram.navigateTo({
                url: '/pages/stock-market/stock-market',
                success: (resp) => {
                    console.log('跳转成功')
                }
            })
            // } 
            // else 
            // {
                // wx.miniProgram.navigateTo({
                //     url: '/pages/ucenter/login',
                //     success: (resp) => {
                //         console.log('跳转成功')
                //     }
                // })                
                // ElementPlus.ElMessage({
                //     message: '请先登录',
                //     type: 'warning',
                // })                        
            // }
        },
        toOptionalStock_1() {
            ElementPlus.ElMessage({
                message: 'success',
                type: 'success',
            })             
            wx.miniProgram.switchTab({
                url: '/pages/home/home',
                success: (resp) => {
                    console.log('跳转成功')
                },
                fail: (err) => {
                    console.log('跳转失败');
                    console.log(err);
                }
            })            
        },
        // 格式化报告类型名称
        formatRptType(name) {
            let fmtName = ''
            if (name === '第一季度报告') {
                fmtName = '一季报'
            } else if (name === '半年度报告') {
                fmtName = '半年报'
            } else if (name === '第三季度报告') {
                fmtName = '三季报'
            } else if (name === '年度报告') {
                fmtName = '年报'
            }
            return fmtName
        },
        // 获取页码信息
        getReportPageNum() {
            let param = {
                TaskId: this.taskId,
                TemplateId: this.templateId
            }
            $.ajax({
                    method: 'POST',
                    url: this.apiUrl + '/Report/GetMatchList',
                    headers: {
                        'Authorization': 'Bearer ' + this.token
                    },
                    contentType: 'application/json',
                    data: JSON.stringify(param),
                    success: (resp)=> {
                        // 处理返回的数据，map化
                        let dataMap = new Map()
                        let data = JSON.parse(resp).data
                        data.forEach(item => {
                            dataMap.set(item.id, {
                                analyseNodeName: item.analyseNodeName,
                                matchPage: item.matchPage
                            })
                        })
                        // 获取匹配的页码
                    this.rptCatalog.forEach(item => {
                            let id = this.getNodeIdById(item.id)
                            let value = dataMap.get(id)
                            this.pageNumData.push({
                                topic: item.topic,
                                matchPage: value.matchPage
                            })
                        })                    
                    },
                })
        },
        // 获取自选股列表
        getOptionalStock() {
            let param = {}
            $.ajax({
                method: 'POST',
                url: this.apiUrl + '/Report/GetUserStock',
                headers: {
                    'Authorization': 'Bearer ' + this.token
                },
                contentType: 'application/json',
                data: JSON.stringify(param),
                success: (resp)=> {
                    this.optionalStockList = JSON.parse(resp).data
                    // 判断当前股票是否已经添加至自选股
                    if(Array.isArray(this.optionalStockList)) {
                        let result = this.optionalStockList.find((item)=> {
                            return item.seccode === this.curStock.secCode;
                        })
                        if(result != -1 && result != undefined) {
                            this.isAdd = true;
                        } else {
                            this.isAdd = false;
                        }   
                    } else {
                        this.isAdd = false;
                    }
          
                },
            })            
        },
               
    },
    mounted() {
        this.initData()
        this.getNavigJson()
        this.getRptInfoByCode()
        this.getGuideText()
        this.getReportPageNum()    
    }
}

const app = Vue.createApp(main);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.use(ElementPlus);
app.mount('#app');
