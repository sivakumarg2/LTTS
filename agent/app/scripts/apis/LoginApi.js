//// API Name: loginApi
//// Description: This will have api methods for login/logout, changepassword functionalities.
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
(function () {
	'use strict';

	angular.module('CCApp').factory('loginApi', Implementation);
	Implementation.$inject = ['$resource', 'API'];

	function Implementation($resource, API) {
		var getCSRFToken = $resource(API.getCSRFToken,
			{},
			{
				get: { method: 'GET' }
			});

		var login = $resource(API.login,
			{},
			{
				post: { method: 'POST' }
			});

		var workerToken = $resource(API.workerToken,
			{ workerSid: "@workerSid" },
			{
				get: { method: 'POST' }
			});

		var changePassword = $resource(API.changePassword,
			{},
			{
				post: { method: 'POST' }
			});

		var logout = $resource(API.logout,
			{ SID: "@sId", actSId: "@actSId" },
			{
				get: { method: 'POST' }
			});

		var updateActivity = $resource(API.updateUserActivity,
			{ userId: "@userId", activityId: "@activityId", incidentId: "@incidentId", alarmId: "@alarmId", sender: "@sender" },
			{
				get: { method: 'POST' }
			});

		var recoverPassword = $resource(API.recoverPassword,
			{ },
			{
				get: { method: 'POST' }
			});

		var removeLRUCache = $resource(API.removeLRUCache,
			{},
			{
				get: { method: 'POST' }
			});

		return { getCSRFToken: getCSRFToken, login: login, workerToken: workerToken, changePassword: changePassword, logout: logout, recoverPassword: recoverPassword, removeLRUCache: removeLRUCache, updateActivity: updateActivity }
	}
})();