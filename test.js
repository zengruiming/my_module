var rp = require('request-promise')  //ajax请求（promise版本）
var tough = require('tough-cookie');

function a() {
    return new Promise((resolve, reject) => {
        setInterval(()=>{
            resolve('resolved')
        }, 2000)
    })
}

a().then(res => {
    console.log(res)
});