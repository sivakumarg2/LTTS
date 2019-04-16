//// File Name: chatMessages.js
//// Description: This has the methods to insert/edit & delete Question text
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/

'use strict';
var dbCalls = require('../dataaccess_layer/chatMessages.js');
var helperLogging = require('../helper/logging.js');

function chatMessages() {
	return {
		insertChatMessage: insertChatMessage,
		retrieveChatMessages: retrieveChatMessages,
		getShutdownReasonTmp: getShutdownReasonTmp,
		deleteChatMessage: deleteChatMessage,
		retrieveCountryQuestionText: retrieveCountryQuestionText,
		saveCountryQuestionText: saveCountryQuestionText,
		deleteCountryQuestionText: deleteCountryQuestionText
	};
}

function insertChatMessage(req, res) {
	try {
		logActivity("insertChatMessage", req.get('userId'), req.get('elevatorID'));
		var objChatMsg = req.body;
		objChatMsg.currentUserId = req.get('userId');
		dbCalls.insertChatMessage(objChatMsg, function (result) {
			if (result.recordset.length > 0) {
				if (result.recordset[0].code != '1001') {
					res.send({ "status": true, data: result.recordset[0] });
				}
				else {
					logException("insertChatMessage", result.recordset[0].message, req.get('userId'));
					res.send({ "status": false, data: result.recordset[0] });
				}
			}
			else {
				res.send({ "status": false, data: undefined });
			}
		});
	}
	catch (exception) {
		logException("insertChatMessage", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "1010", data: undefined });
	}
}

function getShutdownReasonTmp(req, res) {
	try {
		logActivity("retrieveShutdownReason", "1", req.get('elevatorID'));
		var objShutReason = {};
		objShutReason.currentUserId = "1";
		dbCalls.retrieveShutdownReason(objShutReason, function (result) {
			if (result.rowsAffected.length > 0) {
				res.send({ "status": true, data: result });
			}
		});
	}
	catch (exception) {
		logException("retrieveShutdownReason", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "1010", data: undefined });
	}
}

function retrieveChatMessages(req, res) {
	try {
		logActivity("retrieveChatMessages", req.get('userId'), req.get('elevatorID'));
		var objChatMsg = req.body;
		objChatMsg.currentUserId = req.get('userId');
		dbCalls.retrieveChatMessages(objChatMsg, function (result) {
			if (result.rowsAffected.length > 0) {
				res.send({ "status": true, data: result });
			}
		});
	}
	catch (exception) {
		logException("retrieveChatMessages", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "1010", data: undefined });
	}
}

function deleteChatMessage(req, res) {
	try {
		logActivity("deleteChatMessage", req.get('userId'), req.get('elevatorID'));
		var objChatMsg = req.query;
		objChatMsg.currentUserId = req.get('userId');
		dbCalls.deleteChatMessage(objChatMsg, function (result) {
			if(!result.status) {
				res.send({ "status": false, "code": "1010", data: undefined });
			}

			if (result.rowsAffected.length > 0) {
				res.send({ "status": true, data: result });
			}
		});
	}
	catch (exception) {
		logException("deleteChatMessage", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "1010", data: undefined });
	}
}

function retrieveCountryQuestionText(req, res) {
	try {
		logActivity("retrieveCountryQuestionText", req.get('userId'), req.get('elevatorID'));
		var objQuestionText = { "countryConfigurationId": req.query.countryConfigurationId, "languageId": req.query.languageId, currentUserId: req.get('userId') };
		dbCalls.retrieveCountryQuestionText(objQuestionText, function (result) {
			if (result.rowsAffected.length <= 0) {
				logException('retrieveCountryQuestionText', result.recordset[0].message, req.get('userId'));
				res.send({ "status": false, data: result });
			}
			else {
				res.send({ "status": true, data: result });
			}
		});
	}
	catch (exception) {
		logException("retrieveCountryQuestionText", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "1010", data: undefined });
	}
}

function saveCountryQuestionText(req, res) {
	try {
		logActivity("saveCountryQuestionText", req.get('userId'), req.get('elevatorID'));
		var objQuesTxt = req.body;
		objQuesTxt.currentUserId = req.get('userId');
		console.log("Save Question Text: ", objQuesTxt);
		dbCalls.saveCountryQuestionText(objQuesTxt, function (result) {
			console.log("Successfully saved Question Text Translation");
			res.send({ "status": true, data: result });
		});
	}
	catch (exception) {
		logException("saveCountryQuestionText", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "1010", data: undefined });
	}
}

function deleteCountryQuestionText(req, res) {
	try {
		logActivity("deleteCountryQuestionText", req.get('userId'), req.get('elevatorID'));
		var objQuesTxt = {
			"chatMsgId": req.query.chatMsgId, currentUserId: req.get('userId')
		};
		
		dbCalls.deleteCountryQuestionText(objQuesTxt, function (result) {
			if (result.recordset.length > 0) {
				if (result.recordset[0].code != '1001') {
					res.send({ "status": true, data: result.recordset[0] });
				}
				else {
					logException("insertCallDispstnDetails", result.recordset[0].message, req.get('userId'));
					res.send({ "status": false, data: result.recordset[0] });
				}
			}
			else {
				res.send({ "status": false, data: undefined });
			}
		});
	}
	catch (exception) {
		logException("deleteCountryQuestionText ", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "1010", data: undefined });
	}
}

var logActivity = function (activityName, userId, elevatorId) {
	helperLogging.logActivity({ "activityname": activityName, "userId": userId, "elevatorId": elevatorId });
}

var logException = function (methodName, exceptionDetails, userId) {
	console.log(exceptionDetails);
	helperLogging.logException({ "isServer": 1, "methodName": methodName, "exceptionDetails": exceptionDetails, "userId": userId });
}

module.exports = chatMessages();