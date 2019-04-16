//// Service Name: exceptionHandlerFactory
//// Description: This is used to handle unhandled exception.
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
(function () {
    "use strict";

    angular.module("CCApp").factory('$exceptionHandler', ['$injector', 'azureAppInsightsService', 'APP_CONFIG', function ($injector, azureAppInsightsService, APP_CONFIG) {
        return function myExceptionHandler(exception, cause) {
            /*var stack = exception.stack;
            console.log("The Exception is ", exception, " Switch off logs: ", APP_CONFIG.switchOffLogs);
            if (!APP_CONFIG.switchOffLogs) {
                if (stack != null && stack.split('\n').length > 0) {
                    console.log("Method Name: ", stack.split('\n')[1].trim());
                    var $cookies = $injector.get('$cookies');
                    $injector.get('LogApi').logException.post({
                        "methodName": stack.split('\n')[1].trim(),
                        "isServer": 0,
                        "exceptionDetails": exception.message,
                        "userId": $cookies.get('CCApp-userID'),
                        "elevatorId": $cookies.get('CCApp-elevatorID'),
                        "incidentId": $cookies.get('CCApp-incidentID')
                    }).$promise;
                }
                //azureAppInsightsService.trackException(new Exception(exception.message));
                console.log("Exception: ", exception.message);
            }*/
        };
    }]);
})();
