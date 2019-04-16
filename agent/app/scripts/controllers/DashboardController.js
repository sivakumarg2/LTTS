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
    var reportModel = {
      "numOutgoingCalls": 0,
      "numberIncomingCalls": 0,
      "numberOfMissedCalls": 0,
      "longestCallDuration": 0,
      "avgTaskAccTime": 0,
      "availStats": {
        'total': 0,
        'data': [],
        'labels': [],
        'colors': [STATUSCOLOURS.green, STATUSCOLOURS.Red, STATUSCOLOURS.gold]
      }
    };
    $scope.slider = {
      value: 0,
      options: {
        floor: 0,
        ceil: 100,
        step: 10,
        vertical: true,
        showSelectionBar: true
      }
    };

    $scope.sortModel = {
      'columnName': 'name',
      'asc': false
    };

    $scope.chart_options = {
      tooltips: {
        enabled: false
      }
    };
    $scope.enableRow = false;
    $scope.reports = angular.copy(reportModel);
    $scope.dashboardLangTranslation = {};
    $scope.timeFilter = 'today';
    /* Broadcast callback event on language change */
    $rootScope.$on("changeLanguage", function (event, lang) {
      getLanguageString($rootScope.languageShortName === "" ? lang : $rootScope.languageShortName);
    });

    $scope.$emit("hidebars", false, false, true);
    $scope.$emit("topBarTitle", "dashboard", "agent", 0);
    $scope.elevatorDetailsArry = [];
    $scope.callsummaryArry = [];
    $scope.messageDetailsArry = [];
    $scope.todaysDate = '';
    $scope.parent = $scope.$parent;
    $scope.callSummaryDropdown = CALL_SUMMARY_FILTER;
    $scope.selectedCallFilter = $scope.callSummaryDropdown[0].text;
    $scope.objUTCDateRange = commonService.getUTCRangeDate();
    $scope.objSubstractUTCDate = commonService.substractUTCDate(7); //Specify the number of days to substract
    
    $rootScope.$on("callEvents", function (event, data) {
      if (data === "savedisp") {
        getCallReport($cookies.get('CCApp-sId'));
        if ($scope.clicked == 0) {
          $scope.previousDate();
        }
        else {
          $scope.todaysDate();
        }
      }
    });

    $scope.selectedCallFilter = $scope.callSummaryDropdown[0].text;
    $scope.callChangeFilter = function(filter) {
      $scope.selectedCallFilter = filter;
      $scope.currentPage = 0;
      $scope.fetchHear();
    };

    /***************************** Helper Routines ***************************/
    /* Routine to get Report data from Twilio to display in dashboard  */
    function getCallReport(workerSid) {
      try {       
        var objWorker = {
          'workerSid': workerSid,
          'dateFrom': $scope.objUTCDateRange.fromDate,
          'dateTo': $scope.objUTCDateRange.toDate,
          'callFilter': $scope.selectedCallFilter
        };

        $rootScope.loader.showLoader = true;
        reportService.getCallReport(objWorker)
          .then(function (res) {
           $scope.processGetCallReportResult(res);
          }, function (err) {
            $rootScope.loader.showLoader = false;
            commonService.logException({
              "methodName": "getCallReport",
              "ExceptionDetails": err
            });
          });
      } catch (ex) {
        $rootScope.loader.showLoader = false;
        commonService.logException({
          "methodName": "getCallReport",
          "ExceptionDetails": ex
        });
      }
    }

    $scope.processGetCallReportResult = function(res) {
      $rootScope.loader.showLoader = false;
      if (res.status == true) {
        $scope.parseCallReportObject(res);
      }
    };

    $scope.callBackElevator = function (elevatorID) {
      $scope.callbackError = undefined;
      $scope.callbackElevatorId = elevatorID;
      var callDetail = document.getElementById('call-back');

      if(callDetail){
        callDetail.style.display = "block";
      }      

      $rootScope.$broadcast("callBackElevator", elevatorID, 0);
    };

    $rootScope.$on("callElevatorMsgBack", function (event, message) {
      $scope.callbackError = message;
    });

    $scope.closeCallBackModal = function () {
      var callDetail = document.getElementById('call-back');
      if(callDetail){
        callDetail.style.display = "none";
      }      
    };

    /* Routine to get language file based on user selection */
    function getLanguageString(lang) {
      try {
        languageService.getLanguageString({
          "page": $rootScope.selectedCountryShortName + "_" + lang + '_dashboard.json'
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

    $scope.parseCallReportObject = function(json) {
      var reportData = json.data;
      $scope.reports = angular.copy(reportModel);
      if (reportData == null || reportData == undefined)
        return;
      var availablity = [];
      var totalAvailablity = 0,
        idleTime = 0;
      var labels = [];

      //Iterating the call report data array and prepratin $scope.report model
      var availablityStats = function (value) {
        if (value.total == null || value.total == undefined) {
          return;
        }

        availablity.push(value.total);
        totalAvailablity = totalAvailablity + value.total;
        labels.push(value.friendly_name);
      };

      //Iterating each report items(ie, Idle,Reserved, Busy)
      angular.forEach(reportData, function (value) {
        switch (value.friendly_name) {
          case USER_CURRENT_STATUS[0].status: //Idle
            idleTime = value.total;
            availablityStats(value);
            break;
          case USER_CURRENT_STATUS[1].status: //Reserved
            $scope.reports.avgTaskAccTime = timeConvertions(value.avg);
            availablityStats(value);
            break;
          case USER_CURRENT_STATUS[2].status: //Busy
            $scope.reports.longestCallDuration = timeConvertions(value.max);
            availablityStats(value);
            break;
        }
      });

      if (availablity.length > 0) {
        if (totalAvailablity > 0) {
          angular.forEach(availablity, function (value, index) {
            availablity[index] = Math.ceil((value / totalAvailablity) * 100);
          });
          $scope.reports.availStats.total = Math.ceil((idleTime / totalAvailablity) * 100);
        }
        $scope.reports.availStats.data = availablity;
        $scope.reports.availStats.labels = labels;
      }

      if (reportData.length > 0) {
        $scope.reports.numOutgoingCalls = reportData[reportData.length - 1].numberOutGoingCalls;
        $scope.reports.numberIncomingCalls = reportData[reportData.length - 1].numberIncomingCalls;
        $scope.reports.numberOfMissedCalls = reportData[reportData.length - 1].numberOfMissedCalls;        
      }
    };

    function timeConvertions(seconds) {
      var days = Math.floor(seconds / 86400);
      var hours = Math.floor((seconds % 86400) / 3600);
      var mins = Math.floor(((seconds % 86400) % 3600) / 60);
      var secs = ((seconds % 86400) % 3600) % 60;
      return ('00' + mins).slice(-2) + ':' + ('00' + secs).slice(-2);
    }

    $scope.$watch("search.searchText", function (nv, ov) {
      if (nv != ov) {
        $scope.currentPage = 0;
      }
    });

    $scope.fetchHear = function() {
      if ($scope.clicked == 0) {
        $scope.getReport($cookies.get('CCApp-userID'), $scope.objSubstractUTCDate);
      }
      else {
        $scope.getReport($cookies.get('CCApp-userID'), $scope.objUTCDateRange.fromDate);
      }
    };

    $scope.todaysDate = function () {
      $scope.selectedCallFilter = 'all';
      $scope.currentPage = 0;      
      $scope.getReport($cookies.get('CCApp-userID'), $scope.objUTCDateRange.fromDate);
    };

    $scope.previousDate = function () {
      $scope.selectedCallFilter = 'all';
      $scope.currentPage = 0;
      $scope.getReport($cookies.get('CCApp-userID'), $scope.objSubstractUTCDate);
    };

    // Generic method to fetch the report based on number of days
    $scope.getReport = function (userId, date) {
      try {
        $rootScope.loader.showLoader = true;
        var resultarray = [];
        reportService.getCallDetail(userId, date, $scope.selectedCallFilter)
          .then(function (res) {
           $scope.processGetReportResult(res);
          }, function (err) {
            $rootScope.loader.showLoader = false;
            commonService.logException({
              "methodName": "getReport",
              "ExceptionDetails": err
            });
          });
      }
      catch (ex) {
        $rootScope.loader.showLoader = false;
        commonService.logException({
          "methodName": "getReport",
          "ExceptionDetails": ex.message
        });
      }
    };

    $scope.processGetReportResult = function(res) {
      if (res.status) {
        $scope.elevatorDetailsArry = res.data.recordsets;
        $scope.numOfPages = Math.ceil($scope.elevatorDetailsArry[0].length / $scope.pageSize);
      }
      $rootScope.loader.showLoader = false;
    };

    $scope.currentPage = 0;
    $scope.pageSize = 10;

    $scope.openViewDetail = function (elevatorId) {
      $rootScope.$emit("openCallDetails", elevatorId);
    };

    $scope.downloadAudioVideo = function (elevatorDetail) {
      if(elevatorDetail.videoUrl == null && elevatorDetail.audioUrl == null){
         return;
      }
      try {
        $rootScope.loader.showLoader = true;
        reportService.downloadAudioVideo(elevatorDetail)
          .then(function (res) {           
            $rootScope.loader.showLoader = false;
          }, function (err) {
            $rootScope.loader.showLoader = false;
            commonService.logException({
              "methodName": "downloadAudioVideo",
              "ExceptionDetails": err
            });
          });
      }
      catch (ex) {
        $rootScope.loader.showLoader = false;
        commonService.logException({
          "methodName": "downloadVideo",
          "ExceptionDetails": ex.message
        });
      }
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

      getCallReport($cookies.get('CCApp-sId')); // To get the report detail and update dashboard item
      $scope.todaysDate();
    };

    initialize();
  }

  angular.module("CCApp").controller('dashboardController', Implementation);
  Implementation.$inject = ['$rootScope', '$scope', 'languageService', 'reportService', 'USER_CURRENT_STATUS', 'commonService', '$cookies', '$filter', 'REPORTTIME', 'STATUSCOLOURS', 'CALL_SUMMARY_FILTER'];
})();
