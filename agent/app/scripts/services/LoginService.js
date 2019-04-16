//// Service Name: loginService
//// Description: This service has methods for login related functionalities
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
(function () {
	'use strict';

	function ServiceImplementation(loginApi) {
		
		var GetCSRFToken = function () {
			return loginApi.getCSRFToken.get().$promise;
		};

		var Login = function (loginModel) {
			return loginApi.login.post(loginModel).$promise;
		};

		var GetWorkerToken = function (workerSid) {
			return loginApi.workerToken.get({ workerSid: workerSid }).$promise;
		};

		var ChangePassword = function (passwordModel) {
			return loginApi.changePassword.post(passwordModel).$promise;
		};

		var UpdateUserActivity = function (userId, activityId, alarmId, incidentId, sender) {
			return loginApi.updateActivity.get({ userId: userId, activityId: activityId, alarmId: alarmId, incidentId: incidentId, sender: sender }).$promise;
		};

		var UpdateActivity = function (sId, actSId) {
			return loginApi.logout.get({ sId: sId, actSId: actSId }).$promise;
		};

		var RecoverPassword = function (emailId) {
			return loginApi.recoverPassword.get({ emailId: emailId }).$promise;
		};

		var ValidateEmail = function (value) {
			var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return regex.test(value);
		};

		var RemoveLRUCache = function (emailId) {
			return loginApi.removeLRUCache.get().$promise;
		};

		return { getCSRFToken: GetCSRFToken, login: Login, getWorkerToken: GetWorkerToken, changePassword: ChangePassword, updateActivity: UpdateActivity, forgotPassword: RecoverPassword, validateEmail: ValidateEmail, removeLRUCache: RemoveLRUCache, updateUserActivity: UpdateUserActivity };

	}

	angular.module("CCApp").service("loginService", ServiceImplementation);
	ServiceImplementation.$inject = ['loginApi'];
})();