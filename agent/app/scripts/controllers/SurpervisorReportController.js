//// Controller Name: dashboardController
//// Description: This controller will have the logic to show the workers stats
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
(function () {
  'use strict';

  function Implementation($rootScope, $scope, languageService, reportService, USER_CURRENT_STATUS, commonService, $cookies, $filter, REPORTTIME, STATUSCOLOURS, CALL_SUMMARY_FILTER) {

    $rootScope.$on("changeLanguage", function (event, lang) {
      getLanguageString($rootScope.languageShortName === "" ? lang : $rootScope.languageShortName);
    });

    $scope.reportModel = {
      "incomingCall": 0,
      "missedCall": 0,
      "avgCallDuration": 0.0,
      "attendedCall": 0,
      "attendLess30": 0,
      "avgAccptTime": 0
    };

    $scope.agentDateReport = $scope.reportModel;
    $scope.$emit("hidebars", false, false, true);
    $scope.$emit("topBarTitle", "dashboard", "reports", 0);

    $scope.sortModel = {
      'columnName': 'name',
      'asc': false
    };

    $scope.dashboardLangTranslation = {};
    $scope.objUTCDateRange = commonService.getUTCRangeDate();

    /* Routine to get language file based on user selection */
    function getLanguageString(lang) {
      try {
        languageService.getLanguageString({
          "page": $rootScope.selectedCountryShortName + "_" + lang + '_agents_reports.json'
        }).then(function (res) {
          $scope.dashboardLangTranslation = res;
        }, function (err) {
          commonService.logException({
            "methodName": "getLanguageString",
            "ExceptionDetails": err
          });
        });
      } catch (ex) {
        commonService.logException({
          "methodName": "getLanguageString",
          "ExceptionDetails": ex
        });
      }
    }

    $scope.agentReportResult = [];
    $scope.searchReportByFilter = function (reportFilter) {
      if ((reportFilter.fromDate != undefined && reportFilter.fromDate != "") && (reportFilter.toDate != undefined && reportFilter.toDate != "")) {
        $scope.objCustomUTCDateRange = commonService.getCustomUTCDate(reportFilter.fromDate, reportFilter.toDate);
      }

      try {
        var objFilter = {
          'countryId': $rootScope.currentUser.countryId,
          'dateFrom': $scope.objCustomUTCDateRange.fromDate,
          'dateTo': $scope.objCustomUTCDateRange.toDate
        };

        $rootScope.loader.showLoader = true;
        reportService.getAgentsReport(objFilter)
          .then(function (res) {
            $rootScope.loader.showLoader = false;
            if (res.status) {
              $scope.agentDateReport = res.data.recordsets[0][0];
              $scope.agentReportResult = res.data.recordsets[1];
            }
            else {
              $scope.agentDateReport = $scope.reportModel;
              $scope.agentReportResult = [];
            }
          }, function (err) {
            $rootScope.loader.showLoader = false;
            commonService.logException({
              "methodName": "getAgentsReport",
              "ExceptionDetails": err
            });
          });
      } catch (ex) {
        $rootScope.loader.showLoader = false;
        commonService.logException({
          "methodName": "getAgentsReport",
          "ExceptionDetails": ex
        });
      }
    };

    $scope.calculateAverage = function (MyData) {
      var sum = 0;
      for (var i = 0; i < MyData.length; i++) {
        sum += parseInt(MyData[i], 10); //don't forget to add the base 
      }

      var avg = sum / MyData.length;

      return avg;
    };

    $scope.sortUsers = function (columnName) {
      try {
        if ($scope.sortModel.asc) {
          $scope.sortModel.columnName = columnName;
        } else {
          $scope.sortModel.columnName = '-' + columnName;
        }

        $scope.sortModel.name = columnName;
        $scope.sortModel.asc = !$scope.sortModel.asc;
      } catch (ex) {
        commonService.logException({
          "methodName": "sortUsers",
          "ExceptionDetails": ex
        });
      }
    };

    var initialize = function () {
      if ($rootScope.languageShortName) {
        getLanguageString($rootScope.languageShortName);
      }
    };

    initialize();
  }

  angular.module("CCApp").controller('SurpervisorReportController', Implementation);
  Implementation.$inject = ['$rootScope', '$scope', 'languageService', 'reportService', 'USER_CURRENT_STATUS', 'commonService', '$cookies', '$filter', 'REPORTTIME', 'STATUSCOLOURS', 'CALL_SUMMARY_FILTER'];
})();
