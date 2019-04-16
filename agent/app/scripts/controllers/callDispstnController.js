//// Controller Name: callDispstnController
//// Description: This controller will have the logic to handle master disposition functionalities
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
(function () {
  'use strict';

  function Implementation($rootScope, $scope, callDispositionService, commonService, languageService) {
    var callDispostionModel = {
      "code": "",
      "callDisposition": "",
      "shutdownReasonCode": ""
    };

    var callDispostionFormError = {
      'code': {
        'hasError': false,
        "message": ""
      },
      'callDisposition': {
        'hasError': false,
        "message": ""
      },
      'hasError': false
    };

    // Country setting form modal selector
    $scope.callDispostionModalSelctor = document.getElementById('callDispositionModal');
    var statusMessgaeContainer = "status-msg-fade";
    $scope.onlyNumberRegexPattren = '^[0-9]$';
    $scope.callDisptnlangTranslation = {};
    $scope.callDispositionFormModel = {};
    $scope.callDispositions = []; //Initally table items will be empty
    $scope.formfieldError = {};
    $scope.numOfPages = 0;
    $scope.currentPage = 0;
    $scope.pageSize = 10;
    $scope.sid = '';
    $scope.calldispositonStatus = {
      save: false,
      delete: false
    };

    $scope.$emit("hidebars", false, false, true);
    $scope.$emit("topBarTitle", "settings", "callDisposition", 1);

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
        $scope.callDispostionModalSelctor.style.display = 'none';
        $("#delete-confirmation")[0].style.display = 'none';
      }
    });

    /*Routine to get language file based on user selection*/
    var getLanguageString = function (lang) {
      try {
        languageService.getLanguageString({
          "page": $rootScope.selectedCountryShortName + "_" + lang + '_call_disposition.json'
        }).then(function (res) {
          $scope.callDisptnlangTranslation = res;
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
      if($rootScope.languageShortName != null) {
        getLanguageString($rootScope.languageShortName);
      } 
    };

    initilize();

    /*Scope function to add new call disposition*/
    $scope.addNewCallDisposition = function () {
      hideStatusMsg();
      $scope.callDispositionFormModel = angular.copy(callDispostionModel);
      showCallDispositionModal($scope.callDispostionModalSelctor);
    };

    /*Scope function to hide/close call disposition modal*/
    $scope.hideCallDispostionModal = function () {
      $scope.callDispostionModalSelctor.style.display = 'none';
      $scope.formfieldError = angular.copy(callDispostionFormError);
      $scope.calldispositonStatus.save = false;
      $scope.calldispositonStatus.delete = false;
      $scope.calldispositonStatus.duplicate = false;
    };

    /*
    * scope attached function to retrive all Call disposition
    */
    $scope.getAllCallDisposition = function () {
      try {
        $rootScope.loader.showLoader = true;
        callDispositionService.getAllCallDeposition().then(function (res) {
          ////if success
          $scope.processResult(res);
        }, function (err) {
          $rootScope.loader.showLoader = false;
          commonService.logException({
            "methodName": "getAllCallDisposition",
            "exceptionDetails": err
          });
        });
      } catch (logException) {
        $rootScope.loader.showLoader = false;
        commonService.logException({
          "methodName": "getAllCallDisposition",
          "exceptionDetails": logException
        });
      }
    };

    $scope.processResult = function (res) {
      if (res.status) {
        $scope.callDispositions = res.data.recordset;
        $scope.numOfPages = Math.ceil($scope.callDispositions.length / $scope.pageSize);
      }
      $rootScope.loader.showLoader = false;
    };

    /*
    * scope function to save or update call disposition
    */
    $scope.saveOrUpdateCallDispostion = function (callDispostionModel) {
      try {
        $rootScope.loader.showLoader = true;
        validateCallDispositionForm(callDispostionModel);
        if ($scope.formfieldError.hasError) {
          $rootScope.loader.showLoader = false;
          return;
        }
        callDispositionService.addCallDisposition(callDispostionModel).then(function (res) {
          ////if success
          $scope.processSaveorUpdateResult(res);
        }, function (err) {
          $rootScope.loader.showLoader = false;
          commonService.logException({
            "methodName": "addCallDeposition",
            "exceptionDetails": err
          });
        });
      } catch (logException) {
        $rootScope.loader.showLoader = false;
        commonService.logException({
          "methodName": "addCallDeposition",
          "exceptionDetails": logException
        });
      }
    };

    $scope.processSaveorUpdateResult = function(res) {
      if (res.status) {
        $scope.hideCallDispostionModal();
        hideStatusMsg();
        $scope.calldispositonStatus.save = true;
        commonService.showStatusMessage(statusMessgaeContainer);            
        $scope.getAllCallDisposition();
      }else{
        if(isDuplicateRecord(res)){
            $scope.calldispositonStatus.duplicate = true;
        }
      }
      $rootScope.loader.showLoader = false;
    };

    //On click of edit bind the rows data and shows in modal popup  (showCallDispositionModal)
    $scope.editCallDisposition = function (callDisposition) {
      hideStatusMsg();
      $scope.callDispositionFormModel = angular.copy(callDisposition);
      showCallDispositionModal($scope.callDispostionModalSelctor);
    };

    //Before deleting the call disposition shows confirmation modal popup
    $scope.deleteCallDisposition = function (callDispositionId) {
      hideStatusMsg();
      openDeleteModal();
      $scope.callDispositionId = callDispositionId;
    };

    /*Helper routine to show/display call disposition modal*/
    function showCallDispositionModal(callDispostionModalSelctor) {
      $scope.callDispostionModalSelctor.style.display = 'block';
      $scope.calldispositonStatus.save = false;
      $scope.calldispositonStatus.delete = false;
      $scope.calldispositonStatus.duplicate = false;
    }

    //Routine to open the delete confirmation model
    function openDeleteModal() {
      if($("#delete-confirmation").length > 0) {
        $("#delete-confirmation")[0].style.display = 'block';
      }      
    }

    //Routine to close delete confirmation modal
    $scope.closeDeleteModal = function (isConfirmed) {
      try {
        if (isConfirmed) {
          $rootScope.loader.showLoader = true;
          callDispositionService.deleteCallDeposition($scope.callDispositionId).then(function (res) {
           $scope.processDeleteModal(res);
          }, function (err) {
            $rootScope.loader.showLoader = false;
            commonService.logException({
              "methodName": "deleteCallDeposition",
              "exceptionDetails": err
            });
          });
        }
        $("#delete-confirmation")[0].style.display = 'none';

      } catch (logException) {
        $rootScope.loader.showLoader = false;
        commonService.logException({
          "methodName": "deleteCallDeposition",
          "exceptionDetails": logException
        });
      }
    };

    $scope.processDeleteModal = function(res) {
      if (res.status) {
        hideStatusMsg();
        $scope.calldispositonStatus.delete = true;
        commonService.showStatusMessage(statusMessgaeContainer);
        $scope.getAllCallDisposition();
      }
      $rootScope.loader.showLoader = false;
    };

    /*Helper routine to validate call disposition form fields beofre saving Or Updating*/
    function validateCallDispositionForm(callDispostionModel) {

      $scope.formfieldError = angular.copy(callDispostionFormError);

      var hasError = function () {
        if ($scope.formfieldError.hasError)
          return;
        $scope.formfieldError.hasError = true;
      };

      var isEmpty = function (value) {
        var isEmpty = false;
        if(value) {
          if(value.trim) {
            value = value.trim();
          }
        }
        
        if (value === "" || value === undefined) {
          isEmpty = true;
        }
        return isEmpty;
      };

      if (isEmpty(callDispostionModel.code)) {
        hasError();
        $scope.formfieldError.code.hasError = true;
        $scope.formfieldError.code.message = $scope.callDisptnlangTranslation.codeFieldEmpty;
      }
      if (isEmpty(callDispostionModel.callDisposition)) {
        hasError();
        $scope.formfieldError.callDisposition.hasError = true;
        $scope.formfieldError.callDisposition.message = $scope.callDisptnlangTranslation.callDispositoinFieldEmpty;
      }
    }

    function hideStatusMsg() {
      $scope.calldispositonStatus.save = false;
      $scope.calldispositonStatus.delete = false;
    }

    function isDuplicateRecord(result){
      if(result.data != null && result.data.code === "1001"){
        return true;
      }
      return false;
    }
  }

  angular.module("CCApp").controller('callDispstnController', Implementation);
  Implementation.$inject = ['$rootScope', '$scope', 'callDispositionService', 'commonService', 'languageService'];
})();
