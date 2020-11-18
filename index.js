const YAML = require('yaml') //yml文件读取
const fs = require('fs')  //文件操作
const path = require('path') //路径操作
const axios = require('axios')  //axios
const dbdIndex = require('./dbdIndex.js')  //文件操作

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

//解析配置文件 得到请求体、配置参数-手动配置商品ID
const autoCommonFile = fs.readFileSync(path.join(__dirname, './config/autoConfig.yml'), 'utf8')
let autoCommonParse = YAML.parse(autoCommonFile)
let onOrOff = autoCommonParse['onOrOff'];
let queryPriceUrl = autoCommonParse['url'];
let headerParse = autoCommonParse['header'];
let auctionDateParse = autoCommonParse['auctionDate'];

if (onOrOff !== 0) {
    axios({
        url: queryPriceUrl,
        headers: headerParse,
    }).then(res => {
        return res.data.result.data.pageList;
    }).then(res => {
        //执行任务
        for (let i = 0; i < res.length; i++) {
            let auctionId = res[i]['id']//商品编号
            let delay = auctionDateParse[i]['delay']//提前出价时间（单位：毫秒）
            let maxOfferPrice = auctionDateParse[i]['maxOfferPrice']//最大出价金额
            let priceIncrease = auctionDateParse[i]['priceIncrease']//加价金额
            let stableOfferPrice = auctionDateParse[i]['stableOfferPrice']//固定出价金额
            let account = auctionDateParse[i]['account']//出价帐号

            //配置了商品编号才执行抢购任务
            if (auctionId > 0) {
                dbdIndex.startOneTask(auctionId, delay, maxOfferPrice, priceIncrease, stableOfferPrice, account)
            }
        }
    })
}