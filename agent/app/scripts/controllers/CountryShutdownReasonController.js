//// Controller Name: countryShutdownReasonController
//// Description: This controller will have the logic to handle country shutdown reason (translation of master) functionalities
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
(function () {
  'use strict';

  function Implementation($rootScope, $scope, $cookies, commonService, languageService, countryShutdownService) {
    $scope.$emit("topBarTitle", "settings", "countryShutdownReason", 1);
    var statusMessgaeContainer = "status-msg-fade";
    $scope.countryShutdownReasn = { status: false };
    $scope.countryShutdownReasonModalSelctor = document.getElementById('countryShutdownReasnModal');
    $scope.deleteDialogSelector = document.getElementById('delete-confirmation');
    var formfieldError = {
      "hasError": false,
      "translatedShutdownReason": ''
    };
    var selCountryId = 0;

    $scope.disabled = true;
    $scope.countryShutdownReasnStatus = {
      save: false,
      delete: false
    };
    $scope.countryShutdownReasons = [];
    $scope.numOfPages = 0;
    $scope.currentPage = 0;
    $scope.pageSize = 10;

    $scope.$watch("search.searchText", function (nv, ov) {
      if (nv != ov) {
        $scope.currentPage = 0;
      }
    });

    /* Close the existing popup modal on incoming call  */
    $rootScope.$on("callEvents", function (event, data) {
      if (data === "incoming") {
        $scope.deleteDialogSelector.style.display = 'none';
        $scope.countryShutdownReasonModalSelctor.style.display = 'none';
      }
    });
    /*Routine to get language file based on user selection*/
    var getLanguageString = function (lang) {
      try {
        languageService.getLanguageString({
          "page": $rootScope.selectedCountryShortName + "_" + lang + '_country_Shutdown_reason.json'
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
      $scope.getCountryShutdownReason();
    });

    $rootScope.$on("changeCountry", function (event, selectedCountryId) {
      selCountryId = selectedCountryId;
      $scope.getCountryShutdownReason();
      hideStatusMsg();
    });

    $rootScope.$on('afterRefresh', function () {
      getLanguageString($rootScope.languageShortName);
      $scope.getCountryShutdownReason();
    });

    $scope.getCountryShutdownReason = function() {
      $scope.getCountryShutdownReasonBycountryId($rootScope.selectedCountryId, $rootScope.languageId);
    };

    var initialize = function () {
      if ($rootScope.languageShortName != null) {
        getLanguageString($rootScope.languageShortName);
      }

      if ($rootScope.currentUser) {
        $scope.getCountryShutdownReason();
      }
    };

    //Get all the country shutdown reason settings details and bind to grid using allCountryConfigList
    $scope.getCountryShutdownReasonBycountryId = function (countryId, languageId) {
      try {
        $rootScope.loader.showLoader = true;
        if (countryId == undefined || countryId == null) {
          return;
        }

        countryShutdownService.getCountryShutdownReasonById(countryId, languageId).then(function (res) {
          $scope.processCountryShutdownReasonResult(res);
        }, function (err) {
          $rootScope.loader.showLoader = false;
          commonService.logException({
            "methodName": "getCountryShutdownReasonBycountryId",
            "exceptionDetails": err
          });
        });
      } catch (exception) {
        $rootScope.loader.showLoader = false;
        commonService.logException({
          "methodName": "getCountryShutdownReasonBycountryId",
          "exceptionDetails": exception.message
        });
      }
    };

    $scope.processCountryShutdownReasonResult = function(res) {
      ////if success
      if(res.data.recordsets != null) {
        if(res.data.recordsets.length > 1) {
          $rootScope.$emit("assignShutdownValues", res.data.recordsets[1]);
        }
      }
      
      if (res.status) {
        if (res.data.recordset) {
          if(res.data.recordset[0].message != null) {
            $scope.countryShutdownReasons = [];
            $scope.numOfPages = 0;
          }
          else {
            $scope.countryShutdownReasons = res.data.recordset;
            $scope.numOfPages = Math.ceil($scope.countryShutdownReasons.length / $scope.pageSize);
          }
        }
        else {
          $scope.countryShutdownReasons = [];
          $scope.numOfPages = 0;
        }
      } else {
        $scope.countryShutdownReasons = [];
        $scope.numOfPages = 0;
      }

      $rootScope.loader.showLoader = false;
    };
    
    //On click of edit bind the rows data and show in popup
    $scope.editCountryShutdownReason = function (shutdownReason) {
      hideStatusMsg();
      $scope.countryShutdownReasonFormModel = angular.copy(shutdownReason);
      showCountryShutdownReasnModal($scope.countryShutdownReasonModalSelctor);
    };

    //Save the entered country shutdown reason settings and validate while save the same
    $scope.saveOrUpdateCountryShutdownReason = function (translatedShutdownReason) {
      try {
        validateForm(translatedShutdownReason.translation);
        if ($scope.formfieldError.hasError) {
          return;
        }
        translatedShutdownReason.userId = $cookies.get('CCApp-userID');
        translatedShutdownReason.languageId = $rootScope.languageId;
        $rootScope.loader.showLoader = true;
        countryShutdownService.saveCountryShutdownReason(translatedShutdownReason).then(function (res) {
          $scope.processCountrySaveUpdateResult(res);
        }, function (err) {
          $rootScope.loader.showLoader = false;
          commonService.logException({
            "methodName": "saveOrUpdateCountryShutdownReason",
            "exceptionDetails": err
          });
        });
      } catch (exception) {
        $rootScope.loader.showLoader = false;
        commonService.logException({
          "methodName": "saveOrUpdateCountryShutdownReason",
          "exceptionDetails": exception.message
        });
      }
    };

    $scope.processCountrySaveUpdateResult = function(res) {
      ////if success
      if (res.status) {
        hideStatusMsg();
        $scope.countryShutdownReasn.status = true;
        commonService.showStatusMessage(statusMessgaeContainer);
        $scope.hideCountryShutdownReasnModal();
        $scope.getCountryShutdownReason();
      }
      $rootScope.loader.showLoader = false;
    };

    //Before deleting the shutdown reason shows confirmation modal popup
    $scope.deleteShutdownReason = function (shutdownReasonId) {
      hideStatusMsg();
      openDeleteModal();
      $scope.shutdownReasonId = shutdownReasonId;
    };

    //Routine to close delete confirmation modal
    $scope.closeDeleteModal = function (isConfirmed) {
      try {
        if (isConfirmed && $scope.shutdownReasonId != null) {
          $rootScope.loader.showLoader = true;
          countryShutdownService.deleteCountryShutdownReason($scope.shutdownReasonId).then(function (res) {
           $scope.processCloseModalResult(res);
          }, function (err) {
            $rootScope.loader.showLoader = false;
            commonService.logException({
              "methodName": "deleteShutdownReason",
              "exceptionDetails": err
            });
          });
        }
        $scope.deleteDialogSelector.style.display = 'none';
      } catch (exception) {
        $rootScope.loader.showLoader = false;
        commonService.logException({
          "methodName": "deleteShutdownReason",
          "exceptionDetails": exception.message
        });
      }
    };

    $scope.processCloseModalResult = function(res) {
      if (res.status) {
        hideStatusMsg();
        $scope.countryShutdownReasn.status = true;
        $scope.getCountryShutdownReason();
        commonService.showStatusMessage(statusMessgaeContainer);
      }
      $rootScope.loader.showLoader = false;
    };
    
    /*Scope function to hide/close country shutdown reason setting modal*/
    $scope.hideCountryShutdownReasnModal = function () {
      $scope.countryShutdownReasonModalSelctor.style.display = 'none';
      $scope.formfieldError.countryShutdownReasonMsg = "";
    };

    function validateForm(translatedShutdownReason) {
      $scope.formfieldError = angular.copy(formfieldError);
      if (translatedShutdownReason == undefined || translatedShutdownReason.trim() === '') {
        $scope.formfieldError.hasError = true;
        $scope.formfieldError.message = $scope.translation.translatedCallDispoEmpty;
      }
    }

    /*Helper routine to show/display country shutdown reason setting modal*/
    function showCountryShutdownReasnModal(countryShutdownReasonModalSelctor) {
      countryShutdownReasonModalSelctor.style.display = 'block';
    }

    function hideStatusMsg() {
      $scope.formfieldError = angular.copy(formfieldError);
      $scope.countryShutdownReasn.status = false;
    }

    //Routine to open the delete confirmation model
    function openDeleteModal() {
      $scope.deleteDialogSelector.style.display = 'block';
    }

    initialize();
  }

  angular.module("CCApp").controller('countryShutdownReasonController', Implementation);
  Implementation.$inject = ['$rootScope', '$scope', '$cookies', 'commonService', 'languageService', 'countryShutdownService'];
})();
