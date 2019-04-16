//// File Name: logging.js
//// Description: This has the methods work with retrieve & logging exceptions
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/

var mkdirp = require('mkdirp');
var fs = require('fs');
var path = require('path');
var helperLogging = require('../helper/logging.js');
var dbLogging = require('../dataaccess_layer/logging.js');
var callMessage = require('../message/callMessage');

function logging() {
    return {
        logException: logException,
        logMessage: logMessage,
        logActivity: logActivity,
        logTwilioLogs: logTwilioLogs,
        getExceptionDetails: getExceptionDetails
    }
}

//Retrive the Exception details list based on the date
function getExceptionDetails(request, response) {
    try {
        ////Activity Logging here
        dbLogging.getExceptionDetails(request.body, function (res) {
            if (res) {
                response.send({ "status": true, data: res });
            }
            else {
                response.send({ "status": false, data: undefined });
            }
        });

    }
    catch (e) {
        //Exception logging here
        console.log(e);
    }
}

function logMessage(req, res) {
    var message = req.body;
    try {
        //Send to DB for logging
        message.message = (message.userDefined? message.message: callMessage[message.message]) + (message.extraDetails == null ? "": " " + message.extraDetails);
        helperLogging.logMessage(message, (result) => {
        });
    }
    catch (e) {
        console.log(e);
    }
    res.send({ "status": true, "message": "logged successfully" });
}

function logException(req, res) {
    var exception = req.body;
    try {
        //Send to DB for logging
        helperLogging.logException(exception, (result) => {
        });
    }
    catch (e) {
        console.log(e);
    }
    res.send({ "status": true, "message": "logged successfully" });
}

function logActivity(req, res) {
    var exception = req.body;
    try {
        //Send to DB for logging
        helperLogging.logException(exception, (result) => {
            console.log(result);
        })
    }
    catch (e) {
        console.log(e);
    }
    res.send({ "status": true, "message": "logged successfully" });
}

function logTwilioLogs(req, res) {
    var exception = req.body;
    try {
        helperLogging.logException(exception, (result) => {
            console.log(result);
        })
    }
    catch (e) {
        console.log(e);
    }
    res.send({ "status": true, "message": "logged successfully" });
}

module.exports = logging();