//// Service Name: commonService
//// Description: This service has common methods used across client side application
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
(function () {
	'use strict';
	function commonImplementation(LogApi, $cookies, moment, REPORTTIME, APP_CONFIG, $rootScope) {
		var LogException = function (exceptionData) {
			if ($rootScope.loader) {
				$rootScope.loader.showLoader = false;
			}
			/*console.log("Exception Data: ", exceptionData);*/
			if (!APP_CONFIG.switchOffLogs) {
				exceptionData.isServer = 0;
				exceptionData.userId = $cookies.get('CCApp-userID');
				exceptionData.elevatorId = exceptionData.elevatorId == null ? $cookies.get('CCApp-elevatorID') : exceptionData.elevatorId;
				exceptionData.incidentId = exceptionData.incidentId == null ? $cookies.get('CCApp-incidentID') : exceptionData.incidentId;

				var stringConstructor = "test".constructor;
				if (exceptionData.exceptionDetails.constructor != stringConstructor) {
					exceptionData.exceptionDetails = JSON.stringify(exceptionData.exceptionDetails);
				}
				return LogApi.logException.post(exceptionData).$promise;
			}
		};

		var LogMessage = function (message) {
			if (!APP_CONFIG.switchOffLogs) {
				message.userId = $cookies.get('CCApp-userID');
				message.elevatorId = message.elevatorId == null ? $cookies.get('CCApp-elevatorID') : message.elevatorId;
				message.incidentId = message.incidentId == null ? $cookies.get('CCApp-incidentID') : message.incidentId;
				message.isMessage = 1;
				message.isServer = 0;
				return LogApi.logMessage.post(message).$promise;
			}
		};

		var LogActivity = function (Activity) {
			if (!APP_CONFIG.switchOffLogs) {
				Activity.userId = $cookies.get('CCApp-userID');
				Activity.elevatorId = $cookies.get('CCApp-elevatorID');
				Activity.incidentId = $cookies.get('CCApp-incidentID');
				return LogApi.logActivity.post(Activity).$promise;
			}
		};

		var showStatusMessage = function (css, timeout) {
			$("." + css).removeAttr("style");
			setTimeout(function () {
				$("." + css).attr("style", "opacity:0;transition:opacity 1s linear;*");
			}, (timeout == null ? 5000 : timeout));
		};

		// returns the current UTC date and time.
		var GetUTC = function (formatString) {
			if (formatString != null) {
				return moment.utc().format(formatString);
			}
			return moment.utc();
		};

		// convert the UTC date and time to local time
		var GetUTCToLocal = function (UTCdate, formatString) {
			if (formatString != null) {
				return moment(UTCdate).local().format(formatString);
			}
			return moment(UTCdate).local();
		};

		// return the UTC date ranges for to fetch the Twilio reports
		var GetUTCRangeDate = function () {
			var fromDate = moment().format('YYYY-MM-DD') + ' ' + REPORTTIME.StartTime;
			var toDate = moment().format('YYYY-MM-DD') + ' ' + REPORTTIME.EndTime;
			fromDate = moment(fromDate).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
			toDate = moment(toDate).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
			return { fromDate: fromDate, toDate: toDate };
		};

		// return the custom UTC date ranges to fetch the search reports
		var GetCustomUTCDate = function (startDate, endDate, formatString) {
			if (formatString == null) {
				formatString = 'YYYY-MM-DD HH:mm:ss';
			}

			var fromDate = startDate + ' ' + REPORTTIME.StartTime;
			var toDate = endDate + ' ' + REPORTTIME.EndTime;
			fromDate = moment(fromDate).utc().format(formatString);
			toDate = moment(toDate).utc().format(formatString);
			return { fromDate: fromDate, toDate: toDate };
		};

		// return the custom UTC date ranges to fetch the search reports
		var GetConvertedUTCDate = function (date, formatString) {
			if (formatString == null) {
				formatString = 'YYYY-MM-DD HH:mm:ss';
			}

			var fromDate = date;
			fromDate = moment(fromDate).utc().format(formatString);
			return { fromDate: fromDate };
		};

		// return the subtract UTC date  
		var SubstractUTCDate = function (number) {
			var date = moment().format('YYYY-MM-DD') + ' ' + REPORTTIME.StartTime;
			date = moment.utc(moment(date));
			return moment(date).subtract(number, "days").format('YYYY-MM-DDTHH:mm:ss') + 'Z';
		};

		// return the local current time and date with default format
		var GetTodayDateTime = function (format) {
			if (format == null) {
				format = 'YYYY-MM-DD HH:mm:ss';
			}
			return moment().format(format);
		};

		// return the local current time and date with default format
		var IsValidDate = function (format) {
			var dateFormats = ['MM-DD-YY','MM-DD-YYYY','DD-MM-YY','DD-MM-YYYY','YY-MM-DD','YYYY-MM-DD','MM.DD.YY','MM.DD.YYYY','DD.MM.YY','DD.MM.YYYY','YY.MM.DD','YYYY.MM.DD','MM/DD/YY','MM/DD/YYYY','DD/MM/YY','DD/MM/YYYY'];
			if (format == null) {
				true;
			}			
    
			return dateFormats.indexOf(format) >= 0;
		};

		return { logException: LogException, logActivity: LogActivity, logMessage: LogMessage, showStatusMessage: showStatusMessage, getUTC: GetUTC, getUTCToLocal: GetUTCToLocal, getUTCRangeDate: GetUTCRangeDate, getCustomUTCDate: GetCustomUTCDate, substractUTCDate: SubstractUTCDate, getTodayDateTime: GetTodayDateTime, getConvertedUTCDate: GetConvertedUTCDate, isValidDate: IsValidDate };
	}

	angular.module("CCApp").service("commonService", commonImplementation);
	commonImplementation.$inject = ['LogApi', '$cookies', 'moment', 'REPORTTIME', 'APP_CONFIG', '$rootScope'];
})();