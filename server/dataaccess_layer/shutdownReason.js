//// File Name: shutdownReason.js
//// Description: This has the methods to manage shutdown master & translation data.
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/

'use strict';
var helperLogging = require('../helper/logging.js');
var db = require("./db");
const sql = require('mssql');

function shutdownReason() {
	return {
		insertShutdownReason: insertShutdownReason,
		retrieveShutdownReason: retrieveShutdownReason,
		deleteShutdownReason: deleteShutdownReason,
		retrieveCountryShutdownReason: retrieveCountryShutdownReason,
		deleteCountryShutdownReason: deleteCountryShutdownReason,
		saveCountryShutdownReason: saveCountryShutdownReason
	}
}

//Insert Shutdown Reason
function insertShutdownReason(objShutReason, callBack) {
	try {
		console.log(objShutReason);
		new sql.Request(db)
			.input('code', sql.VarChar(100), objShutReason.code)
			.input('shutdownReason', sql.VarChar(100), objShutReason.shutdownReason)
			.input('isAdmin', sql.VarChar(100), 1)
			.input('userId', sql.VarChar(100), objShutReason.currentUserId)
			.input('shutdownReasonId', sql.Int, objShutReason.shutdownReasonId)
			.execute('spInsertShutdownReason', (error, result) => {
				returnResult(error, result, objShutReason.currentUserId, callBack);
			});
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "insertShutdownReason", "exceptionDetails": exception.message, "userId": objShutReason.currentUserId });
		returnError(exception.message, callBack);
	}
}

//Retrieve Shutdown Reason
function retrieveShutdownReason(objShutReason, callBack) {
	try {
		new sql.Request(db)
			.execute('spRetrieveShutdownReason', (error, result) => {
				returnResult(error, result, objShutReason.currentUserId, callBack);
			});
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "retrieveShutdownReason", "exceptionDetails": exception.message, "userId": objShutReason.currentUserId });
		returnError(exception.message, callBack);
	}
}

//Delete Shutdown Reason
function deleteShutdownReason(objShutReason, callBack) {
	try {
		new sql.Request(db)
			.input('shutdownReasonId', sql.Int, objShutReason.shutdownReasonId)
			.execute('spDeleteShutdownReason', (error, result) => {
				returnResult(error, result, objShutReason.currentUserId, callBack);
			});
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "deleteShutdownReason", "exceptionDetails": exception.message, "userId": objShutReason.currentUserId });
		returnError(exception.message, callBack);
	}
}

//Get Country Shutdown Reason
function retrieveCountryShutdownReason(objCountShutReason, callBack) {
	try {
		console.log("Gettting Country Shutdown Reason: ", objCountShutReason);
		new sql.Request(db)
			.input('countryId', sql.Int, objCountShutReason.countryConfigurationId)
			.input('languageId', sql.Int, objCountShutReason.languageId)
			.execute('spRetrieveCountryShutdownReason', (error, result) => {
				returnResult(error, result, objCountShutReason.currentUserId, callBack);
			});
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "retrieveCountryShutdownReason", "exceptionDetails": exception.message, "userId": objCountShutReason.currentUserId });
		returnError(exception.message, callBack);
	}
}

//Delete Country Shutdown Reason
function deleteCountryShutdownReason(objCountShutReason, callBack) {
	try {
		var shutdownReasonId = parseInt(objCountShutReason.shutdownReasonId)
		new sql.Request(db)
			.input('shutdownReasonId', sql.Int, shutdownReasonId)
			.execute('spDeleteCountryShutdownReason', (error, result) => {
				returnResult(error, result, objCountShutReason.currentUserId, callBack);
			});
		console.log("Successfully deleted")
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "deleteCountryShutdownReason", "exceptionDetails": exception.message, "userId": objCountShutReason.currentUserId });
		returnError(exception.message, callBack);
	}
}

//Save Country Shutdown Reason
function saveCountryShutdownReason(objCountShutReason, callBack) {
	try {
		new sql.Request(db)
			.input('shutdownReasonId', sql.Int, objCountShutReason.shutdownReasonId)
			.input('shutdownReason', sql.NVarChar(250), objCountShutReason.translation)
			.input('code', sql.NVarChar(100), objCountShutReason.code)
			.input('countryConfigurationId', sql.Int, objCountShutReason.countryConfigurationId)
			.input('userId', sql.Int, objCountShutReason.userId)
			.input('languageId', sql.Int, objCountShutReason.languageId)
			.execute('spSaveCountryShutdownReason', (error, result) => {
				console.log(error);
				returnResult(error, result, objCountShutReason.currentUserId, callBack);
			});
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "saveCountryShutdownReason", "exceptionDetails": exception.message, "userId": objCountShutReason.currentUserId });
		returnError(exception.message, callBack);
	}
}

//common function to get results of above calling store procedure
function returnResult(err, result, userId, callBack) {
	if (err != null) {
		callBack({ "status": false });
		helperLogging.logException({ "isServer": 1, "methodName": "returnResult", "exceptionDetails": err, "userId": userId }, (result) => {
		})
	}
	else {
		callBack(result);
	}
}

//common function for returning error of above functions
function returnError(err, callBack) {
	callBack(err);
}

module.exports = shutdownReason();
