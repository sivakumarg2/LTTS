//// Controller Name: shutdownReasonController
//// Description: This controller will have the logic to maintain shutdown reason master data for the calls
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
(function () {
  'use strict';

  function Implementation($rootScope, $scope, shutdownReasonService, commonService, languageService) {
    var shutdownReasonModel = {
      "code": "",
      "shutdownReason": ""
    };

    var shutdownReasonFormError = {
      'code': {
        'hasError': false,
        "message": ""
      },
      'shutdownReason': {
        'hasError': false,
        "message": ""
      },
      'hasError': false
    };

    // Country setting form modal selector
    $scope.shutdownReasonModalSelctor = document.getElementById('shutdownReasonModal');
    var statusMessgaeContainer = "status-msg-fade";
    $scope.onlyNumberRegexPattren = '^[0-9]$';
    $scope.shutdownlangTranslation = {};
    $scope.shutdownReasonFormModel = {};
    $scope.shutdownReasons = []; //Initally table items will be empty
    $scope.formfieldError = {};
    $scope.numOfPages = 0;
    $scope.currentPage = 0;
    $scope.pageSize = 10;
    $scope.sid = '';
    $scope.shutdownReasonStatus = {
      save: false,
      delete: false
    };

    $scope.$emit("hidebars", false, false, true);
    $scope.$emit("topBarTitle", "settings", "shutdownReason", 1);
    /* Rootscope change event to get the language file*/
    $rootScope.$on("changeLanguage", function (event, lang) {
      getLanguageString($rootScope.languageShortName === "" ? lang : $rootScope.languageShortName);
    });

    $scope.$watch("search.searchText", function (nv, ov) {
      if (nv != ov) {
        $scope.currentPage = 0;
      }
    });
    
    /* Close the existing popup modal on incoming call  */
    $rootScope.$on("callEvents", function (event, data) {
      if (data === "incoming") {
        $scope.shutdownReasonModalSelctor.style.display = 'none';
        $("#delete-confirmation")[0].style.display = 'none';
      }
    });

    /*Routine to get language file based on user selection*/
    var getLanguageString = function (lang) {
      try {
        languageService.getLanguageString({
          "page": $rootScope.selectedCountryShortName + "_" + lang + '_shutdown_reason.json'
        }).then(function (res) {
          $scope.shutdownlangTranslation = res;
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
    };

    var initilize = function () {
      if ($rootScope.languageShortName != null) {
        getLanguageString($rootScope.languageShortName);
      }
    };

    initilize();

    /*Scope function to add new Shutdown Reason*/
    $scope.addNewShutdownReason = function () {
      hideStatusMsg();
      $scope.shutdownReasonFormModel = angular.copy(shutdownReasonModel);
      showShutdownReasonModal($scope.shutdownReasonModalSelctor);
    };

    /*Scope function to hide/close shutdown reason modal*/
    $scope.hideShutdownReasonModal = function () {
      $scope.shutdownReasonModalSelctor.style.display = 'none';
      $scope.formfieldError = angular.copy(shutdownReasonFormError);
    };

    /*
    * scope attached function to retrive all Shutdown Reason
    */
    $scope.getAllShutdownReason = function () {
      try {
        $rootScope.loader.showLoader = true;
        shutdownReasonService.getAllShutdownReason().then(function (res) {
          $scope.processResult(res);
        }, function (err) {
          $rootScope.loader.showLoader = false;
          commonService.logException({
            "methodName": "getAllShutdownReason",
            "exceptionDetails": err
          });
        });
      } catch (logException) {
        $rootScope.loader.showLoader = false;
        commonService.logException({
          "methodName": "getAllShutdownReason",
          "exceptionDetails": logException
        });
      }
    };

    $scope.processResult = function (res) {
      ////if success
      if (res.status) {
        $scope.shutdownReasons = res.data.recordset;
        $scope.numOfPages = Math.ceil($scope.shutdownReasons.length / $scope.pageSize);
      }
      $rootScope.loader.showLoader = false;
    };

    /*
    * scope function to save or update Shutdown Reason
    */
    $scope.saveOrUpdateShutdownReason = function (shutdownReasonModel) {
      try {
        $rootScope.loader.showLoader = true;
        validateShutdownReasonForm(shutdownReasonModel);
        if ($scope.formfieldError.hasError) {
          $rootScope.loader.showLoader = false;
          return;
        }
        shutdownReasonService.addShutdownReason(shutdownReasonModel).then(function (res) {
          $scope.processSaveorUpdateResult(res);
        }, function (err) {
          $rootScope.loader.showLoader = false;
          commonService.logException({
            "methodName": "saveOrUpdateShutdownReason",
            "exceptionDetails": err
          });
        });
      } catch (logException) {
        $rootScope.loader.showLoader = false;
        commonService.logException({
          "methodName": "saveOrUpdateShutdownReason",
          "exceptionDetails": logException
        });
      }
    };

    $scope.processSaveorUpdateResult = function (res) {
      ////if success
      if (res.status) {
        hideStatusMsg();
        $scope.shutdownReasonStatus.save = true;
        commonService.showStatusMessage(statusMessgaeContainer);
        $scope.hideShutdownReasonModal();
        $scope.getAllShutdownReason();
      } else {
        if (isDuplicateRecord(res)) {
          $scope.shutdownReasonStatus.duplicate = true;
        }
      }
      $rootScope.loader.showLoader = false;
    };

    //On click of edit bind the rows data and shows in modal popup  (showShutdownReasonModal)
    $scope.editShutdownReason = function (shutdownReason) {
      hideStatusMsg();
      $scope.shutdownReasonFormModel = angular.copy(shutdownReason);
      showShutdownReasonModal($scope.shutdownReasonModalSelctor);
    };

    //Before deleting the Shutdown Reason shows confirmation modal popup
    $scope.deleteShutdownReason = function (shutdownReasonId) {
      $scope.shutdownReasonId = shutdownReasonId;
      hideStatusMsg();
      openDeleteModal();      
    };

    /*Helper routine to show/display Shutdown Reason modal*/
    function showShutdownReasonModal(shutdownReasonModalSelctor) {
      shutdownReasonModalSelctor.style.display = 'block';
      $scope.shutdownReasonStatus.save = false;
      $scope.shutdownReasonStatus.delete = false;
      $scope.shutdownReasonStatus.duplicate = false;
    }

    //Routine to open the delete confirmation model
    function openDeleteModal() {
      if(angular.element("#delete-confirmation").length > 0) {
        angular.element("#delete-confirmation")[0].style.display = 'block';
      }      
    }

    //Routine to close delete confirmation modal
    $scope.closeDeleteModal = function (isConfirmed) {
      try {
        if (isConfirmed) {
          $rootScope.loader.showLoader = true;
          shutdownReasonService.deleteShutdownReason($scope.shutdownReasonId).then(function (res) {
           $scope.processDeleteModal(res);
          }, function (err) {
            $rootScope.loader.showLoader = false;
            commonService.logException({
              "methodName": "deleteShutdownReason",
              "exceptionDetails": err
            });
          });
        }
        $("#delete-confirmation")[0].style.display = 'none';

      } catch (logException) {
        $rootScope.loader.showLoader = false;
        commonService.logException({
          "methodName": "deleteShutdownReason",
          "exceptionDetails": logException
        });
      }
    };

    $scope.processDeleteModal = function (res) {
      if (res.status) {
        hideStatusMsg();
        $scope.shutdownReasonStatus.delete = true;
        commonService.showStatusMessage(statusMessgaeContainer);
        $scope.getAllShutdownReason();
      }
      $rootScope.loader.showLoader = false;
    };

    /*Helper routine to validate Shutdown Reason form fields beofre saving Or Updating*/
    function validateShutdownReasonForm(shutdownReasonModel) {

      $scope.formfieldError = angular.copy(shutdownReasonFormError);

      var hasError = function () {
        if ($scope.formfieldError.hasError)
          return;
        $scope.formfieldError.hasError = true;
      };

      var isEmpty = function (value) {
        var isEmpty = false;
        if (value.trim() === "" || value === undefined) {
          isEmpty = true;
        }
        return isEmpty;
      };

      if (isEmpty(shutdownReasonModel.code)) {
        hasError();
        $scope.formfieldError.code.hasError = true;
        $scope.formfieldError.code.message = $scope.shutdownlangTranslation.codeFieldEmpty;
      }
      if (isEmpty(shutdownReasonModel.shutdownReason)) {
        hasError();
        $scope.formfieldError.shutdownReason.hasError = true;
        $scope.formfieldError.shutdownReason.message = $scope.shutdownlangTranslation.shutdownReasonFieldEmpty;
      }
    }

    function hideStatusMsg() {
      $scope.shutdownReasonStatus.save = false;
      $scope.shutdownReasonStatus.delete = false;
    }

    function isDuplicateRecord(result) {
      if (result.data != null && result.data.code === "1001") {
        return true;
      }
      return false;
    }
  }

  angular.module("CCApp").controller('shutdownReasonController', Implementation);
  Implementation.$inject = ['$rootScope', '$scope', 'shutdownReasonService', 'commonService', 'languageService'];
})();
