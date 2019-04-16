//// File Name: tokenHandler.js
//// Description: This has the methods generate & verify the token
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/

var jwt = require("jsonwebtoken");
var helperLogging = require('./logging.js');
var kvservice = require('./keyVaultService');
var cache = require('./lruCache.js');
var fs = require('fs');
const AGENT = 1;
const SUPERVISOR = 2;
const ACCESS_DENIED = "Access Denied";
const TOKEN_EXPIRED = "token expired";
const INVALID_ACCESS = "invalid access";
var siteAddress = "";

kvservice.getSecret("encryptPassword", function (result) {
	process.env.SECRET_KEY = result;
});

function getSiteAddress() {
	kvservice.getSecret("siteAddress", function (result) {
		siteAddress = result;
	});
}
getSiteAddress();

function tokenHandler() {
	return {
		generateToken: generateToken,
		validateAndAuthorize: validateAndAuthorize
	}
}

//generating token to access the twilio 
function generateToken(user) {
	var forUser = {
		"username": user.emailId,
		"roleid": user.roleId
	};

	var token = jwt.sign(forUser, process.env.SECRET_KEY, {
		expiresIn: "24h"
	});

	return token;
}

//validate and authorize
function validateAndAuthorize(req, res, next) {
	var reqUrl = req.originalUrl;
	var token = req.get("token");
	if(siteAddress == "") {
		getSiteAddress();
	}

	var origin = siteAddress;
	if(process.env.allowAll != null){
		if(process.env.allowAll == 'true') {
			origin = "*";
		}
	}
	
	try {
		if (reqUrl.indexOf("?") > -1) {
			reqUrl = reqUrl.substr(0, reqUrl.indexOf("?"));
		}
		res.cookie('XSRF-TOKEN', req.csrfToken());
		res.header('Access-Control-Allow-Origin', origin);
		//res.header('Access-Control-Allow-Origin', '*');
		res.header('Cache-Control', 'no-store');
		res.header('Pragma', 'no-cache');
		res.header('Access-Control-Allow-Methods', "DELETE");
		res.header("Access-Control-Allow-Headers", "token, isOngoingCall, emailId, userId, elevatorId, x-ms-request-id, x-ms-request-root-id, incidentId, Origin, X-Requested-With, Content-Type, Accept");
	}
	catch (exception) {
		helperLogging.logException({ "isServer": 1, "methodName": "updateLanguage", "exceptionDetails": exception.message, "userId": req.get('userId') });
	}

	if(reqUrl.indexOf('/win/') <= -1) {
		if (token) {
			////Token is available so verify here		
			jwt.verify(token, process.env.SECRET_KEY, function (err, decode) {
				if (!err) {
					if(req.get('isOngoingCall') == null || req.get('isOngoingCall') == '0') {
						var datetime = new Date();
	
						//if (!cache.verifyLRUCache4Req(req.get('emailId'))) {
						if(!cache.verifyReqSession(req, req.get('emailId'))) {
							console.log("Cache not found! ", datetime);
							res.status(401);
							res.send({ "status": false, "message": ACCESS_DENIED });
							return;
						}
					}
	
					//verify the authorization				
					var resources = JSON.parse(fs.readFileSync('./server/configs/usersResource.js', 'utf8'));
					if (decode.roleid === AGENT) {
						var agent = resources[0].agent;
						if (agent.indexOf(reqUrl) <= -1) {
							res.send({ "status": false, "message": ACCESS_DENIED });
							return;
						}
					}
					else if (decode.roleid === SUPERVISOR) {
						var supervisor = resources[0].supervisor;
						if (supervisor.indexOf(reqUrl) <= -1) {
							res.send({ "status": false, "message": ACCESS_DENIED });
							return;
						}
					}
					else {
						var admin = resources[0].admin;
						if (admin.indexOf(reqUrl) <= -1) {
							res.send({ "status": false, "message": ACCESS_DENIED });
							return;
						}
					}
	
					next();
				}
				else {
					res.status(401);
					res.send({ "status": false, "message": TOKEN_EXPIRED });
				}
			});
		}
		else {
			////Log invalid token for the user xxxxx
			res.status(401);
			res.send({ "status": false, "message": INVALID_ACCESS });
		}
	}
	else {
		next();
	}	
}

module.exports = tokenHandler();