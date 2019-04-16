//// File Name: chatMessages.js
//// Description: This has the methods to manage chat messages master & translation data.
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

function chatMessages() {
	return {
		insertChatMessage: insertChatMessage,
		retrieveChatMessages: retrieveChatMessages,
		deleteChatMessage: deleteChatMessage,
		retrieveCountryQuestionText: retrieveCountryQuestionText,
		deleteCountryQuestionText: deleteCountryQuestionText,
		saveCountryQuestionText: saveCountryQuestionText
	}
}

//Insert Chat Messages
function insertChatMessage(ObjChatMsg, callBack) {
	try {
		console.log("Chart Messages: ", ObjChatMsg);
		new sql.Request(db)
			.input('priority', sql.VarChar(100), ObjChatMsg.priority)
			.input('questionText', sql.VarChar(100), ObjChatMsg.questionText)
			.input('isAdmin', sql.VarChar(100), 1)
			.input('userId', sql.VarChar(100), ObjChatMsg.currentUserId)
			.input('chatMsgId', sql.Int, ObjChatMsg.chatMsgId)
			.execute('spInsertChatMessage', (error, result) => {
				returnResult(error, result, ObjChatMsg.currentUserId, callBack);
			});
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "insertChatMessage", "exceptionDetails": exception.message, "userId": objShutReason.currentUserId });
		returnError(exception.message, callBack);
	}
}

//Retrieve Chat Question Messages
function retrieveChatMessages(objShutReason, callBack) {
	try {
		new sql.Request(db)
			.execute('spRetrieveChatMesssages', (error, result) => {
				returnResult(error, result, objShutReason.currentUserId, callBack);
			});
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "retrieveChatMessages", "exceptionDetails": exception.message, "userId": objShutReason.currentUserId });
		returnError(exception.message, callBack);
	}
}

//Delete Shutdown Reason
function deleteChatMessage(ObjChatMsg, callBack) {
	try {
		new sql.Request(db)
			.input('chatMsgId', sql.Int, ObjChatMsg.chatMsgId)
			.execute('spDeleteChatMessage', (error, result) => {
				returnResult(error, result, ObjChatMsg.currentUserId, callBack);
			});
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "deleteChatMessage", "exceptionDetails": exception.message, "userId": ObjChatMsg.currentUserId });
		returnError(exception.message, callBack);
	}
}

//Get Country Question Texts
function retrieveCountryQuestionText(objQuestionText, callBack) {
	try {		
		new sql.Request(db)
			.input('countryId', sql.Int, objQuestionText.countryConfigurationId)
			.input('languageId', sql.Int, objQuestionText.languageId)
			.execute('spRetrieveCountryChatMessages', (error, result) => {
				returnResult(error, result, objQuestionText.currentUserId, callBack);
			});
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "retrieveCountryQuestionText", "exceptionDetails": exception.message, "userId": objQuestionText.currentUserId });
		returnError(exception.message, callBack);
	}
}

//Delete Country Shutdown Reason
function deleteCountryQuestionText(objQuestionText, callBack) {
	try {
		new sql.Request(db)
			.input('chatMsgId', sql.Int, parseInt(objQuestionText.chatMsgId))
			.execute('spDeleteCountryQuestionText', (error, result) => {
				returnResult(error, result, objQuestionText.currentUserId, callBack);
			});
		console.log("Successfully deleted")
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "deleteCountryQuestionText", "exceptionDetails": exception.message, "userId": objQuestionText.currentUserId });
		returnError(exception.message, callBack);
	}
}

//Save Country Shutdown Reason
function saveCountryQuestionText(objQuesTxt, callBack) {
	try {
		new sql.Request(db)
			.input('chatMsgId', sql.Int, objQuesTxt.chatMsgId)
			.input('questionText', sql.NVarChar(250), objQuesTxt.translation)
			.input('priority', sql.NVarChar(100), objQuesTxt.priority)
			.input('countryConfigurationId', sql.Int, objQuesTxt.countryConfigurationId)
			.input('masterChatMsgId', sql.Int, objQuesTxt.chatMsgId)
			.input('userId', sql.Int, objQuesTxt.userId)
			.input('languageId', sql.Int, objQuesTxt.languageId)
			.execute('spSaveCountryQuestionText', (error, result) => {
				console.log(error);
				returnResult(error, result, objQuesTxt.currentUserId, callBack);
			});
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "saveCountryQuestionText", "exceptionDetails": exception.message, "userId": objQuesTxt.currentUserId });
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
		result.status = true;
		callBack(result);
	}
}

//common function for returning error of above functions
function returnError(err, callBack) {
	callBack(err);
}

module.exports = chatMessages();
