const YAML = require('yaml') //yml文件读取
const fs = require('fs')  //文件操作
const path = require('path') //路径操作
const axios = require('axios')  //axios
const dbdIndex = require('./dbdIndex.js')  //文件操作
const logger = require('./log4js').logger('default');
let qs = require('qs');
let avg = require('./avgPrice');
let schedule = require('node-schedule')
let moment = require('moment')

//解析配置文件 得到请求体、配置参数-自动配置商品ID
const autoCommonFile = fs.readFileSync(path.join(__dirname, './config/autoConfig.yml'), 'utf8')
let autoCommonParse = YAML.parse(autoCommonFile)
let onOrOff = autoCommonParse['onOrOff'];
let autoDelay = autoCommonParse['delay'];
let autoMaxOfferPrice = autoCommonParse['maxOfferPrice'];
let autoAccount = autoCommonParse['account'];
let queryPriceUrl = autoCommonParse['url'].replace('*', Date.now);
let headerParse = autoCommonParse['header'];


//解析配置文件 得到请求体、配置参数-手动配置商品ID
const diyCommonFile = fs.readFileSync(path.join(__dirname, './config/diyConfig.yml'), 'utf8')
let diyCommonParse = YAML.parse(diyCommonFile)
//解析配置文件 得到url
const urlFile = fs.readFileSync(path.join(__dirname, './config/dbdUrl.yml'), 'utf8')
let urlParse = YAML.parse(urlFile)
//执行任务
diyCommonParse.forEach(req => {
    let auctionId = req['auctionId']//商品编号
    let delay = autoDelay//提前出价时间（单位：毫秒）
    let maxOfferPrice = req['maxOfferPrice']//最大出价金额
    let priceIncrease = req['priceIncrease']//加价金额
    let stableOfferPrice = req['stableOfferPrice']//固定出价金额
    let account = autoAccount//出价帐号

    //配置了商品编号才执行抢购任务
    if (auctionId > 0) {
        axios({
            url: urlParse["getUrl"],
            params: {auctionId: auctionId},
        }).then(res => {
                let endTime = res.data.data.actualEndTime;
                logger.info("夺宝任务开始，结束时间：" + moment(endTime).format('YYYY-MM-DD HH:mm:ss') + "，最大出价金额为：", maxOfferPrice)
                return endTime - 10000
            }
        ).then(date => {
                if (Date.now() < date + 10000) {
                    schedule.scheduleJob(date, function (auctionId, delay, maxOfferPrice, priceIncrease, stableOfferPrice, account) {
                        dbdIndex.startOneTask(auctionId, delay, maxOfferPrice, priceIncrease, stableOfferPrice, account)
                    }.bind(null, auctionId, delay, maxOfferPrice, priceIncrease, stableOfferPrice, account))
                } else {
                    logger.error("夺宝已结束！结束时间：" + moment(date + 10000).format('YYYY-MM-DD HH:mm:ss'))
                }
            }
        )
    }
})


if (onOrOff !== 0) {
    axios({
        url: queryPriceUrl,
        headers: headerParse,
    }).then(res => {
        return res.data.result.data.pageList;
    }).then(req => {
        //执行任务
        req.forEach(req => {
            let auctionId = req['id']//商品编号
            let delay = autoDelay//提前出价时间（单位：毫秒）
            let priceIncrease = 1//加价金额
            let stableOfferPrice = 0//固定出价金额
            let account = autoAccount//出价帐号
            //获取最大出价金额，并执行抢购任务
            avg.queryAvgPrice(req['productName'], req['cappedPrice'],urlParse,auctionId,autoMaxOfferPrice,req['usedNo']).then(maxOfferPrice =>
                axios({
                    url: urlParse["getUrl"],
                    params: {auctionId: auctionId},
                }).then(res =>
                    // console.log('请求结果：', res.data.data);
                    res.data.data.actualEndTime - 10000
                ).then(date => {
                        if (Date.now() < date + 10000) {
                            schedule.scheduleJob(date, function (auctionId, delay, maxOfferPrice, priceIncrease, stableOfferPrice, account) {
                                dbdIndex.startOneTask(auctionId, delay, maxOfferPrice, priceIncrease, stableOfferPrice, account)
                            }.bind(null, auctionId, delay, maxOfferPrice, priceIncrease, stableOfferPrice, account))
                        } else {
                            logger.error("夺宝已结束！结束时间：" + moment(date + 10000).format('YYYY-MM-DD HH:mm:ss'))
                        }
                    }
                )
            );
        })
    })
}