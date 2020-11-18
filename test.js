const axios = require('axios')  //axios
const YAML = require('yaml') //yml文件读取
const fs = require('fs')  //文件操作
const path = require('path') //路径操作

const autoCommonFile = fs.readFileSync(path.join(__dirname, './config/autoConfig.yml'), 'utf8')
let autoCommonParse = YAML.parse(autoCommonFile)
var queryPriceUrl = autoCommonParse['url'];
var headersParse = autoCommonParse['header'];

axios({
    url: queryPriceUrl,
    headers: headersParse,
}).then(res => {
    console.log('请求结果：', res.data.result.data.pageList[0]['id']);
});