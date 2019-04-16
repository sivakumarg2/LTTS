//// File Name: logging.js
//// Description: This has the methods to log the exception, message & activity
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/

var mkdirp = require('mkdirp');
var fs = require('fs');
var path = require('path');
var dbLogging = require('../dataaccess_layer/logging.js');
var configs = require('../configs/config.js');

function logging() {
    return {
        logException: logException,
        logActivity: logActivity,
        logMessage: logMessage,
        deleteExpiredLogs: deleteExpiredLogs
    }
}

//exception log each corner of application
function logException(exception, callBack) {
    try {
        if (!(configs.switchOffLogs == "true" ? true : false)) {
            //Send to DB for logging
            dbLogging.exceptionLogging(exception, (result) => {
            })
            exception.category = "Exception";

            //Send to file for logging
            logToFileException(exception);
            callBack({ "status": true, "message": "logged successfully" });
        }
    }
    catch (e) {
    }
}

//exception log each corner of application
function logMessage(message, callBack) {
    try {
        if (!(configs.switchOffLogs == "true" ? true : false)) {

            if(!message.isOnlyLog) {
                //Send to DB for logging
                dbLogging.messageLogging(message, (result) => {
                })
            }
            message.category = "Message";

            //Send to file for logging
            logToFileMessage(message);            
            callBack({ "status": true, "message": "logged successfully" });
        }
    }
    catch (e) {
    }
}

//activity of application is logging to db
function logActivity(activity, callBack = undefined) {
    try {
        //console.log("Updated Configs: ", (configs.switchOffLogs == "true" ? true : false));
        if (!(configs.switchOffLogs == "true" ? true : false)) {
            //Send to DB for logging
            if (activity.userId != null) {
                dbLogging.activityLogging(activity, (result) => {
                })
            }

            if (callBack) {
                callBack({ "status": true, "message": "logged successfully" });
            }
        }
    }
    catch (e) {
    }
}

//To remove expired logs
function deleteExpiredLogs() {
    try {
        dbLogging.deleteExpiredLogs(configs.logRetentionPeriod, (result) => {
            //logMessage({ "methodName": "deleteExpiredLogs", "userId": 1, "isServer": 1, "message": 'Delete expired log '});
            if(!result.status) {
                logException({methodName: 'deleteExpiredLogs', userId: 1, isServer: 1, category: 'Exception', exceptionDetails: result.err})
            }            
        })
    }
    catch (e) {
    }
}

//log to local file system
var logToFileException = function (exception) {
    try {
        var dirname = require('path').dirname;
        ////Write into file here     
        mkdirp(dirname("./log/log.log"), function (err) {
            fs.appendFile('./log/log.log', `
            \r\n************** Exception: Date:(` + new Date() + `) ***************            
            \r\nMethodName: ` + exception.methodName + `
            \r\nUserId: ` + exception.userId + `
			\r\ElevatorId ` + exception.elevatorId + `
            \r\nIs Server: ` + exception.isServer + `
            \r\nCategory: ` + exception.category + `
            \r\nDetails: ` + exception.exceptionDetails + `
            \r\n`, function (err) {
                    if (err) throw err;
                });
        });

        //const stats = fs.statSync('./log/log.log')
        //console.log("Size of the file is ", stats.size);
    }
    catch (e) {
        console.log("Exception from logToFile: ", e.message)
    }
}

//log to local file system
var logToFileMessage = function (message) {
    try {
        var dirname = require('path').dirname;
        ////Write into file here     
        mkdirp(dirname("./log/log.log"), function (err) {
            fs.appendFile('./log/log.log', `
            \r\n************** Message: Date:(` + new Date() + `) ***************            
            \r\nMethodName: ` + message.methodName + `
            \r\nUserId: ` + message.userId + `
            \r\ElevatorId ` + message.elevatorId + `
            \r\nIs Server: ` + message.isServer + `
            \r\nCategory: ` + message.category + `
            \r\nDetails: ` + message.message + `
            \r\n`, function (err) {
                    if (err) throw err;
                });
        });

        //const stats = fs.statSync('./log/log.log')
        //console.log("Size of the file is ", stats.size);
    }
    catch (e) {
        console.log("Exception from logToFile: ", e.message)
    }
}

module.exports = logging();