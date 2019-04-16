//// API Name: callApi
//// Description: This will have api methods to handle completely related to calls functionality.
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
(function () {
    'use strict';

    function Implementation($resource, API) {
        var insertCallDetails = $resource(API.insertCallDetails,
            {},
            {
                post: { method: 'POST' }
            });

        var updateCallDetails = $resource(API.updateCallDetails,
            {},
            {
                post: { method: 'POST' }
            });

        var updateCall = $resource(API.updateCall,
            {},
            {
                post: { method: 'POST' }
            });

        var saveCallDisposition = $resource(API.saveCallDisposition,
            {},
            {
                post: { method: 'POST' }
            });

        var getCallsDetailsIncident = $resource(API.retrieveCallDetailsIncident,
            { incidentId: "@incidentId" },
            {
                get: { method: 'POST' }
            });

        var getCallsDetailsCountry = $resource(API.retrieveCallDetailsCountry,
            { countryId: "@countryId" },
            {
                get: { method: 'GET' }
            });

        var getCallsDetailsElevator = $resource(API.retrieveCallDetailsElevator,
            { elevatorId: "@elevatorId" },
            {
                get: { method: 'POST' }
            });

        var saveCallMessage = $resource(API.saveCallMessage,
            {},
            {
                post: { method: 'POST' }
            });

        var insertChatMsgDetails = $resource(API.insertChatMsgDetails,
            {},
            {
                post: { method: 'POST' }
            });


        var getGeoAddress = $resource(API.getGeoCodeAddress,
            { address: "@address" },
            {
                get: { method: 'POST' }
            });

        var retriveAudioVideoData = $resource(API.retriveAudioVideoData,
            { callDetailsId: "@callDetailsId", incidentId: '@incidentId' },
            {
                get: { method: 'GET' }
            });

        var retriveVideosDuration = $resource(API.retriveVideoDuration, {},
            {
                get: { method: 'POST' }
            });

        var getWorkerCallHistory = $resource(API.getWorkerCallActivities, {},
            {
                get: { method: 'POST' }
            });

        var getIdentityToken = $resource(API.getIdentityToken,
            { identity: "@identity" },
            {
                get: { method: 'POST' }
            });

        var transferCall = $resource(API.callTransfer, {},
            {
                post: { method: 'POST' }
            });

        var callbackElevatorApp = $resource(API.callBackElevatorWinApp,
            {},
            {
                post: { method: 'POST' }
            });
        return { insertCallDetails: insertCallDetails, updateCall: updateCall, getCallsDetailsIncident: getCallsDetailsIncident, getCallsDetailsCountry: getCallsDetailsCountry, saveCallDisposition: saveCallDisposition, saveCallMessage: saveCallMessage, updateCallDetails: updateCallDetails, insertChatMsgDetails: insertChatMsgDetails, getCallsDetailsElevator: getCallsDetailsElevator, getGeoAddress: getGeoAddress, retriveAudioVideoData: retriveAudioVideoData, retriveVideosDuration: retriveVideosDuration, getWorkerCallHistory: getWorkerCallHistory, getIdentityToken: getIdentityToken, transferCall: transferCall, callbackElevatorApp: callbackElevatorApp };
    };

    angular.module("CCApp").factory("callApi", Implementation);
    Implementation.$inject = ['$resource', 'API'];
})();
