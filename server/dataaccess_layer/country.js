//// File Name: cacountry.js
//// Description: This has the methods to handle all the functionalities related to country configuration.
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

function dataAccessCountry() {
    return {
        getAllCountryConfigDetails: getAllCountryConfigDetails,
        getAllCountryConfigDetailsForTwilio: getAllCountryConfigDetailsForTwilio,
        addCountryConfiguration: addCountryConfiguration,
        deleteCountryConfigurationById: deleteCountryConfigurationById
    }
}

// Returns the User list on Country Id
function getAllCountryConfigDetails(currentUserId, callBack) {
    try {
        new sql.Request(db)
            .input('userId', sql.Int, currentUserId)
            .execute('spRetrieveCountryConfigByCountryId', (error, result) => {
                returnResult(error, sql, result, currentUserId, callBack);
            });
    }
    catch (exception) {
        helperLogging.logException({ "isServer": 1, "methodName": "getAllCountryConfigDetails", "exceptionDetails": exception.message, "userId": currentUserId });
    }
}

// Returns the User list on Country Id
function getAllCountryConfigDetailsForTwilio(currentUserId, callBack) {
    try {
        new sql.Request(db)
            .execute('spRetrieveAllCountryConfig', (error, result) => {
                returnResult(error, sql, result, currentUserId, callBack);
            });
    }
    catch (exception) {
        helperLogging.logException({ "isServer": 1, "methodName": "getAllCountryConfigDetailsForTwilio", "exceptionDetails": exception.message, "userId": currentUserId });
    }
}

//Creating the new User 
function addCountryConfiguration(objCountry, callBack) {
    try {
        console.log("Country Settings: ", objCountry)
        var xml = '<numbers>';
        for (var i = 0; i < objCountry.countryRedirectionNo.length; i++) {
            xml += '<number><value>' + objCountry.countryRedirectionNo[i] + '</value></number>';
        }
        xml += '</numbers>';        
        new sql.Request(db)
            .input('countryId', sql.Int, objCountry.countryId)
            .input('cultureCode', sql.NVarChar(10), objCountry.cultureSetting)
            .input('dateFormat', sql.NVarChar(10), objCountry.dateFormat)            
            .input('callTimeOut', sql.VarChar(50), objCountry.countryCallTimeout)
            .input('userId', sql.Int, objCountry.currentUserId)
            .input('data', sql.NVarChar(2000), JSON.stringify(xml))
            .input('sid', sql.NVarChar(2000), objCountry.sid)
            .input('recordVideo', sql.VarChar(10), objCountry.recordVideo)
            .input('enableDataTracks', sql.NVarChar(5), objCountry.enableDataTracks)
            .input('enableCallDispo', sql.NVarChar(5), objCountry.enableCallDispo)
            .input('mediaRegion', sql.NVarChar(5), objCountry.mediaRegion)
            .input('recordAudio', sql.VarChar(10), objCountry.recordAudio)
            .input('days', sql.Int, objCountry.dataRetentionPeriod)
            .input('countryConfigurationId',sql.Int,objCountry.countryConfigurationId)
            .execute('spInsertCountryConfig', (error, result) => {
                returnResult(error, sql, result, objCountry.currentUserId, callBack);
            });
    }
    catch (exception) {
        returnResult(exception, null, null, null, callBack);
        helperLogging.logException({ "isServer": 1, "methodName": "addCountryConfiguration", "exceptionDetails": exception.message, "userId": objCountry.currentUserId });
    }
}

//Delete the User 
function deleteCountryConfigurationById(objCountryConfigurationId, callBack) {
    try {
        new sql.Request(db)
            .input('sid', sql.VarChar(100), objCountryConfigurationId.configurationId)
            .execute('spDeleteCountryConfigById', (error, result) => {
                returnResult(error, sql, result, objCountryConfigurationId.currentUserId, callBack);
            });
    }
    catch (exception) {
        helperLogging.logException({ "isServer": 1, "methodName": "deleteCountryConfigurationById", "exceptionDetails": exception.message, "userId": objCountryConfigurationId.currentUserId });
    }
}

//common function to get results of above calling store procedure
function returnResult(err, sqlReq, result, userId, callBack) {
    if (err != null) {
        // Log to file system and log it to database, check the issue because of not database
        helperLogging.logException({ "isServer": 1, "methodName": "returnResult", "exceptionDetails": err, "userId": userId });
    }
    else {
        callBack(result);
    }
}

module.exports = dataAccessCountry();