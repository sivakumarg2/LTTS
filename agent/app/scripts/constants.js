//// Name: constant
//// Description: This has all the client settings.
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
(function () {
	'use strict';
	//var serviceUrl = 'http://localhost:1346';
	var serviceUrl = '';
	angular.module('CCApp').constant('API', {
		login: serviceUrl + '/api/login',
		logout: serviceUrl + '/api/update-activity',
		updateUserActivity: serviceUrl + '/sec-api/update-user-activity',
		removeLRUCache: serviceUrl + '/sec-api/remove-lru-cache',
		getUser: serviceUrl + '/sec-api/get-user',
		addUser: serviceUrl + '/sec-api/add-user',
		editUser: serviceUrl + '/sec-api/edit-user',
		editUserPreferences: serviceUrl + '/sec-api/edit-user-preferences',
		deleteUser: serviceUrl + '/sec-api/delete-user',
		saveSettings: serviceUrl + '/api/save-settings',
		updateActivity: serviceUrl + '/api/updateActivity/:activityId',
		getCountry: serviceUrl + '/sec-api/get-all-country-config',
		addCountry: serviceUrl + '/sec-api/add-country-config',
		editCountry: serviceUrl + '/sec-api/edit-country-config-byId',
		deleteCountry: serviceUrl + '/sec-api/delete-country-config-byId',
		getCallReport: serviceUrl + '/sec-api/get-worker-report',
		getAgentsReport: serviceUrl + '/sec-api/get-agents-report',
		downloadAudioVideo: serviceUrl + '/sec-api/download-audio-video',
		retriveAudioVideoData: serviceUrl + '/sec-api/retrive-audio-video',
		deleteAudioVideo: serviceUrl + '/sec-api/delete-audio-video',
		getCallSummary: serviceUrl + '/sec-api/get-call-summary',
		addCallReport: serviceUrl + '/api/addCallReport',
		editCallReport: serviceUrl + '/api/editCallReport/:callId',
		workerToken: serviceUrl + '/sec-api/workerToken',
		addException: serviceUrl + '/api/log-exception',
		addMessage: serviceUrl + '/api/log-message',
		addActivities: serviceUrl + '/api/logActivities',
		changePassword: serviceUrl + '/sec-api/change-password',
		languageString: '../json/:page',
		getExceptionDetails: serviceUrl + '/sec-api/retrieve-exception-detail',
		recoverPassword: serviceUrl + '/api/recoverPassword',
		updateLanguage: serviceUrl + '/sec-api/update-language',
		refreshToken: serviceUrl + '/sec-api/refresh-token',

		//// G3MS APIs
		getElevatorInfo: serviceUrl + '/sec-api/get-elevator-info',
		stopStartVideo: serviceUrl + '/sec-api/start-stop-elevator-video',
		callbackFromElevator: serviceUrl + '/sec-api/callback-elevator',
		modifyMicGain: serviceUrl + '/sec-api/modify-elevator-micgain',
		modifySpeakerVolume: serviceUrl + '/sec-api/modify-elevator-speakervolume',

		//// Calls APIs
		insertCallDetails: serviceUrl + '/sec-api/insert-call-details',
		updateCallDetails: serviceUrl + '/sec-api/update-call-details',
		updateCall: serviceUrl + '/sec-api/update-call',
		retrieveCallDetailsCountry: serviceUrl + '/sec-api/retrieve-call-details-country',
		retrieveCallDetailsIncident: serviceUrl + '/sec-api/retrieve-call-details-incident',
		retrieveCallDetailsElevator: serviceUrl + '/sec-api/retrieve-call-details-elevator',
		saveCallDisposition: serviceUrl + '/sec-api/save-call-disposition',
		saveCallMessage: serviceUrl + '/sec-api/save-call-message',
		insertChatMsgDetails: serviceUrl + '/sec-api/insert-chat-message-details',
		exportCallSummary: serviceUrl + '/sec-api/export-callsummary-excel',
		getWorkersStatistcs: serviceUrl + '/sec-api/get-workers-report',
		getWorkersForSupervisor: serviceUrl + '/sec-api/get-workers-report-for-supervisor',
		getWorkersDetailsForSupervisor: serviceUrl + '/sec-api/get-workers-report-details-for-supervisor',
		getCallDetail: serviceUrl + '/sec-api/get-call-detail',
		retriveVideoDuration: serviceUrl + '/sec-api/retrieve-videos-duration',
		callTransfer: serviceUrl + '/sec-api/call-transfer',
		getWorkerCallActivities: serviceUrl + '/sec-api/get-workers-call-activity',
		getIdentityToken: serviceUrl + '/sec-api/token',

		//Call disposition
		getAllCallDisposition: serviceUrl + '/sec-api/retrieve-call-dispstn-details',
		insertSallDisposition: serviceUrl + '/sec-api/insert-calldispstn-details',
		editCallDisposition: serviceUrl + '/sec-api/update-call-dispstn-details',
		deleteByCallDispositionId: serviceUrl + '/sec-api/delete-call-dispstn-details',
		loadCopyDisposition: serviceUrl + '/sec-api/load-copy-disposition',

		//Country call disposition
		getAllCountryCallDisposition: serviceUrl + '/sec-api/retrieve-call-disposition',
		addCountryCallDisposition: serviceUrl + '/sec-api/save-call-disposition-data',
		deleteCountryCallDisposition: serviceUrl + '/sec-api/delete-call-disposition',

		//map
		getGeoCodeAddress: serviceUrl + '/sec-api/get-geoCode-address',
		validateToken: serviceUrl + '/sec-api/token-verification',

		//Shutdown Reason
		insertShutdownReason: serviceUrl + '/sec-api/insert-shutdown-reason',
		getAllShutdownReason: serviceUrl + '/sec-api/retrieve-shutdown-reason',
		deleteShutdownReason: serviceUrl + '/sec-api/delete-shutdown-reason',

		//Country Shutdown Reason
		addCountryShutdownReason: serviceUrl + '/sec-api/save-country-shutdown-reason',
		getAllCountryShutdownReason: serviceUrl + '/sec-api/retrieve-country-shutdown-reason',
		deleteCountryShutdownReason: serviceUrl + '/sec-api/delete-country-shutdown-reason',

		//Chat Message
		insertChatMessage: serviceUrl + '/sec-api/insert-chat-message',
		getAllChatMessage: serviceUrl + '/sec-api/retrieve-chat-message',
		deleteChatMessage: serviceUrl + '/sec-api/delete-chat-message',

		//Country Shutdown Reason
		addCountryChatMessage: serviceUrl + '/sec-api/save-country-chat-message',
		getAllCountryChatMessage: serviceUrl + '/sec-api/retrieve-country-chat-message',
		deleteCountryChatMessage: serviceUrl + '/sec-api/delete-country-chat-message',

		getCSRFToken: serviceUrl + '/api/get-csrf-token',
		getAvailableLanguages: '/sec-api/get-all-languages',
		callBackElevatorWinApp: '/sec-api/win/callback-elevator',
		getWinElevatorInfo: '/sec-api/win/get-elevator-info/:elevatorId',
		getWinToken: '/sec-api/win/token/:roomName',
		getWinUserToken: '/sec-api/win/user-token-app/:userId'
	});

	angular.module('CCApp').constant('ACTIVITY_STATUS', [
		{ id: "1", status: 'Available' },
		{ id: "2", status: 'Offline' },
		{ id: "3", status: 'Not Available' },
		{ id: "4", status: 'Not Available: Timeout' },
		{ id: "5", status: 'Reserved' },
		{ id: "6", status: 'Busy' },
		{ id: "7", status: 'Available' }]);

	angular.module('CCApp').constant('MEDIA_REGION', [
		{ id: "1", code: "au1", value: 'Australia' },
		{ id: "2", code: "br1", value: 'Brazil' },
		{ id: "3", code: "de1", value: 'Germany' },
		{ id: "4", code: "ie1", value: 'Ireland' },
		{ id: "5", code: "in1", value: 'India' },
		{ id: "6", code: "jp1", value: 'Japan' },
		{ id: "7", code: "sg1", value: 'Singapore' },
		{ id: "8", code: "us1", value: 'US East Coast (Virginia)' },
		{ id: "9", code: "us2", value: 'US West Coast (Oregon)' }]);

	angular.module('CCApp').constant('USER_CURRENT_STATUS', [
		{ id: 1, activityId: 1, sId: '', status: 'Idle', text: 'idle' },
		{ id: 2, activityId: 0, sId: '', status: 'Reserved', text: 'reserved' },
		{ id: 3, activityId: 0, sId: '', status: 'Busy', text: 'busy' },
		{ id: 4, activityId: 3, sId: '', status: 'Offline', text: 'offline' }]);

	angular.module('CCApp').constant('WORKING_DAYS', [
		{ id: 1, day: 'Monday' },
		{ id: 2, day: 'Tuesday' },
		{ id: 3, day: 'Wednesday' },
		{ id: 4, day: 'Thursday' },
		{ id: 5, day: 'Friday' },
		{ id: 6, day: 'Saturday' },
		{ id: 7, day: 'Sunday' }]);

	angular.module('CCApp').constant('USER_WORKING_HOURS', [
		{ id: 1, text: 'employee', type: 'Employee' },
		{ id: 2, text: 'contractor', type: 'Contractor' }]);

	angular.module('CCApp').constant('USER_PROFILE_TYPES', [
		{ id: 0, text: 'select', type: 'Select' },
		{ id: 1, text: 'Active', type: 'Active' },
		{ id: 2, text: 'Retired', type: 'Retired' }]);

	angular.module('CCApp').constant('USER_ROLES', [
		{ id: 0, text: 'select', role: 'Select' },
		{ id: 2, text: 'Supervisor', role: 'OTISLine Supervisor' },
		{ id: 1, text: 'Agent', role: 'OTISLine Agent' }
	]);

	angular.module('CCApp').constant('USER_CALLTYPES', [
		{ id: 1, isDisplay: 1, type: 'Commissioning' },
		{ id: 2, isDisplay: 1, type: 'Production' },
		{ id: 3, isDisplay: 1, type: 'FactoryTest' },
		{ id: 4, isDisplay: 1, type: 'Operations' }
	]);

	angular.module('CCApp').constant('SELECTED_LANGUAGE', [
        /*{ id: 1, countryId: 1, isFirst: 1, text: 'english', code: 'eng', value: 'English' },
        { id: 2, countryId: 1, isFirst: 1, text: 'german', code: 'deu', value: 'German' },
		{ id: 3, countryId: 2, isFirst: 0, text: 'german', code: 'deu', value: 'German' },
		{ id: 8, countryId: 2, isFirst: 0, text: 'english', code: 'eng', value: 'English' },
        { id: 4, countryId: 3, isFirst: 1, text: 'french', code: 'fre', value: 'French' },        
		{ id: 6, countryId: 3, isFirst: 1, text: 'portuguese', code: 'por', value: 'Portuguese' },
		{ id: 7, countryId: 3, isFirst: 0, text: 'english', code: 'eng', value: 'English' },
		{ id: 5, countryId: 5, isFirst: 1, text: 'spanish', code: 'spa', value: 'Spanish' },
		{ id: 9, countryId: 5, isFirst: 0, text: 'english', code: 'eng', value: 'English' },*/
	]);

	angular.module('CCApp').constant('SELECTED_COUNTRY', [
		//{ id: 0, value: 'Select' },
		//{ id: 1, code: 'US', value: 'USA' },
		//{ id: 2, code: 'DE', value: 'Germany' },
		//{ id: 3, code: 'FR', value: 'France' },
		// { id: 4, code: 'IT', value: 'Italy' },
		//{ id: 5, code: 'ES', value: 'Spain' },
		// { id: 6, code: 'IN', value: 'India' },
	]);

	angular.module('CCApp').constant('APP_CONFIG', {
		'frameRate': 10,
		'showLoaderTimings': 30000,
		'workflowTimeout': 0,
		'callInitiator': 'Elevator',
		'selfInitiator': 'Agent',
		'minFrameRate': 7,
		'busySid': "",
		'deleteSid': "",
		'offlineSid': "",
		'reservSid': "",
		'appVersion': "1.0.1",
		'copyright': '2018 Otis Elevator Company.',
		'version': 'Version',
		'mapZoomLevel': 16,
		'testCallCodes': '1001,1002,1003',
		"setInterval": 180000, // 300000 ~= 5 minutes,
		"isOnlyAudio": true,
		"taskQueueKey": "OtisLineTaskQueue-",
		"notAvailable": "Offline",
		"serverBeatKey": "clientAvailable",
		"defaultLanguageShortName": "eng",
		"videoinput": "videoinput",
		"audioinput": "audioinput",
		"deviceCheckTimeout": 15000,
		"agentDisconnectTimeout": 5000,
		"isTransfer": "true",
		"activity9": 9,
		"status": "status",
		"callTransferTrackRetryCount": 25
	});

	angular.module('CCApp').constant('REPORTTIME', {
		'StartTime': '00:00:00',
		'EndTime': '23:59:59',
	});

	angular.module('CCApp').constant('CALLQULITY', {
		'high': 10,
		'low': 7
	});

	angular.module('CCApp').constant('G3MS_COMMANDS', {
		'startVideo': 'resumeRemoteVideo',
		'stopVideo': 'stopRemoteVideo',
		'joinRoom': 'joinVideoRoom',
		'msg': 'displayTextMessage',
		'micGain': 'adjustMicrophoneGain',
		'speakerVolume': 'adjustVolume'
	});

	angular.module('CCApp').constant('STATUSTYPE', {
		'ERROR': 'error',
		'WARNING': 'warning',
		'SUCCESS': 'success'
	});

	angular.module('CCApp').constant('STATUSCOLOURS', {
		'darkOrgange': '#FF8C00',
		'green': '#32CD32',
		'Red': '#FF0000',
		'gold': '#FFD700'
	});
	angular.module('CCApp').constant('moment', moment);

	angular.module('CCApp').constant('USER_FILTER_TYPES', [
		{ id: 0, text: 'All', type: 'All' },
		{ id: 1, text: 'Active', type: 'Active' },
		{ id: 2, text: 'Retired', type: 'Retired' }]);

	angular.module('CCApp').constant('CALL_SUMMARY_FILTER', [
		{ id: 0, text: 'all', type: 'All' },
		{ id: 1, text: 'answered', type: 'Answered' },
		{ id: 2, text: 'myCall', type: 'My Call' },
		{ id: 3, text: 'missedCalls', type: 'Missed Calls' },
		{ id: 4, text: 'myMissedCalls', type: 'My Missed Calls' },
		{ id: 5, text: 'outgoingCalls', type: 'Outgoing Calls' }]);
})();
