var rp = require('request-promise')  //ajax请求（promise版本）
var tough = require('tough-cookie');

// Easy creation of the cookie - see tough-cookie docs for details
let cookie = new tough.Cookie({
    key: "some_key",
    value: "some_value",
    domain: 'api.mydomain.com',
    httpOnly: true,
    maxAge: 31536000
});

// Put cookie in an jar which can be used across multiple requests
var cookiejar = rp.jar();
cookiejar.setCookie(cookie, 'https://api.mydomain.com');
// ...all requests to https://api.mydomain.com will include the cookie

var options = {
    uri: 'https://api.mydomain.com/...',
    jar: cookiejar // Tells rp to include cookies in jar that match uri
};

rp(options)
    .then(function (body) {
        // Request succeeded...
    })
    .catch(function (err) {
        // Request failed...
    });