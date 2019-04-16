//// Service Name: callService
//// Description: This service has the methods to handle call related functionalities
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
(function () {
	'use strict';

	function ServiceImplementation(callApi) {
		var GetCallDetails = function (id, isCountry) {
			if (isCountry) {
				return callApi.getCallsDetailsCountry.get({ countryId: id }).$promise;
			}
			else {
				return callApi.getCallsDetailsIncident.get({ incidentId: id }).$promise;
			}
		};

		var GetCallDetailsByElevatorId = function (elevatorId) {
			return callApi.getCallsDetailsElevator.get({ elevatorId: elevatorId }).$promise;
		};

		var InsertCallDetails = function (elevatorCall) {
			return callApi.insertCallDetails.post(elevatorCall).$promise;
		};

		var UpdateCallDetails = function (elevatorCall) {
			return callApi.updateCallDetails.post(elevatorCall).$promise;
		};

		var UpdateCall = function (elevatorCall) {
			return callApi.updateCall.post(elevatorCall).$promise;
		};

		var SaveDispositionDetails = function (callDetails) {
			console.log("Save Call details: ", callDetails);
			return callApi.saveCallDisposition.post(callDetails).$promise;
		};

		var InsertChatMsgDetails = function (msgDetails) {
			return callApi.insertChatMsgDetails.post(msgDetails).$promise;
		};

		var GetGeoCodeAddress = function (address) {
			console.log("calling bings geo coder");
			return callApi.getGeoAddress.get({ address: address }).$promise;
		};

		var RetriveAudioVideoData = function (callDetail) {
			return callApi.retriveAudioVideoData.get(callDetail).$promise;
		};

		var RetriveVideosDuration = function (call) {
			return callApi.retriveVideosDuration.get(call).$promise;
		};

		var GetWorkerCallHistory = function (alarmId, incidentId) {
			return callApi.getWorkerCallHistory.get({ alarmId: alarmId, incidentId: incidentId }).$promise;
		};

		var GetIdentityToken = function (identity) {
			return callApi.getIdentityToken.get({ identity: identity }).$promise;
		};

		var TransferCall = function(attribute) {
			return callApi.transferCall.post(attribute).$promise;
		};

		var CallbackElevatorApp = function(obj) {
			return callApi.callbackElevatorApp.post(obj).$promise;
		};

		return { getCallDetails: GetCallDetails, getCallDetailsByElevatorId: GetCallDetailsByElevatorId, insertCallDetails: InsertCallDetails, updateCall: UpdateCall, saveDispositionDetails: SaveDispositionDetails, updateCallDetails: UpdateCallDetails, insertChatMsgDetails: InsertChatMsgDetails, getGeoCodeAddress: GetGeoCodeAddress, retriveAudioVideoData: RetriveAudioVideoData, retriveVideosDuration: RetriveVideosDuration, getWorkerCallHistory: GetWorkerCallHistory, getIdentityToken: GetIdentityToken, transferCall: TransferCall, callbackElevatorApp: CallbackElevatorApp };
	}

	angular.module("CCApp").service("callService", ServiceImplementation);
	ServiceImplementation.$inject = ['callApi'];
})();
