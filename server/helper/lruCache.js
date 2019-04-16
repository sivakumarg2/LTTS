//// File Name: lruCache.js
//// Description: This has the methods to save and remove the user cache
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
var moment = require('moment');
var twilioInterface = require('../twilio_interface/twilioInterface.js');

var LRU = require("lru-cache"),
	options = {
		max: 20000
		, maxAge: (1000 * 60 * 60 * 10)
	},
	cache = LRU(options);

//console.log("Cache Option: ", options);

function cccCache() {
	return {
		saveLRUCache: saveLRUCache,
		saveReqSession: saveReqSession,
		removeLRUCache: removeLRUCache,
		removeReqSession: removeReqSession,
		verifyLRUCache: verifyLRUCache,
		verifyReqSession: verifyReqSession,
		verifyLRUCache4Req: verifyLRUCache4Req
	}
}

//Save cache in server end(ram) using least recently used cache of npm module(LRU-Cache)
function saveLRUCache(emailId, workerSid) {
	try {
		if (emailId != null) {
			emailId = emailId.toLowerCase()
		}
		//console.log("save lru cache is calling!!");
		if (emailId !== null) {
			if (cache.has(emailId)) {
				//console.log("dont delete cache on refresh!!");
				cache.del(emailId);
			}

			var datetime = new Date();
			cache.set(emailId, { "workerSid": workerSid, datetime: datetime });
		}
	}
	catch (exception) {
	}
};

//Save cache in server end(ram) using least recently used cache of npm module(LRU-Cache)
function saveReqSession(req, emailId, workerSid) {
	try {
		if (emailId != null) {
			emailId = emailId.toLowerCase()
		}
		//console.log("save lru cache is calling!!");
		if (emailId !== null) {
			/*if (cache.has(emailId)) {
				//console.log("dont delete cache on refresh!!");
				cache.del(emailId);
			}

			var datetime = new Date();
			cache.set(emailId, { "workerSid": workerSid, datetime: datetime });
			*/
			if (!req.session.userSession) {
				console.log("Session is empty")
				req.session.userSession = {};
			}
			req.session.userSession[emailId] = emailId;
		}
	}
	catch (exception) {
	}
};

function verifyReqSession(req, emailId) {
	if (emailId != null) {
		emailId = emailId.toLowerCase()
	}
	if (!req.session.userSession) { 
		req.session.userSession = {};
		return false;
	}
	return (req.session.userSession[emailId] != null && req.session.userSession[emailId] == emailId) ? true : false;
}

function verifyLRUCache(emailId) {
	if (emailId != null) {
		emailId = emailId.toLowerCase()
	}
	return cache.has(emailId) ? true : false;
}

function verifyLRUCache4Req(emailId) {
	if (emailId != null) {
		emailId = emailId.toLowerCase()
	}

	if (cache.has(emailId)) {
		var datetime = new Date();
		var value = cache.get(emailId);
		value.datetime = datetime;
		cache.del(emailId);
		cache.set(emailId, value);
		return true;
	}

	return false;
}

//remove or delete the cache in server end(ram) using least recently used cache of npm module(LRU-Cache)
function removeLRUCache(emailId) {
	try {
		if (emailId != null) {
			emailId = emailId.toLowerCase()
		}
		cache.del(emailId);
		return true;
	}
	catch (exception) {
	}
}

function removeReqSession(req, emailId) {
	try {
		if (emailId != null) {
			emailId = emailId.toLowerCase()
		}
		if (!req.session.userSession) { 
			req.session.userSession = {};
			return true;
		}
		req.session.userSession[emailId] = null;
		return true;
	}
	catch (exception) {
	}
}

module.exports = cccCache();