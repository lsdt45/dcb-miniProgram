let data = {
	"API_ROOT_ZJZT": "https://dev.ducaibao.cn",
	"API_ROOT_AUTH": "https://dev.ducaibao.cn:444",
	"System_Name": "读财报",
	"System_ProcessName": "财报析构",
	"Slogan": "财报解析，还原一个真实的企业",
	"FinancialAnalysisTemplateId":"20230511354FCCF0D6B5",
	"AccountingAnalysisTemplateId":"20220722153016928001",
	"ReportNavigateTemplateId":"202305118D63C01C9CE3",
	// #ifdef MP
	"PdfViewerUrl": "https://ducaibao.com.cn/test/wxapp/beta/pdf/web/viewer.html?file=",
	// #endif
	// #ifdef H5
	"PdfViewerUrl": "../../../static/pdf/web/viewer.html?file=",
	// #endif
	"PrivacyInfoUrl":"https://ducaibao.com.cn/static/%E6%9C%8D%E5%8A%A1%E5%8D%8F%E8%AE%AE&%E9%9A%90%E7%A7%81%E5%A3%B0%E6%98%8E.html",
	"canvas2d": "true",	// 是否开启图表的canvas2d模式。开发时可改为"canvas2d": ""，以避免模拟器图表位置不对。但上传前必须改回true。
	"MaxStartTime":2000,	// 最大开始时间
	"IndustryTree":["中信行业分类标准","申银万国行业分类","证监会行业分类","全球行业分类（GICS）"],
}

export default {
	data
}
