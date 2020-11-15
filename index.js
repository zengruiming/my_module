const YAML = require('yaml') //yml文件读取
const fs = require('fs')  //文件操作
const path = require('path') //路径操作
const dbdIndex = require('./dbdIndex.js')  //文件操作

//解析配置文件 得到请求体、配置参数
const commonFile = fs.readFileSync(path.join(__dirname, './config/dbdCommon.yml'), 'utf8')
let commonParse = YAML.parse(commonFile)
let commonParseElement = commonParse['dbd'];

//执行任务
commonParseElement.forEach(req => {
    let auctionId = req['auctionId']//商品编号
    let delay = req['delay']//提前出价时间（单位：毫秒）
    let maxOfferPrice = req['maxOfferPrice']//最大出价金额
    let priceIncrease = req['priceIncrease']//加价金额
    let stableOfferPrice = req['stableOfferPrice']//最大出价金额

    //配置了商品编号才执行抢购任务
    if (auctionId > 0){
        dbdIndex.startOneTask(auctionId,delay,maxOfferPrice,priceIncrease,stableOfferPrice)
    }
})
