//// File Name: login.js
//// Description: This has the methods to log-in, change password, recover password & update user activity.
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
var messages = require('../message/loginMessage.js');

function dataAccessLogin() {
	return {
		getUserByUsernameAndPassword: getUserByUsernameAndPassword,
		changePassword: changePassword,
		recoverPassword: recoverPassword,
		getUserForRefresh: getUserForRefresh,
		updateUserActivity: updateUserActivity,
		validateUserByLink: validateUserByLink,
		getAllLanguages: getAllLanguages
	}
}

//existing user can change password after login
function changePassword(objChangePwd, callBack) {
	try {
		new sql.Request(db)
			.input('emailId', sql.VarChar(50), objChangePwd.emailId)
			.input('password', sql.VarChar(50), objChangePwd.oldPassword)
			.input('newPassword', sql.VarChar(50), objChangePwd.newPassword)
			.execute('spChangeUserPassword', (error, result) => {
				returnResults(error, result, objChangePwd.currentUserId, callBack, "changePassword", (error? messages.changePasswordError: messages.gotChangePasswordResult));
			});
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "changePassword", "exceptionDetails": exception.message, "userId": objChangePwd.currentUserId });
		returnError(exception.message, callBack);
	}
}

////This method is going to verify the password & userId sent was valid
//// If it's 
function validateUserByLink(objLogin, callBack) {
	try {
		new sql.Request(db)
			.input('userId', sql.Int, objLogin.userId)
			.input('password', sql.VarChar(50), objLogin.password)
			.input('hours', sql.Int, objLogin.hours)
			.execute('spValidAttemptsOfLink', (error, result) => {
				returnResults(error, result, objLogin.emailId, callBack, "validateUserByLink", "");
			});
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "validateUserByLink", "exceptionDetails": exception.message, "userId": objLogin.emailId });
		returnError(exception.message, callBack);
	}
}

//after refresh keep the data
function getUserForRefresh(userID, callBack) {
	try {
		new sql.Request(db)
			.input('userID', sql.Int, userID)
			.execute('spGetUserForRefresh', (error, result) => {
				returnResults(error, result, userID, callBack, "getUserForRefresh", "");
			});
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "getUserForRefresh", "exceptionDetails": exception.message, "userId": userID });
		returnError(exception.message, callBack);
	}
}

//find user is exist or not
function getUserByUsernameAndPassword(objLogin, callBack) {
	try {
		new sql.Request(db)
			.input('emailId', sql.VarChar(50), objLogin.emailId)
			.input('password', sql.VarChar(50), objLogin.password)
			.execute('spValidAttemptsOfLogin', (error, result) => {
				returnResults(error, result, objLogin.emailId, callBack, "getUserByUsernameAndPassword", "");
			});
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "getUserByUsernameAndPassword", "exceptionDetails": exception.message, "userId": objLogin.emailId });
		returnError(exception.message, callBack);
	}
}

//recover password of users by passing existing credentials
function recoverPassword(emailId, password, callBack) {
	try {
		new sql.Request(db)
			.input('emailId', sql.VarChar(50), emailId)
			.input('password', sql.VarChar(50), password)
			.execute('spRecoverPassword', (error, result) => {
				returnResult(error, result, emailId, callBack, "recoverPassword", "");
			});
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "recoverPassword", "exceptionDetails": exception.message, "userId": emailId });
		returnError(exception.message, callBack);
	}
}

//recover password of users by passing existing credentials
function updateUserActivity(objActivity, callBack) {
	try {
		console.log("Activity Insert: ", objActivity);
		new sql.Request(db)
			.input('userId', sql.Int, objActivity.userId)
			.input('activityId', sql.Int, objActivity.activityId)
			.input('alarmId', sql.NVarChar(100), objActivity.alarmId)
			.input('incidentId', sql.NVarChar(100), objActivity.incidentId)
			.execute('spUserActivityInsert', (error, result) => {
				returnResult(error, result, objActivity.userId, callBack);
			});
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "recoverPassword", "exceptionDetails": exception.message, "userId": emailId });
		returnError(exception.message, callBack);
	}
}

//existing user can change password after login
function getAllLanguages(userId, callBack) {
	try {
		new sql.Request(db)			
			.execute('spRetrieveAvailableLanguages', (error, result) => {
				returnResult(error, result, userId, callBack, "getAllLanguages", "");
			});
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "getAllLanguages", "exceptionDetails": exception.message, "userId": userId });
		returnError(exception.message, callBack);
	}
}

//common function to get results of above calling store procedure
function returnResults(err, result, userId, callBack, methodName, errorMsg) {
	if (err != null) {
		if(errorMsg) {
			helperLogging.logMessage({ "isServer": 1, "methodName": methodName, "message": errorMsg, "userId": userId }, (result) => {});
		}		
		helperLogging.logException({ "isServer": 1, "methodName": methodName, "exceptionDetails": err, "userId": userId }, (result) => {});
		callBack({status: false, err: err});
	}
	else {		
		result.recordset = [result.recordsets[0][0], result.recordsets[1], result.recordsets[2], result.recordsets[3], result.recordsets[4], result.recordsets[5]];
		callBack(result.recordset, result.recordsets[0][0]);
	}
}

//common function to get result of above calling store procedure
function returnResult(err, result, userId, callBack, methodName, errorMsg) {
	if (err != null) {
		if(errorMsg) {
			helperLogging.logMessage({ "isServer": 1, "methodName": methodName, "message": errorMsg, "userId": userId }, (result) => {});
		}
		helperLogging.logException({ "isServer": 1, "methodName": "returnResult", "exceptionDetails": err, "userId": userId }, (result) => {});
		callBack({status: false, err: err});
	}
	else {
		callBack(result.recordset);
	}
}

//common function for returning error of above functions
function returnError(err, callBack) {
	callBack(err);
}

module.exports = dataAccessLogin();