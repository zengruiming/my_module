const axios = require('axios')  //axios
const YAML = require('yaml') //yml文件读取
const fs = require('fs')  //文件操作
const path = require('path') //路径操作
const logger = require('./log4js').logger('default');


const autoCommonFile = fs.readFileSync(path.join(__dirname, './config/autoConfig.yml'), 'utf8')
let autoCommonParse = YAML.parse(autoCommonFile)
let queryPriceUrl = autoCommonParse['url'];
let headersParse = autoCommonParse['header'];
let auctionDataParse = autoCommonParse['auctionData'];

console.log(auctionDataParse)

/*for (let i = 0; i < auctionDataParse.length; i++) {
    console.log(auctionDataParse[i]['maxOfferPrice'])
}*/

// auctionDataParse.forEach(req => console.log(req['maxOfferPrice']))

queryPriceUrl.replace('*', Date.now)

axios({
    url: queryPriceUrl,
    headers: headersParse,
}).then(res => {
    // console.log('请求结果：', res.data.result.data.pageList.length);
    return res.data.result.data.pageList
}).then(res => {
    // console.log(res)
    for (let i = 0; i < res.length; i++) {
        logger.info(res[i])
        // logger.info(res[i]['id'])
        // logger.info(res[i]['productName'])
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
