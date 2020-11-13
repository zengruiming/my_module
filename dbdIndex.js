const YAML = require('yaml') //yml文件读取
const fs = require('fs')  //文件操作
const axios = require('axios')  //axios

let actualEndTime;//结束时间戳
let currentPrice;//当前价格
let delay;//提前出价时间（单位：毫秒）
let maxOfferPrice;//最大出价金额
let priceIncrease;//加价金额

//解析配置文件 得到url
const urlFile = fs.readFileSync('./config/dbdUrl.yml', 'utf8')
let urlParse = YAML.parse(urlFile)
let urlParseElement = urlParse['dbd'];
let queryPriceUrl = urlParseElement[0]["url"];
let offerPriceUrl = urlParseElement[1]["url"];

//解析配置文件 得到请求体、配置参数
const commonFile = fs.readFileSync('./config/dbdCommon.yml', 'utf8')
let headersParse = YAML.parse(commonFile)
//请求头
let headersParseElement = headersParse['dbd']['header'];
headersParseElement['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
//组装带正确商品编号的查询字符串、请求体
let auctionId = headersParse['dbd']['auctionId']//商品编号
let queryPriceQs = {auctionId: auctionId};//查询字符串
let offerPriceBody = urlParseElement[1]["body"].replace("*", auctionId);//提交价格请求体
//配置参数
delay = headersParse['dbd']['delay']//提前出价时间（单位：毫秒）
priceIncrease = headersParse['dbd']['priceIncrease']//加价金额
maxOfferPrice = headersParse['dbd']['maxOfferPrice']//最大出价金额

// 配置代理服务器信息
let proxy = {
    host: "127.0.0.1", //代理服务器地址
    port: 8888,//端口
};

let fun1 = async function () {
    await axios({
        url: queryPriceUrl,
        params: queryPriceQs,
    }).then(res => {
        // console.log('请求结果：', res.data.data);
        actualEndTime = res.data.data.actualEndTime
    });

    let l = actualEndTime - Date.now() - 5000//出价10秒前修正时间
    await new Promise((resolve, reject) => setTimeout(resolve, l))
}

let fun2 = async function () {
    await axios({
        url: queryPriceUrl,
        params: queryPriceQs,
    }).then(res => {
        // console.log('请求结果：', res.data.data);
        actualEndTime = res.data.data.actualEndTime
    });
    return actualEndTime - Date.now() - delay//距离出价的时间
}

let fun3 = async function () {
    await axios({
        url: queryPriceUrl,
        params: queryPriceQs,
    }).then(res => {
        // console.log('请求结果：', res.data.data);
        actualEndTime = res.data.data.actualEndTime
        currentPrice = res.data.data.currentPrice
    });

    if (currentPrice < maxOfferPrice) {
        // let offerPrice = currentPrice + priceIncrease
        let offerPrice = "2"
        offerPriceBody = offerPriceBody.replace("_", offerPrice);//提交价格请求体
        await axios({
            url: offerPriceUrl,
            method: 'post',
            data: offerPriceBody,
            headers: headersParseElement,
            // proxy: proxy
        }).then(res => {
            console.log('请求结果：', res.data);
        });
    }

    return actualEndTime - Date.now() - delay;//距离出价的时间
}

fun1().then(() => {
        fun2().then(t => {
            setTimeout(() => {
                let n = setInterval(
                    () => {
                        fun3().then((req) => {
                            if (req < 0) {
                                clearInterval(n)
                            }
                        })
                    }
                )
            }, t)
        })
    }
)
