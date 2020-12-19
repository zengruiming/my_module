const axios = require('axios')  //axios
const YAML = require('yaml') //yml文件读取
const fs = require('fs')  //文件操作
const path = require('path') //路径操作
const logger = require('./log4js').logger('default');
let qs = require('qs');
let moment = require('moment')

function queryAvgPrice(productName, cappedPrice,urlParse,auctionId) {
    const testFile = fs.readFileSync(path.join(__dirname, './config/queryAvgPrice.yml'), 'utf8')
    let testParse = YAML.parse(testFile)
    let testUrlElement = testParse['url'];
    let testBodyElement = testParse['body'];
    let onOrOff = testParse['onOrOff'];
    let parse = qs.parse(testBodyElement);
    parse['shopName'] = productName
    let body = qs.stringify(parse);

    return axios({
        url: urlParse["getUrl"],
        params: {auctionId: auctionId},
    }).then(res =>
        res.data.data.actualEndTime
    ).then(date => axios({
        method: 'post',
        url: testUrlElement,
        data: body,
    }).then(res => {
        let data = res.data;
        let avgPrice = parseInt(data.substring(data.indexOf("平均成交价"), data.indexOf("最低成交价")).replace(/[^0-9.]/ig, ""))
        let miniPrice = parseInt(data.substring(data.indexOf("最低成交价"), data.indexOf("最高成交价")).replace(/[^0-9.]/ig, ""))
        // 出价金额
        let offerPrice
        // 不是数值时替代金额
        let nanPrice = cappedPrice * 0.4;
        if (onOrOff === 0) {
            offerPrice = (avgPrice + miniPrice) / 2
        } else {
            offerPrice = isNaN(avgPrice) ? nanPrice : miniPrice;
        }
        // 从第三方服务器获取最大出价金额,如果没有金额记录，则默认设置为原价的百分之40
        let maxOfferPrice = isNaN(avgPrice) ? nanPrice : offerPrice;
        logger.info("夺宝任务开始，商品名为：" + productName + "，结束时间：" + moment(date).format('YYYY-MM-DD HH:mm:ss') + "，最大出价金额为：", maxOfferPrice)
        return maxOfferPrice
    }))
}

exports.queryAvgPrice = queryAvgPrice
