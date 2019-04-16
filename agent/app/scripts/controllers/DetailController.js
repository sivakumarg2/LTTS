//// Controller Name: detailController
//// Description: This controller will have the logic for call details functionality
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
(function () {
	'use strict';

	function Implementation($rootScope, $scope, detailService, commonService, $cookies) {
		$scope.getElevatorDetails = function () {
			try {
				detailService.GetElevatorDetails().then(function (res) {

					////if success
					if (res.status) {
						console.log("Result: ", res);
						$scope.userList = res.data;
					}

				}, function (err) {
					commonService.logException({ "methodName": "GetElevatorDetails", "exceptionDetails": err, "isServer": 0, "userId": $cookies.get('CCApp-userID') });
				});
			}
			catch (logException) {
				commonService.logException({ "methodName": "GetElevatorDetails", "exceptionDetails": logException, "isServer": 0, "userId": $cookies.get('CCApp-userID') });
			}
		};

		$scope.getContactInformation = function () {
			try {
				detailService.GetContactInformation().then(function (res) {

					////if success
					if (res.status) {
						console.log("Result: ", res);
						$scope.userList = res.data;
					}

				}, function (err) {
					commonService.logException({ "methodName": "getContactInformation", "exceptionDetails": err, "isServer": 0, "userId": $cookies.get('CCApp-userID') });
				});
			}
			catch (logException) {
				commonService.logException({ "methodName": "getContactInformation", "exceptionDetails": logException, "isServer": 0, "userId": $cookies.get('CCApp-userID') });
			}
		};

		$scope.getPreviousCallDetails = function () {
			try {
				detailService.GetPreviousCallDetails().then(function (res) {

					////if success
					if (res.status) {
						console.log("Result: ", res);
						$scope.userList = res.data;
					}

				}, function (err) {
					commonService.logException({ "methodName": "getPreviousCallDetails", "exceptionDetails": err, "isServer": 0, "userId": $cookies.get('CCApp-userID') });
				});
			}
			catch (logException) {
				commonService.logException({ "methodName": "getPreviousCallDetails", "exceptionDetails": logException, "isServer": 0, "userId": $cookies.get('CCApp-userID') });
			}
		};

		$scope.callDisposition = function (callDispositionModel) {
			try {
				detailService.CallDisposition(callDispositionModel).then(function (res) {

					////if success
					if (res.status) {
						console.log("Result: ", res);
					}

				}, function (err) {
					commonService.logException({ "methodName": "callDisposition", "exceptionDetails": err, "isServer": 0, "userId": $cookies.get('CCApp-userID') });
				});
				console.log($scope.userModel);
			}
			catch (logException) {
				commonService.logException({ "methodName": "callDisposition", "exceptionDetails": logException, "isServer": 0, "userId": $cookies.get('CCApp-userID') });
			}
		};
	}

	angular.module("CCApp").controller('detailcontroller', Implementation);
	Implementation.$inject = ['$rootScope', '$scope', 'detailService', 'commonService', '$cookies'];
})();