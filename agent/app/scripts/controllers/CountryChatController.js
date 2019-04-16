//// Controller Name: countryChatController
//// Description: This controller will have the logic to handle country Question Text (translation of master) functionalities
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
(function () {
  'use strict';

  function Implementation($rootScope, $scope, $cookies, commonService, languageService, countryChatService) {
    $scope.$emit("topBarTitle", "settings", "countryQuestionText", 1);
    var statusMessgaeContainer = "status-msg-fade";
    $scope.countryQuestionText = { status: false };
    $scope.countryQuestionTextModalSelctor = document.getElementById('countryQuestionTextModal');
    $scope.deleteDialogSelector = document.getElementById('delete-confirmation');
    var formfieldError = {
      "hasError": false
    };
    var selCountryId = 0;
    $scope.disabled = true;

    $scope.countryQuestionTexts = [];
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
        $scope.countryQuestionTextModalSelctor.style.display = 'none';
      }
    });

    /*Routine to get language file based on user selection*/
    var getLanguageString = function (lang) {
      try {
        languageService.getLanguageString({
          "page": $rootScope.selectedCountryShortName + "_" + lang + '_country_chat_messages.json'
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
      $scope.getCountryQuestionTexts();
    });

    $rootScope.$on("changeCountry", function (event, selectedCountryId) {
      selCountryId = selectedCountryId;
      $scope.getCountryQuestionTexts();
      hideStatusMsg();
    });

    $rootScope.$on('afterRefresh', function () {
      getLanguageString($rootScope.languageShortName);
      $scope.getCountryQuestionTexts();
    });

    $scope.getCountryQuestionTexts = function () {
      $scope.getCountryQuestionTextsByCountryId($rootScope.selectedCountryId, $rootScope.languageId);
    };

    var initialize = function () {
      if ($rootScope.languageShortName != null) {
        getLanguageString($rootScope.languageShortName);
      }

      if ($rootScope.currentUser) {
        $scope.getCountryQuestionTexts();
      }
    };

    //Get all the country Question Text details and bind to grid using allCountryConfigList
    $scope.getCountryQuestionTextsByCountryId = function (countryId, languageId) {
      try {
        $rootScope.loader.showLoader = true;
        if (countryId == undefined || countryId == null) {
          return;
        }

        countryChatService.getCountryChatMessages(countryId, languageId).then(function (res) {
          $scope.processCountryResult(res);
        }, function (err) {
          $rootScope.loader.showLoader = false;
          commonService.logException({
            "methodName": "getCountryQuestionTextsByCountryId",
            "exceptionDetails": err
          });
        });
      } catch (exception) {
        $rootScope.loader.showLoader = false;
        commonService.logException({
          "methodName": "getCountryQuestionTextsByCountryId",
          "exceptionDetails": exception.message
        });
      }
    };

    $scope.processCountryResult = function(res) {
      ////if success
      if(res.data.recordsets != null) {
        if(res.data.recordsets.length > 1) {
          $rootScope.$emit("assignQuestionTextValues", res.data.recordsets[1]);
        }
      }

      if (res.status) {
        if (res.data.recordset) {
          if (res.data.recordset[0].message != null) {
            $scope.countryQuestionTexts = [];
            $scope.numOfPages = 0;
          }
          else {
            $scope.countryQuestionTexts = res.data.recordset;
            $scope.numOfPages = Math.ceil($scope.countryQuestionTexts.length / $scope.pageSize);
          }
        }
        else {
          $scope.countryQuestionTexts = [];
          $scope.numOfPages = 0;
        }
      } else {
        $scope.countryQuestionTexts = [];
        $scope.numOfPages = 0;
      }

      $rootScope.loader.showLoader = false;
    };

    //On click of edit bind the rows data and show in popup
    $scope.editCountryQuestionText = function (questionText) {
      hideStatusMsg();
      $scope.countryQuestionTextModal = angular.copy(questionText);
      showCountryQuestionTestModal($scope.countryQuestionTextModalSelctor);
    };

    //Save the entered country Question Text and validate while save the same
    $scope.saveOrUpdateCountryQuestionText = function (translatedQuestionText) {
      try {
        validateForm(translatedQuestionText.translation);
        if ($scope.formfieldError.hasError) {
          return;
        }
        translatedQuestionText.userId = $cookies.get('CCApp-userID');
        translatedQuestionText.languageId = $rootScope.languageId;
        $rootScope.loader.showLoader = true;
        countryChatService.saveCountryChatMessage(translatedQuestionText).then(function (res) {
         $scope.processSaveCountryChatResult(res);
        }, function (err) {
          $rootScope.loader.showLoader = false;
          commonService.logException({
            "methodName": "saveOrUpdateCountryQuestionText",
            "exceptionDetails": err
          });
        });
      } catch (exception) {
        $rootScope.loader.showLoader = false;
        commonService.logException({
          "methodName": "saveOrUpdateCountryQuestionText",
          "exceptionDetails": exception.message
        });
      }
    };

    $scope.processSaveCountryChatResult = function (res) {
      if (res.status) {
        hideStatusMsg();
        $scope.countryQuestionText.status = true;
        commonService.showStatusMessage(statusMessgaeContainer);
        $scope.hideCountryQuestionTextModal();
        $scope.getCountryQuestionTexts();
      }
      $rootScope.loader.showLoader = false;
    };

    //Before deleting the Question Text shows confirmation modal popup
    $scope.deleteQuestionText = function (chatMsgId) {
      hideStatusMsg();
      openDeleteModal();
      $scope.chatMsgId = chatMsgId;
    };

    //Routine to close delete confirmation modal
    $scope.closeDeleteModal = function (isConfirmed) {
      try {
        if (isConfirmed && $scope.chatMsgId != null) {
          $rootScope.loader.showLoader = true;
          countryChatService.deleteCountryChatMessage($scope.chatMsgId).then(function (res) {
            $scope.processCloseModalResult(res);
          }, function (err) {
            $rootScope.loader.showLoader = false;
            commonService.logException({
              "methodName": "deleteCountryChatMessage",
              "exceptionDetails": err
            });
          });
        }
        $scope.deleteDialogSelector.style.display = 'none';
      } catch (exception) {
        $rootScope.loader.showLoader = false;
        commonService.logException({
          "methodName": "deleteCountryChatMessage",
          "exceptionDetails": exception.message
        });
      }
    };

    $scope.processCloseModalResult = function (res) {
      if (res.status) {
        hideStatusMsg();
        $scope.countryQuestionText.status = true;
        $scope.getCountryQuestionTexts();
        commonService.showStatusMessage(statusMessgaeContainer);
      }
      $rootScope.loader.showLoader = false;
    };

    /*Scope function to hide/close country Question Text modal*/
    $scope.hideCountryQuestionTextModal = function () {
      $scope.countryQuestionTextModalSelctor.style.display = 'none';
    };

    function validateForm(translatedQuestionText) {
      $scope.formfieldError = angular.copy(formfieldError);
      if (translatedQuestionText == undefined || translatedQuestionText.trim() === '') {
        $scope.formfieldError.hasError = true;
        $scope.formfieldError.message = $scope.translation.emptyQuestionText;
      }
    }

    /*Helper routine to show/display country Question Text modal*/
    function showCountryQuestionTestModal(countryQuestionTextModal) {
      countryQuestionTextModal.style.display = 'block';
    }

    function hideStatusMsg() {
      $scope.formfieldError = angular.copy(formfieldError);
      $scope.countryQuestionText.status = false;
    }

    //Routine to open the delete confirmation model
    function openDeleteModal() {
      $scope.deleteDialogSelector.style.display = 'block';
    }

    initialize();
  }

  angular.module("CCApp").controller('countryChatController', Implementation);
  Implementation.$inject = ['$rootScope', '$scope', '$cookies', 'commonService', 'languageService', 'countryChatService'];
})();
