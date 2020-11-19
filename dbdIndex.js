const YAML = require('yaml') //yml文件读取
const fs = require('fs')  //文件操作
const path = require('path') //路径操作
const axios = require('axios')  //axios
const logger = require('./log4js').logger('default');

function DBDTask() {
    //开启一个抢购任务
    this.startOneTask = function (auctionId,delay,maxOfferPrice,priceIncrease,stableOfferPrice,account) {
        account = account -1
        let actualEndTime;//结束时间戳
        let currentPrice;//当前价格

        //解析配置文件 得到url
        const urlFile = fs.readFileSync(path.join(__dirname, './config/dbdUrl.yml'), 'utf8')
        let urlParse = YAML.parse(urlFile)
        //url
        let queryPriceUrl = urlParse["getUrl"];
        let offerPriceUrl = urlParse["postUrl"];
        //请求头
        let headersParse = urlParse["header"]
        headersParse['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
        headersParse['Cookie'] = urlParse["bodyAndCookie"][account]["Cookie"]

        //组装带正确商品编号的查询字符串、请求体
        let queryPriceQs = {auctionId: auctionId};//查询字符串
        let offerPriceBody = urlParse["bodyAndCookie"][account]["body"].replace("*", auctionId);//提交价格请求体

        // 配置代理服务器信息
        /*let proxy = {
            host: "127.0.0.1", //代理服务器地址
            port: 8888,//端口
        };*/

        let fun1 = async function () {
            await axios({
                url: queryPriceUrl,
                params: queryPriceQs,
            }).then(res => {
                // console.log('请求结果：', res.data.data);
                actualEndTime = res.data.data.actualEndTime
            });

            let l = actualEndTime - Date.now() - 5000//出价10秒前修正时间
            await new Promise((resolve, reject) => setTimeout(resolve, l))
        }

        let fun2 = async function () {
            await axios({
                url: queryPriceUrl,
                params: queryPriceQs,
            }).then(res => {
                // console.log('请求结果：', res.data.data);
                actualEndTime = res.data.data.actualEndTime
            });
            let m = actualEndTime - Date.now() - delay//距离出价的时间
            await new Promise((resolve, reject) => setTimeout(resolve, m))
        }

        let fun3 = async function () {
            await axios({
                url: queryPriceUrl,
                params: queryPriceQs,
            }).then(res => {
                // console.log('请求结果：', res.data.data);
                actualEndTime = res.data.data.actualEndTime
                currentPrice = res.data.data.currentPrice
            });

            if (currentPrice < maxOfferPrice) {
                // 判断是否固定价格出价
                let offerPrice
                if(stableOfferPrice === 0){
                    offerPrice = currentPrice + priceIncrease
                    // offerPrice = "2" //测试数据
                }else {
                    offerPrice = stableOfferPrice
                }
                offerPriceBody = offerPriceBody.replace("_", offerPrice);//提交价格请求体
                await axios({
                    url: offerPriceUrl,
                    method: 'post',
                    data: offerPriceBody,
                    headers: headersParse,
                    // proxy: proxy
                }).then(res => {
                    logger.info("请求结果：", res.data)
                });
            }

            return actualEndTime - Date.now() - delay;//距离出价的时间
        }

        fun1().then(fun2).then(() => {
            let n = setInterval(() => {
                    fun3().then((req) => {
                        if (req < 0) {
                            clearInterval(n)
                        }
                    })
                },50
            )
        })
    }
}

module.exports = new DBDTask()