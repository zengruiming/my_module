const axios = require('axios')  //axios
const YAML = require('yaml') //yml文件读取
const fs = require('fs')  //文件操作
const path = require('path') //路径操作
const logger = require('./log4js').logger('default');
let avg = require('./avgPrice');
let moment = require('moment')


//解析配置文件 得到url
const urlFile = fs.readFileSync(path.join(__dirname, './config/dbdUrl.yml'), 'utf8')
let urlParse = YAML.parse(urlFile)
//url
let queryPriceUrl = urlParse["getUrl"];
let offerPriceUrl = urlParse["postUrl"];
//请求头
let headersParse = urlParse["header"]
headersParse['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
headersParse['Cookie'] = urlParse["bodyAndCookie"][1]["Cookie"]

//组装带正确商品编号的查询字符串、请求体
let queryPriceQs = {auctionId: 246165284};//查询字符串

axios({
    url: queryPriceUrl,
    params: queryPriceQs,
}).then(res => {
    // console.log('请求结果：', res.data.data);
    // console.log(moment(res.data.data.actualEndTime).format('YYYY-MM-DD HH:mm:ss'))

});


const autoCommonFile = fs.readFileSync(path.join(__dirname, './config/autoConfig.yml'), 'utf8')
let autoCommonParse = YAML.parse(autoCommonFile)
let autoQueryPriceUrl = autoCommonParse['url'];
let autoHeadersParse = autoCommonParse['header'];
let auctionDataParse = autoCommonParse['auctionData'];

// console.log(auctionDataParse)

/*for (let i = 0; i < auctionDataParse.length; i++) {
    console.log(auctionDataParse[i]['maxOfferPrice'])
}*/

// auctionDataParse.forEach(req => console.log(req['maxOfferPrice']))

autoQueryPriceUrl.replace('*', Date.now)

axios({
    url: autoQueryPriceUrl,
    headers: autoHeadersParse,
}).then(res => {
    // console.log('请求结果：', res.data.result.data.pageList.length);
    return res.data.result.data.pageList
}).then(res => {
    // console.log(res)
    for (let i = 0; i < res.length; i++) {
        // avg.queryAvgPrice(res[i]['productName'], res[i]['cappedPrice'],urlParse,res[i].id,0,res[i]['usedNo'])
        // console.log(res[i]['usedNo'])
        // console.log(res[i]['id'])
        // console.log(res[i]['productName'])
    }
})



// 测试定时器延时
/*
let n;
let m = Date.now()+500

let fun2 = async function () {
    await new Promise(((resolve, reject) => setTimeout(resolve,500)))
    let t = m - Date.now()
    console.log(t)
    if (t<0) {
        clearInterval(n)
    }
}

n = setInterval(fun2,50)*/

// avg.queryAvgPrice('未来人类AMD 15.6英寸游戏笔记本电脑',1000).then(req=>console.log(req));
// console.log(queryAvgPrice)

//解析配置文件 得到url
const avgFile = fs.readFileSync(path.join(__dirname, './config/avgPrice.yml'), 'utf8')
let avgParse = YAML.parse(avgFile)
let avgUrl = avgParse.url;
let avgHeader = avgParse.header;
let avgParams = avgParse.params;
avgParams.body.usedNo = '44181172570038190'
avgParams.t = Date.now()

axios({
    url: avgUrl,
    params: avgParams,
    headers: avgHeader
}).then(res => {
    let result = res.data.result.data;
    console.log(result)
    let avg = 0;
    if (result.length>0) {
        result.sort(function (a, b) {
            return a.offerPrice-b.offerPrice;
        })
        let min = parseInt(result[0].offerPrice)
        let max = parseInt(result[result.length - 1].offerPrice)
        avg = parseInt((min+max)*0.5);
        console.log(min)
        console.log(max)
        console.log(avg)
    } else {
        // console.log("hello")
    }

    // console.log(avg)

})

