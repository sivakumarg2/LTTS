//// File Name: logging.js
//// Description: This has the methods to log the message, exception & activities
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
'use strict';
const fs = require('fs');
const sql = require('mssql');
var db = require("./db");

function dbLogging() {
	return {
		activityLogging: activityLogging,
		exceptionLogging: exceptionLogging,
		messageLogging: messageLogging,
		getExceptionDetails: getExceptionDetails,
		deleteExpiredLogs: deleteExpiredLogs
	}
}

function getExceptionDetails(loggingFilter, callBack) {
	try {
		new sql.Request(db)
			.input('FromDate', sql.NVarChar(100), loggingFilter.fromServerDate == '' ? null : loggingFilter.fromServerDate)
			.input('ToDate', sql.NVarChar(100), loggingFilter.toServerDate == '' ? null : loggingFilter.toServerDate)
			.input('EmailId', sql.NVarChar(50), loggingFilter.emailId == '' ? null : loggingFilter.emailId)
			.input('ElevatorUnitId', sql.NVarChar(50), loggingFilter.elevatorUnitId == '' ? null : loggingFilter.elevatorUnitId)
			.input('methodName', sql.NVarChar(100), loggingFilter.methodName == '' ? null : loggingFilter.methodName)
			.input('alarmId', sql.NVarChar(100), loggingFilter.alarmId == ''? null: loggingFilter.alarmId)
			.execute('spRetrieveExceptionDetails', (error, result) => {
				returnResult(error, result, callBack);
			});
	}
	catch (e) {
		//Exception logging here
	}
}

//activityLogging in each corner of app using below function
function activityLogging(activity, callBack) {
	try {
		new sql.Request(db)
			.input('ActivityName', sql.VarChar(50), activity.activityname)
			.input('UserID', sql.NVarChar(100), activity.userId)
			.input('elevatorID', sql.NVarChar(50), activity.elevatorId)
			.input('alarmId', sql.NVarChar(100), activity.alarmId == ''? null: activity.alarmId)
			.execute('spInsertActivityLog', (error, result) => {
				returnResult(error, result, callBack);
			});
	}
	catch (e) {
	}
}

//Message Logging from the path we go
function messageLogging(message, callBack) {
	try {
		//console.log("Message Logging: ", message);
		new sql.Request(db)
			.input('MethodName', sql.NVarChar(50), message.methodName)
			.input('MessageDetails', sql.NVarChar(2000), message.message)
			.input('ElevatorId', sql.NVarChar(20), message.elevatorId)
			.input('IsServer', sql.Int, message.isServer)
			.input('UserId', sql.NVarChar(100), message.userId)
			.input('alarmId', sql.NVarChar(100), message.alarmId == ''? null: message.alarmId)
			.execute('spInsertMessageLog', (error, result) => {
				returnResult(error, result, callBack);
			});
	}
	catch (e) {
	}
}

//exceptionLogging in each corner of app using below function
function exceptionLogging(exception, callBack) {
	try {
		//console.log("Exception Logging: ", exception);
		new sql.Request(db)
			.input('MethodName', sql.VarChar(50), exception.methodName)
			.input('ExceptionDetails', sql.VarChar(2000), exception.exceptionDetails)
			.input('IsServer', sql.Int, exception.isServer)
			.input('UserId', sql.NVarChar(100), exception.userId)
			.input('ElevatorId', sql.NVarChar(20), exception.elevatorId)
			.input('alarmId', sql.NVarChar(100), exception.alarmId == ''? null: exception.alarmId)
			.execute('spInsertExceptionLog', (error, result) => {
				returnResult(error, result, callBack);
			});
	}
	catch (e) {
	}
}

//To delete expired logs
function deleteExpiredLogs(period, callBack) {
	try {
		new sql.Request(db)
			.input('period', sql.Int, period)
			.execute('spDeleteAllLogs', (error, result) => {
				returnResult(error, result, callBack);
			});
	}
	catch (e) {
	}
}

//common function to get results of above calling store procedure
function returnResult(err, result, callBack) {
	if (err == null) {
		if (callBack) {
			callBack(result);
		}
	}
	else {
		callBack({status: false, err: err});
	}
}

module.exports = dbLogging();