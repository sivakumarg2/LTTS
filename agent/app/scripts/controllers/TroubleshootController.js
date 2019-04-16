//// Controller Name: troubleshootController
//// Description: This controller will have the logic to retrieve and filter exception log, message log & twilio logs.
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
(function () {
  'use strict';

  function Implementation($rootScope, $scope, troubleshootService, languageService, commonService, moment, REPORTTIME, $filter) {
    $scope.$emit("hidebars", false, false, true);
    $scope.showExceptionDiv = false;
    $scope.mainLogsList = [];
    $scope.logType = 0;
    $scope.$emit("topBarTitle", "logs", "logs", -1);
    $scope.logResults = {};
    var logModal = document.getElementById('logging-modal');
    $scope.currentPage = 0;
    $scope.pageSize = 10;

    var initTroubleshootData = function () {
      return {
        fromDate: "",
        toDate: "",
        elevatorUnitId: "",
        emailId: "",
        incidentId: "",
        isMessage: 1,
        alarmId: "",
        methodName: ""
      };
    };

    var getLanguageString = function (lang) {
      languageService.getLanguageString({
        "page": $rootScope.selectedCountryShortName + "_" + lang + "_troubleshoot.json"
      }).then(function (res) {
        $scope.translation = res;
      }, function (err) {
      });
    };

    $rootScope.$on("changeLanguage", function (event) {
      getLanguageString($rootScope.languageShortName);
    });

    $scope.troubleshootErrModel = {
      emailErrMsg: "",
      unitIDErrMsg: "",
      incidentIDErrMsg: "",
      validated: false
    };
    var validateTroubleshoot = function () {
      if ($scope.troubleshootData.emailId) {
        if ($scope.troubleshootData.emailId.trim() != "") {
          var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          var check = regex.test($scope.troubleshootData.emailId);
          if (!check) {
            $scope.troubleshootErrModel.validated = true;
            $scope.troubleshootErrModel.emailErrMsg = $scope.translation.invalidEmailFormat;
          } else {
            $scope.troubleshootErrModel.emailErrMsg = null;
          }
        }
      }
    };

    $scope.reset = function () {
      $scope.troubleshootData = initTroubleshootData();
      $scope.troubleshootErrModel = {
        emailErrMsg: "",
        unitIDErrMsg: "",
        incidentIDErrMsg: "",
        validated: false
      };
    };

    $scope.showList = function (index) {
      $scope.currentPage = 0;
      $scope.logType = index;

      if ($scope.logResults.length > 0) {
        if (index == 0) {
          $scope.mainLogsList = $filter('filter')($scope.logResults[index], {
            isMessage: 0
          });
        }
        else if (index == 4) {
          $scope.mainLogsList = $filter('filter')($scope.logResults[0], {
            isMessage: 1
          });
        }
        else {
          $scope.mainLogsList = $scope.logResults[index];
        }
      }

      $scope.numberOfPages = $scope.mainLogsList != undefined ? Math.ceil($scope.mainLogsList.length / $scope.pageSize) : 0;
    };

    /*
 * Broadcast event listner attached to  listen/watch when language is changed
 * @param1: event
 * @param2: countryId
 */
    $rootScope.$on('changeCountry', function (event, countryId) {
      $scope.mainLogsList = [];
      $scope.logResults = [];
    });

    /*Retriveing all types of logs from DB*/
    $scope.retrieveLogDetails = function (troubleshootData) {
      try {
        validateTroubleshoot();
        if ($scope.troubleshootErrModel.validated) {
          return;
        }

        $rootScope.loader.showLoader = true;
        $scope.currentPage = 0;
        $scope.mainLogsList = [];

        if ($scope.troubleshootData.fromDate != '') {
          $scope.troubleshootData.fromServerDate = moment.utc(moment($scope.troubleshootData.fromDate + ' ' + REPORTTIME.StartTime)).format('YYYY-MM-DD HH:mm:ss');
        }

        if ($scope.troubleshootData.toDate != '') {
          $scope.troubleshootData.toServerDate = moment.utc(moment($scope.troubleshootData.toDate + ' ' + REPORTTIME.EndTime)).format('YYYY-MM-DD HH:mm:ss');
        }

        troubleshootService.getExceptionDetails($scope.troubleshootData).then(function (res) {
          $scope.processTroubleShootResult(res);
        }, function (err) {
          $rootScope.loader.showLoader = false;
          commonService.logException({
            "methodName": "retrieveLogDetails",
            "exceptionDetails": err
          });
        });
      } catch (logException) {
        $rootScope.loader.showLoader = false;
        commonService.logException({
          "methodName": "retrieveLogDetails",
          "exceptionDetails": logException
        });
      }
    };

    $scope.processTroubleShootResult = function (res) {
      ////if success
      if (res.status) {
        $scope.logResults = res.data.recordsets;
        $scope.showList($scope.logType);
        $scope.numberOfPages = Math.ceil($scope.mainLogsList.length / $scope.pageSize);
      }

      $rootScope.loader.showLoader = false;
    };

    /*When the user clicks on logs table row */
    $scope.openLoggingModal = function (item, log) {
      logModal.style.display = "block";
      $scope.logItem = {
        item: item,
        log: log
      };
    };

    // When the user clicks on <span> (x), close the modal
    $scope.closeLoggingModal = function () {
      logModal.style.display = "none";
    };

    window.onclick = function (event) {
      if (event.target === logModal) {
        logModal.style.display = "none";
      }
    };

    var init = function () {
      if ($rootScope.languageShortName) {
        getLanguageString($rootScope.languageShortName);
      }
      $scope.troubleshootData = initTroubleshootData();
    };

    init();
  }

  angular.module("CCApp").controller('troubleshootController', Implementation);
  Implementation.$inject = ['$rootScope', '$scope', 'troubleshootService', 'languageService', 'commonService', 'moment', 'REPORTTIME', '$filter'];
})();
