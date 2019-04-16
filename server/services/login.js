//// File Name: login.js
//// Description: This has the methods to authenticate users.
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/

'use strict';

var dbLogin = require('../dataaccess_layer/login.js');
var helperLogging = require('../helper/logging.js');
var messages = require('../message/loginMessage.js');
var twilioInterface = require('../twilio_interface/twilioInterface.js');
var appConfig = require('../configs/config.js');
var crypto = require('../helper/cryptohelper.js');
var tokenHandler = require('../helper/tokenHandler.js');
var mail = require('../helper/mailHelper.js');
var cache = require('../helper/lruCache.js');
var fs = require('fs');
var dbName = "", siteAddress = "";
var kvservice = require('../helper/keyVaultService');

function businessLogin() {
	return {
		login: validateLogin,
		getTokenTemp: getTokenTemp,
		changePassword: changePassword,
		updateUserActivity: updateUserActivity,
		getAllLanguages: getAllLanguages,
		recoverPassword: recoverPassword,
		getTokenRefresh: getTokenRefresh,
		getTokenRefreshForWin: getTokenRefreshForWin,
		getTokenRefreshForTesting: getTokenRefreshForTesting,
		mailContent: mailContent,
		removeLRUCache: removeLRUCache,
		removeReqSession: removeReqSession,
		verifyToken: verifyToken,
		getLoadDetails: getLoadDetails
	}
}

function getKeyFromVault() {
	kvservice.getSecret("connectionString", function (result) {
		var dbString = JSON.parse(result);
		dbName = dbString.database;
	});

	kvservice.getSecret("siteAddress", function (result) {
		siteAddress = result;
	});
}
getKeyFromVault();

function verifyToken(req, res) {
	res.send({ status: true });
}

function getMailContent() {
	return JSON.parse(fs.readFileSync('./server/configs/mail.js', 'utf8'));
}

function getTokenTemp(SID, callBack) {
	////Get worker token
	var workerToken = twilioInterface.getWorkerToken(SID);
	callBack({ "status": true, data: workerToken.token });
}


function getLoadDetails(callBack) {
	try {
		logActivity("getLoadDetails", "-", "-");
		callBack({
			"appName": appConfig.appName,
			"appVersion": appConfig.appVersion,
			"version": appConfig.version,
			"buildDate": appConfig.buildDate,
		});
	}
	catch (exception) {
		logException("getLoadDetails", exception.message, "-");
	}
}

function getTokenRefreshForTesting(req, res) {
	try {
		logActivity("getTokenRefreshForTesting", req.get('userId'), req.get('elevatorID'));
		dbLogin.getUserForRefresh(req.query.userId, function (result) {
			processLoginResult(result, res, req, "refresh-testing", req.query.userId);
		});
	}
	catch (exception) {
		logException("getTokenRefreshForTesting", exception.message, req.query.userId);
	}
}

function getTokenRefreshForWin(req, res) {
	try {
		var userId = req.params.userId;
		logActivity("getTokenRefresh", userId, null);
		dbLogin.getUserForRefresh(userId, function (result) {
			var status = false;
			var code = "";
			var resultData = undefined;
			var reqUserId = userId;
			logMessage(sender, messages.processLoginRes, reqUserId);
			var sender = "win-app";
			try {
				if (result.length > 0) {
					if (result[0].code === "1001") {
						reqUserId = result[0].userID;
						logMessage(sender, messages.successLoginResult, reqUserId);
						var userResult = { "user": result[0] };

						//Get the call disposition for that user				
						userResult.callDispo = result[1];

						resultData = userResult;
						status = true;
						res.send({ "status": status, "code": code, data: resultData });
					}
					else {
						var msg = "validate login-";
						switch (result[0].code) {
							case "1002":
								msg += "Invalid login details: emailId: " + id;
								break;
							case "1003":
								msg += "Account is locked: emailId: " + id;
								break;
							case "2001":
								msg += "password link is expired: emailId: " + id;
								break;
						}

						if (result[0].code != '1004') {
							logException(sender, msg, id);
							logMessage(sender, msg, reqUserId);
						}
						code = result[0].code;
						res.send({ "status": status, "code": code, emailId: result[0].emailId, data: resultData });
					}
				}
				else {
					////2000: will be the error code internal server error
					res.send({ "status": status, "code": "3000", data: resultData });
				}
			}
			catch (exception) {
				res.send({ "status": false, "code": "2000", data: null });
				logException("processLoginResult", exception.message, req.currentUserId);
			}
		});
	}
	catch (exception) {
		logException("getTokenRefresh", exception.message, userId);
	}
}

function getTokenRefresh(req, res) {
	try {
		logActivity("getTokenRefresh", req.get('userId'), req.get('elevatorID'));
		dbLogin.getUserForRefresh(req.query.userId, function (result) {
			processLoginResult(result, res, req, "refresh", req.query.userId);
		});
	}
	catch (exception) {
		logException("getTokenRefresh", exception.message, req.query.userId);
	}
}

function getAllLanguages(req, res) {
	try {
		var objLogin = req.body;
		logActivity("getAllLanguages", req.get('userId'), req.get('elevatorID'));
		objLogin.currentUserId = req.get('userId');
		dbLogin.getAllLanguages(req.query.userId, function (result) {
			res.send({ "status": (result.status ? result.status : true), data: result });
		});
	}
	catch (exception) {
		logException("getAllLanguages", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "", data: undefined });
	}
}

function validateLogin(req, res) {
	try {
		var objLogin = req.body;
		logActivity("validateLogin", objLogin.emailId, req.get('elevatorID'));
		objLogin.currentUserId = objLogin.emailId;

		if (objLogin.isFirstLogin) {
			logMessage("validateLogin", messages.loginChangePassword, req.get('userId'));
			objLogin.newPassword = crypto.encrypt(objLogin.newPassword);
			objLogin.oldPassword = crypto.encrypt(objLogin.password);

			if (objLogin.num && objLogin.chr && objLogin.ident) {
				logMessage("validateLogin", messages.loginChangePasswordForLink, req.get('userId'));
				objLogin.oldPassword = objLogin.chr;
			}

			dbLogin.changePassword(objLogin, function (result, data) {
				//send mail here
				var mailText = getMailContent();
				var objMailContent = mailText[0][data.languageShortName].changePassword;
				var objUser = { name: data.name, emailId: objLogin.emailId, password: objLogin.confirmPassword };
				var objMail = mailContent(objMailContent, objUser);
				mail.mailSender(objMail, function () {
					result.currentUserId = objLogin.emailId;
					processLoginResult(result, res, req, "changepwd-login", objLogin.emailId);
				});
			});
		}
		else {
			logMessage("validateLogin", messages.loginStarted, req.get('userId'));

			if (objLogin.num && objLogin.chr && objLogin.ident) {
				logMessage("validateLogin", 'Validating user link started', req.get('userId'));
				objLogin.password = objLogin.chr;
				objLogin.userId = crypto.decrypt(objLogin.num);
				objLogin.hours = objLogin.ident == "rp" ? appConfig.pwdResetLinkExpiredHours : appConfig.newUserLinkExpiredHours;
				dbLogin.validateUserByLink(objLogin, function (result) {
					result.currentUserId = result.emailId;
					processLoginResult(result, res, req, "login", result.emailId);
				});
			}
			else {
				objLogin.password = crypto.encrypt(objLogin.password);
				dbLogin.getUserByUsernameAndPassword(objLogin, function (result) {
					result.currentUserId = objLogin.emailId;
					processLoginResult(result, res, req, "login", objLogin.emailId);
				});
			}
		}
	}
	catch (exception) {
		logException("validateLogin", exception.message, req.body.emailId);
		res.send({ "status": false, "code": "", data: undefined });
	}
}

function changePassword(req, res) {
	try {
		logActivity("changePassword", req.get('userId'), req.get('elevatorID'));
		var objChangePwd = req.body;
		objChangePwd.currentUserId = req.get('userId');
		objChangePwd.oldPassword = crypto.encrypt(objChangePwd.oldPassword);
		objChangePwd.newPassword = crypto.encrypt(objChangePwd.newPassword);
		dbLogin.changePassword(objChangePwd, function (result) {
			if (result.length > 0 && result[0].code === "1001") {
				var langShrtName = result[0].languageShortName == null ? "eng" : result[0].languageShortName;
				var content = getMailContent()[0][langShrtName] == null ? getMailContent()[0]["eng"] : getMailContent()[0][langShrtName];
				var objMailContent = content.changePassword;
				var objUser = { name: result[0].name, emailId: objChangePwd.emailId, password: objChangePwd.confirmPassword };
				var objMail = mailContent(objMailContent, objUser);
				objMail.currentUserId = objChangePwd.currentUserId;
				mail.mailSender(objMail, function (response) {
					res.send({ "status": true, mailStatus: response.status, data: result[0].code });
				});
			}
			else {
				res.send({ "status": false, "code": "", data: undefined });
			}
		});
	}
	catch (exception) {
		logException("changePassword", exception.message, req.get('userId'));
		res.send({ "status": false, "code": "", data: undefined });
	}
};

function processLoginResult(result, res, req, sender, id) {
	var status = false;
	var code = "", mailId = "";
	var resultData = undefined;
	var reqUserId = req.get('userId');
	logMessage(sender, messages.processLoginRes, reqUserId);

	try {
		if (result.length > 0) {
			if (result[0].code === "1001") {
				reqUserId = result[0].userID;
				logMessage(sender, messages.successLoginResult, reqUserId);
				var userResult = { "user": result[0] };
				var roleId = result[0].roleId;
				var reservationTimeout = result[0].reservationTimeout;
				var menus = JSON.parse(fs.readFileSync('./server/configs/ccMenu.js', 'utf8'));
				var menuHtml = "";

				//// Get Menu here
				if (menus.length > 0) {
					menuHtml = roleId === 1 ? menus[0].agent : (roleId === 2 ? menus[0].supervisor : menus[0].admin);
					userResult.menu = menuHtml;
				}

				//Get the call disposition for that user				
				userResult.callDispo = result[1];
				userResult.shutdownReson = result[2];

				userResult.selectedCountries = result[3];

				userResult.selectedLanguages = result[4];

				userResult.questionText = result[5];

				console.log("RoleId is ", roleId);

				if (req.body.from == null) {
					//Generate token and send it to frontend
					logMessage(sender, messages.getJSONToken, reqUserId);
					var accToken = tokenHandler.generateToken(result[0]);
					userResult.accToken = accToken;
					logMessage(sender, messages.gotJSONToken, reqUserId);

					//Save cache in server end(ram) using least recently used cache of npm module(LRU-Cache)
					//cache.saveLRUCache(id, result[0].sId);
					cache.saveReqSession(req, id);
				}

				userResult.config = {
					"bingAPIKey": appConfig.bingMapMasterKey,
					"appConfig": {}
				}
				
				userResult.config.appConfig = {
					"idleSid": appConfig.idleSid,
					"busySid": appConfig.busySid,
					"deleteSid": appConfig.deleteSid,
					"offlineSid": appConfig.offlineSid,
					"reservSid": appConfig.reservSid,
					"isOnlyAudio": (appConfig.isOnlyAudio == "true" ? true : false),
					"videoCodec": appConfig.videoCodec,
					"audioCodec": appConfig.audioCodec,
					"switchOffLogs": (appConfig.switchOffLogs == "true" ? true : false),
					"timeout": reservationTimeout
				}
				
				userResult.aboutInfo = {
					"dbName": dbName,
					"g3ms": 'https://' + appConfig.g3msUri,
					"cims": 'https://' + appConfig.cimsUri,
					"appName": appConfig.appName,
					"appVersion": appConfig.appVersion,
					"version": appConfig.version,
					"buildDate": appConfig.buildDate,
				};

				////Get the token here if the user is not admin
				if (roleId !== 3 && req.body.from == null) {
					logMessage(sender, messages.identiTokInitiated, reqUserId);
					var token = twilioInterface.getIdentityToken(result[0].Name);
					if (token.status) {
						userResult.token = token.token;
					}

					////Get worker token
					logMessage(sender, messages.workerTokInitiated, reqUserId);
					var workerToken = twilioInterface.getWorkerToken(result[0].sId);
					if (workerToken.status) {
						userResult.workerToken = workerToken.token;
					}

					if (sender !== "refresh") {
						logMessage(sender, messages.updateActStart, reqUserId);
						twilioInterface.updateActivity(result[0].sId, appConfig.idleSid, appConfig.offlineSid, reservationTimeout, function (activityRes) {
							console.log("Got result from new logic: ", activityRes)
							if (!activityRes.status) {
								logMessage(sender, messages.updateActFail, reqUserId);
								console.log(activityRes.err);
								logException(sender, activityRes.err, reqUserId);
								res.send({ "status": false, "data": null, "err": activityRes.err, "code": '20001' });
							}
							else {
								//Log exception here
								logMessage(sender, messages.updateActSuccess, reqUserId);
								res.send({ "status": true, data: userResult });
							}
						});
					}
					else {
						res.send({ "status": true, data: userResult });
					}
				}
				else {
					resultData = userResult;
					status = true;
					res.send({ "status": status, "code": code, data: resultData });
				}
			}
			else {
				var msg = "validate login-";
				switch (result[0].code) {
					case "1002":
						msg += "Invalid login details: emailId: " + id;
						break;
					case "1003":
						msg += "Account is locked: emailId: " + id;
						break;
					case "2001":
						msg += "password link is expired: emailId: " + id;
						break;
				}

				if (result[0].code != '1004') {
					logException(sender, msg, id);
					logMessage(sender, msg, reqUserId);
				}
				code = result[0].code;
				res.send({ "status": status, "code": code, emailId: result[0].emailId, data: resultData });
			}
		}
		else {
			////2000: will be the error code internal server error
			res.send({ "status": status, "code": "3000", data: resultData });
		}
	}
	catch (exception) {
		res.send({ "status": false, "code": "2000", data: null });
		logException("processLoginResult", exception.message, req.currentUserId);
	}
}

function updateUserActivity(req, res) {
	try {
		logActivity("updateUserActivity", req.query.userId, req.query.activityId);
		var objActivity = { userId: req.query.userId, activityId: req.query.activityId, alarmId: req.query.alarmId, incidentId: req.query.incidentId };
		dbLogin.updateUserActivity(objActivity, function (result) {
			if (req.query.sender != 'logout') {
				res.send({ "status": true });
			}
			else {
				//if (cache.removeLRUCache(req.get("emailId"))) {
				if (cache.removeReqSession(req, req.get("emailId"))) {
					res.send({ "status": true });
				}
			}
		});
	}
	catch (exception) {
		logException("updateUserActivity", exception.message, req.get('userId'));
		res.send({ "status": true });
	}
}

//recover password
function recoverPassword(req, res) {
	var emailId = req.body.emailId;
	try {
		logActivity("recoverPassword", emailId, req.get('elevatorID'));
		var genPassword = crypto.generatePassword();
		var password = crypto.encrypt(genPassword);
		dbLogin.recoverPassword(emailId, password, function (result) {
			if (result[0].code === "1001") {
				var langShrtName = result[0].languageShortName == null ? "eng" : result[0].languageShortName;
				var content = getMailContent()[0][langShrtName] == null ? getMailContent()[0]["eng"] : getMailContent()[0][langShrtName];
				var objMailContent = content.recoverPassword;
				var decryptPassword = crypto.decrypt(result[0].password);
				var objUser = { num: crypto.encrypt(result[0].userID + ""), char: password, hour: appConfig.pwdResetLinkExpiredHours, name: result[0].name, emailId: emailId, password: decryptPassword };
				var objMail = mailContent(objMailContent, objUser);
				//console.log(objMail)
				objMail.currentUserId = emailId;
				mail.mailSender(objMail, function (response) {
					res.send({ "status": true, mailStatus: response.status, data: result[0].code });
				});
			}
			else {
				logException("recoverPassword", "Invalid emailId-" + emailId, emailId);
				res.send({ "status": false, mailStatus: false, data: undefined });
			}
		});
	}
	catch (exception) {
		logException("recoverPassword", exception.message, emailId);
		res.send({ "status": false, "code": "", data: undefined });
	}
};

function mailContent(objMailContent, objUser, isNewUser = false) {
	try {
		var content = objMailContent.content;
		//updating the placeholder with values
		objMailContent.content = content.replace("name", objUser.name);

		if (objMailContent.website) {
			objMailContent.website = objMailContent.website.replace(/<pwd>/g, objUser.char);
			objMailContent.website = objMailContent.website.replace(/<userId>/g, objUser.num);
			objMailContent.website = objMailContent.website.replace(/<siteAddress>/g, siteAddress);
		}

		if (objUser.hour && objMailContent.footerText) {
			objMailContent.footerText = objMailContent.footerText.replace(/<hour>/g, objUser.hour)
		}

		objMailContent.userId = objUser.emailId;
		objMailContent.password = objUser.password;

		if (isNewUser) {
			objMailContent.role = objUser.role;
			objMailContent.body = objMailContent.content + "User ID:&nbsp;" + objMailContent.userId + "<br>Role:&nbsp;" + objMailContent.role + objMailContent.website + objMailContent.footerText + objMailContent.footer + objUser.currentUserName;
		}
		else {
			objMailContent.body = objMailContent.content + "User ID:&nbsp;" + objMailContent.userId + (objMailContent.website != null ? objMailContent.website : "") + objMailContent.footerText + objMailContent.footer;
		}

		objMailContent.to = objUser.emailId;
		objMailContent.from = 'donotreply@otis.com';
		return objMailContent;
	}
	catch (exception) {
		logException("replaceMailContent", exception.message, objUser.emailId);
	}
};

//remove or delete the cache in server end(ram) using least recently used cache of npm module(LRU-Cache)
function removeReqSession(req, res) {
	try {
		if (cache.removeReqSession(req, req.get("emailId"))) {
			res.send({ "status": true, "code": "", data: undefined });
		}
	}
	catch (exception) {
		logException("removeReqSession", exception.message, req.params.emailId);
		res.send({ "status": true, "code": "", data: undefined });
	}
}

//remove or delete the cache in server end(ram) using least recently used cache of npm module(LRU-Cache)
function removeLRUCache(req, res) {
	try {
		if (cache.removeLRUCache(req.get("emailId"))) {
			res.send({ "status": true, "code": "", data: undefined });
		}
	}
	catch (exception) {
		logException("removeLRUCache", exception.message, req.params.emailId);
		res.send({ "status": true, "code": "", data: undefined });
	}
}

var logActivity = function (activityName, userId, elevatorId) {
	helperLogging.logActivity({ "activityname": activityName, "userId": userId, "elevatorId": elevatorId });
}

var logException = function (methodName, exceptionDetails, userId) {
	helperLogging.logException({ "isServer": 1, "methodName": methodName, "exceptionDetails": exceptionDetails, "userId": userId });
}

var logMessage = function (methodName, message, userId) {
	helperLogging.logMessage({ "isServer": 1, "methodName": methodName, "message": message, "userId": userId });
}

module.exports = businessLogin();

