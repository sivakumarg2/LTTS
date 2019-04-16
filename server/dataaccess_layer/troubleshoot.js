//// File Name: troubleshoot.js
//// Description: This has the methods to manage troubleshoot functionalities.
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/

'use strict';
var fs = require('fs');
const sql = require('mssql');
var db = require("./db");
var helperLogging = require('../helper/logging.js');

function dataAccessTroubleshoot() {
    return {
        getExceptionDetails: getExceptionDetails
    }
}

// Returns the User list on Country Id
function getExceptionDetails(objTroubleshoot, callBack) {
    try {
        new sql.Request(db)
            .input('FromDate', sql.VarChar(50), objTroubleshoot.objData.fromDate)
            .input('ToDate', sql.VarChar(50), objTroubleshoot.objData.toDate)
            .input('EmailId', sql.VarChar(50), objTroubleshoot.objData.emailId)
            .input('ElevatorUnitId', sql.VarChar(50), objTroubleshoot.objDataelevatorUnitId)
            .input('IncidentId', sql.Int, objTroubleshoot.objData.incidentId)
            .execute('spRetrieveExceptionDetails', (error, result) => {
                returnResult(error, result, objTroubleshoot.currentUserId, callBack);
            });
    }
    catch (exception) {
        //Exception logging here
        helperLogging.logException({ "isServer": 1, "methodName": "getExceptionDetails", "exceptionDetails": exception.message, "userId": objTroubleshoot.currentUserI });
    }
}

//common function to get results of above calling store procedure
function returnResult(err, result, currentUserId, callBack) {
    if (err != null) {
        //// Log to file system and log it to database, check the issue because of not database
        //Exception logging here
        helperLogging.logException({ "isServer": 1, "methodName": "returnResult", "exceptionDetails": err, "userId": currentUserId });
    }
    else {
        callBack(result);
    }
}

module.exports = dataAccessTroubleshoot();