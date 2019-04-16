//// File Name: troubleshoot.js
//// Description: This has the methods to work with troubleshoot
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/

'use strict';

var dbTroubleshoot = require('../dataaccess_layer/troubleshoot.js');
var helperLogging = require('../helper/logging.js');
var twilioInterface = require('../twilio_interface/twilioInterface.js');
var crypto = require('../helper/cryptohelper.js');
var tokenHandler = require('../helper/tokenHandler.js');
var fs = require('fs');

function businessTroubleshoot() {
    return {
        getExceptionDetails: getExceptionDetails
    }
}

//Retrive the Exception details list based on the date
function getExceptionDetails(request, response) {
    try {
        var objException = {
            'objData':request.body,
            'currentUserId':request.get('userId') 
        }
        ////Activity Logging here
        logActivity("getExceptionDetails", request.get('userId'), request.get('elevatorID'));
        dbTroubleshoot.getExceptionDetails(objException,function (res) {
           if (res) {
                response.send({ "status": true, data: res });
            }
            else {
                response.send({ "status": false, data: undefined });
            }
        });
       
    }
    catch (exception) {
        //Exception logging here
        logException("getExceptionDetails", exception.message, objWorkers.currentUserId);
    }
}

var logActivity = function (activityName, userId, elevatorId) {
	helperLogging.logActivity({ "activityname": activityName, "userId": userId, "elevatorId": elevatorId });
}
var logException = function (methodName, exceptionDetails, userId = '') {
	helperLogging.logException({ "isServer": 1, "methodName": methodName, "exceptionDetails": exceptionDetails, "userId": userId });
}

module.exports = businessTroubleshoot();