
//// Controller Name: reportController
//// Description: This controller will have the logic to filter & display the report
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
(function () {
  'use strict';

  function Implementation($scope, $rootScope, $cookies, $filter, reportService, exportReportService, commonService, languageService, REPORTTIME) {

    var initReportModelData = function () {
      return {
        buildingName: "",
        unitId: "",
        agent: "",
        fromDate: "",
        toDate: ""
      };
    };
    $scope.reportFilter = {};
    $scope.reportTemplateLangTranslation = {};
    $scope.enableRow = false;
    $scope.reportFilterErrorModel = {};
    $scope.elevatorDetailsArry = [];
    $scope.callsummaryArry = [];
    $scope.messageDetailsArry = [];
    $scope.exportData = [];
    $scope.currentPage = 0;
    $scope.pageSize = 10;
    $scope.search = {
      elevatorUnitId: "",
      buildingName: "",
      lastUpdatedBy: "",
      fromDate: "",
      toDate: "",
      countryId: $rootScope.selectedCountryId,
      userId: $cookies.get('CCApp-userID')
    };
    $scope.showNoRecord = true;
    $scope.TodayDate = commonService.getTodayDateTime('YYYY-MM-DD'); 

    $scope.sortModel = {
      'columnName': 'name',
      'asc': false
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
          "exceptionDetails": ex
        });
      }
    };


    /* Broadcast callback event on language change */
    $rootScope.$on("changeLanguage", function (event, lang) {
      getLanguageString($rootScope.languageShortName === "" ? lang : $rootScope.languageShortName);
    });

    $scope.$emit("hidebars", false, false, true);

    $rootScope.$on("callEvents", function (event, data) {
      if (data === "savedisp") {
        $scope.search.countryId = $rootScope.selectedCountryId;
        getCallDetailsByCountry($scope.search);
        getCallSummary($scope.search);
      }
    });

    $scope.searchReportByFilter = function (reportFilter) {
      $scope.currentPage = 0;
      $scope.search = {
        elevatorUnitId: reportFilter.unitId,
        buildingName: reportFilter.buildingName,
        lastUpdatedBy: reportFilter.agent,
        fromDate: null,
        toDate: null,
        countryId: $rootScope.selectedCountryId,
        userId: $cookies.get('CCApp-userID')
      };

      $scope.interalSearch = { buildingName: reportFilter.buildingName, elevatorUnitId: reportFilter.unitId, lastUpdatedBy: reportFilter.agent };
      if (reportFilter.fromDate != "" || reportFilter.toDate != "") {
        validateReportFilter(reportFilter);
        if ($scope.reportFilterErrorModel.hasError) {
          return;
        }
      }

      if ((reportFilter.fromDate != undefined && reportFilter.fromDate != "") && (reportFilter.toDate != undefined && reportFilter.toDate != "")) {
        var objCustomUTCDateRange = commonService.getCustomUTCDate(reportFilter.fromDate, reportFilter.toDate);
        $scope.search.fromDate = objCustomUTCDateRange.fromDate;
        $scope.search.toDate = objCustomUTCDateRange.toDate;
      }


      if ($rootScope.currentUser.roleId === 3) {
        getCallDetailsByCountry($scope.search);
      }
      else {
        getCallSummary($scope.search);
      }
    };

    $scope.resetFilter = function () {
      $scope.reportFilter = initReportModelData();
    };

    var callTitleBar = function () {
      if ($rootScope.currentUser.roleId == 3) {
        $scope.$emit("topBarTitle", "search", "search", -1);
      }
      else {
        $scope.$emit("topBarTitle", "search", "search", -1);
      }
    };

    $rootScope.$on('afterRefresh', function () {
      $scope.showNoRecord = true;
      $scope.reportFilter = initReportModelData();
      getLanguageString($rootScope.languageShortName);
      if ($rootScope.currentUser != null) {
        $scope.search.countryId = $rootScope.selectedCountryId;
        callTitleBar();
      }
    });

    /*
     * Broadcast event listner attached to  listen/watch when language is changed
     * @param1: event
     * @param2: countryId
     */
    $rootScope.$on('changeCountry', function (event, countryId) {
      $scope.search = {
        elevatorUnitId: "",
        buildingName: "",
        lastUpdatedBy: "",
        fromDate: "",
        toDate: "",
        countryId: $rootScope.selectedCountryId,
        userId: $cookies.get('CCApp-userID')
      };
      $scope.showNoRecord = true;
      $scope.exportData = [];
      $scope.elevatorDetailsArry = [];
      $scope.currentPage = 0;
      $scope.search.countryId = $rootScope.selectedCountryId;
      getCallDetailsByCountry($scope.search);
    });

    /*
     * variable function to get all call summary and language translation file
     * associated to report page
     */
    var initilize = function () {
      $scope.reportFilter = initReportModelData();
      if ($rootScope.languageShortName != null) {
        getLanguageString($rootScope.languageShortName);
      }

      if ($rootScope.currentUser != null) {
        $scope.search.countryId = $rootScope.selectedCountryId;
        callTitleBar();
      }
    };

    initilize();

    $scope.openViewDetail = function (elevatorId) {
      //write a ogic to display the elevator details
      $rootScope.$emit("openCallDetails", elevatorId);
    };

    /* Routine to get language file based on user selection
     *  @param:lang
     */
    function getLanguageString(lang) {
      try {
        languageService.getLanguageString({
          "page": $rootScope.selectedCountryShortName + "_" + lang + '_report.json'
        }).then(function (res) {
          $scope.reportTemplateLangTranslation = res;
        }, function (err) {
          commonService.logException({
            "methodName": "getLanguageString",
            "exceptionDetails": err
          });
        });
      } catch (ex) {
        commonService.logException({
          "methodName": "getLanguageString",
          "exceptionDetails": ex.message
        });
      }
    }

    function getCallDetailsByCountry(objFilter) {
      try {
        $rootScope.loader.showLoader = true;
        reportService.getCallDetailsByCountry(objFilter)
          .then(function (res) {
            $scope.processGetCallDetailsResult(res);
          }, function (err) {
            $rootScope.loader.showLoader = false;
            commonService.logException({
              "methodName": "getCallDetailsByCountry",
              "exceptionDetails": err
            });
          });
      } catch (ex) {
        $rootScope.loader.showLoader = false;
        commonService.logException({
          "methodName": "getCallDetailsByCountry",
          "exceptionDetails": ex
        });
      }
    }

    $scope.processGetCallDetailsResult = function(res) {
      $rootScope.loader.showLoader = false;
      if (res.status == true) {
        $scope.elevatorDetailsArry = res.data.recordsets;
        $scope.showNoRecord = true;
        if ($scope.elevatorDetailsArry[0].length > 0) {
          $scope.showNoRecord = false;
        }
        $scope.numOfPages = Math.ceil($scope.elevatorDetailsArry[0].length / $scope.pageSize);
      }
    };

    function getCallSummary(objFilter) {
      try {
        $rootScope.loader.showLoader = true;
        reportService.getCallSummary(objFilter)
          .then(function (res) {
            $scope.processGetCallSummary(res);
          }, function (err) {
            $rootScope.loader.showLoader = false;
            commonService.logException({
              "methodName": "getCallSummary",
              "exceptionDetails": err
            });
          });
      } catch (ex) {
        $rootScope.loader.showLoader = false;
        commonService.logException({
          "methodName": "getCallSummary",
          "exceptionDetails": ex.message
        });
      }
    }

    $scope.processGetCallSummary = function(res) {
      if (res.status == true) {
        $scope.elevatorDetailsArry = res.data.recordsets;
        $scope.showNoRecord = true;
        if ($scope.elevatorDetailsArry[0].length > 0) {
          $scope.showNoRecord = false;
        }
        $scope.numOfPages = Math.ceil($scope.elevatorDetailsArry[0].length / $scope.pageSize);
      }
      $rootScope.loader.showLoader = false;
    };
    
    /*
     * Variable function to export excel report
     */
    $scope.exportReport = function () {
      var reportDate = $filter('date')(new Date(), "dd_M_y_h_mm_a");
      var fileName = 'Call_summary_' + reportDate;
      var userId = $cookies.get('CCApp-userID');
      $scope.exportExcelData = [];
      //$scope.exportExcelData = prepare2DMatrixDataForExcel($scope.elevatorDetailsArry[0]);
      //exportReportService.exportToExcel($scope.exportExcelData, fileName);
      if ($scope.elevatorDetailsArry.length > 0) {
        var filteredData = $filter('filter')($scope.elevatorDetailsArry[0], {
          elevatorUnitId: $scope.reportFilter.unitId, buildingName: $scope.reportFilter.buildingName, lastUpdatedBy: $scope.reportFilter.agent
        });
        $scope.exportExcelData = prepare2DMatrixDataForExcel(filteredData);
        exportReportService.exportToExcel($scope.exportExcelData, fileName);
      }
      /*try {
        reportService.exportCallReport(userId)
          .then(function (res) {
            if (res.status == true) {
              var filteredData = $filter('filter')(res.data.recordset, {
                elevatorUnitId: $scope.reportFilter.unitId, buildingName: $scope.reportFilter.buildingName
              });
              $scope.exportExcelData = prepare2DMatrixDataForExcel(filteredData);
              exportReportService.exportToExcel($scope.exportExcelData, fileName);
            }
          }, function (err) {
            commonService.logException({
              "methodName": "exportCallReport",
              "exceptionDetails": err
            });
          });
      } catch (ex) {
        commonService.logException({
          "methodName": "exportReport",
          "exceptionDetails": ex.message
        });
      }*/
    };

    /*
     * Routine to validate the report filter input fields
     * @param: reportFilter
     */
    function validateReportFilter(reportFilter) {
      $scope.reportFilterErrorModel = {
        "hasError": false,
        "DateError": ""
      };

      var isEmpty = function (value) {
        if(value) {
          if(value.trim) {
            value = value.trim();
          }
        }
        return (value === "" || value === undefined || value === null);
      };

      if (reportFilter.toDate < reportFilter.fromDate) {
        $scope.reportFilterErrorModel.hasError = true;
        $scope.reportFilterErrorModel.DateError = $scope.reportTemplateLangTranslation.dateCompareError;
      }

      if (reportFilter.fromDate > $scope.TodayDate) {
        $scope.reportFilterErrorModel.hasError = true;
        $scope.reportFilterErrorModel.DateError = $scope.reportTemplateLangTranslation.dateError;
      }
      if (reportFilter.toDate > $scope.TodayDate) {
        $scope.reportFilterErrorModel.hasError = true;
        $scope.reportFilterErrorModel.DateError = $scope.reportTemplateLangTranslation.dateError;
      }

      if (isEmpty(reportFilter.fromDate) || isEmpty(reportFilter.toDate)) {
        $scope.reportFilterErrorModel.hasError = true;
        $scope.reportFilterErrorModel.DateError = $scope.reportTemplateLangTranslation.dateEmpty;
      }
    }

    /*
     * Routine to convert Json Array of objects into 2D matrix for excel report
     * generation
     * ie, [{key:value,key1,value1,key2:value2},{key:value,key1,value1,key2:value2}]
     * will be converted into  [[value,value1,value2][value,value1,value2]];
     * @param: record (Json array of objects)
     * @return: exportData (Array of array)
     */
    function prepare2DMatrixDataForExcel(record) {
      var exportData = [];
      //Adding header for excel report
      exportData.push([
        $scope.reportTemplateLangTranslation.elevatorIdTbHeader,
        $scope.reportTemplateLangTranslation.lastUpdateByTBHeader,
        $scope.reportTemplateLangTranslation.buildingNameTbHeader,
        $scope.reportTemplateLangTranslation.floorDirectionTBHeader,
        $scope.reportTemplateLangTranslation.calldisposition,
        $scope.reportTemplateLangTranslation.createdOn,
        $scope.reportTemplateLangTranslation.assignedOn,
        $scope.reportTemplateLangTranslation.connectedOn,
        $scope.reportTemplateLangTranslation.completedOn,
        $scope.reportTemplateLangTranslation.messages,
        $scope.reportTemplateLangTranslation.notes
      ]);
      for (var index = 0; index < record.length; index++) {
        exportData.push([
          record[index].elevatorUnitId,
          record[index].lastUpdatedBy,
          record[index].buildingName,
          record[index].floorNumber + '-' + (record[index].direction == "0"? "Down": (record[index].direction == "1"? "Up": "Stopped")),
          record[index].callDisposition,
          record[index].createdOn,
          record[index].recievedOn,          
          record[index].connectedOn,
          record[index].completedOn,
          record[index].message,
          record[index].notes
        ]);
      }
      return exportData;
    }
  }

  angular.module('CCApp').controller('reportController', Implementation);
  Implementation.$inject = ['$scope', '$rootScope', '$cookies', '$filter', 'reportService', 'exportReportService', 'commonService', 'languageService', 'REPORTTIME'];
})();
