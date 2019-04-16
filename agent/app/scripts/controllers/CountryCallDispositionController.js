//// Controller Name: countryCallDispositionController
//// Description: This controller will have the logic to handle country disposition functionalities
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
(function () {
  'use strict';

  function Implementation($rootScope, $scope, $cookies, commonService, languageService, countryService) {
    $scope.$emit("topBarTitle", "settings", "countryCallDisposition", 1);
    var statusMessgaeContainer = "status-msg-fade";
    // Country call disposition setting form modal selector
    $scope.countryCallDispo = { status: false };
    $scope.countryCallDispoModalSelctor = document.getElementById('countryCallDispoModal');
    $scope.deleteDialogSelector = document.getElementById('delete-confirmation');
    var formfieldError = {
      "hasError": false,
      "translatedCallDisposition": ''
    };
    var selCountryId = 0;

    $scope.disabled = true;
    $scope.countryCallDispoStatus = {
      save: false,
      delete: false
    };
    $scope.countryCallDispositions = [];
    $scope.numOfPages = 0;
    $scope.currentPage = 0;
    $scope.pageSize = 10;

    /* Close the existing popup modal on incoming call  */
    $rootScope.$on("callEvents", function (event, data) {
      if (data === "incoming") {
        $scope.deleteDialogSelector.style.display = 'none';
        $scope.countryCallDispoModalSelctor.style.display = 'none';
      }
    });

    $scope.$watch("search.searchText", function (nv, ov) {
      if (nv != ov) {        
        $scope.currentPage = 0;
      }
    });

    /*Routine to get language file based on user selection*/
    var getLanguageString = function (lang) {
      try {
        languageService.getLanguageString({
          "page": $rootScope.selectedCountryShortName + "_" + lang + '_country_Disposition.json'
        }).then(function (res) {
          $scope.translation = res;
        }, function (err) {
          commonService.logException({
            "methodName": "getLanguageString",
            "exceptionDetails": err
          });
        });
      } catch (exception) {
        commonService.logException({
          "methodName": "getLanguageString",
          "exceptionDetails": exception.message
        });
      }
    };

    /* Broadcast callback event on language change */
    $rootScope.$on("changeLanguage", function (event, lang) {
      getLanguageString($rootScope.languageShortName === "" ? lang : $rootScope.languageShortName);
      $scope.getCountryCallDisposition();
    });

    $rootScope.$on("changeCountry", function (event, selectedCountryId) {
      selCountryId = selectedCountryId;
      $scope.getCountryCallDisposition();
      hideStatusMsg();
    });

    $rootScope.$on('afterRefresh', function () {
      getLanguageString($rootScope.languageShortName);
      $scope.getCountryCallDisposition();
    });

    $scope.getCountryCallDisposition = function() {
      $scope.getCallDispositionBycountryId($rootScope.selectedCountryId, $rootScope.languageId);
    };

    var initialize = function () {
      if ($rootScope.languageShortName != null) {
        getLanguageString($rootScope.languageShortName);
      }

      if ($rootScope.currentUser) {
        selCountryId = $rootScope.selectedCountryId;
        $scope.getCountryCallDisposition();
      }
    };

    //Get all the country call disposition settings details and bind to grid using allCountryConfigList
    $scope.getCallDispositionBycountryId = function (countryId, languageId) {
      try {
        $rootScope.loader.showLoader = true;
        if (countryId == undefined || countryId == null) {
          return;
        }

        countryService.getCallDispositionByCountryId(countryId, languageId).then(function (res) {
          $scope.processCountryDispResult(res);
        }, function (err) {
          $rootScope.loader.showLoader = false;
          commonService.logException({
            "methodName": "getCallDispositionByCountryId",
            "exceptionDetails": err
          });
        });
      } catch (exception) {
        $rootScope.loader.showLoader = false;
        commonService.logException({
          "methodName": "getCallDispositionByCountryId",
          "exceptionDetails": exception.message
        });
      }
    };

    $scope.processCountryDispResult = function (res) {
      ////if success
      if(res.data.recordsets != null) {
        if(res.data.recordsets.length > 1) {
          $rootScope.$emit("assignCallDispoValues", res.data.recordsets[1]);
        }
      }

      if (res.status) {
        if (res.data.recordset) {
          if(res.data.recordset[0].message != null) {
            $scope.countryCallDispositions = [];
            $scope.numOfPages = 0;
          }
          else {
            $scope.countryCallDispositions = res.data.recordset;
            $scope.numOfPages = Math.ceil($scope.countryCallDispositions.length / $scope.pageSize);
          }
        }
        else {
          $scope.countryCallDispositions = [];
          $scope.numOfPages = 0;
        }
      } else {
        $scope.countryCallDispositions = [];
        $scope.numOfPages = 0;
      }

      $rootScope.loader.showLoader = false;
    };

    //On click of edit bind the rows data and show in popup
    $scope.editCountryCallDisposition = function (calldispostion) {
      hideStatusMsg();
      $scope.callDispositionFormModel = angular.copy(calldispostion);
      showCountryDispoModal($scope.countryCallDispoModalSelctor);
    };

    //Save the entered country call disposition settings and validate while save the same
    $scope.saveOrUpdateCountryDispo = function (translatedCallDispo) {
      try {
        validateForm(translatedCallDispo.translation);
        if ($scope.formfieldError.hasError) {
          return;
        }
        translatedCallDispo.userId = $cookies.get('CCApp-userID');
        translatedCallDispo.languageId = $rootScope.languageId;
        $rootScope.loader.showLoader = true;
        countryService.saveCountryCallDispo(translatedCallDispo).then(function (res) {
          ////if success
          $scope.processSaveorUpdateResult(res);          
        }, function (err) {
          $rootScope.loader.showLoader = false;
          commonService.logException({
            "methodName": "addCountryCallDispo",
            "exceptionDetails": err
          });
        });
      } catch (exception) {
        $rootScope.loader.showLoader = false;
        commonService.logException({
          "methodName": "addCountryCallDispo",
          "exceptionDetails": exception.message
        });
      }
    };

    $scope.processSaveorUpdateResult = function (res) {
      if (res.status) {
        hideStatusMsg();
        $scope.countryCallDispo.status = true;
        commonService.showStatusMessage(statusMessgaeContainer);
        $scope.hideCountryDispoModal();
        $scope.getCountryCallDisposition();
      }
      $rootScope.loader.showLoader = false;
    };

    //Before deleting the call disposition shows confirmation modal popup
    $scope.deleteCallDeposition = function (callDispositionId) {
      hideStatusMsg();
      openDeleteModal();
      $scope.callDispositionId = callDispositionId;
    };

    //Routine to close delete confirmation modal
    $scope.closeDeleteModal = function (isConfirmed) {
      try {
        if (isConfirmed && $scope.callDispositionId != null) {
          $rootScope.loader.showLoader = true;
          countryService.deleteCountryCallDispo($scope.callDispositionId).then(function (res) {
            $scope.processCloseModalResult(res);
          }, function (err) {
            $rootScope.loader.showLoader = false;
            commonService.logException({
              "methodName": "deleteCallDeposition",
              "exceptionDetails": err
            });
          });
        }
        $scope.deleteDialogSelector.style.display = 'none';
      } catch (exception) {
        $rootScope.loader.showLoader = false;
        commonService.logException({
          "methodName": "deleteCallDeposition",
          "exceptionDetails": exception.message
        });
      }
    };

    $scope.processCloseModalResult = function (res) {
      if (res.status) {
        hideStatusMsg();
        $scope.countryCallDispo.status = true;
        $scope.getCountryCallDisposition();
        commonService.showStatusMessage(statusMessgaeContainer);
      }
      $rootScope.loader.showLoader = false;
    };

    /*Scope function to hide/close country call disposition setting modal*/
    $scope.hideCountryDispoModal = function () {
      $scope.countryCallDispoModalSelctor.style.display = 'none';
      $scope.formfieldError.countryCalldDispositionMsg = "";
    };

    function validateForm(translatedCallDisposition) {
      $scope.formfieldError = angular.copy(formfieldError);
      if (translatedCallDisposition == undefined || translatedCallDisposition.trim() === '') {
        $scope.formfieldError.hasError = true;
        $scope.formfieldError.message = $scope.translation.translatedCallDispoEmpty;
      }
    }

    /*Helper routine to show/display country call disposition setting modal*/
    function showCountryDispoModal(countryCallDispoModalSelctor) {
      countryCallDispoModalSelctor.style.display = 'block';
    }

    function hideStatusMsg() {
      $scope.formfieldError = angular.copy(formfieldError);
      $scope.countryCallDispo.status = false;
    }

    //Routine to open the delete confirmation model
    function openDeleteModal() {
      $scope.deleteDialogSelector.style.display = 'block';
    }

    initialize();
  }

  angular.module("CCApp").controller('countryCallDispositionController', Implementation);
  Implementation.$inject = ['$rootScope', '$scope', '$cookies', 'commonService', 'languageService', 'countryService'];
})();
