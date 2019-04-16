//// File Name: report.js
//// Description: This has the methods to display the calls for report
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/

'use strict';
var twilioInterface = require('../twilio_interface/twilioInterface.js');
var dbUser = require('../dataaccess_layer/users.js');
var helperLogging = require('../helper/logging.js');
var messages = require('../message/reportMessage.js');

function reports() {
	return {
		getWorkerStatistics: getWorkerStatistics,
		getWorkersStatistics: getWorkersStatistics,
		getWorkersStatusForSupervisor: getWorkersStatusForSupervisor,
		getWorkersStatusDetailsForSupervisor: getWorkersStatusDetailsForSupervisor,
		getWorkersCallActivity: getWorkersCallActivity,
		getAgentsReport: getAgentsReport
	}
}

function getWorkerStatistics(req, res) {
	try {
		logActivity("getWorkerStatistics", req.get('userId'), req.get('elevatorID'));
		var objWorker = req.body;
		objWorker.currentUserId = req.get('userId');
		twilioInterface.getWorkerStatistics(objWorker, function (result) {
			var retResult = result.data.cumulative.activity_durations;
			dbUser.getWorkerReport(objWorker, function (dataResult) {
				retResult.push({
					'numberOutGoingCalls': dataResult.recordsets[0].length,
					'numberOfMissedCalls': dataResult.recordsets[1].length,
					'numberIncomingCalls': result.data.cumulative.reservations_accepted
				});

				res.send({
					"status": true,
					data: retResult
				});
			})
		});
	} catch (exception) {
		logException("getWorkerStatistics", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "1010", data: undefined });
	}
}

function getAgentsReport(req, res) {
	try {
		logActivity("getAgentsReport", req.get('userId'), req.get('elevatorID'));
		var objFilter = req.body;
		objFilter.currentUserId = req.get('userId');
		dbUser.getAgentsReport(objFilter, function (result) {
			if (result.recordsets[0].length > 0) {
				res.send({
					"status": true,
					"data": result
				});
			} else {
				res.send({
					"status": false,
					"data": undefined
				});
			}
		});
	} catch (exception) {
		logException("getAgentsReport", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "1010", data: undefined });
	}
}

function getWorkersStatusForSupervisor(req, res) {
	try {
		logActivity("getWorkersStatusForSupervisor", req.get('userId'), req.get('elevatorID'));
		var objWorkers = req.body;
		objWorkers.currentUserId = req.get('userId');
		dbUser.getWorkersReportForSupervisor(objWorkers, function (result) {
			if (result.recordsets[0].length > 0) {
				res.send({
					"status": true,
					"data": result
				});
			} else {
				res.send({
					"status": false,
					"data": undefined
				});
			}
		});
	} catch (exception) {
		logException("getWorkersStatusForSupervisor", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "1010", data: undefined });
	}
}

function getWorkersCallActivity(req, res) {
	try {
		logActivity("getWorkersCallActivity", req.get('userId'), req.get('elevatorID'));
		var objWorkers = req.body;
		objWorkers.currentUserId = req.get('userId');
		dbUser.getWorkersCallActivity(objWorkers, function (result) {
			if (result.recordsets[0].length > 0) {
				res.send({
					"status": true,
					"data": result
				});
			} else {
				res.send({
					"status": false,
					"data": undefined
				});
			}
		});
	} catch (exception) {
		logException("getWorkersCallActivity", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "1010", data: undefined });
	}
}

function getWorkersStatusDetailsForSupervisor(req, res) {
	try {
		logActivity("getWorkersStatusDetailsForSupervisor", req.get('userId'), req.get('elevatorID'));
		var objWorkers = req.body;
		objWorkers.currentUserId = req.get('userId');
		dbUser.getWorkersReportDetailsForSupervisor(objWorkers, function (result) {
			if (result.recordsets[0].length > 0) {
				res.send({
					"status": true,
					"data": result
				});
			} else {
				res.send({
					"status": false,
					"data": undefined
				});
			}
		});
	} catch (exception) {
		logException("getWorkersStatusDetailsForSupervisor", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "1010", data: undefined });
	}
}

function getWorkersStatistics(req, res) {
	try {
		logMessage("getWorkersStatistics", messages.getWorkersStatsStarted, req.get('userId'), req.get('elevatorID'));
		var objWorkers = req.body;
		objWorkers.currentUserId = req.get('userId');
		objWorkers.name = [];
		dbUser.getWorkersReport(objWorkers, function (result) {
			logMessage("getWorkersStatistics", messages.gotWorkersFromDBForCountry, req.get('userId'), req.get('elevatorID'));
			if (result.recordsets[0].length > 0) {
				if (result.recordsets[1].length > 0) {
					objWorkers.numberOutGoingCalls = result.recordsets[1][0].outgoingcalls;
				} else {
					objWorkers.numberOutGoingCalls = 0;
				}

				objWorkers.taskQueueSid = result.recordset[0].taskqueueSid;

				logMessage("getWorkersStatistics", messages.reqWorkerStatsTwilio, req.get('userId'), req.get('elevatorID'));
				twilioInterface.getWorkersStatistics(objWorkers, function (result) {
					logMessage("getWorkersStatistics", messages.gotWorkerStatsTwilio, req.get('userId'), req.get('elevatorID'));
					var retResult = {
						workerStatistics: { data: { cumulative: result.data.cumulative } },
						numberOutGoingCalls: objWorkers.numberOutGoingCalls
					}
					res.send({
						"status": true,
						data: retResult
					});
				});				
			} else {
				res.send({
					"status": false,
					"data": undefined
				});
			}
		});
	} catch (exception) {
		logException("getWordersStatistics", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "1010", data: undefined });
	}
}

var logActivity = function (activityName, userId, elevatorId) {
	helperLogging.logActivity({ "activityname": activityName, "userId": userId, "elevatorId": elevatorId });
}

var logException = function (methodName, exceptionDetails, userId = '') {
	helperLogging.logException({ "isServer": 1, "methodName": methodName, "exceptionDetails": exceptionDetails, "userId": userId });
}

var logMessage = function (methodName, message, userId = '', elevatorId) {
	helperLogging.logMessage({ "isServer": 1, "methodName": methodName, "message": message, "userId": userId, "elevatorId": elevatorId });
}

module.exports = reports();