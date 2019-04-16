/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
(function () {
    'use strict';

    /**
     * @ngdoc app
     * @name Call Center Application
     * @description
     * # Call Center Application
     *
     * Main module of the application.
     */
    angular
        .module('CCApp', [
            'ngAnimate',
            'ngAria',
            'ngCookies',
            'ngMessages',
            'ngResource',
            'ngRoute',
            'ngSanitize',
            'ngTouch',
            'ui.router',
            'datepicker',
            'ui.multiselect',
            'chart.js',
            'ui.bootstrap',
            'rzModule',
            'ApplicationInsightsModule']).factory('httpRequestInterceptor', function ($q, $cookies, $state, $rootScope) {
                return {
                    request: function (config) {
                        // do something on success
                        config.headers.token = $cookies.get('CCApp-token');
                        config.headers.userId = $cookies.get('CCApp-userID');
                        config.headers.elevatorId = $cookies.get('CCApp-elevatorID');
                        config.headers.incidentId = $cookies.get('CCApp-incidentID');
                        config.headers.emailId = $cookies.get('CCApp-emailid');
                        config.headers.isOngoingCall = $cookies.get('CCApp-isOngoingCall');
                        config.headers["XSRF-TOKEN"] = $cookies.get('XSRF-TOKEN');
                        config.headers.countryId = $cookies.get('CCApp-countryID');
                        if (config.url.indexOf('sec-api') >= 0) {
                            console.log('Calling ' + config.url);
                        }
                        
                        return config;
                    },
                    responseError: function (rejection) {
                        // Unauthorized access
                        if (rejection.status === 401 || rejection.status === 403) { //|| rejection.status === 404
                            $cookies.remove('CCApp-token');
                            $cookies.remove('CCApp-emailid');

                            //// Redirect to login page.
                            $rootScope.$emit("redirectToLogin", rejection.status);
                        }

                        return $q.reject(rejection);
                    }
                };
            })
        .config(function ($httpProvider) {
            //$httpProvider.defaults.withCredentials = true;
            $httpProvider.interceptors.push('httpRequestInterceptor');
            if (!$httpProvider.defaults.headers.get) {
                $httpProvider.defaults.headers.get = {};
            }
        })
        .config(function (applicationInsightsServiceProvider) {
            var options = { appName: 'CCApp', developerMode: true, autoPageViewTracking: true, autoLogTracking: true, autoExceptionTracking: true };
            applicationInsightsServiceProvider.configure('59efb513-ded6-4454-9fef-c9b974a28693', options);
        })
        .config(function () {
            var locale = window.navigator.userLanguage || window.navigator.language;
            moment.locale(locale);
        })
        .filter('startFrom', function () {
            return function (input, start) {
                start = +start;
                if (input !== undefined && input !== null) {
                    return input.slice(start);
                }
                else {
                    return input;
                }

            };
        }).filter('timeConversion', function () {
             return function (seconds) {
                if (seconds != null) {
                    var mins = Math.floor(((seconds % 86400) % 3600) / 60);
                    var secs = ((seconds % 86400) % 3600) % 60;
                    return ('00' + mins).slice(-2) + ':' + ('00' + secs).slice(-2);
                }

                return "00:00";
            };
        }).filter("separate", function ($filter) {
            return function (input) {
                if (!input) return;

                var value = input.split('---');
                var localeData = moment.localeData();
                var format = localeData.longDateFormat('L');

                var dtValue = value[2];
                try {
                    dtValue = $filter('date')(new Date(moment(value[2]).local().format('YYYY-MM-DDTHH:mm:ss') + 'Z'), format.replace(/Y/g, 'y').replace(/D/g, 'd') +  ' h:mm a');
                }
                catch {
                    dtValue = $filter('date')(new Date(value[2]), format.replace(/Y/g, 'y').replace(/D/g, 'd') +  ' h:mm a');
                }

                var time = $filter('date')(new Date(dtValue), 'h:mm a');
                var content = '<div class="talk-bubble tri-right btm-right">';
                content += '<div class="talkname"><p>' + value[1] + '</p></div>';
                content += '<div class="sent-time">: [' + time + ']</div>';
                content += '<div class="talktext"><p>' + value[0] + '</p></div>';
                content += '</div>';
                return content;
            };
        }).filter("localeDate", function($filter, commonService, $rootScope) {
            return function (input) { 
                if(input){                        
                    var format = $rootScope.dateFormat == null ? "DD/MM/YYY h:mm a": $rootScope.dateFormat + ' h:mm a';
                    return commonService.getUTCToLocal(new Date(input), format).replace("AM", "am").replace("PM","pm");
                }
                else {
                    return "";
                }
            };
        }).filter("localeDateTime", function($filter, commonService, $rootScope) {
            return function (input) {
                if(input){
                    var format = $rootScope.dateFormat == null ? "DD/MM/YYY h:mm:s a": $rootScope.dateFormat + ' h:mm:s a';
                    return commonService.getUTCToLocal(new Date(input), format).replace("am", "AM").replace("pm","PM");
                }
                else {
                    return "";
                }
            };
        });
})();