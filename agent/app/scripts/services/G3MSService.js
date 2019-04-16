//// Service Name: G3MSService
//// Description: This service has methods to communicate with G3MS.
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
(function () {
	'use strict';

	function Implementation(G3MSApi) {
		var GetElevatorDetails = function (elevatorId) {
			return G3MSApi.elevatorDetails.get({ elevatorId: elevatorId }).$promise;
		};

		var StopStartVideo = function (elevatorId, command) {
			return G3MSApi.stopStartVideo.post({ elevatorId: elevatorId, command: command }).$promise;
		};
		
		var CallBackElevator = function (callBackObj) {
			return G3MSApi.callBackElevator.post({ uuid: callBackObj.uuid, elevatorId: callBackObj.elevatorId, volume: "", sId: callBackObj.sId, command: callBackObj.command, mediaRegion: callBackObj.mediaRegion }).$promise;
		};

		var ModifyMicGain = function (uuid, elevatorId, value, command) {
			return G3MSApi.modifyMicGain.post({uuid:uuid, elevatorId: elevatorId, value: value, command: command }).$promise;
		};

		var ModifySpeakerVolume = function (uuid, elevatorId, value, command) {
			return G3MSApi.modifySpeakerVolume.post({uuid:uuid, elevatorId: elevatorId , value: value, command: command}).$promise;
		};

		return { getElevatorDetails: GetElevatorDetails, stopStartVideo: StopStartVideo, callBackElevator: CallBackElevator, modifyMicGain: ModifyMicGain, modifySpeakerVolume: ModifySpeakerVolume };
	}

	angular.module("CCApp").service("G3MSService", Implementation);
	Implementation.$inject = ['G3MSApi'];
})();
