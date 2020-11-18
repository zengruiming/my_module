var log4js = require('log4js');
log4js.configure({
    appenders: {
        out: {type: 'console'},
        task: {type: 'dateFile', filename: 'logs/task', "pattern": "MM-dd.log", alwaysIncludePattern: true},
        result: {type: 'dateFile', filename: 'logs/result', "pattern": "MM-dd.log", alwaysIncludePattern: true},
        error: {type: 'dateFile', filename: 'logs/error', "pattern": "MM-dd.log", alwaysIncludePattern: true},
        default: {type: 'dateFile', filename: 'logs/default', "pattern": "MM-dd.log", alwaysIncludePattern: true},
        rate: {type: 'dateFile', filename: 'logs/rate', "pattern": "MM-dd.log", alwaysIncludePattern: true}
    },
    categories: {
        default: {appenders: ['out', 'default'], level: 'info'},
        task: {appenders: ['task'], level: 'info'},
        result: {appenders: ['result'], level: 'info'},
        error: {appenders: ['error'], level: 'error'},
        rate: {appenders: ['rate'], level: 'info'}
    }
});

exports.logger=function(name){
    var logger = log4js.getLogger(name);
    return logger;
}