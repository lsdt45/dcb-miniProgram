var $ = mdui.$;

window.onload = () => {
    console.log('returnCitySN=' + returnCitySN);
    let siteInfo = getAddress()
    let param = {
        UserName:"Guest",
        LoginIP:siteInfo.LoginIP,
        UserClass:99,
        LoginCName:siteInfo.LoginCName
    }
    $(document).ajaxStart(function (event, xhr, options) {
    // xhr: XMLHttpRequest 对象
    // options: AJAX 请求的配置参数
        console.log(options);
    });    
    $.ajax({
        method: 'POST',
        url: 'http://127.0.0.1:8001/UserInfo/UserLogin',
        headers: {
            'Accept': 'application/json',
            'Simulate': true,
            'X-Requested-With': 'XMLHttpRequest',
        },
        contentType: 'application/json;charset=UTF-8',
        data: JSON.stringify(param),
        beforeSend: (xhr) => {
          console.log(xhr);
        },
        success: (data)=> {
            console.log(data);
        },
    })
    
    
    // $.ajax({
    //     method: 'POST',
    //     url: 'http://127.0.0.1:8000/ReportTaskInfo/GetHomeData',
    //     data: {
    //         NodeId: '20200053',
    //         NodeTreeId: '20200053',
    //         TaskId: '20220409235033865001',
    //         TemplateNavigationId: '20211008170256485001',
    //         UserId: '20211126141545225001'
    //     },
    //     success: function (data) {
    //       console.log(data);
    //     }
    // });
    
    
    let outline = $('#outline')[0];
    outline.addEventListener('click', ()=> {
        console.log('outline is checked!');
        let navMenu = document.getElementById('navMenu');
        if(navMenu.className.indexOf('show') != -1) {
            navMenu.classList.remove('show');
        } else {
            navMenu.classList.add('show');
        }
        
    })
    let fstBtn = document.querySelector('.mdui-list-item.fst');
    fstBtn.addEventListener('click', ()=> {
        document.getElementById("initPage").innerHTML = '10';
        document.getElementById("changePage").click();
    })
    let secBtn = document.querySelector('.mdui-list-item.sec');
    secBtn.addEventListener('click', ()=> {
        document.getElementById("initPage").innerHTML = '20';
        document.getElementById("changePage").click();
    })
    let trdBtn = document.querySelector('.mdui-list-item.trd');
    trdBtn.addEventListener('click', ()=> {
        document.getElementById("initPage").innerHTML = '30';
        document.getElementById("changePage").click();
    })
    let pdfViewer = $('.pdfViewer');
    pdfViewer.on('click', ()=> {
        console.log('pdfViewer is cliced');
        if($('.tab-bar')[0].className.indexOf('show') != -1) {
            $('.tab-bar')[0].classList.remove('show');
        } else {
            $('.tab-bar')[0].classList.add('show');
        }
        
    })
    
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

const main = {
    data() {
        return {
            test: 'hello vue',
        }
    },
    mounted() {
        console.log('loaded!');
    }
}

Vue.createApp(main).mount('#app');