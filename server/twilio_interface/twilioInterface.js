//// File Name: twilioInterface.js
//// Description: This has the methods to generate worker token, updating worker status, creating/ modifying workers
//// Version: 1.1
//// Changes: 
////	1. Timeout workflow is added to move the task from regular to Timeout workflow.
////	2. New method is included to fetch the item from sync map of Twilio to find out the user in-activity
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
'use strict';

var AccessToken = require('twilio').jwt.AccessToken;
const SyncGrant = AccessToken.SyncGrant;
const taskrouter = require('twilio').jwt.taskrouter;
var VideoGrant = AccessToken.VideoGrant;
var twilio = require('twilio');
var twilioCredentials = require('../configs/config.js');
var helperLogging = require('../helper/logging.js');
var kvservice = require('../helper/keyVaultService');
var dbLogin = require('../dataaccess_layer/login.js');
var client = require('twilio');
const TaskRouterCapability = taskrouter.TaskRouterCapability;
const Policy = TaskRouterCapability.Policy;
var moment = require('moment');
var messages = require('../message/twilioMessage.js');
var g3msComm = require('../G3MS_interface/G3MSInterface');
var urlencode = require('urlencode');
var constant = {
	pageSize: 100,
	activityId: 2,
	offline: "Offline",
	"delayDiff": 5
};
var queueExpression = "(task.language IN worker.languages AND task.elevator_commission_state IN worker.elevator_commission_state AND transfer = null)";
var expCallForward = " or (task.target_worker = worker.agent_name)";
var settings = require('../dataaccess_layer/settings.js');

function getTwilioDetailsFromVault() {
	kvservice.getSecret("accountSid", function (accountSid) {
		twilioCredentials.accountSid = accountSid;

		kvservice.getSecret("authToken", function (authToken) {
			twilioCredentials.authToken = authToken;
			client = require('twilio')(twilioCredentials.accountSid, twilioCredentials.authToken);
		});
	});

	kvservice.getSecret("workspaceSid", function (workspaceSid) {
		twilioCredentials.workspaceSid = workspaceSid;
	});

	kvservice.getSecret("workflowSid", function (workflowSid) {
		twilioCredentials.workflowSid = workflowSid;
	});

	kvservice.getSecret("twilioAPIKey", function (twilioAPIKey) {
		twilioCredentials.twilioAPIKey = twilioAPIKey;
	});

	kvservice.getSecret("twilioAPISecret", function (twilioAPISecret) {
		twilioCredentials.twilioAPISecret = twilioAPISecret;
	});

	kvservice.getSecret("syncSid", function (syncSid) {
		twilioCredentials.syncSid = syncSid;
	});

	kvservice.getSecret("timeoutQueueSid", function (timeoutQueueSid) {
		twilioCredentials.timeoutQueueSid = timeoutQueueSid;
	});

}
getTwilioDetailsFromVault();

const util = require('twilio').jwt.taskrouter.util;
const URL = require('url');
const version = 'v1';

function twilioInteraction() {
	return {
		getIdentityToken: getIdentityToken,
		getIdentityTokenRequest: getIdentityTokenRequest,
		getIdentityTokenFromSIPVideo: getIdentityTokenFromSIPVideo,
		getWorkerToken: getWorkerToken,
		getWorkerTokenRequest: getWorkerTokenRequest,
		getWorkerTokenForWinApp: getWorkerTokenForWinApp,
		updateActivity: updateActivity,
		updateUserActivity: updateUserActivity,
		addWorker: addWorker,
		completeTheTask: completeTheTask,
		updateWorker: updateWorker,
		deleteWorker: deleteWorker,
		changeActivity: changeActivity,
		getWorkerStatistics: getWorkerStatistics,
		getWorkersStatistics: getWorkersStatistics,
		saveWorkflow: saveWorkflow,
		addCountrySettings: addCountrySettings,
		deleteCountrySettings: deleteCountrySettings,
		updateCountrySettings: updateCountrySettings,
		getStatistics: getStatistics,
		generateToken4CPIB: generateToken4CPIB,
		initiatePhoneCall: initiatePhoneCall,
		recordMediaByRoom: recordMediaByRoom,
		recordMediaByParticipantId: recordMediaByParticipantId,
		deleteRecordedMediaBySId: deleteRecordedMediaBySId,
		createAuthenticatedMediaUrl: createAuthenticatedMediaUrl,
		generateTaskqueToken: generateTaskqueToken,
		getTaskDetails: getTaskDetails,
		createRoom: createRoom,
		fetchSyncItems: fetchSyncItems,
		transferTask: transferTask
	}
}

function getTaskDetails(taskSid, callBack) {
	try {
		client.taskrouter.v1
			.workspaces(twilioCredentials.workspaceSid)
			.tasks(taskSid)
			.fetch()
			.then((task) => {
				callBack({ status: true, task: task });
			}, (err) => {
				callBack({ status: false });
			});
	}
	catch (e) {
	}
}

function saveWorkflow(config, taskQueues, callBack, userId) {
	console.log("Timeout : ", config.timeout)
	logMessage("saveWorkflow", messages.saveWorkflowStarted, userId, null);

	//tq_timeout is the taskqueue which will initiate phone-call if there is no agent is available.
	const configuration = {
		'task_routing': {
			'filters': []
		}
	};

	for (var i = 0; i < taskQueues.length; i++) {
		if (taskQueues[i].isRedirectionEnabled) {
			configuration.task_routing.filters.push({
				'targets': [{
					'queue': taskQueues[i].sId,
					'expression': queueExpression + expCallForward,
					'timeout': taskQueues[i].timeout
				},
				{
					'queue': twilioCredentials.timeoutQueueSid
				}],
				'filter_friendly_name': taskQueues[i].name,
				'expression': taskQueues[i].expression
			});
		}
		else {
			configuration.task_routing.filters.push({
				'targets': [{
					'queue': taskQueues[i].sId,
					'expression': queueExpression + expCallForward,
					'timeout': taskQueues[i].timeout
				}],
				'filter_friendly_name': taskQueues[i].name,
				'expression': taskQueues[i].expression
			});
		}
	}
	logMessage("saveWorkflow", messages.workflowExpressionFormed, userId, null);
	client.taskrouter.v1
		.workspaces(twilioCredentials.workspaceSid)
		.workflows(twilioCredentials.workflowSid)
		.update({
			taskReservationTimeout: config.timeout,
			configuration: JSON.stringify(configuration)
		})
		.then((workflow) => {
			logMessage("saveWorkflow", messages.workflowSavedSuccessfully, userId, null);
			callBack({
				"status": true,
				"workflow": workflow
			});
		},
			(err) => {
				logMessage("saveWorkflow", messages.workflowSavingError + err, userId, null);
				logException("saveWorkflow", err, "");
				callBack({
					"status": false,
					"err": err
				});
			});
}

function getWorkerStatistics(objWorker, callBack) {
	try {
		var request = client.taskrouter.v1
			.workspaces(twilioCredentials.workspaceSid)
			.workers(objWorker.workerSid)
			.statistics();
		request['_uri'] = request['_uri'] + '?StartDate=' + objWorker.dateFrom + '&EndDate=' + objWorker.dateTo;
		request.fetch().then((responseData) => {
			logMessage("getWorkerStatistics", messages.gotWorkerStats, objWorker.currentUserId);
			callBack({
				"status": true,
				data: responseData
			});
		}, (err) => {
			logException("getWorkerStatistics", err, objWorker.currentUserId);
			callBack({ "status": false, data: undefined })
		});
	} catch (exception) {
		callBack({ "status": false, "data": undefined, "err": exception.message })
	}
}

function getStatistics(objWorker, callBack) {
	try {
		var i = 0;
		var deatilsArray = [];
		logMessage("getStatistics", messages.getStatistics, objWorker.currentUserId);
		function loop() {
			var request = client.taskrouter.v1
				.workspaces(twilioCredentials.workspaceSid)
				.workers(objWorker.workerStatistics[i])
				.statistics();
			request['_uri'] = request['_uri'] + '?StartDate=' + objWorker.dateFrom + '&EndDate=' + objWorker.dateTo;
			request.fetch().then((responseData) => {
				deatilsArray.push({ workerName: objWorker.name[i], workerSid: objWorker.workerStatistics[i], workerStats: responseData.cumulative, availability: "", activityName: "", statusUpdated: "" });
				i++;
				if (i < objWorker.workerStatistics.length) {
					loop();
				} else {
					objWorker.allWorker = deatilsArray;
					getWorkerAvailability(objWorker, function (result) {
						logMessage("getStatistics", messages.gotStatistics, objWorker.currentUserId);
						callBack(result);
					});
				}
			}, (err) => {
				logException("getStatistics", err, objWorker.currentUserId);
				callBack(undefined)
			});
		}
		loop();
	} catch (exception) {
		callBack({ "data": undefined, "err": exception.message });
	}
}

function getWorkerAvailability(objWorker, callBack) {
	try {
		var i = 0;
		logMessage("getWorkerAvailability", messages.getWorkerAvailabilityReq, objWorker.currentUserId);
		function loop() {
			var request = client.taskrouter.v1
				.workspaces(twilioCredentials.workspaceSid)
				.workers(objWorker.workerStatistics[i]);
			request.fetch().then(worker => {
				objWorker.allWorker[i].availability = worker.available
				objWorker.allWorker[i].activityName = worker.activityName
				objWorker.allWorker[i].statusUpdated = worker.dateStatusChanged
				i++
				if (i < objWorker.workerStatistics.length) {
					loop()
				} else {
					logMessage("getWorkerAvailability", messages.gotWorkerAvailabilityReq, objWorker.currentUserId);
					callBack(objWorker)
				}
			}, (err) => {
				logException("getStatistics", err, objWorker.currentUserId);
				callBack(undefined)
			});
		}
		loop();
	}
	catch (exception) {
		callBack({ "data": undefined, "err": exception.message });
	}
}

function getWorkersStatistics(objWorkers, callBack) {
	logMessage("getWorkersStatistics", messages.getWorkersStatisticsReq, objWorkers.currentUserId);
	try {
		var request = client.taskrouter.v1
			.workspaces(twilioCredentials.workspaceSid)
			.workers
			.statistics();
		request['_uri'] = request['_uri'] + '?StartDate=' + objWorkers.dateFrom + '&EndDate=' + objWorkers.dateTo + '&TaskQueueSid=' + objWorkers.taskQueueSid;
		request.fetch().then((responseData) => {
			logMessage("getWorkersStatistics", messages.gotWorkersStatisticsReq, objWorkers.currentUserId);
			callBack({
				"status": true,
				data: responseData
			});
		}, (err) => {
			console.log("Exception: ", err);
			logException("getWorkersStatistics", err, objWorker.currentUserId);
			callBack({
				"status": false,
				data: undefined
			})
		});
	} catch (ex) {
		callBack({ "status": false, "data": undefined, "err": ex.message });
	}
}

function getIdentityToken(identity) {
	return generateIdentityToken(identity);
}

function getIdentityTokenFromSIPVideo(request, response) {
	var identity = request.params.identity;
	response.send({
		identity: identity,
		token: generateIdentityToken(identity).token,
		syncToken: generateSyncToken(identity)
	});
}

function getIdentityTokenRequest(request, response) {
	var identity = request.query.identity;
	response.send({
		identity: identity,
		token: generateIdentityToken(identity).token
	});
}

function getWorkerToken(workerSid) {
	try {
		return {
			"status": true,
			"token": generateWorkerToken(workerSid)
		};
	} catch (exception) {
		return { "status": false, "err": exception.message, "token": "" };
	}
}

function getWorkerTokenForWinApp(request, response) {
	try {
		console.log("worker token request:")
		var workerSid = request.query.workerSid;
		var activitySid = request.query.activitySid;
		//make user available & send token
		updateActivityFunc(workerSid, activitySid, function (res) {
			console.log("Res: ", res)
			response.send({
				status: true,
				token: generateWorkerToken(workerSid),
				taskqueueToken: generateTaskqueToken(workerSid),
				syncToken: generateSyncToken(workerSid)
			});
		});
	} catch (exception) {
		response.send({ status: false, token: "" });
	}
}

function getWorkerTokenRequest(request, response) {
	try {
		console.log("worker token request:")
		var workerSid = request.query.workerSid;
		response.send({
			status: true,
			token: generateWorkerToken(workerSid),
			taskqueueToken: generateTaskqueToken(workerSid),
			syncToken: generateSyncToken(workerSid)
		});
	} catch (exception) {
		response.send({ status: false, token: "" });
	}
}

function changeActivity(req, res) {
	try {
		logActivity("changeActivity", req.get('userId'), req.get('elevatorID'));
		var workerSid = req.query.SID;
		var activitySid = req.query.actSId;

		client.taskrouter.v1
			.workspaces(twilioCredentials.workspaceSid)
			.workers(workerSid)
			.update({
				activitySid: activitySid
			})
			.then(function (worker) {
				res.send({ "status": true });
			}, function (err) {
				logException("changeActivity", err, req.get('userId'));
				res.send({ "status": false, "err": err });
			});
	} catch (exception) {
		logException("changeActivity", exception.message, req.get('userId'));
	}
}

function completeTheTask(rmSid, taskSid) {

	try {
		if (rmSid != null) {
			var client = new twilio(twilioCredentials.twilioAPIKey, twilioCredentials.twilioAPISecret, { accountSid: twilioCredentials.accountSid });
			client.video.rooms(rmSid)
				.update({
					status: 'completed'
				}).then((room) => {
					console.log("Completing the task (room updation): ", room.status);
				}, (err) => {
					console.log("Task Updation Error (room updation): ", err)
				});
		}

		if (taskSid != null) {
			client.taskrouter.v1
				.workspaces(twilioCredentials.workspaceSid)
				.tasks(taskSid)
				.update({
					assignmentStatus: 'completed',
					reason: 'Task completed',
				})
				.then((task) => {
					console.log("Completing the task (task updation): ", task.assignmentStatus);
				},
					(err) => {
						console.log("Task Updation Error (task updation): ", err);
					});
		}
	}
	catch (e) {
	}
}

function updateActivityFunc(workerSid, activitySid, callBack) {
	client.taskrouter.v1
		.workspaces(twilioCredentials.workspaceSid)
		.workers(workerSid)
		.update({
			activitySid: activitySid
		})
		.then(function (worker) {
			callBack({ "status": true, "data": {} });
		}, function (err) {
			logException("updateActivity", err, "");
			//Get the task age here
			callBack({ "status": false, "err": err });
		});
}

function updateActivityForLogin(workerSid, timeout, callBack) {
	try {
		console.log("Function for login reached: ", workerSid, " timeout: ", timeout);
		logMessage("updateActivityForLogin", messages.updateActivityLogin, workerSid, null);
		
		//Get the task age here	
		client.taskrouter.v1
			.workspaces(twilioCredentials.workspaceSid)
			.workers(workerSid)
			.reservations
			.list()
			.then((data) => {
				if (data.length > 0) {
					client.taskrouter.workspaces(twilioCredentials.workspaceSid)
						.tasks(data[data.length - 1].taskSid)
						.fetch()
						.then(task => {
							var res = (timeout - task.age) > 0 ? (timeout - task.age) : 0;
							var retRes = { status: (res > 15 ? true : false), age: (res > 0 ? res : 0) };
							console.log(task.age, task.assignmentStatus, res, " Return Result: ", retRes);
							logMessage("updateActivityForLogin", messages.updateActAge + task.age, workerSid, null);
							callBack(retRes);
						});
				}
				else {
					callBack({ status: true, res: data[0] })
				}
			});
	}
	catch (e) {
		console.log("Exception: ", e)
	}
}

function updateActivity(workerSid, activitySid, offActivitySid, reservationTimeout, callBack) {
	try {
		client.taskrouter.workspaces(twilioCredentials.workspaceSid)
			.workers(workerSid)
			.fetch()
			.then(worker => {
				if (worker.activityName == "Idle" && offActivitySid != null) {
					updateActivityFunc(workerSid, offActivitySid, function (res) {
						if (res.status) {
							updateActivityFunc(workerSid, activitySid, callBack);
						}
						else {
							callBack(res);
						}
					});
				}
				else {
					console.log("activity name: ", worker.activityName)
					if (worker.activityName == "Reserved") {
						updateActivityForLogin(workerSid, reservationTimeout, function (res) {
							if (!res.status) {
								//console.log("Timeout Age is: ", res.age, "timeout: ", (res.age + 1) * 1000)
								logMessage("updateActivityForLogin:SetTimeout", messages.updateActAge + res.age, workerSid, null);
								setTimeout(updateActivityFunc, ((res.age + 1) * 1000), workerSid, activitySid, callBack);
							}
							else {
								callBack(res);
							}
						});
					}
					else {
						updateActivityFunc(workerSid, activitySid, callBack);
					}
				}
			})
			.done();

	} catch (exception) {
		logException("updateActivity", exception.message, req.get('userId'));
	}
}

function updateUserActivity(workerSid, activitySid, callBack) {
	try {
		client.taskrouter.v1
			.workspaces(twilioCredentials.workspaceSid)
			.workers(workerSid)
			.update({
				activitySid: activitySid
			})
			.then(function (worker) {
				if (callBack) {
					callBack({ status: true })
				}
			}, function (err) {
				if (callBack) {
					callBack({ status: false })
				}
				logException("updateUserActivity", err, "");
			});
	} catch (exception) {
		logException("updateUserActivity", exception.message, req.get('userId'));
	}
}

var generateToken4CPIB = function (req, res) {
	try {
		if (!req.query.identity) {
			res.send({ status: false, msg: "Identity is required" });
		}
		else if (!req.query.room) {
			res.send({ status: false, msg: "Room is required" });
		}
		else {
			var token = new AccessToken(
				twilioCredentials.accountSid,
				twilioCredentials.twilioAPIKey,
				twilioCredentials.twilioAPISecret
			);

			token.identity = req.query.identity;
			const grant = new VideoGrant();
			grant.room = req.query.room;
			token.addGrant(grant);

			res.send({ status: true, token: token.toJwt() });
		}

	} catch (exception) {
		res.send({ status: false, msg: exception.message });
	}
}

var initiatePhoneCall = function (req, res) {
	try {
		logMessage("initiatePhoneCall", messages.sipCallReached, null, req.query.unitId);
		if (!req.query.to) {
			logException("initiatePhoneCall", messages.toRequired, 1, req.query.unitId);
			res.send({ status: false, msg: messages.toRequired });
		}
		else if (!req.query.from) {
			logException("initiatePhoneCall", messages.fromRequired, 1, req.query.unitId);
			res.send({ status: false, msg: messages.fromRequired });
		}
		else if (!req.query.groupId) {
			logException("initiatePhoneCall", "GroupId required", 1, req.query.unitId);
			res.send({ status: false, msg: "GroupId required" });
		}
		else if (!req.query.unitId) {
			logException("initiatePhoneCall", messages.unitIDRequired, 1, req.query.unitId);
			res.send({ status: false, msg: messages.unitIDRequired });
		}
		else {
			if (isNaN(req.query.to)) {
				logException("initiatePhoneCall", messages.fromRequired, 1, req.query.unitId);
				res.send({ status: false, msg: messages.unitIDRequired });
			}
			else if (isNaN(req.query.from)) {
				logException("initiatePhoneCall", messages.fromShouldNumber, 1, req.query.unitId);
				res.send({ status: false, msg: messages.fromShouldNumber });
			}
			else if (isNaN(req.query.groupId)) {
				logException("initiatePhoneCall", "GroupId should be number", 1, req.query.unitId);
				res.send({ status: false, msg: "GroupId should be number" });
			}
			else {
				logMessage("initiatePhoneCall", messages.sipCallInitiated + req.query.unitId + ", to: " + req.query.to + ", from: " + req.query.from, null, req.query.unitId);
				const client = require('twilio')(twilioCredentials.accountSid, twilioCredentials.authToken);

				g3msComm.getElevatorInfo(req.query.unitId, function (result) {
					var encoded = urlencode(result.data.contractInfo.buildingName + " " + result.data.contractInfo.buildingAddress);
					var encodElevatorId = urlencode(req.query.unitId);

					client.calls
						.create({
							method: 'GET',
							statusCallback: twilioCredentials.statusCallbackURL,
							statusCallbackMethod: 'POST',
							statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
							url: twilioCredentials.twiMLHandler + encodElevatorId + '&lang=us' + '&buildInfo=' + encoded,
							to: req.query.to,
							from: req.query.from,
						})
						.then(call => {
							logMessage("initiatePhoneCall", messages.callInitiatedSuccessfully + call.sid, 1, req.query.unitId);
							res.send({ status: true });
						}, (err) => {
							logException("initiatePhoneCall", messages.callInitiationErr + err, 1, req.query.unitId);
							res.send({ status: false });
						});
				});
			}
		}

	} catch (exception) {
		res.send({ status: false, msg: exception.message });
	}
}

var generateIdentityToken = function (identity) {
	try {
		var token = new AccessToken(
			twilioCredentials.accountSid,
			twilioCredentials.twilioAPIKey,
			twilioCredentials.twilioAPISecret
		);

		token.identity = identity;
		token.addGrant(new VideoGrant());

		return {
			"status": true,
			"identity": identity,
			"token": token.toJwt()
		};
	} catch (exception) {
		return {
			"status": false,
			"err": exception.message,
			"token": ""
		};
	}
}

var generateSyncToken = function (workerSid) {
	// Create a "grant" identifying the Sync service instance for this app.
	var syncGrant = new SyncGrant({
		serviceSid: twilioCredentials.syncSid,
	});

	// Create an access token which we will sign and return to the client,
	// containing the grant we just created and specifying his identity.
	var token = new AccessToken(
		twilioCredentials.accountSid,
		twilioCredentials.twilioAPIKey,
		twilioCredentials.twilioAPISecret
	);

	token.addGrant(syncGrant);
	token.identity = workerSid;

	// Serialize the token to a JWT string and include it in a JSON res
	return token.toJwt();
}

var generateTaskqueToken = function (workerSid) {
	try {
		const TASKROUTER_BASE_URL = 'https://taskrouter.twilio.com';
		const version = 'v1';

		const capability = new twilio.jwt.taskrouter.TaskRouterCapability({
			accountSid: twilioCredentials.accountSid,
			authToken: twilioCredentials.authToken,
			workspaceSid: twilioCredentials.workspaceSid,
			channelId: workerSid
		});

		function buildWorkspacePolicy(options) {
			options = options || {};
			var resources = options.resources || [];
			var urlComponents = [TASKROUTER_BASE_URL, version, 'Workspaces', twilioCredentials.workspaceSid]

			return new Policy({
				url: urlComponents.concat(resources).join('/'),
				method: options.method || 'GET',
				allow: true
			});
		}

		// Event Bridge Policies
		var eventBridgePolicies = util.defaultEventBridgePolicies(twilioCredentials.accountSid, workerSid);
		var workspacePolicies = [
			// Workspace fetch Policy
			buildWorkspacePolicy(),
			// Workspace subresources fetch Policy
			buildWorkspacePolicy({ resources: ['**'] }),
			// Workspace Tasks Update Policy
			buildWorkspacePolicy({ resources: ['Workers', twilioCredentials.workspaceSid, 'Tasks', '**'], method: 'POST' }),
		];

		eventBridgePolicies.concat(workspacePolicies).forEach(function (policy) {
			capability.addPolicy(policy);
		});

		return capability.toJwt();
	}
	catch (exception) {
		return "";
	}
}

var generateWorkerToken = function (workerSid) {
	try {
		var capability = new twilio.jwt.taskrouter.TaskRouterCapability({
			accountSid: twilioCredentials.accountSid,
			authToken: twilioCredentials.authToken,
			workspaceSid: twilioCredentials.workspaceSid,
			channelId: workerSid,
			ttl: 36000
		});

		const workerPolicies = util.defaultWorkerPolicies('v1', twilioCredentials.workspaceSid, workerSid);
		workerPolicies.forEach(function (policy) {
			capability.addPolicy(policy);
		});

		const newPolicy1 = new twilio.jwt.taskrouter.TaskRouterCapability.Policy({
			url: 'https://taskrouter.twilio.com/v1/Workspaces/' + twilioCredentials.workspaceSid + '/Tasks/**',
			method: 'POST',
			allow: true
		});
		capability.addPolicy(newPolicy1);

		const newPolicy2 = new twilio.jwt.taskrouter.TaskRouterCapability.Policy({
			url: 'https://taskrouter.twilio.com/v1/Workspaces/' + twilioCredentials.workspaceSid + '/Workers/**',
			method: 'POST',
			allow: true
		});
		capability.addPolicy(newPolicy2);

		const eventBridgePolicies = util.defaultEventBridgePolicies(twilioCredentials.accountSid, workerSid);
		eventBridgePolicies.forEach(function (policy) {
			capability.addPolicy(policy);
		});

		return capability.toJwt();
	} catch (exception) {
		return "";
	}
}

function addWorker(agent, callBack) {
	try {
		logMessage("addWorker:twilio", "Adding agent " + agent.userID + "-" + agent.name + " is in-progress", 1);
		var friName = agent.userID + "-" + agent.name;
		var agentAttributes = {
			"elevator_commission_state": agent.callType,
			"company": "otis",
			"country": agent.countryName,
			"languages": agent.languageSkillsId,
			"name": friName
		};

		//create user with attributes
		client.taskrouter.v1
			.workspaces(twilioCredentials.workspaceSid)
			.workers
			.create({
				friendlyName: friName,
				activitySid: agent.activitySid,
				attributes: JSON.stringify(agentAttributes),
			}).then((worker) => {
				logMessage("addWorker:twilio", "Agent " + agent.userID + "-" + agent.name + " added successfully", 1);
				/*client.sync.services(twilioCredentials.syncSid)
					//.documents('MyFirstDocument')
					.documentPermissions(friName)
					.update({ read: true, write: true, manage: true })
					.then(document_permission => {
						console.log("Got permission result")
						console.log(document_permission.serviceSid)
					},
					err => console.log("Error ", err));*/

				callBack({
					"status": true,
					"sId": worker.sid
				});
			}, (err) => {
				logException("addWorker:twilio", err, 1);
				callBack({
					"status": false,
					"err": err
				});
			});
	} catch (exception) {
		logException("addWorker:twilio", exception.message, 1);
		callBack({
			"status": false,
			"err": exception.message
		});
	}
}

function updateWorker(agent, callBack) {
	try {
		logMessage("updateWorker:twilio", "Updating agent " + agent.userID + "-" + agent.name + " is in-progress", 1);
		var friName = agent.userID + "-" + agent.name;
		var agentAttributes = {
			"elevator_commission_state": agent.callType,
			"company": "otis",
			"country": agent.countryName,
			"languages": agent.languageSkillsId,
			"name": friName
		};

		var attri = {
			attributes: JSON.stringify(agentAttributes),
			'friendlyName': friName
		};

		if (agent.proUpdate != "self" && agent.isStausModified) {
			attri.activitySid = agent.activitySid;
		}

		//update activity of a user
		client.taskrouter.v1
			.workspaces(twilioCredentials.workspaceSid)
			.workers(agent.sId)
			.update(attri)
			.then(function (worker) {
				logMessage("updateWorker:twilio", "Agent " + agent.userID + "-" + agent.name + " updated successfully", 1);
				/*client.sync.services(twilioCredentials.syncSid)
					.syncMaps('OtisLineTaskQueue-' + agent.countryName.toLowerCase())
					.syncMapPermissions(agent.sId)
					.update({ read: true, write: true, manage: true })
					.then(document_permission => {
						console.log("Got permission result")
						//console.log(document_permission)},
					err => console.log("Error ", err));
					client.sync.services(twilioCredentials.syncSid)
					.syncMaps('clientAvailable')
					.syncMapPermissions(agent.sId)
					.update({ read: true, write: true, manage: true })
					.then(document_permission => {
						console.log("Got permission result")
						//console.log(document_permission)},
					err => console.log("Error ", err));
				client.sync.services(twilioCredentials.syncSid)
					.syncMaps('UserIdentity3')
					.syncMapPermissions(agent.sId)
					.update({ read: true, write: true, manage: true })
					.then(document_permission => {
						console.log("Got permission result")
						console.log(document_permission)},
					err => console.log("Error ", err));
				client.sync.services(twilioCredentials.syncSid)
					.documents('CallEvent-3')
					.documentPermissions(agent.sId)
					.update({ read: true, write: true, manage: true })
					.then(document_permission => {
						console.log("Got permission result")
						console.log(document_permission)},
					err => console.log("Error ", err));
				*/
				callBack({
					"status": true
				});
			}, function (err) {
				logException("updateWorker:twilio", err, 1);
				callBack({
					"status": false,
					"err": err
				});
			});
	} catch (exception) {
		logException("updateWorker:twilio", exception.message, 1);
		callBack({
			"status": false,
			"err": exception.message
		});
	}
}

function deleteWorker(workerSid, activitySid, callBack) {
	try {
		//delete a worker: update just activity

		client.taskrouter.v1
			.workspaces(twilioCredentials.workspaceSid)
			.workers(workerSid)
			.update({
				activitySid: activitySid
			})
			.then(function (worker) {
				callBack({
					"status": true
				});
			}, function (err) {
				logException("deleteWorker", err, "");
				callBack({
					"status": false,
					"err": err
				});
			});

	} catch (exception) {
		callBack({
			"status": false,
			"err": exception.message
		});
	}
}

function addCountrySettings(objCountry, callBack) {
	try {
		//To create task queue 
		client.taskrouter.v1
			.workspaces(twilioCredentials.workspaceSid)
			.taskQueues
			.create({
				friendlyName: objCountry.countryShortName + '-TaskQueue',
				reservationActivitySid: objCountry.reservSid,
				assignmentActivitySid: objCountry.assignSid,
				targetWorkers: 'country == "' + objCountry.countryShortName + '"'
			}).then((country) => {
				callBack({
					"status": true,
					"country": country
				});
			}, (err) => {
				logException("addCountrySettings", err, "");
				callBack({
					"status": false,
					"err": err
				});
			});
	} catch (exception) {
	}
}


function deleteCountrySettings(objCountry, callBack) {
	try {
		var taskQueueSid = objCountry.configurationId;
		client.taskrouter.v1
			.workspaces(twilioCredentials.workspaceSid)
			.taskQueues(taskQueueSid)
			.remove()
			.then((taskQueueSid) => {
				callBack({
					"status": true,
					"data": "Deleted in twilio"
				});
			}, (err) => {
				logException("deleteCountrySettings", err, "");
				callBack({
					"status": false,
					"err": err
				});
			});;

	} catch (exception) {
		callBack({
			"status": false,
			"err": exception.message
		});
	}
}

function updateCountrySettings(objCountry, callBack) {
	try {
		var taskQueueSid = objCountry.sid;
		client.taskrouter.v1
			.workspaces(twilioCredentials.workspaceSid)
			.taskQueues(taskQueueSid)
			.update({
				targetWorkers: 'country == "' + objCountry.countryShortName + '"'
			})
			.then(taskQueue => {
			}, err => {
				logException("updateCountrySettings", err, "");
			});
		callBack({
			"status": true,
			"taskQueueSid": taskQueueSid
		});
	} catch (exception) {
		callBack({
			"status": false,
			"err": exception.message
		});
	}
}

function recordMediaByRoom(roomId, callBack) {
	try {
		if (roomId == null) {
			callBack({ "status": true, "room": [] });
		}
		else {
			client.video.recordings
				.list({
					groupingSid: [roomId]
				})
				.then(rooms => {
					if (rooms.length > 0) {
						callBack({ "status": true, "room": rooms })
					}
					else {
						callBack({ "status": true, "room": [] });
					}
				}, err => {
					callBack({ "status": true, "room": [] });
					logException("recordMediaByRoom", err, "");
				});
		}

	} catch (exception) {
		callBack({
			"status": false,
			"err": exception.message
		});
	}
}


function recordMediaByParticipantId(participantSid, callBack) {
	try {
		if (participantSid == null) {
			callBack({ "status": true, "room": [] });
		}
		else {
			client.video.recordings
				.list({
					groupingSid: participantSid,
				})
				.then(rooms => {
					if (rooms.length > 0) {
						callBack({ "status": true, "room": rooms })
					}
					else {
						callBack({ "status": true, "room": [] });
					}
				}, err => {
					callBack({ "status": true, "room": [] });
					logException("recordMediaByParticipantId", err, "");
				});
		}

	} catch (exception) {
		callBack({
			"status": false,
			"err": exception.message
		});
	}
}

function deleteRecordedMediaBySId(sid) {
	try {
		client.video.recordings(sid)
			.remove().then((response) => {
			}, (err) => {
				logException("deleteRecordedMediaBySId", err, "");
			});
	} catch (exception) {
		callBack({
			"status": false,
			"err": exception.message
		});
	}
}

function createAuthenticatedMediaUrl(urlString) {
	try {
		if (urlString == null || urlString == "") {
			return null;
		} else {
			var username = twilioCredentials.accountSid;
			var password = twilioCredentials.authToken;
			const atRateSymb = "@";
			const slash = "/\/";
			const colon = ":";
			var parsedUrl = URL.parse(urlString), authenticatedUrl = null;
			authenticatedUrl = parsedUrl.protocol +
				slash +
				username + colon + password + atRateSymb +
				parsedUrl.hostname +
				parsedUrl.pathname + '\\' + "Media";
			return authenticatedUrl
		}
	} catch (exe) {
		throw exe;
	}
}

/* This method will create a task for the target worker */
function transferTask(req, res) {
	try {
		client.taskrouter.v1
			.workspaces(twilioCredentials.workspaceSid)
			.tasks
			.create({
				workflowSid: twilioCredentials.workflowSid,
				attributes: JSON.stringify(req.body),
				timeout: 300
			}).then(function (result) {
				console.log("Task SID: ", result.sid);
				res.send({ "status": true, "msg": "Task Added", "taskId": result.sid });
			}, function (err) {
				res.send({ "status": false, "msg": "Error creating task", "err": err });
			});
	}
	catch (e) {
		logException("transferTask", err, "");
	}
}

function createRoom(input, callBack) {
	try {
		logMessage("elevatorCallback", messages.createRoomStarted + " roomName: " + input.roomName + ", mediaRegion: " + input.mediaRegion, input.userId, null);
		var twiClient = new twilio(twilioCredentials.twilioAPIKey, twilioCredentials.twilioAPISecret, { accountSid: twilioCredentials.accountSid });
		twiClient.video.rooms
			.create(
				{
					uniqueName: input.roomName,
					mediaRegion: input.mediaRegion
				}
			)
			.then(
				(room) => {
					logMessage("elevatorCallback", messages.callbackRoomCreated, input.userId, null);
					callBack({ "status": true, "roomSID": room.sid, "mediaRegion": room.mediaRegion });
				},
				(err) => {
					if (err.code == 53113) {
						logMessage("elevatorCallback", messages.callbackRoomCreation53113Error, input.userId, null);
						callBack({ "status": true, "roomSID": "", "mediaRegion": input.mediaRegion });
					}
					else {
						logMessage("elevatorCallback", messages.callbackRoomCreationError, input.userId, null);
						err.statusCode = 1000;
						callBack({ "status": false, "err": err })
					}
				});
	} catch (ex) {
		logMessage("elevatorCallback", messages.callbackRoomCreationException + ex.message, input.userId, null);
		callBack({ "status": false, "err": ex });
	}
}

function fetchSyncItems() {
	try {
		//logMessage("CleaningInactiveUsers", messages.cleaningInactiveUsers, 1, true)
		const client = require('twilio')(twilioCredentials.accountSid, twilioCredentials.authToken);
		client.sync.services(twilioCredentials.syncSid)
			.syncMaps('clientAvailable')
			.fetch()
			.then(map => {
				//fecthing sync items
				client.sync.services(twilioCredentials.syncSid)
					.syncMaps(map.sid)
					.syncMapItems
					.each({ page_size: constant.pageSize },
						item => {
							//Process and make disable.
							var datetime = new Date();
							var diff = moment(datetime).diff(moment(item.data.datetime), 'minutes');

							if (diff >= constant.delayDiff) {
								//Log the message
								logMessage("diffForUser", "Diff for the user: " + item.data.userId + ", diff: " + diff, 1, null, true);
								logMessage("UpdatingUserActivity", messages.updateActivityMsg + diff + " minutes", item.data.userId, null)

								//Update activity Call twilio to make this to offline								
								updateUserActivity(item.data.workerSid, twilioCredentials.offlineSid, function (res) {
									client.sync.services(twilioCredentials.syncSid)
										.syncMaps(map.sid)
										.syncMapItems(item.data.workerSid)
										.remove()
										.then(sync_map_item => {
											console.log(sync_map_item.key);
										}, err => {
											logException("Scheduler", err, "");
										})
										.done();

									//Update the Useractivity as offline
									client.sync.services(twilioCredentials.syncSid)
										.syncMaps('UserIdentity' + item.data.countryConfigId)
										.fetch()
										.then(smap => {
											client.sync.services(twilioCredentials.syncSid)
												.syncMaps(smap.sid)
												.syncMapItems("UserId" + item.data.userId)
												.update({
													data: { "name": item.data.name, "status": constant.offline, "statusId": constant.activityId }
												})
												.then(smap => {
													var objActivity = { userId: item.data.userId, activityId: constant.activityId, alarmId: null, incidentId: null };
													logMessage("Scheduler", messages.updateActivityStarted + item.data.userId, item.data.userId)
													dbLogin.updateUserActivity(objActivity, function (res) {
														//Remove this user from session
														logMessage("Scheduler", messages.updateActivitySuccess + item.data.userId, item.data.userId)
													});
												}, err => {
													logException("Scheduler", err, "");
												})
												.done();
										}, err => {
											logException("Scheduler", err, "");
										});
								});
							}
						});
			}, err => {
				logException("Scheduler", err, "");
			})
			.done();

	} catch (ex) {
		logException("Scheduler", ex.message, "");
	}
}

var logActivity = function (activityName, userId, elevatorId) {
	helperLogging.logActivity({ "activityname": activityName, "userId": userId, "elevatorId": elevatorId });
}

var logException = function (methodName, exceptionDetails, userId = '', elevatorId) {
	helperLogging.logException({ "isServer": 1, "methodName": methodName, "exceptionDetails": exceptionDetails, "userId": userId, "elevatorId": elevatorId });
}

var logMessage = function (methodName, message, userId, elevatorId, isOnlyLog) {
	helperLogging.logMessage({
		"isServer": 1,
		"methodName": methodName,
		"message": message,
		"userId": userId,
		"elevatorId": elevatorId,
		"isOnlyLog": isOnlyLog != null ? true : false
	});
}

module.exports = twilioInteraction();