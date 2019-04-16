//// File Name: callDetails.js
//// Description: This has the methods to work with calls, communication with G3MS & CIMS
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/

'use strict';

var dbCalls = require('../dataaccess_layer/callDetails.js');
var helperLogging = require('../helper/logging.js');
var g3msInterface = require('../G3MS_interface/G3MSInterface.js');
var twilioInterface = require('../twilio_interface/twilioInterface.js');
var geobing = require('geobing');
var bingCredentials = require('../configs/config.js');
var mediaDownloader = require('./MediaDownloader.js');
var messages = require('../message/callServicesMessage.js');

function callDetails() {
	return {
		insertCallDetails: insertCallDetails,
		updateCallDetails: updateCallDetails,
		updateCall: updateCall,
		getCallSummaryByUserId: getCallSummaryByUserId,
		getCallSummaryByUserIdForExport: getCallSummaryByUserIdForExport,
		retrieveCallDetailsForCountry: retrieveCallDetailsForCountry,
		retrieveCallDetailsForIncident: retrieveCallDetailsForIncident,
		retrieveCallDetailsForElevator: retrieveCallDetailsForElevator,
		saveCallDisposition: saveCallDisposition,
		saveMessage: saveMessage,
		insertChatMsgDetails: insertChatMsgDetails,
		insertCallDispstnDetails: insertCallDispstnDetails,
		retrieveCallDispstnDetails: retrieveCallDispstnDetails,
		deleteCallDispstnDetails: deleteCallDispstnDetails,
		loadCopyDisposition: loadCopyDisposition,
		addCountryDisposition: addCountryDisposition,
		retrieveCallDispositionData: retrieveCallDispositionData,
		saveCallDispositionData: saveCallDispositionData,
		deleteCallDispositionData: deleteCallDispositionData,
		getCallDetail: getCallDetail,
		deleteAudioVideo: deleteAudioVideo,
		retriveAudioVideoData: retriveAudioVideoData,
		downloadAudioVideo: downloadAudioVideo,
		getGeoAddress: getGeoAddress,
		retrieveVideoDetails: retrieveVideoDetails
	}
}

function insertCallDetails(req, res) {
	try {
		logMessage("insertCallDetails", messages.insertCallDetailsStarted, req.get('userId'), req.get('elevatorID'));
		var objCallIncidents = req.body;
		objCallIncidents.currentUserId = req.get('userId');
		objCallIncidents.sender = "insertCallDetails";
		dbCalls.insertCallDetails(objCallIncidents, function (result) {
			if (result.status != null && !result.status) {
				logException("insertCallDetails", result.err, req.get('userId'), req.get('elevatorID'));
				res.send({ "status": result.status, data: result });
			}
			else {
				logMessage("insertCallDetails", messages.insertCallDetailsSuccess, req.get('userId'), req.get('elevatorID'));
				res.send({ "status": result.status, data: result });
			}
		});
	}
	catch (exception) {
		logException("insertCallDetails", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "1010", data: undefined });
	}
}

function updateCallDetails(req, res) {
	try {
		logActivity("updateCallDetails", req.get('userId'), req.get('elevatorID'));
		var objUpdateCallDetails = req.body;
		objUpdateCallDetails.currentUserId = req.get('userId');
		dbCalls.updateCallDetails(objUpdateCallDetails, function (result) {
			res.send({ "status": true, data: result });
		});
	}
	catch (exception) {
		logException("updateCallDetails", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "1010", data: undefined });
	}
}

function getCallSummaryByUserId(req, res) {
	try {
		logActivity("getCallSummaryByUserId", req.get('userId'), req.get('elevatorID'));
		var objRetrieve = {
			'fromdate': req.query.fromDate,
			'toDate': req.query.toDate,
			'currentUserId': req.get('userId')
		};
		dbCalls.getCallSummaryByUserId(objRetrieve, function (result) {
			if (result) {
				res.send({ "status": true, data: result });
			}
			else {
				res.send({ "status": false, data: undefined });
			}
		});
	}
	catch (exception) {
		logException("getCallSummaryByUserId", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "1010", data: undefined });
	}
}

function loadCopyDisposition(req, res) {
	try {
		logActivity("loadCopyDisposition", req.get('userId'), req.get('elevatorID'));
		var objRetrieve = {
			'configId': req.query.configId,
			'currentUserId': req.get('userId')
		};
		dbCalls.loadCopyDisposition(objRetrieve, function (result) {
			if (result) {
				res.send({ "status": true, data: result });
			}
			else {
				res.send({ "status": false, data: undefined });
			}
		});
	}
	catch (exception) {
		logException("loadCopyDisposition", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "1010", data: undefined });
	}
}

function addCountryDisposition(req, res) {
	try {
		logActivity("addCountryDisposition", req.get('userId'), req.get('elevatorID'));
		var objDisp = req.body;
		objDisp.currentUserId = req.get('userId');

		dbCalls.addCountryDisposition(objDisp, function (result) {
			if (result) {
				res.send({ "status": true, data: result });
			}
			else {
				res.send({ "status": false, data: undefined });
			}
		});
	}
	catch (exception) {
		logException("addCountryDisposition", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "1010", data: undefined });
	}
}

function getCallSummaryByUserIdForExport(req, res) {
	try {
		logActivity("getCallSummaryByUserIdForExport", req.get('userId'), req.get('elevatorID'));
		var objRetrieve = {
			'userId': req.query.userId,
			'currentUserId': req.get('userId')
		};
		dbCalls.getCallSummaryByUserIdExport(objRetrieve, function (result) {
			if (result) {
				res.send({ "status": true, data: result });
			}
			else {
				res.send({ "status": false, data: undefined });
			}
		});
	}
	catch (exception) {
		logException("getCallSummaryByUserIdForExport", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "1010", data: undefined });
	}
}

function updateCall(req, res) {
	try {		
		var objUpdateCall = req.body;
		console.log("objUpdateCall.isCallConnected: ", objUpdateCall.isCallConnected);
		logMessage("updateCall", messages.updateCallUserActivityStarted + (objUpdateCall.isCallConnected == null || objUpdateCall.isCallConnected == undefined? "updateCall:startedOn": "updateCall:connectedOn"), req.get('userId'), req.get('elevatorID'));
		objUpdateCall.currentUserId = req.get('userId');

		if (objUpdateCall.incidentId == null) {
			logMessage((objUpdateCall.isCallConnected == null || objUpdateCall.isCallConnected == undefined? "updateCall:startedOn": "updateCall:connectedOn"), messages.noCallIncidentsIdFound + objUpdateCall.uniqueId, req.get('userId'), req.get('elevatorID'))
		}

		dbCalls.updateCall(objUpdateCall, function (result) {
			var currentTime = new Date();
			result.startedDateTime = currentTime;
			res.send({ "status": true, data: result });
		});
	}
	catch (exception) {
		logException("updateCall", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "1010", data: undefined });
	}
}

function retrieveCallDetailsForCountry(req, res) {
	try {
		logActivity("retrieveCallDetailsForCountry", req.get('userId'), req.get('elevatorID'));
		var objReterive = {
			'fromdate': req.query.fromDate,
			'toDate': req.query.toDate,
			'countryId': req.query.countryId,
			'currentUserId': req.get('userId')
		};
		dbCalls.retrieveCallDetailsForCountry(objReterive, function (result) {
			res.send({ "status": true, data: result });
		});
	}
	catch (exception) {
		logException("retrieveCallDetailsForCountry", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "1010", data: undefined });
	}
}

function retrieveCallDetailsForIncident(req, res) {
	try {
		logActivity("retrieveCallDetailsForIncident", req.get('userId'), req.get('elevatorID'));
		var objIncident = {
			'incidentId': req.query.incidentId,
			'currentUserId': req.get('userId')
		}
		dbCalls.retrieveCallDetailsForIncident(objIncident, function (result) {
			res.send({ "status": true, data: result });
		});
	}
	catch (exception) {
		logException("retrieveCallDetailsForIncident", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "1010", data: undefined });
	}
}

function retrieveCallDetailsForElevator(req, res) {
	try {
		logActivity("retrieveCallDetailsForElevator", req.get('userId'), req.get('elevatorID'));
		var objCall = {
			'elevatorId': req.query.elevatorId,
			'currentUserId': req.get('userId')
		}
		console.log("ElevatorId: ", req.query.elevatorId);
		dbCalls.retrieveCallDetailsForElevator(objCall, function (result) {
			res.send({ "status": true, data: result });
		});
	}
	catch (exception) {
		logException("retrieveCallDetailsForElevator", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "1010", data: undefined });
	}
}

function deleteMediaRecordingsBySid(twilioresSid, type, userId) {
	try {
		twilioInterface.deleteRecordedMediaBySId(twilioresSid, function (result) {
			if (result) {
				console.log("deleted Media recordings from main stream is success", type);
			}
		});
	}
	catch (exception) {
		logException("deleteMediaRecordingsBySid", exception.message, userId);
	}

}

function saveCallDisposition(req, res) {
	try {
		var objcallDisposition = req.body;
		if (!objcallDisposition.popup) {
			callDispositionSave(req, res);
		}
		else {
			callDispositionUpdate(req, res);
		}
	}
	catch (exception) {
	}
}

function retrieveVideoDetails(req, res) {
	try {
		var objcall = req.body;
		twilioInterface.recordMediaByRoom(objcall.roomSid, function (twiliores) {
			if (twiliores.status) {
				if (twiliores.room.length > 0) {
					for (var i = 0; i < twiliores.room.length; i++) {
						console.log(twiliores.room);
						if (twiliores.room[i].groupingSids.participant_sid == objcall.localParticipantSid) {
							if (twiliores.room[i].type == "audio") {
								objcall.videoDuration = twiliores.room[i].duration;
							}
						}

						if (twiliores.room[i].groupingSids.participant_sid == objcall.remoteParticipantSid) {
							if (twiliores.room[i].type == "audio") {
								objcall.remVideoDuration = twiliores.room[i].duration;
							}
						}
					}
				}

				dbCalls.saveVideoIntervals(objcall, function (dbresult) {
					if (dbresult.rowsAffected.length > 0) {
						res.send({ "status": true, data: objcall });
					} else {
						res.send({ "status": true, "code": "1010", data: objcall });
					}
				});
			}
			else {
				res.send({ "status": false, "code": "1010", data: undefined });
			}
		});
	}
	catch (exception) {
		logException("retrieveVideoDetails", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "1010", data: undefined });
	}
}

function callDispositionSave(req, res) {
	try {
		logMessage("saveCallDisposition", messages.saveCallDispoStarted, req.get('userId'), req.get('elevatorID'));
		var objcallDisposition = req.body;
		objcallDisposition.currentUserId = req.get('userId');
		objcallDisposition.sender = "saveCallDisposition";
		twilioInterface.recordMediaByRoom(objcallDisposition.roomSid, function (twiliores) {
			if (twiliores.status) {
				if (twiliores.room.length > 0) {
					for (var i = 0; i < twiliores.room.length; i++) {
						if (twiliores.room[i].groupingSids.participant_sid == objcallDisposition.localParticipantSid) {
							if (twiliores.room[i].type == "video") {
								objcallDisposition.videoSid = twiliores.room[i].sid;
								objcallDisposition.twilioResVideoUrl = twiliores.room[i].url;
								objcallDisposition.videoDuration = twiliores.room[i].duration;
							}
							else {
								objcallDisposition.audioSid = twiliores.room[i].sid;
								objcallDisposition.twilioResAudioUrl = twiliores.room[i].url;
							}
						}

						if (twiliores.room[i].groupingSids.participant_sid == objcallDisposition.remoteParticipantSid) {
							if (twiliores.room[i].type == "video") {
								objcallDisposition.videoRemSid = twiliores.room[i].sid;
								objcallDisposition.twilioResRemVideoUrl = twiliores.room[i].url;
								objcallDisposition.remVideoDuration = twiliores.room[i].duration;
							}
							else {
								objcallDisposition.audioRemSid = twiliores.room[i].sid;
								objcallDisposition.twilioResRemAudioUrl = twiliores.room[i].url;
							}
						}
					}
				}

				twilioInterface.completeTheTask(objcallDisposition.roomSid, objcallDisposition.taskSid, function () {
				});

				if (objcallDisposition.callDispositionId == null) {
					logException("saveCallDisposition", messages.noCallIncidentsIdFound + objcallDisposition.uniqueId, req.get('userId'), req.get('elevatorID'))
				}
				if (objcallDisposition.callDetailsId == null) {
					logException("saveCallDisposition", messages.noCallDetailsIdFound + objcallDisposition.uniqueId, req.get('userId'), req.get('elevatorID'))
				}

				logMessage("saveCallDisposition", messages.saveCallDispoDBStarted, req.get('userId'), req.get('elevatorID'));
				dbCalls.saveCallDisposition(objcallDisposition, function (dbresult) {
					var objAlarmDispo = {
						voice_uuid: (objcallDisposition.voiceCallType == 3 ? "" : objcallDisposition.alarmId),
						unit_id: objcallDisposition.elevatorId,
						voice_call_type: objcallDisposition.voiceCallType,
						call_initiator: objcallDisposition.initiator,
						call_start_datetime: objcallDisposition.callStartDateTime,
						call_end_datetime: objcallDisposition.callEndDateTime,
						disposition_code: !isNaN(objcallDisposition.dispositionCode) ? parseInt(objcallDisposition.dispositionCode) : 0,
						video_quality: !isNaN(objcallDisposition.videoQuality) ? parseInt(objcallDisposition.videoQuality) : 0,
						audio_quality: !isNaN(objcallDisposition.audioQuality) ? parseInt(objcallDisposition.audioQuality) : 0,
						notes: objcallDisposition.notes
					};

					g3msInterface.elevatorHangup(req.get('userId'), objcallDisposition.elevatorId, objcallDisposition.uuid);
					if (objcallDisposition.enableCallDispo == "true") {
						g3msInterface.sendAlarmDisposition(objAlarmDispo, req.get('userId'), objcallDisposition.elevatorId, function (g3msResult) {
							if (dbresult.rowsAffected.length > 0) {
								res.send({ "status": true, data: undefined });
							} else {
								res.send({ "status": false, "code": "1010", data: undefined });
							}
						});
					}
					else {
						res.send({ "status": true, data: undefined });
					}
				});
			}
			else {
				res.send({ "status": false, "code": "1010", data: undefined });
			}
		});
	}
	catch (exception) {
		logException("saveCallDisposition", exception.message, req.get('userId'), req.get('elevatorID'));
		res.send({ "status": false, "code": "1010", data: undefined });
	}
}

function callDispositionUpdate(req, res) {
	try {
		logActivity("UpdateCallDisposition", req.get('userId'), req.get('elevatorID'));
		var objcallDisposition = req.body;
		objcallDisposition.currentUserId = req.get('userId');
		dbCalls.updateCallDisposition(objcallDisposition, function (dbresult) {
			if (dbresult.rowsAffected.length > 0) {
				res.send({ "status": true, data: undefined });
			} else {
				res.send({ "status": false, "code": "1010", data: undefined });
			}
		});
	}
	catch (exception) {
		logException("callDispositionUpdate", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "1010", data: undefined });
	}
}

function retrieveCallDispositionData(req, res) {
	try {
		logActivity("retrieveCallDispositionData", req.get('userId'), req.get('elevatorID'));
		var objcallDisposition = { "countryConfigurationId": req.query.countryConfigurationId, currentUserId: req.get('userId'), "languageId": req.query.languageId };
		dbCalls.retrieveCallDispositionData(objcallDisposition, function (result) {
			if (result.recordset.length > 0) {
				if (result.recordset[0].message != null) {
					logException('retrieveCallDispositionData', result.recordset[0].message, req.get('userId'));
					res.send({ "status": false, data: result });
				}
				else {
					res.send({ "status": true, data: result });
				}
			}
			else {
				res.send({ "status": true, data: result });
			}
		});
	}
	catch (exception) {
		logException("retrieveCallDispositionData", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "1010", data: undefined });
	}
}

function saveCallDispositionData(req, res) {
	try {
		logActivity("saveCallDispositionData", req.get('userId'), req.get('elevatorID'));
		var objcallDisposition = req.body;
		objcallDisposition.currentUserId = req.get('userId');
		dbCalls.saveCallDispositionData(objcallDisposition, function (result) {
			res.send({ "status": true, data: result });
		});
	}
	catch (exception) {
		logException("saveCallDispositionData", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "1010", data: undefined });
	}
}

function deleteCallDispositionData(req, res) {
	try {
		logActivity("deleteCallDispositionData", req.get('userId'), req.get('elevatorID'));
		var objcallDisposition = {
			"callDispositionId": req.query.callDispositionId, currentUserId: req.get('userId')
		};

		dbCalls.deleteCallDispositionData(objcallDisposition, function (result) {
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
		logException("deleteCallDispositionData ", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "1010", data: undefined });
	}
}

function saveMessage(req, res) {
	try {
		logActivity("saveMessage", req.get('userId'), req.get('elevatorID'));
		var objcallDisposition = req.body;
		objcallDisposition.currentUserId = req.get('userId');
		dbCalls.retrieveCallDetails(objcallDisposition, function (result) {
			dbCalls.incidentId = 1;
			dbCalls.alarmId = 1;
			res.send({ "status": true, data: dbCalls });
		});
	}
	catch (exception) {
		logException("saveMessage", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "1010", data: undefined });
	}
}

function insertChatMsgDetails(req, res) {
	try {
		logActivity("insertChatMsgDetails", req.get('userId'), req.get('elevatorID'));
		var objChatDetails = req.body;
		objChatDetails.currentUserId = req.get('userId');
		// g3msInterface.sendChatMsg(objChatDetails, function (result) {
		// 	if (result.status) {
		dbCalls.insertChatMsgDetails(objChatDetails, function (result) {
			if (result.rowsAffected.length > 0) {
				res.send({ "status": true, data: result });
			}
		});
		// 	}
		// 	else {
		// 		res.send({ "status": false, data: undefined });
		// 	}
		// });
	}
	catch (exception) {
		logException("insertChatMsgDetails", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "1010", data: undefined });
	}
}

function insertCallDispstnDetails(req, res) {
	try {
		logActivity("insertCallDispstnDetails", req.get('userId'), req.get('elevatorID'));
		var objCallDispostnDetails = req.body;
		objCallDispostnDetails.currentUserId = req.get('userId');
		dbCalls.insertCallDispstnDetails(objCallDispostnDetails, function (result) {
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
		logException("insertCallDispstnDetails", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "1010", data: undefined });
	}
}

function retrieveCallDispstnDetails(req, res) {
	try {
		logActivity("retrieveCallDispstnDetails", req.get('userId'), req.get('elevatorID'));
		var objCallDispostnDetails = req.body;
		objCallDispostnDetails.currentUserId = req.get('userId');
		dbCalls.retrieveCallDispstnDetails(objCallDispostnDetails, function (result) {
			if (result.rowsAffected.length > 0) {
				res.send({ "status": true, data: result });
			}
		});
	}
	catch (exception) {
		logException("retrieveCallDispstnDetails", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "1010", data: undefined });
	}
}

function deleteCallDispstnDetails(req, res) {
	try {
		logActivity("deleteCallDispstnDetails", req.get('userId'), req.get('elevatorID'));
		var objCallDispostnDetails = req.query;
		objCallDispostnDetails.currentUserId = req.get('userId');
		dbCalls.deleteCallDispstnDetails(objCallDispostnDetails, function (result) {
			if (result.rowsAffected.length > 0) {
				console.log("delete call disposition details success");
				res.send({ "status": true, data: result });
			}
		});
	}
	catch (exception) {
		logException("deleteCallDispstnDetails", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "1010", data: undefined });
	}
}

function getCallDetail(req, res) {
	try {
		logActivity("getCallDetail", req.get('userId'), req.get('elevatorID'));
		var objCallDetails = {
			userId: req.query.userId,
			date: req.query.date,
			currentUserId: req.get('userId'),
			callFilter: req.query.callFilter
		}
		dbCalls.getCallDetail(objCallDetails, function (result) {
			if (result.rowsAffected.length > 0) {
				res.send({ "status": true, data: result });
			}
		});
	}
	catch (exception) {
		logException("getCallDetail", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "1010", data: undefined });
	}
}


function getGeoAddress(req, res) {
	try {
		var geoAddress = req.query.address
		geobing.setKey(bingCredentials.bingMapQueryKey);

		geobing.getCoordinates(geoAddress, function (err, coordinates) {
			if (coordinates != null) {
				geobing.getInfoFromCoordinates({ lat: coordinates.lat, lng: coordinates.lng }, function (err, result) {
					res.send({ 'status': true, 'lat': coordinates.lat, 'lng': coordinates.lng, address: result.name });
				});
			}
			else {
				console.log("Map Error: ", err)
				res.send({ 'status': false, 'lat': undefined, 'lng': undefined, address: undefined });
			}
		});
	}
	catch (exception) {
		logException("getGeoAddress", exception.message, req.get('userId'));
		res.send({ 'status': false, 'lat': undefined, 'lng': undefined, address: undefined });
	}
}

/*
*	Request handler to delete Audio & Video from application DB
*	@param1: req (Request)
*	@param2:res(response)
* 	@return: res
*/
function deleteAudioVideo(req, res) {
	console.log("Request recived");
	res.send({ "status": true });
}

/*
*	Request handler to retrive Audio & Video from application DB
*	@param1: req (Request)
*	@param2:res(response)
* 	@return: res
*/
function retriveAudioVideoData(req, res) {
	try {
		var callDetails = {
			'callDetailsId': req.query.callDetailsId,
			'incidentId': req.query.incidentId,
			'currentUserId': req.get('userId')
		};
		var responseResult = {
			"status": false,
			"data": undefined,
			"code": undefined
		};
		dbCalls.retriveAudioVideoData(callDetails, function (result, unexpectedError) {
			if (unexpectedError) {
				responseResult.code = "2000";
			} else {
				if (result.rowsAffected.length > 0) {
					responseResult.status = true;
					responseResult.data = result;

				}
			}
			res.send(responseResult);
		});
	} catch (exception) {
		logException("retriveAudioVideoData", exception.message, req.get('userId'));
		responseResult.code = "1010";
		res.send(responseResult);
	}
}

/*
*	Request handler to download Audio & Video from twilio to application DB
*	@param1: req (Request)
*	@param2:res(response)
* 	@return: res
*/
function downloadAudioVideo(req, res) {
	var elevatorDetail = req.body;
	var responseResult = {
		"status": false,
		"data": null,
		"code": null
	}

	console.log(elevatorDetail.roomSid);
	//Check we have all the urls
	twilioInterface.recordMediaByRoom(elevatorDetail.roomSid, function (twiliores) {
		if (twiliores.status) {
			if (twiliores.room.length > 0) {
				for (var i = 0; i < twiliores.room.length; i++) {
					if (twiliores.room[i].groupingSids.participant_sid == elevatorDetail.localParticipantSid) {
						if (twiliores.room[i].type == "video") {
							elevatorDetail.videoUrl = twiliores.room[i].url;
						}
						else {
							elevatorDetail.audioUrl = twiliores.room[i].url;
						}
					}

					if (twiliores.room[i].groupingSids.participant_sid == elevatorDetail.remoteParticipantSid) {
						if (twiliores.room[i].type == "video") {
							elevatorDetail.remVideoUrl = twiliores.room[i].url;
						}
						else {
							elevatorDetail.remAudioUrl = twiliores.room[i].url;
						}
					}
				}
			}
		}

		var downLoadDetail = {
			agent: {
				audio: null,
				video: null,
				audioUrl: elevatorDetail.audioUrl,
				videoUrl: elevatorDetail.videoUrl
			},
			elevator: {
				audio: null,
				video: null,
				audioUrl: elevatorDetail.remAudioUrl,
				videoUrl: elevatorDetail.remVideoUrl
			},
			downloadStatus: "",
			currentuserId: req.get('userId'),
			callDetailId: elevatorDetail.callDetailsId,
			userId: elevatorDetail.userId,
			downloadFor: ""
		};

		try {
			mediaDownloader.downlodCompleteMedia(downLoadDetail, function (result) {
				res.send({ "status": true, "data": result });
			}, function (error) {
				logException(error.methodName, error.detailederrorObj, req.get('userId'));
				res.send({ "status": false, "data": undefined });
			});
		} catch (exe) {
			logException("downloadAudioVideo", exception.message, req.get('userId'));
			responseResult.code = "1010";
			res.send({ "status": false, "data": undefined });
		}
	});
}

var logActivity = function (activityName, userId, elevatorId) {
	helperLogging.logActivity({ "activityname": activityName, "userId": userId, "elevatorId": elevatorId });
}

var logException = function (methodName, exceptionDetails, userId) {
	helperLogging.logException({ "isServer": 1, "methodName": methodName, "exceptionDetails": exceptionDetails, "userId": userId });
}

var logMessage = function (methodName, message, userId, elevatorId = null) {
	helperLogging.logMessage({
		"isServer": 1,
		"methodName": methodName,
		"message": message,
		"userId": userId,
		"elevatorId": elevatorId,
		"isOnlyLog": false
	})
}

module.exports = callDetails();
