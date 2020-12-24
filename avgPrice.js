const axios = require('axios')  //axios
const YAML = require('yaml') //yml文件读取
const fs = require('fs')  //文件操作
const path = require('path') //路径操作
const logger = require('./log4js').logger('default');
let qs = require('qs');
let moment = require('moment')
let queryAvg = require('./queryAvgPrice');

function queryAvgPrice(productName, cappedPrice,urlParse,auctionId,autoMaxOfferPrice,usedNo) {
//解析配置文件 得到url
    const avgFile = fs.readFileSync(path.join(__dirname, './config/avgPrice.yml'), 'utf8')
    let avgParse = YAML.parse(avgFile)
    let avgUrl = avgParse.url;
    let avgHeader = avgParse.header;
    let avgParams = avgParse.params;
    let avgOnOrOff = avgParse.onOrOff;
    avgParams.body.usedNo = usedNo
    avgParams.t = Date.now()

    return axios({
        url: urlParse["getUrl"],
        params: {auctionId: auctionId},
    }).then(res =>
        res.data.data.actualEndTime
    ).then(date =>axios({
        url: avgUrl,
        params: avgParams,
        headers: avgHeader
    }).then(res => {
        let result = res.data.result.data;
        let maxOfferPrice
        if (result.length>0) {
            result.sort(function (a, b) {
                return a.offerPrice-b.offerPrice;
            })
            let min = parseInt(result[0].offerPrice)
            let max = parseInt(result[result.length - 1].offerPrice)
            let avg = parseInt((min+max)*0.5);
            // 出价金额
            let myOfferPrice
            if (avgOnOrOff === 0) {
                myOfferPrice = avg
            } else {
                myOfferPrice = min
            }
            maxOfferPrice = autoMaxOfferPrice === 0 ? myOfferPrice : autoMaxOfferPrice
            console.log("usedNo："+usedNo)
            logger.info("夺宝任务开始，商品名为：" + productName + "，结束时间：" + moment(date).format('YYYY-MM-DD HH:mm:ss') + "，最大出价金额为：", maxOfferPrice)

        } else {
            // 官方查无出价记录时，使用第三方查价
            console.log("官方出价无记录")
            maxOfferPrice = queryAvg.queryAvgPrice(productName, cappedPrice,urlParse,auctionId,autoMaxOfferPrice)
        }
       return maxOfferPrice
    }))
}

exports.queryAvgPrice = queryAvgPrice
