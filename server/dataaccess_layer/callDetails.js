//// File Name: callDetails.js
//// Description: This has the methods to work with all the call related functionalities.
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

function dataAccessCallDetails() {
	return {
		insertCallDetails: insertCallDetails,
		updateCallDetails: updateCallDetails,
		getCallSummaryByUserId: getCallSummaryByUserId,
		getCallSummaryByUserIdExport: getCallSummaryByUserIdExport,
		updateCall: updateCall,
		retrieveCallDetailsForCountry: retrieveCallDetailsForCountry,
		retrieveCallDetailsForIncident: retrieveCallDetailsForIncident,
		retrieveCallDetailsByElevatorId: retrieveCallDetailsByElevatorId,
		retrieveCallDetailsForElevator: retrieveCallDetailsForElevator,
		saveCallDisposition: saveCallDisposition,
		updateCallDisposition: updateCallDisposition,
		insertChatMsgDetails: insertChatMsgDetails,
		insertCallDispstnDetails: insertCallDispstnDetails,
		retrieveCallDispstnDetails: retrieveCallDispstnDetails,
		deleteCallDispstnDetails: deleteCallDispstnDetails,
		loadCopyDisposition: loadCopyDisposition,
		addCountryDisposition: addCountryDisposition,
		saveCallDispositionData: saveCallDispositionData,
		deleteCallDispositionData: deleteCallDispositionData,
		retrieveCallDispositionData: retrieveCallDispositionData,
		getCallDetail: getCallDetail,
		saveAudioVideoAgent: saveAudioVideoAgent,
		retriveAudioVideoData: retriveAudioVideoData,
		saveVideoIntervals: saveVideoIntervals,
		getAlarmIDByElevatorId: getAlarmIDByElevatorId
	}
}

//insert call detail when user get call from elevator 
function insertCallDetails(objCalls, callBack) {
	try {
		new sql.Request(db)
			.input('alarmId', sql.NVarChar(100), objCalls.alarmId)
			.input('userId', sql.Int, objCalls.userId)
			.input('elevatorID', sql.VarChar(100), objCalls.elevator_id)
			.input('countryId', sql.Int, objCalls.countryId)
			.input('floor', sql.Int, objCalls.floor == "" ? null : objCalls.floor)
			.input('direction', sql.VarChar(10), objCalls.direction)
			.input('failure', sql.VarChar(150), objCalls.failure)
			.input('initiator', sql.VarChar(150), objCalls.initiator)
			.input('taskSid', sql.NVarChar(200), objCalls.taskSid)
			.input('taskCreatedOn', sql.NVarChar(200), objCalls.taskCreatedOn)
			.input('uniqueId', sql.NVarChar(100), objCalls.uniqueId)
			.execute('spInserCallIncidents', (error, result) => {
				helperLogging.logMessage({ "isServer": 1, "methodName": "insertCallDetails:db", "message": "SP call success: Any Error?: " + (error!= null? "true": "false") , "userId": objCalls.currentUserId, "elevatorId": objCalls.elevator_id });
				returnResult(error, result, objCalls.currentUserId, callBack, objCalls.sender, objCalls.elevator_id);
			});
	}
	catch (exception) {
		console.log("Exception is: ", exception)
		helperLogging.logException({ "isServer": 1, "methodName": "insertCallDetails", "exceptionDetails": exception.message, "userId": objCalls.currentUserId, "elevatorId": objCalls.elevator_id });
		returnError(exception.message, callBack);
	}
}

//update the call details
function updateCallDetails(objCalls, callBack) {
	try {
		new sql.Request(db)
			.input('callIncidentId', sql.Int, objCalls.callIncidentId)
			.input('controllerType', sql.VarChar(100), objCalls.controllerType)
			.input('buildingName', sql.VarChar(200), objCalls.buildingName)
			.input('buildingAddress', sql.VarChar(200), objCalls.buildingAddress)
			.input('contractInformation', sql.VarChar(200), objCalls.contractInformation)
			.input('contractStatus', sql.VarChar(200), objCalls.contractStatus)
			.input('customerName', sql.VarChar(200), objCalls.customerName)
			.input('otisBranch', sql.VarChar(150), objCalls.otisBranch)
			.input('commissioningMode', sql.VarChar(100), objCalls.commissioningMode)
			.execute('spUpdateCallIncidents', (error, result) => {
				helperLogging.logMessage({ "isServer": 1, "methodName": "updateCallDetails:db", "message": "SP call success: Any Error?: " + (error!= null? "true": "false") , "userId": objCalls.currentUserId, "elevatorId": objCalls.elevator_id });
				returnResult(error, result, objCalls.currentUserId, callBack);
			});
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "updateCallDetails", "exceptionDetails": exception.message, "userId": objCalls.currentUserId });
		returnError(exception.message, callBack);
	}
}

//get call details of particular user by userId
function getCallSummaryByUserId(objCountry, callBack) {
	try {
		new sql.Request(db)
			.input('userId', sql.Int, objCountry.currentUserId)
			.input('FromDate', sql.NVarChar(100), objCountry.fromdate)
			.input('ToDate', sql.NVarChar(100), objCountry.toDate)
			.execute('spRetrieveCallIncidents', (error, result) => {
				returnResult(error, result, objCountry.currentUserId, callBack);
			});
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "getCallSummaryByUserId", "exceptionDetails": exception.message, "userId": objCountry.currentUserId });
		returnError(exception.message, callBack);
	}
}

//load call disposition and copy from one country to another
function loadCopyDisposition(objRetrieve, callBack) {
	try {
		new sql.Request(db)
			.input('countryConfigId', sql.Int, objRetrieve.configId)
			.execute('spRetrieveSingleCountryConfigByCountryId', (error, result) => {
				returnResult(error, result, objRetrieve.currentUserId, callBack);
			});
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "loadCopyDisposition", "exceptionDetails": exception.message, "userId": objCountry.currentUserId });
		returnError(exception.message, callBack);
	}
}

//country disposition will get add to db
function addCountryDisposition(objDispo, callBack) {
	try {
		var callDispostnXML = '<calls>';
		for (var i = 0; i < objDispo.callDispositions.length; i++) {
			callDispostnXML += '<call><code>' + objDispo.callDispositions[i].code + '</code><text>' + objDispo.callDispositions[i].callDisposition + '</text></call>';
		}
		callDispostnXML += '</calls>';

		new sql.Request(db)
			.input('countryConfigId', sql.Int, objDispo.countryConfigurationId)
			.input('userId', sql.Int, objDispo.userId)
			.input('callDispositionData', sql.NVarChar(2000), JSON.stringify(callDispostnXML))
			.execute('spInsertCountryDispo', (error, result) => {
				returnResult(error, result, objDispo.currentUserId, callBack);
			});
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "addCountryDisposition", "exceptionDetails": exception.message, "userId": objDispo.currentUserId });
		returnError(exception.message, callBack);
	}
}

//export the call summary of particular country through userid
function getCallSummaryByUserIdExport(objCountry, callBack) {
	try {
		new sql.Request(db)
			.input('userId', sql.Int, objCountry.userId)
			.execute('spRetrieveCallIncidentsForExport', (error, result) => {
				returnResult(error, result, objCountry.currentUserId, callBack);
			});
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "getCallSummaryByUserIdExport", "exceptionDetails": exception.message, "userId": objCountry.currentUserId });
		returnError(exception.message, callBack);
	}
}

//update the call details by calldetailId
function updateCall(objCalls, callBack) {
	try {
		console.log("Update Call details working....", objCalls)
		new sql.Request(db)
			.input('incidentId', sql.Int, objCalls.incidentId)
			.input('uniqueId', sql.NVarChar(100), objCalls.uniqueId)
			.input('alarmId', sql.NVarChar(100), objCalls.alarmId)
			.input('isCallConnected', sql.NVarChar(10), objCalls.isCallConnected)
			.execute('spUpdateCallDetails', (error, result) => {
				helperLogging.logMessage({ "isServer": 1, "methodName": "updateCall:db", "message": "SP call success: Any Error?: " + (error!= null? "true": "false") , "userId": objCalls.currentUserId, "elevatorId": objCalls.elevator_id });
				returnResult(error, result, objCalls.currentUserId, callBack);
			});
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "updateCall", "exceptionDetails": exception.message, "userId": objCalls.currentUserId });
		returnError(exception.message, callBack);
	}
}

//retrieve call details for country and sort /orderby countryId
function retrieveCallDetailsForCountry(objCountry, callBack) {
	try {
		new sql.Request(db)
			.input('countryId', sql.Int, objCountry.countryId)
			.input('FromDate', sql.NVarChar(100), objCountry.fromdate)
			.input('ToDate', sql.NVarChar(100), objCountry.toDate)
			.execute('spRetrieveCallDetailsByCountryId', (error, result) => {
				returnResult(error, result, objCountry.currentUserId, callBack);
			});
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "retrieveCallDetailsForCountry", "exceptionDetails": exception.message, "userId": objCountry.currentUserId });
		returnError(exception.message, callBack);
	}
}

//retrieve call details for country sort /orderby elevatorId
function retrieveCallDetailsForElevator(objCall, callBack) {
	try {
		new sql.Request(db)
			.input('alarmId', sql.VarChar(100), objCall.elevatorId)
			.execute('spRetrieveCallDetailsByAlarmId', (error, result) => {
				returnResult(error, result, objCall.currentUserId, callBack);
			});
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "retrieveCallDetailsForIncident", "exceptionDetails": exception.message, "userId": objCall.currentUserId });
		returnError(exception.message, callBack);
	}
}

//retrieve call details for country sort /orderby callIncidentId
function retrieveCallDetailsForIncident(objIncident, callBack) {
	try {
		new sql.Request(db)
			.input('callIncidentId', sql.Int, objIncident.incidentId)
			.execute('spRetrieveCallDetailsByIncidentId', (error, result) => {
				returnResult(error, result, objIncident.currentUserId, callBack);
			});
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "retrieveCallDetailsForIncident", "exceptionDetails": exception.message, "userId": objIncident.currentUserId });
		returnError(exception.message, callBack);
	}
}

//retrieve call details for country sort /orderby callIncidentId
function retrieveCallDetailsByElevatorId(objElevator, callBack) {
	try {		
		new sql.Request(db)
			.input('elevatorUnitId', sql.NVarChar(100), objElevator.elevatorId)
			.execute('spRetrieveCallDetailsByElevatorId', (error, result) => {
				returnResult(error, result, objElevator.currentUserId, callBack);
			});
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "retrieveCallDetailsForIncident", "exceptionDetails": exception.message, "userId": objIncident.currentUserId });
		returnError(exception.message, callBack);
	}
}

//after call ends /svae and hang up
function updateCallDisposition(objCallDisposition, callBack) {
	try {
		new sql.Request(db)
			.input('callDetailsId', sql.Int, objCallDisposition.callDetailsId)
			.input('callDispositionId', sql.Int, objCallDisposition.callDispositionId)
			.input('videoQuality', sql.Int, objCallDisposition.videoQuality)
			.input('audioQuality', sql.Int, objCallDisposition.audioQuality)
			.input('notes', sql.VarChar(200), objCallDisposition.notes)
			.execute('spUpdateCallDispositionDetails', (error, result) => {
				helperLogging.logMessage({ "isServer": 1, "methodName": "updateCallDisposition:db", "message": "SP call success: Any Error?: " + (error!= null? "true": "false") , "userId": objCallDisposition.currentUserId, "elevatorId": objCallDisposition.elevator_id });
				returnResult(error, result, objCallDisposition.currentUserId, callBack);
			});
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "saveCallDisposition", "exceptionDetails": exception.message, "userId": objCallDisposition.currentUserId });
		returnError(exception.message, callBack);
	}
}


//after call ends /svae and hang up
function saveVideoIntervals(objCallDisposition, callBack) {
	try {
		new sql.Request(db)
			.input('callDetailsId', sql.Int, objCallDisposition.callDetailsId)
			.input('videoDuration', sql.Int, objCallDisposition.videoDuration)
			.input('remVideoDuration', sql.Int, objCallDisposition.remVideoDuration)
			.execute('spSaveCallVideoDuration', (error, result) => {
				returnResult(error, result, objCallDisposition.currentUserId, callBack);
			});
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "saveCallDisposition", "exceptionDetails": exception.message, "userId": objCallDisposition.currentUserId });
		returnError(exception.message, callBack);
	}
}

//after call ends /svae and hang up
function saveCallDisposition(objCallDisposition, callBack) {
	try {
		new sql.Request(db)
			.input('callDetailsId', sql.Int, objCallDisposition.callDetailsId)
			.input('callDispositionId', sql.Int, objCallDisposition.callDispositionId)
			.input('videoQuality', sql.Int, objCallDisposition.videoQuality)
			.input('audioQuality', sql.Int, objCallDisposition.audioQuality)
			.input('roomSid', sql.NVarChar(100), objCallDisposition.roomSid)
			.input('localParticipantSid', sql.NVarChar(100), objCallDisposition.localParticipantSid)
			.input('remoteParticipantSid', sql.NVarChar(100), objCallDisposition.remoteParticipantSid)
			.input('videoUrl', sql.NVarChar(100), objCallDisposition.twilioResVideoUrl)
			.input('audioUrl', sql.NVarChar(100), objCallDisposition.twilioResAudioUrl)
			.input('videoSid', sql.NVarChar(100), objCallDisposition.videoSid)
			.input('isDisconnected', sql.NVarChar(100), objCallDisposition.isCallDisconnected)
			.input('audioSid', sql.NVarChar(100), objCallDisposition.audioSid)
			.input('remVideoUrl', sql.NVarChar(100), objCallDisposition.twilioResRemVideoUrl)
			.input('remAudioUrl', sql.NVarChar(100), objCallDisposition.twilioResRemAudioUrl)
			.input('remVideoSid', sql.NVarChar(100), objCallDisposition.videoRemSid)
			.input('remAudioSid', sql.NVarChar(100), objCallDisposition.audioRemSid)
			.input('videoDuration', sql.Int, objCallDisposition.videoDuration)
			.input('remVideoDuration', sql.Int, objCallDisposition.remVideoDuration)
			.input('notes', sql.VarChar(200), objCallDisposition.notes)
			.execute('spSaveCallDispositionDetails', (error, result) => {
				helperLogging.logMessage({ "isServer": 1, "methodName": "saveCallDisposition:db", "message": "SP call success: Any Error?: " + (error!= null? "true": "false") , "userId": objCallDisposition.currentUserId, "elevatorId": objCallDisposition.elevator_id });
				returnResult(error, result, objCallDisposition.currentUserId, callBack, objCallDisposition.sender);
			});
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "saveCallDisposition", "exceptionDetails": exception.message, "userId": objCallDisposition.currentUserId });
		returnError(exception.message, callBack);
	}
}

//get call disposition data
function retrieveCallDispositionData(objCallDisposition, callBack) {
	try {
		new sql.Request(db)
			.input('countryId', sql.Int, objCallDisposition.countryConfigurationId)
			.input('languageId', sql.Int, objCallDisposition.languageId)
			.execute('spRetrieveCallDispstnsByCountryId', (error, result) => {
				returnResult(error, result, objCallDisposition.currentUserId, callBack);
			});
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "retrieveCallDispositionData", "exceptionDetails": exception.message, "userId": objCallDisposition.currentUserId });
		returnError(exception.message, callBack);
	}
}
//delete call dispsition data
function deleteCallDispositionData(objCallDisposition, callBack) {
	try {
		var callDispositionId = parseInt(objCallDisposition.callDispositionId)
		console.log("After conversion to INT call Disposition in DB with id ", callDispositionId)
		new sql.Request(db)
			.input('callDispositionId', sql.Int, callDispositionId)
			.execute('spDeleteCallDispstnsData', (error, result) => {
				returnResult(error, result, objCallDisposition.currentUserId, callBack);
			});
	}
	catch (exception) {
		console.log("Deleteing call Disposition exception ", exception.message)
		helperLogging.logException({ "isServer": 1, "methodName": "deleteCallDispositionData", "exceptionDetails": exception.message, "userId": objCallDisposition.currentUserId });
		returnError(exception.message, callBack);
	}
}

//save call dispsition data
function saveCallDispositionData(objCallDisposition, callBack) {
	try {
		new sql.Request(db)
			.input('callDispositionId', sql.Int, objCallDisposition.callDispositionId)
			.input('callDisposition', sql.NVarChar(250), objCallDisposition.translation)
			.input('code', sql.NVarChar(100), objCallDisposition.code)
			.input('countryConfigurationId', sql.Int, objCallDisposition.countryConfigurationId)
			.input('shutdownReasonCode', sql.NVarChar(10), objCallDisposition.shutdownReasonCode)
			.input('userId', sql.Int, objCallDisposition.userId)
			.input('languageId', sql.Int, objCallDisposition.languageId)
			.execute('spSaveCallDispstnsData', (error, result) => {
				returnResult(error, result, objCallDisposition.currentUserId, callBack);
			});
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "saveCallDispositionData", "exceptionDetails": exception.message, "userId": objCallDisposition.currentUserId });
		returnError(exception.message, callBack);
	}
}

//insertChatMsgDetails using call details id
function insertChatMsgDetails(objChatMsgs, callBack) {
	try {
		new sql.Request(db)
			.input('message', sql.NVarChar(sql.MAX), objChatMsgs.message)
			.input('callDetailsId', sql.Int, objChatMsgs.callDetailsId)
			.input('sender', sql.Int, objChatMsgs.sender)
			.execute('spInsertChatMessages', (error, result) => {
				returnResult(error, result, objChatMsgs.currentUserId, callBack);
			});
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "insertChatMsgDetails", "exceptionDetails": exception.message, "userId": objChatMsgs.currentUserId });
		returnError(exception.message, callBack);
	}
}

//get alarmId by elevatorId
function getAlarmIDByElevatorId(objAlarm, callBack, callBackTwilio) {
	try {
		if (callBackTwilio == null) {
			new sql.Request(db)
				.input('elevatorID', sql.NVarChar(200), objAlarm.elevatorId)
				.execute('spAlarmIDByElevatorID', (error, result) => {
					returnResult(error, result, objAlarm.currentUserId, callBack);
				});
		}
		else {
			callBack({ recordset: { alarmId: null} });
		}
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "insertChatMsgDetails", "exceptionDetails": exception.message, "userId": objChatMsgs.currentUserId });
		returnError(exception.message, callBack);
	}
}

//insert call disposition details
function insertCallDispstnDetails(objCllDispstns, callBack) {
	try {
		new sql.Request(db)
			.input('code', sql.VarChar(100), objCllDispstns.code)
			.input('callDisposition', sql.VarChar(100), objCllDispstns.callDisposition)
			.input('isAdmin', sql.VarChar(100), 1)
			.input('shutdownReasonCode', sql.VarChar(100), objCllDispstns.shutdownReasonCode)
			.input('userId', sql.VarChar(100), objCllDispstns.currentUserId)
			.input('callDispositionId', sql.Int, objCllDispstns.callDispositionId)
			.execute('spInsertCallDispstns', (error, result) => {
				returnResult(error, result, objCllDispstns.currentUserId, callBack);
			});
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "insertCallDispstnDetails", "exceptionDetails": exception.message, "userId": objCllDispstns.currentUserId });
		returnError(exception.message, callBack);
	}
}

//retrieve call disposition details
function retrieveCallDispstnDetails(objCllDispstns, callBack) {
	try {
		new sql.Request(db)
			.execute('spRetrieveCallDispstns', (error, result) => {
				returnResult(error, result, objCllDispstns.currentUserId, callBack);
			});
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "retrieveCallDispstnDetails", "exceptionDetails": exception.message, "userId": objCllDispstns.currentUserId });
		returnError(exception.message, callBack);
	}
}

//delete call disposition details
function deleteCallDispstnDetails(objCllDispstns, callBack) {
	try {
		new sql.Request(db)
			.input('callDispositionId', sql.Int, objCllDispstns.callDispositionId)
			.execute('spDeleteCallDispstns', (error, result) => {
				returnResult(error, result, objCllDispstns.currentUserId, callBack);
			});
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "deleteCallDispstnDetails", "exceptionDetails": exception.message, "userId": objCllDispstns.currentUserId });
		returnError(exception.message, callBack);
	}
}

//insert call disposition details
function getCallDetail(objCallDetails, callBack) {
	try {
		new sql.Request(db)
			.input('userId', sql.Int, objCallDetails.userId)
			.input('date', sql.NVarChar(100), objCallDetails.date)
			.input('callFilter', sql.NVarChar(100), objCallDetails.callFilter)
			.execute('spRetrieveCallIncidentsDashboard', (error, result) => {
				returnResult(error, result, objCallDetails.currentUserId, callBack);
			});
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "getCallDetail", "exceptionDetails": exception.message, "userId": objCallDetails.currentUserId });
		returnError(exception, callBack);
	}
}

//save recorded video & audion for Agent
function saveAudioVideoAgent(objCallDetails, callBack) {
	try {
		new sql.Request(db)
			.input('callDetailsId', sql.Int, objCallDetails.callDetailId)
			.input('audioData', sql.VarBinary(sql.MAX), objCallDetails.agent.audio.data)
			.input('videoData', sql.VarBinary(sql.MAX), objCallDetails.agent.video.data)
			.input('isDownloaded', sql.Int, 1)
			.execute('spInsertAudioVideoDataAgent', (error, result) => {
				returnDbResult(error, result, objCallDetails.currentUserId, callBack, "saveAudioVideo");
			});
	}
	catch (exception) {
		unExpectedException(exception.message, result, objCallDetails.currentUserId, callBack, false, "saveAudioVideo");
	}
}

//retrieve saved video
function retriveAudioVideoData(callDetail, callBack) {
	try {
		new sql.Request(db)
			.input('callDetailsId', sql.Int, callDetail.callDetailsId)
			.execute('spRetrieveAudioVideoData', (error, result) => {
				returnDbResult(error, result, callDetail.currentUserId, callBack, "retriveAudioVideoData");
			});
	}
	catch (exception) {
		unExpectedException(exception.message, result, objCallDetails.currentUserId, callBack, false, "retriveAudioVideoData");
	}
}

//common function to get results of above calling store procedure
function returnResult(err, result, userId, callBack, sender, elevatorId) {
	if (err != null) {		
		helperLogging.logException({ "isServer": 1, "methodName": (sender != null? ":" + sender: "returnResult"), "exceptionDetails": "Exception from returnResult. Error: " + err, "userId": userId, "elevatorId": elevatorId }, (result) => {});
		callBack({ "status": false, err: err });
	}
	else {
		callBack(result);
	}
}

//common function for returning error of above functions
function returnError(err, callBack) {
	callBack(err);
}


//common modified function to get results of above calling store procedure 
/*Important dont delete*/
function returnDbResult(err, result, userId, callBack, methodName) {
	if (err != null) {
		unExpectedException(err, result, userId, callBack, true, methodName)
	}
	else {
		callBack(result, false);
	}
}

/*Important dont delete*/
function unExpectedException(error, result, userId, callBack, dbError, methodName) {
	if (dbError) {
		helperLogging.logException({ "isServer": 1, "methodName": methodName, "exceptionDetails": error, "userId": userId }, (result) => {
		})
	} else {
		helperLogging.logException({ "isServer": 1, "methodName": methodName, "exceptionDetails": error, "userId": userId });
	}
	callBack(null, true);
}

module.exports = dataAccessCallDetails();
