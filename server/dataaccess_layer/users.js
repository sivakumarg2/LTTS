//// File Name: users.js
//// Description: This has the methods to manage user management.
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/

'use strict';
const sql = require('mssql');
var db = require("./db");
var helperLogging = require("../helper/logging");

function dataAccessUser() {
    return {
        getUsers: getUsers,
        getUserIdByEmailId: getUserIdByEmailId,
        addUser: addUser,
        updateUserPreferences: updateUserPreferences,
        updateUser: updateUser,
        updateUserBySId: updateUserBySId,
        updateLanguage: updateLanguage,
        deleteUser: deleteUser,
        getWorkersReport: getWorkersReport,
        getWorkerReport: getWorkerReport,
        getWorkersReportForSupervisor: getWorkersReportForSupervisor,
        getWorkersReportDetailsForSupervisor: getWorkersReportDetailsForSupervisor,
        getWorkersCallActivity: getWorkersCallActivity,
        getAgentsReport: getAgentsReport
    }
}

//Return the user details by email id
function getUserIdByEmailId(userEmailId, currentUserId, CallBack) {
    try {
        new sql.Request(db)
            .input('emailId', sql.VarChar(100), userEmailId)
            .execute('spRetrieveUserByEmailId', (error, result) => {
                returnResult(error, result, currentUserId, CallBack);
            });
    }
    catch (exception) {
        helperLogging.logException({ "isServer": 1, "methodName": "getUserIdByEmailId", "exceptionDetails": exception.message, "userId": currentUserId });
        returnError(exception.message, CallBack);
    }
}


// Returns the User list on Country Id
function getUsers(objUser, callBack) {
    try {
        new sql.Request(db)
            .input('countryId', sql.Int, objUser.countryId)
            .execute('spRetrieveUserByCountryId', (error, result) => {
                returnResult(error, result, objUser.currentUserId, callBack);
            });
    }
    catch (exception) {
        helperLogging.logException({ "isServer": 1, "methodName": "getUsers", "exceptionDetails": exception.message, "userId": objUser.currentUserId });
        returnError(exception.message, callBack);
    }
}

//Creating the new User 
function addUser(objUser, callBack) {
    try {
        new sql.Request(db)
            .input('name', sql.VarChar(50), objUser.name)
            .input('emailId', sql.VarChar(50), objUser.emailId)
            .input('password', sql.VarChar(50), objUser.password)
            .input('sId', sql.VarChar(100), objUser.sId)
            .input('video', sql.Bit, objUser.video)
            .input('userStatusId', sql.Int, objUser.userStatusId)
            .input('countryId', sql.Int, objUser.countryId)
            .input('shiftType', sql.VarChar(50), objUser.shiftType)
            .input('callType', sql.VarChar(50), objUser.callType)
            .input('roleId', sql.Int, objUser.roleId)
            .input('languageId', sql.Int, objUser.languageId)
            .input('languageSkillsId', sql.VarChar(100), objUser.languageSkillsId)
            .input('createdBy', sql.Int, objUser.createdBy)
            .execute('spInsertUser', (error, result) => {
                returnResult(error, result, objUser.currentUserId, callBack);
            });
    }
    catch (exception) {
        helperLogging.logException({ "isServer": 1, "methodName": "addUser", "exceptionDetails": exception.message, "userId": objUser.currentUserId });
        returnError(exception.message, callBack);
    }
}

//Update user preferences
function updateUserPreferences(objUser, callBack) {
    try {
        new sql.Request(db)
            .input('userId', sql.Int, objUser.userID)
            .input('video', sql.VarChar(100), objUser.video)
            .execute('spUpdateUserPreferences', (error, result) => {
                returnResult(error, result, objUser.currentUserId, callBack);
            });
    }
    catch (exception) {
        helperLogging.logException({ "isServer": 1, "methodName": "updateUserBySId", "exceptionDetails": exception.message, "userId": objUser.currentUserId });
        returnError(exception.message, callBack);
    }
}

//Update the User by SID only
function updateUserBySId(objUser, callBack) {
    try {
        new sql.Request(db)
            .input('userId', sql.Int, objUser.userID)
            .input('sId', sql.VarChar(100), objUser.sId)
            .execute('spUpdateUserBySId', (error, result) => {
                returnResult(error, result, objUser.currentUserId, callBack);
            });
    }
    catch (exception) {
        helperLogging.logException({ "isServer": 1, "methodName": "updateUserBySId", "exceptionDetails": exception.message, "userId": objUser.currentUserId });
        returnError(exception.message, callBack);
    }
}

//Update the user by all  the existing details
function updateUser(objUser, callBack) {
    try {
        new sql.Request(db)
            .input('userId', sql.Int, objUser.userID)
            .input('name', sql.VarChar(50), objUser.name)
            .input('userStatusId', sql.Int, objUser.userStatusId)
            .input('countryId', sql.Int, objUser.countryId)
            .input('roleId', sql.Int, objUser.roleId)
            .input('callType', sql.VarChar(50), objUser.callType)
            .input('video', sql.Bit, objUser.video)
			.input('languageId', sql.Int, objUser.languageId)
            .input('languageSkillsId', sql.VarChar(100), objUser.languageSkillsId)
            .input('shiftType', sql.VarChar(50), objUser.shiftType)
            .input('emailId', sql.VarChar(50), objUser.emailId)
            .input('password', sql.VarChar(50), objUser.password)
            .input('isLocked', sql.NVarChar(10), objUser.isLocked)
            .execute('spUpdateUser', (error, result) => {
                returnResult(error, result, objUser.currentUserId, callBack);
            });
    }
    catch (exception) {
        helperLogging.logException({ "isServer": 1, "methodName": "updateUser", "exceptionDetails": exception.message, "userId": objUser.currentUserId });
        returnError(exception.message, callBack);
    }
}

//Creating the new User 
function updateLanguage(objUser, callback) {
    try {
        new sql.Request(db)
            .input('userId', sql.VarChar(50), objUser.userId)
            .input('shortName', sql.VarChar(5), objUser.shortName)
            .execute('spUpdateLanguage', (error, result) => {
                returnResult(error, result, objUser.currentUserId, callback);
            });

    }
    catch (exception) {
        helperLogging.logException({ "isServer": 1, "methodName": "updateLanguage", "exceptionDetails": exception.message, "userId": objUser.currentUserId });
        returnError(exception.message, callBack);
    }
}

//Delete the User by user id
function deleteUser(objUser, callBack) {
    try {
        new sql.Request(db)
            .input('userId', sql.Int, objUser.userId)
            .execute('spDeleteUser', (error, result) => {
                returnResult(error, result, objUser.currentUserId, callBack);
            });

    }
    catch (exception) {
        helperLogging.logException({ "isServer": 1, "methodName": "deleteUser", "exceptionDetails": exception.message, "userId": objUser.currentUserId });
        returnError(exception.message, callBack);
    }
}

//get all workers of selected country with in date
function getWorkersReport(objWorkers, callBack) {
    try {
        new sql.Request(db)
            .input('countryId', sql.Int, objWorkers.countryId)
            .input('dateFrom', sql.NVarChar(100), objWorkers.dateFrom)
            .input('dateTo', sql.NVarChar(100), objWorkers.dateTo)
            .execute('spRetrieveAgentForReport', (error, result) => {
                returnResult(error, result, objWorkers.currentUserId, callBack);
            });
    }
    catch (exception) {
        helperLogging.logException({ "isServer": 1, "methodName": "getWorkersReport", "exceptionDetails": exception.message, "userId": objWorkers.currentUserId });
        returnError(exception.message, callBack);
    }
}

//get all Agents report for supervisor & date
function getAgentsReport(objFilter, callBack) {
    try {
        new sql.Request(db)
            .input('countryId', sql.Int, objFilter.countryId)
            .input('dateFrom', sql.NVarChar(100), objFilter.dateFrom)
            .input('dateTo', sql.NVarChar(100), objFilter.dateTo)
            .execute('spAgentReportForSupervisor', (error, result) => {
                returnResult(error, result, objFilter.currentUserId, callBack);
            });
    }
    catch (exception) {
        helperLogging.logException({ "isServer": 1, "methodName": "getWorkersReportForSupervisor", "exceptionDetails": exception.message, "userId": objFilter.currentUserId });
        returnError(exception.message, callBack);
    }
}

//get all workers of selected country with in date
function getWorkersReportForSupervisor(objWorkers, callBack) {
    try {
        new sql.Request(db)
            .input('countryId', sql.Int, objWorkers.countryId)
            .input('dateFrom', sql.NVarChar(100), objWorkers.dateFrom)
            .input('dateTo', sql.NVarChar(100), objWorkers.dateTo)
            .execute('spUserActivityRetrieveForSupervisor', (error, result) => {
                returnResult(error, result, objWorkers.currentUserId, callBack);
            });
    }
    catch (exception) {
        helperLogging.logException({ "isServer": 1, "methodName": "getWorkersReportForSupervisor", "exceptionDetails": exception.message, "userId": objWorkers.currentUserId });
        returnError(exception.message, callBack);
    }
}

//get all workers of selected country with in date
function getWorkersReportDetailsForSupervisor(objWorkers, callBack) {
    try {
        new sql.Request(db)
            .input('userId', sql.Int, objWorkers.userId)
            .input('dateFrom', sql.NVarChar(100), objWorkers.dateFrom)
            .input('dateTo', sql.NVarChar(100), objWorkers.dateTo)
            .execute('spUserActivityRetrieveForSupDetails', (error, result) => {
                returnResult(error, result, objWorkers.currentUserId, callBack);
            });
    }
    catch (exception) {
        helperLogging.logException({ "isServer": 1, "methodName": "getWorkersReportDetailsForSupervisor", "exceptionDetails": exception.message, "userId": objWorkers.currentUserId });
        returnError(exception.message, callBack);
    }
}

//get all workers of selected country with in date
function getWorkersCallActivity(objWorkers, callBack) {
    try {
        new sql.Request(db)
            .input('alarmId', sql.NVarChar(100), objWorkers.alarmId)
            .input('incidentId', sql.NVarChar(100), objWorkers.incidentId)
            .execute('spRetrieveUserActivityByAlarmId', (error, result) => {
                returnResult(error, result, objWorkers.currentUserId, callBack);
            });
    }
    catch (exception) {
        helperLogging.logException({ "isServer": 1, "methodName": "getWorkersCallActivity", "exceptionDetails": exception.message, "userId": objWorkers.currentUserId });
        returnError(exception.message, callBack);
    }
}

//get worker report from db
function getWorkerReport(objWorker, callBack) {
    try {
        new sql.Request(db)
            .input('sId', sql.NVarChar(100), objWorker.workerSid)
            .input('userId', sql.NVarChar(100), objWorker.currentUserId)
            .input('dateFrom', sql.NVarChar(100), objWorker.dateFrom)
            .input('dateTo', sql.NVarChar(100), objWorker.dateTo)
            .execute('spRetrieveOutgoingCalls', (error, result) => {
                returnResult(error, result, objWorker.currentUserId, callBack);
            });
    }
    catch (exception) {
        helperLogging.logException({ "isServer": 1, "methodName": "getWorkerReport", "exceptionDetails": exception.message, "userId": objWorkers.currentUserId });
        returnError(exception.message, callBack);
    }
}

function retrieveSetting(setting, callBack) {
	try {
		new sql.Request(db)
			.input('setting', sql.NVarChar(100), setting)
			.execute('spRetrieveSetting', (error, result) => {
				returnResultSettings(error, result, callBack);
			});
	}
	catch (e) {
		//Exception logging here
	}
}

function saveSetting(setting, callBack) {
	try {
		console.log("Saving setting: ", setting)
		new sql.Request(db)
			.input('value', sql.NVarChar(100), setting.value)
			.input('setting', sql.NVarChar(100), setting.setting)
			.execute('spInsertSettings', (error, result) => {
				returnResultSettings(error, result, callBack);
			});
	}
	catch (e) {
	}
}

//common function to get results of above calling store procedure
function returnResultSettings(err, result, callBack) {
	if (err == null) {
		var res = {"status": true, data: result};
		if (callBack) {
			callBack(res);
		}
	}
	else {
		console.log("Error: ", err)
		var res = {"status": false, data: result};
		if (callBack) {
			callBack(res);
		}
	}
}

//common function to return results of each store procedure
function returnResult(err, result, currentUserId, callBack) {
    if (err != null) {
        //// Log to file system and log it to database, check the issue because of not database
        helperLogging.logException({ "isServer": 1, "methodName": "returnResult", "exceptionDetails": err, "userId": currentUserId });
        callBack(err);
    }
    else {
        callBack(result);
    }
}

//common function for returning error of above functions
function returnError(err, callBack) {
    callBack(err);
}

module.exports = dataAccessUser();