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

queryPriceUrl.replace('*',Date.now)

axios({
    url: queryPriceUrl,
    headers: headersParse,
}).then(res => {
    // console.log('请求结果：', res.data.result.data.pageList.length);
    return res.data.result.data.pageList
}).then(res => {
    // console.log(res)
    for (let i = 0; i < res.length; i++) {
        logger.info(res[i]['id'])
        logger.info(res[i]['productName'])
    }
})
