const YAML = require('yaml') //yml文件读取
const rp = require('request-promise')  //ajax请求（promise版本）
const tough = require('tough-cookie');  //让request-promise支持cookie
const fs = require('fs')  //文件操作
const qs = require('qs')  //查询字符串转换模块
const schedule = require('node-schedule')  //定时任务

//解析配置文件 得到url数组
const urlFile = fs.readFileSync('./config/url.yml', 'utf8')
let urlParse = YAML.parse(urlFile)
let urlParseElement = urlParse["zouLuZhuanUrl"];
// console.log(urlParseElement[0])

//解析配置文件 得到headers数组
const headersFile = fs.readFileSync('./config/headers.yml', 'utf8')
let headersParse = YAML.parse(headersFile)
let headersParseElement = headersParse["zouLuZhuanUrl"];
// console.log(headersParseElement[0]['app'])


urlParseElement.forEach(req => {
    if (req["method"] === "GET") {
        let queryString = qs.parse(req["qs"]);
        let options = {
            uri: req["url"],
            qs: queryString,
            headers: headersParseElement[0]['app'],
            json: true // Automatically parses the JSON string in the response
        };

        rp(options)
            .then(function (repos) {
                console.log(repos.data.currentPrice);
            })
    } else {
        let queryBody =  qs.parse(req["body"]);
        let options = {
            method: 'POST',
            uri: req["url"],
            body: queryBody,
            json: true // Automatically stringifies the body to JSON
        };

        rp(options)
            .then(function (parsedBody) {
                console.log(parsedBody);
                // POST succeeded...
            })
    }
})
