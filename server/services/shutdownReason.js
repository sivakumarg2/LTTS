//// File Name: shutdownReason.js
//// Description: This has the methods to insert/edit & delete shutdown reason
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/

'use strict';
var dbCalls = require('../dataaccess_layer/shutdownReason.js');
var helperLogging = require('../helper/logging.js');

function shutdownReason() {
	return {
		insertShutdownReason: insertShutdownReason,
		retrieveShutdownReason: retrieveShutdownReason,
		getShutdownReasonTmp: getShutdownReasonTmp,
		deleteShutdownReason: deleteShutdownReason,
		retrieveCountryShutdownReason: retrieveCountryShutdownReason,
		saveCountryShutdownReason: saveCountryShutdownReason,
		deleteCountryShutdownReason: deleteCountryShutdownReason
	};
}

function insertShutdownReason(req, res) {
	try {
		logActivity("insertShutdownReason", req.get('userId'), req.get('elevatorID'));
		var objShutReason = req.body;
		objShutReason.currentUserId = req.get('userId');
		dbCalls.insertShutdownReason(objShutReason, function (result) {
			if (result.recordset.length > 0) {
				if (result.recordset[0].code != '1001') {
					res.send({ "status": true, data: result.recordset[0] });
				}
				else {
					logException("insertShutdownReason", result.recordset[0].message, req.get('userId'));
					res.send({ "status": false, data: result.recordset[0] });
				}
			}
			else {
				res.send({ "status": false, data: undefined });
			}
		});
	}
	catch (exception) {
		logException("insertShutdownReason", exception.message, req.get('userId'));
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

function retrieveShutdownReason(req, res) {
	try {
		logActivity("retrieveShutdownReason", req.get('userId'), req.get('elevatorID'));
		var objShutReason = req.body;
		objShutReason.currentUserId = req.get('userId');
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

function deleteShutdownReason(req, res) {
	try {
		logActivity("deleteShutdownReason", req.get('userId'), req.get('elevatorID'));
		var objShutReason = req.query;
		objShutReason.currentUserId = req.get('userId');
		dbCalls.deleteShutdownReason(objShutReason, function (result) {
			if (result.rowsAffected.length > 0) {
				console.log("Delete Shutdown Reason Success");
				res.send({ "status": true, data: result });
			}
		});
	}
	catch (exception) {
		logException("deleteShutdownReason", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "1010", data: undefined });
	}
}

function retrieveCountryShutdownReason(req, res) {
	try {
		logActivity("retrieveCountryShutdownReason", req.get('userId'), req.get('elevatorID'));
		var objShutReason = { "countryConfigurationId": req.query.countryConfigurationId, "languageId": req.query.languageId, currentUserId: req.get('userId') };
		dbCalls.retrieveCountryShutdownReason(objShutReason, function (result) {
			if (result.rowsAffected.length <= 0) {
				logException('retrieveCountryShutdownReason', result.recordset[0].message, req.get('userId'));
				res.send({ "status": false, data: result });
			}
			else {
				res.send({ "status": true, data: result });
			}
		});
	}
	catch (exception) {
		logException("retrieveCountryShutdownReason", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "1010", data: undefined });
	}
}

function saveCountryShutdownReason(req, res) {
	try {
		logActivity("saveCountryShutdownReason", req.get('userId'), req.get('elevatorID'));
		var objShutReason = req.body;
		objShutReason.currentUserId = req.get('userId');
		console.log("Save call disposition");
		dbCalls.saveCountryShutdownReason(objShutReason, function (result) {
			console.log("Save call disposition");
			res.send({ "status": true, data: result });
		});
	}
	catch (exception) {
		logException("saveCountryShutdownReason", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "1010", data: undefined });
	}
}

function deleteCountryShutdownReason(req, res) {
	try {
		logActivity("deleteCountryShutdownReason", req.get('userId'), req.get('elevatorID'));
		var objShutReason = {
			"shutdownReasonId": req.query.shutdownReasonId, currentUserId: req.get('userId')
		};
		
		dbCalls.deleteCountryShutdownReason(objShutReason, function (result) {
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
		logException("deleteCountryShutdownReason ", exception.message, req.get('userId'));
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

module.exports = shutdownReason();