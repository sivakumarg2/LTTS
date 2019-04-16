//// Controller Name: supervisorDashboardController
//// Description: This controller will have the logic to retrieve the worker under that supervisor & show the call stats
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
(function () {
  'use strict';

  function Implementation($rootScope, $scope, languageService, reportService, USER_CURRENT_STATUS, commonService, $cookies, $filter, REPORTTIME, STATUSCOLOURS, $location, ACTIVITY_STATUS) {
    var reportModel = {
      "numOutgoingCalls": 0,
      "numberIncomingCalls": 0,
      "longestCallDuration": 0,
      "avgTaskAccTime": 0,
      "availStats": {
        'total': 0,
        'data': [0, 0, 0, 0],
        'labels': [],
        'colors': [STATUSCOLOURS.Red, STATUSCOLOURS.green, STATUSCOLOURS.gold]
      }
    };
    var agentActivity = null;

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
    $scope.activityStatus = ACTIVITY_STATUS;
    $scope.statsavailablity = {};
    $scope.agentDetails = [];
    $scope.currentPage = 0;
    $scope.currentDetailPage = 0;
    $scope.currentCallPage = 0;
    $scope.pageSize = 10;
    $scope.selectedSection = 1;
    $scope.objUTCRangeDate = commonService.getUTCRangeDate();

    //Bar chgrt data starts here
    $scope.series = ["Missed Calls", "Attended Calls", "All Calls"];
    $scope.data = [];
    $scope.chart_options = {
      tooltips: {
        enabled: false,
        barPercentage: 0.9,
        barThickness: 20
      }
    };

    $scope.bar_options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        xAxes: [{
          ticks: {
            stepSize: 1
          },
          gridLines: {
            display: false     // default:True to display the grid line in the chart
          }
        }],
        yAxes: [{
          ticks: {
            stepSize: 1
          },
          gridLines: {
            display: true       // default:True to display the grid line in the chart
          }
        }]
      }
    };

    $scope.disableNext = false;
    $scope.disablePrevious = false;
    $scope.reports = angular.copy(reportModel);
    $scope.dashboardLangTranslation = {};
    $scope.userCurrentStatus = USER_CURRENT_STATUS;

    /* Broadcast callback event on language change */
    $rootScope.$on("changeLanguage", function (event, lang) {
      getLanguageString($rootScope.languageShortName === "" ? lang : $rootScope.languageShortName);
    });

    $rootScope.$on('afterRefresh', function () {
      getLanguageString($rootScope.languageShortName);
      getWorkerstatistics();
    });


    $scope.$emit("hidebars", false, false, true);
    $scope.$emit("topBarTitle", "dashboard", "supervisor");
    $scope.parent = $scope.$parent;
    $scope.reportDate = $filter('date')(new Date().toISOString(), 'yyyy-MM-dd');

    $rootScope.$on("callEvents", function (event, data) {
      if (data === "savedisp") {
        getLanguageString($rootScope.languageShortName);
        getWorkerstatistics();
        if(agentActivity != null) {
          $scope.showUserActivity(agentActivity);
        }        
      }
    });

    $rootScope.$on("loadReports", function () {
      getWorkerstatistics(false);
    });

    var jsonStatus = { "Idle": "status1", "Offline": "status2", "NotAvailable": "status3", "Timeout": "status4", "Reserved": "status5", "Busy": "status6" };
    $rootScope.$on("activityChanges", function (event, data) {
      if (data != "") {
        angular.forEach($(".agent-status-identi"), function (element) {
          //if (data.value[element.id] != null) {
          for (var i = 0; i < data.length; i++) {
            //return ele.key == element.id;
            if (data[i].key == element.id) {
              //angular.forEach($scope.agentDetails, function (item) {
              for (var j = 0; j < $scope.agentDetails.length; j++) {
                var item = $scope.agentDetails[j];
                if ("UserId" + item.userId == element.id) {

                  if (data[i].descriptor.data.status == "Offline") {
                    angular.element(element).html($scope.dashboardLangTranslation["status" + data[i].descriptor.data.statusId]);
                  }
                  else {
                    angular.element(element).html($scope.dashboardLangTranslation[jsonStatus[data[i].descriptor.data.status]]);
                  }

                  //update the details
                  var agent = $.grep($scope.agentDetails, function (ele) {
                    return ele.userId == item.userId;
                  });

                  if (agent.length > 0) {
                    if (data[i].descriptor.data.statusId != "2") {
                      agent[0].loggedInStatusId = 7;
                    }
                    else {
                      agent[0].loggedInStatusId = data[i].descriptor.data.statusId;
                    }
                  }

                  if (data[i].descriptor.data.statusId == 2 || data[i].descriptor.data.statusId == 7) {
                    if (data[i].descriptor.data.statusId == 2) {
                      angular.element("#img" + item.userId).html("<img src='../images/offline-icon.png' />");
                      angular.element("#imga" + item.userId).html("<img src='../images/offline-icon.png' />");
                    }
                    else {
                      angular.element("#img" + item.userId).html("<img src='../images/available-icon.png' />");
                      angular.element("#imga" + item.userId).html("<img src='../images/available-icon.png' />");
                    }
                  }
                }
                //});
              }
              $scope.getTotalAvailabilty($scope.agentDetails);
            }
          }
          //}
        });
      }
    });

    $scope.sortModel = {
      'columnName': 'name',
      'asc': false
    };

    $scope.openViewDetail = function (alarmId) {
      $rootScope.$emit("openCallDetails", alarmId);
    };
    
    $scope.showUserActivity = function (agent) {
      agentActivity = agent;
      $scope.currentDetailPage = 0;
      $scope.currentCallPage = 0;
      $scope.selectedSection = 2;
      var objReport = {
        'dateFrom': $scope.objUTCRangeDate.fromDate,
        'dateTo': $scope.objUTCRangeDate.toDate,
        "userId": agent.userId
      };
      $scope.agentHistory = {
        "userId": agent.userId,
        "name": agent.name,
        "loggedInStatusId": agent.loggedInStatusId,
        "activity": "",
        "calls": "",
      };

      $rootScope.loader.showLoader = true;
      reportService.getWorkersDetailsForSupervisor(objReport)
        .then(function (res) {
          $scope.processShowUserActivityResult(res);
        }, function (err) {
          $rootScope.loader.showLoader = false;
          commonService.logException({
            "methodName": "getWorkersForSupervisor",
            "exceptionDetails": err
          });
        });
    };

    $scope.processShowUserActivityResult = function (res) {
      $rootScope.loader.showLoader = false;
      if (res.status == true) {
        $scope.agentHistory.activity = res.data.recordsets[0];
        $scope.agentHistory.calls = res.data.recordsets[1];
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
          "exceptionDetails": ex
        });
      }
    };

    /* Routine to get Report data to display in dashboard */
    function getWorkerstatistics(load) {
      try {
        var objReport = {
          'countryId': $rootScope.currentUser.countryId,
          'dateFrom': $scope.objUTCRangeDate.fromDate,
          'dateTo': $scope.objUTCRangeDate.toDate,
          "userId": $cookies.get('CCApp-userID')
        };

        $scope.reports = angular.copy(reportModel);
        if (load == null) {
          $rootScope.loader.showLoader = true;
        }

        reportService.getWorkersForSupervisor(objReport)
          .then(function (res) {
            $scope.processWorkersRes4Supervisor(res);
          }, function (err) {
            $rootScope.loader.showLoader = false;
            commonService.logException({
              "methodName": "getWorkersForSupervisor",
              "exceptionDetails": err
            });
          });

        $scope.getDashboardStats(objReport);
      } catch (ex) {
        $rootScope.loader.showLoader = false;
        commonService.logException({
          "methodName": "getWorkerstatistics",
          "exceptionDetails": ex
        });
      }
    }

    $scope.processWorkersRes4Supervisor = function (res) {
      $rootScope.loader.showLoader = false;
      if (res.status) {
        $scope.agentDetails = res.data.recordset;

        //calculate #of incoming calls
        var count = 0;
        angular.forEach($scope.agentDetails, function (item) {
          count += item.attendedCall;
          $scope.reports.numberIncomingCalls = count;
        });
        $scope.numOfPages = Math.ceil($scope.agentDetails.length / $scope.pageSize);
        $scope.getTotalAvailabilty(res.data.recordset);

        $scope.getAvailableDetails();
      }
    };

    $scope.getDashboardStats = function (objReport) {
      reportService.getWorkersReport(objReport)
        .then(function (res) {
         $scope.getDashboardStatsResult(res);
        }, function (err) {
          $rootScope.loader.showLoader = false;
          commonService.logException({
            "methodName": "getWorkerstatistics",
            "exceptionDetails": err
          });
        });
    };
    
    $scope.getDashboardStatsResult = function(res) {
      if (res.status == true) {
        $scope.reportData = res.data;
        $scope.parseCallReportObject(res);
      }
      $rootScope.loader.showLoader = false;
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
            "exceptionDetails": err
          });
        });
      } catch (ex) {
        commonService.logException({
          "methodName": "getLanguageString",
          "exceptionDetails": ex
        });
      }
    }

    $scope.parseCallReportObject = function (json) {
      var reportData = json.data;
      if (reportData == null || reportData == undefined)
        return;
      var allAgent = reportData.workerStatistics;
      for (var i = 0; i < allAgent.length; i++) {
        allAgent[i].statusUpdated = commonService.getUTCToLocal(allAgent[i].statusUpdated, 'MM/DD/YYYY HH:mm:ss a');
      }

      $scope.reports.numOutgoingCalls = reportData.numberOutGoingCalls;
      getLongestCallDuration(reportData.workerStatistics);
      getAverageTaskAcceptance(reportData.workerStatistics);
    };

    function getLongestCallDuration(objstats) {
      var temp = 0;
      for (var i = 0; i < objstats.data.cumulative.activity_durations.length; i++) {
        if (objstats.data.cumulative.activity_durations[i].friendly_name == $scope.userCurrentStatus[2].status) {
          if (temp < objstats.data.cumulative.activity_durations[i].max) {
            temp = objstats.data.cumulative.activity_durations[i].max;
          }
        }
      }
      $scope.reports.longestCallDuration = timeConvertions(temp);
    }

    function timeConvertions(seconds) {
      var days = Math.floor(seconds / 86400);
      var hours = Math.floor((seconds % 86400) / 3600);
      var mins = Math.floor(((seconds % 86400) % 3600) / 60);
      var secs = ((seconds % 86400) % 3600) % 60;
      return ('00' + mins).slice(-2) + ':' + ('00' + secs).slice(-2);
    }

    function getAverageTaskAcceptance(objstats) {
      var count = 0, item = 0;
      for (var i = 0; i < objstats.data.cumulative.activity_durations.length; i++) {
        if (objstats.data.cumulative.activity_durations[i].friendly_name == $scope.userCurrentStatus[1].status) {
          count = objstats.data.cumulative.activity_durations[i].avg;
        }
      }

      $scope.reports.avgTaskAccTime = timeConvertions(count);
    }

    $scope.getTotalAvailabilty = function (objstats) {
      var total = objstats.length;
      var loggedIn = 0;
      for (var i = 0; i < objstats.length; i++) {
        if (objstats[i].loggedInStatusId == $scope.activityStatus[6].id) {
          loggedIn = loggedIn + 1;
        }
      }

      $scope.reports.availStats.total = Math.ceil((loggedIn / total) * 100);
      $scope.reports.availStats.data = [Math.ceil((loggedIn / total) * 100), Math.ceil(((total - loggedIn) / total) * 100)];

      $scope.reports.availStats.labels = [$scope.userCurrentStatus[1].status, $scope.userCurrentStatus[0].status];
      $scope.reports.availStats.colors = [STATUSCOLOURS.green, STATUSCOLOURS.gold];
    };

    var initialize = function () {
      if ('/super-dash' == $location.path()) {
        if ($rootScope.languageShortName != null) {
          getLanguageString($rootScope.languageShortName);
        }
        if ($rootScope.currentUser != null) {
          getWorkerstatistics();
        }
      }
    };

    $scope.getAvailableDetails = function () {
      $rootScope.$emit("getActivityChanges");
    };

    initialize();
  }

  angular.module("CCApp").controller('supervisorDashboardController', Implementation);
  Implementation.$inject = ['$rootScope', '$scope', 'languageService', 'reportService', 'USER_CURRENT_STATUS', 'commonService', '$cookies', '$filter', 'REPORTTIME', 'STATUSCOLOURS', '$location', 'ACTIVITY_STATUS'];
})();
