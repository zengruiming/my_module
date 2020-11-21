const YAML = require('yaml') //yml文件读取
const fs = require('fs')  //文件操作
const path = require('path') //路径操作
const axios = require('axios')  //axios
const dbdIndex = require('./dbdIndex.js')  //文件操作
const logger = require('./log4js').logger('default');
let qs = require('qs');
let avg = require('./queryAvgPrice');

//解析配置文件 得到请求体、配置参数-手动配置商品ID
const diyCommonFile = fs.readFileSync(path.join(__dirname, './config/diyConfig.yml'), 'utf8')
let diyCommonParse = YAML.parse(diyCommonFile)
//执行任务
diyCommonParse.forEach(req => {
    let auctionId = req['auctionId']//商品编号
    let delay = req['delay']//提前出价时间（单位：毫秒）
    let maxOfferPrice = req['maxOfferPrice']//最大出价金额
    let priceIncrease = req['priceIncrease']//加价金额
    let stableOfferPrice = req['stableOfferPrice']//固定出价金额
    let account = req['account']//出价帐号

    //配置了商品编号才执行抢购任务
    if (auctionId > 0) {
        dbdIndex.startOneTask(auctionId, delay, maxOfferPrice, priceIncrease, stableOfferPrice, account)
    }
})

//解析配置文件 得到请求体、配置参数-自动配置商品ID
const autoCommonFile = fs.readFileSync(path.join(__dirname, './config/autoConfig.yml'), 'utf8')
let autoCommonParse = YAML.parse(autoCommonFile)
let onOrOff = autoCommonParse['onOrOff'];
let queryPriceUrl = autoCommonParse['url'].replace('*', Date.now);
let headerParse = autoCommonParse['header'];

if (onOrOff !== 0) {
    axios({
        url: queryPriceUrl,
        headers: headerParse,
    }).then(res => {
        return res.data.result.data.pageList;
    }).then(res => {
        //执行任务
        res.forEach(req => {
            let auctionId = req['id']//商品编号
            let delay = 600//提前出价时间（单位：毫秒）
            let priceIncrease = 1//加价金额
            let stableOfferPrice = 0//固定出价金额
            let account = 1//出价帐号
            //从第三方服务器获取最大出价金额，并执行抢购任务
            avg.queryAvgPrice(req['productName'], req['cappedPrice']).then(maxOfferPrice => dbdIndex.startOneTask(auctionId, delay, maxOfferPrice, priceIncrease, stableOfferPrice, account));
        })
    })
}