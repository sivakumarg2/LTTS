//// Controller Name: appController
//// Description: This controller will have the logic to handle application level functionality
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
(function () {
	'use strict';

	function Implementation($scope, loginService, callService) {
		$scope.$emit("hidebars", false, false, false);

		//Start: Login
		$scope.loginModel = { status: true, from: "win-app", emailId: "", password: "", confirmPassword: "", newPassword: "", recoverEmailID: "", isFirstLogin: false };
		$scope.loginTranslation = {
			"1002": "Email ID or password is wrong.",
			"1003": "Account is locked. Please contact Admin",
			"1005": "Temp password has been expired. Please reset password again.",
			"20001": "Twilio Error: please try again.",
			"commonError": "Error: Please contact administrator"
		};

		$scope.callbackTranslation = {
			"400": "Bad Request",
			"401": "Access Denied",
			"200": "Call success"
		};
		function getParameterValues(param) {
			var url = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
			for (var i = 0; i < url.length; i++) {
				var urlparam = url[i].split('=');
				if (urlparam[0] == param) {
					return urlparam[1];
				}
			}
		}

		$scope.validate = function () {
			loginService.login($scope.loginModel).then(function (res) {
				$scope.validateUser(res);
			}, function (err) {
			});
		};

		$scope.validateUser = function (res) {
			try {
				// Validate login and to get the result code from stored procedure
				if (res.code) {
					if (res.code == "2000") {
						$scope.loginModel.errMsg = scope.loginTranslation["commonError"];						
					}
					else {
						$scope.loginModel.errMsg = $scope.loginTranslation[res.code + ""];
					}	
				}
				
				$scope.loginModel.status = res.status;
				if (res.status) {
					$scope.loginModel.data = res.status + "+" + res.data.user.userID;
					$scope.loginModel.errMsg =  "";
					//$rootScope.$emit("initializeAgent", res.data);
					//Pass/keep value for further use
					if (res.data.user.roleId === 3) {
						//Admin
						return;
					}
					//Other than Admin
					$state.go('dashboard');
				}
				else {
					$scope.loginModel.data = $scope.loginModel.errMsg;
				}
			}
			catch (ex) {
			}
		};
		//End: Login

		//Start: callback
		function callBackElevator(obj) {
			$scope.callbackModel = {};
			callService.callbackElevatorApp(obj).then(function (res) {
				console.log("Callback result:", res);
				$scope.callbackModel.data = res.status;
				
				if(!res.status) {
					$scope.callbackModel.data += "+" + $scope.callbackTranslation["" + res.err.statusCode];
				}
				//validate result
			}, function (err) {
			});
		}

		//End: callback
		var sender = getParameterValues('sender');
		switch (sender) {
			case "login":
				console.log("It's from login");
				var email = getParameterValues('email');
				var pass = getParameterValues('pass');

				$scope.loginModel.emailId = email;
				$scope.loginModel.password = pass;
				$scope.loginModel.status = true;
				$scope.loginModel.errMsg = "";

				loginService.getCSRFToken().then(function () {
					$scope.validate();
				}, function (err) {
					$scope.validate(err);
				});
				break;
			case "callback":
				console.log("It's from callback");
				var elevatorId = getParameterValues('elevatorId');
				var sipUri = getParameterValues('sipUri');
				loginService.getCSRFToken().then(function () {
					callBackElevator({userId: 88, elevatorId: elevatorId, sipUri: sipUri});
				}, function (err) {
					callBackElevator({userId: 88, elevatorId: elevatorId, sipUri: sipUri});
				});
			break;
			default:
				break;
		}
	}

	angular.module("CCApp").controller('WinAppController', Implementation);
	Implementation.$inject = ['$scope', 'loginService', 'callService'];
})();