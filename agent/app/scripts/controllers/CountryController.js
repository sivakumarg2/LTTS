//// Controller Name: countryController
//// Description: This controller will have the logic to handle country configuration & settings functionalities
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
(function () {
  'use strict';

  function Implementation($rootScope, $scope, countryService, commonService, languageService, SELECTED_COUNTRY, APP_CONFIG, MEDIA_REGION, $filter) {

    $scope.$emit("topBarTitle", "settings", "otisLineSettings", 1);
    $scope.$emit("hidebars", false, false, true);
    var statusMessgaeContainer = "status-msg-fade";

    //Local country from model to get the user input
    var countryModel = {
      "countryConfigurationId": 0,
      "userId": '',
      "countryId": '',
      "countryName": "",
      'cultureSetting': "",
      'dateFormat': "",
      'selCountry': "",
      "countryCallTimeout": '',
      "countryRedirectionNo": [],
      "isRedirectionEnabled": true,
      "workflowTimout": "",
      "enableDataTracks": false,
      "enableCallDispo": false,
      "mediaRegion": '',
      "enableRecording": false,
      "recordAudio": false,
      "recordVideo": false
    };
    $scope.timeoutFieldPattern = '^[0-9]{1,3}$';
    $scope.redirectionNoPattern = '^[0-9-]{1,20}$';
    $scope.sid = '';
    $scope.countrySettings = {
      status: false,
      errStatus: false,
      message: ''
    };
    $scope.MEDIA_REGION = MEDIA_REGION;
    $scope.redirectionNo = '';
    $scope.fromNo = '';
    $scope.countrySettingModalSelctor = document.getElementById('countrySettingModal'); // Country setting form modal selector
    $scope.allCountryConfigList = []; //Initally table items will be empty
    $scope.numOfPages = 0;
    $scope.currentPage = 0;
    $scope.pageSize = 10;
    $scope.countryConfig = {
      "startTime": "",
      "endTime": "",
      "callTimeout": ""
    };
    $scope.isEdit = false;

    var formFieldError = function () {
      return {
        'countrynameMsg': '',
        'countryCallTimeoutMsg': '',
        'countryDateformatMsg': '',
        'countrycultureSettingsMsg': '',
        'countryMediaRegion': '',
        'countryRedirectionNoMsg': '',
        'countryCalldDispositionMsg': '',
        'dataRetentionPeriod': '',
        'hasError': false
      };
    };

    /* Close the existing popup modal on incoming call  */
    $rootScope.$on("callEvents", function (event, data) {
      if (data === "incoming") {
        $scope.countrySettingModalSelctor.style.display = 'none';
        angular.element("#delete-confirmation")[0].style.display = 'none';
      }
    });

    /*Routine to get language file based on user selection*/
    var getLanguageString = function (lang) {
      try {
        languageService.getLanguageString({
          "page": $rootScope.selectedCountryShortName + "_" + lang + '_country_setting.json'
        }).then(function (res) {
          $scope.countryConfigLangTranslation = res;
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

    /* Rootscope change event to get the language file*/
    $rootScope.$on("changeLanguage", function (event, lang) {
      getLanguageString($rootScope.languageShortName === "" ? lang : $rootScope.languageShortName);
    });

    /*Scope function to add new country setting form*/
    $scope.addNewCountrySetting = function () {
      $scope.isEdit = false;
      hideStatusMsg();
      $scope.countryModel = angular.copy(countryModel);
      $scope.countryModel.countryName = $rootScope.currentUser.countryName;
      $scope.countryModel.selCountry = $rootScope.currentUser.countryName;
      $scope.countryModel.countryId = $rootScope.currentUser.countryId;
      $scope.redirectionNo = '';
      $scope.fromNo = '';
      $scope.selctdRedirctnNumIndx = null;
      $scope.showCountrySettingModal();
    };

    /*Scope function to hide/close country setting modal*/
    $scope.hideContrysettingModal = function () {
      $scope.countrySettingModalSelctor.style.display = 'none';
      $scope.formfieldError.countryCallTimeoutMsg = "";
      $scope.formfieldError.countryDateformatMsg = "";
      $scope.formfieldError.countrycultureSettingsMsg = '';
      $scope.formfieldError.countryMediaRegion = "";
      $scope.formfieldError.countryRedirectionNoMsg = "";
      $scope.formfieldError.countryFromNoMsg = "";
    };

    /*$scope.selctdRedirctnNum = function (redictnNum, i) {
      $scope.redirectionNo = redictnNum;
      $scope.selctdRedirctnNumIndx = i;
    };*/

    $scope.clearEnableVideo = function (recording) {
      if (!recording) {
        $scope.countryModel.recordVideo = false;
      }
    };

    $scope.loadCountry = function ($query) {
      return $rootScope.SELECTED_COUNTRY.filter(function (country) {
        return country.value.toLowerCase().indexOf($query.toLowerCase()) != -1 && country.value.toLowerCase().indexOf("select") === -1;
      });
    };

    /*scope function to delete added re-direction number from
    array item(ie. scope variable "$scope.countryModel.countryRedirectionNo" )*/
    $scope.deleteRedirection = function (redirectionIndex) {
      $scope.countryModel.countryRedirectionNo.splice(redirectionIndex, 1);
    };


    //Get all the country settings details and bind to grid using allCountryConfigList
    $scope.getCountrySetting = function () {
      try {
        $rootScope.loader.showLoader = true;
        countryService.getCountrySetting().then(function (res) {
          $scope.procesGetCountry(res);
        }, function (err) {
          $rootScope.loader.showLoader = false;
          commonService.logException({
            "methodName": "getCountrySetting",
            "exceptionDetails": err
          });
        });
      } catch (logException) {
        $rootScope.loader.showLoader = false;
        commonService.logException({
          "methodName": "getCountrySetting",
          "exceptionDetails": logException
        });
      }
    };

    $scope.procesGetCountry = function (res) {
      if (res.status) {
        $scope.allCountryConfigList = res.data;
        $scope.numOfPages = Math.ceil($scope.allCountryConfigList[2].length / $scope.pageSize);
      }
      $rootScope.loader.showLoader = false;
    };

    /*scope function to add the re-direction number into
array item (ie. scope variable "$scope.countryModel.countryRedirectionNo")
Note: before adding re-direction no validation to be done*/
    /*$scope.addRedirection = function (redirection) {
      var isEditMode = ($scope.selctdRedirctnNumIndx != null) ? true : false;
      if ($scope.validateRedirectionNumber(redirection)) {
        if (isEditMode) {
          $scope.deleteRedirection($scope.selctdRedirctnNumIndx);
        }
        $scope.countryModel.countryRedirectionNo.push(redirection);
        $scope.redirectionNo = '';
        $scope.selctdRedirctnNumIndx = null;
      }
    };*/

    //Save the entered country settings and validate while save the same
    $scope.saveOrUpdateCountrySetting = function (countryMod) {
      $scope.formfieldError.hasError = false;
      var countryModel = angular.copy(countryMod);
      $scope.countrySettings.errStatus = false;
      try {
        //$scope.addRedirection($scope.redirectionNo);
        $scope.countryModel.countryRedirectionNo = [];

        if (countryModel.isRedirectionEnabled) {
          $scope.countryModel.countryRedirectionNo.push($scope.fromNo);
          $scope.countryModel.countryRedirectionNo.push($scope.redirectionNo);
        }

        $scope.validateCountrySettingForm(countryModel);


        if ($scope.formfieldError.hasError) {
          return;
        }

        countryModel.userId = $rootScope.currentUser.userID;
        countryModel.workflowTimout = APP_CONFIG.workflowTimeout;
        //APP_CONFIG.workflowTimeout = countryModel.countryCallTimeout;

        //get country details here
        var selectedCountry = $.grep($rootScope.SELECTED_COUNTRY, function (item) {
          return item.value === countryModel.selCountry;
        });

        if (selectedCountry.length > 0) {
          countryModel.countryId = selectedCountry[0].id;
          countryModel.countryName = selectedCountry[0].code;
          countryModel.countryShortName = selectedCountry[0].code;
        }

        if (countryModel.recordVideo == false && countryModel.recordAudio == false) {
          countryModel.dataRetentionPeriod = 0;
        }

        countryModel.reservSid = APP_CONFIG.reservSid;
        countryModel.assignSid = APP_CONFIG.busySid;
        $rootScope.loader.showLoader = true;

        if ($rootScope.countryConfig.countryconfigId == countryModel.countryConfigurationId) {
          $rootScope.countryConfig.enableDataTracks = countryModel.enableDataTracks;
          $rootScope.countryConfig.enableCallDispo = countryModel.enableCallDispo + "";
        }

        countryService.addCountrySetting(countryModel).then(function (res) {
          $rootScope.currentUser.mediaRegion = countryModel.mediaRegion;
          $scope.procesAddCountry(res);
        }, function (err) {
          $rootScope.loader.showLoader = false;
          commonService.logException({
            "methodName": "addCountrySetting",
            "exceptionDetails": err
          });
        });
      } catch (logException) {
        $rootScope.loader.showLoader = false;
        commonService.logException({
          "methodName": "addCountrySetting",
          "exceptionDetails": logException
        });
      }
    };

    $scope.procesAddCountry = function (res) {
      if (res.status) {
        hideStatusMsg();
        $scope.countrySettings.errStatus = false;
        $scope.countrySettings.status = true;
        $scope.countrySettings.message = $scope.countryConfigLangTranslation.countrySettingsSaveStatus;
        commonService.showStatusMessage(statusMessgaeContainer);
        commonService.showStatusMessage(statusMessgaeContainer);
        $scope.hideContrysettingModal();
        $scope.getCountrySetting();
      }
      else {
        //get the message based on the code & display the proper message
        $scope.countrySettings.errStatus = true;
      }
      $rootScope.loader.showLoader = false;
    };

    //On click of edit bind the rows data and show in popup  (showCountrySettingModal)
    $scope.editCountrySetting = function (singleCountryConfig, redirectionNumbers) {
      $scope.isEdit = true;
      hideStatusMsg();
      singleCountryConfig.selCountry = singleCountryConfig.countryName;
      $scope.countryModel = angular.copy(singleCountryConfig);
      $scope.countryModel.cultureSetting = singleCountryConfig.cultureCode;
      $scope.countryModel.countryCallTimeout = singleCountryConfig.callTimeOut;
      $scope.countryModel.dataRetentionPeriod = singleCountryConfig.days;
      $scope.countryModel.enablDataTracks = singleCountryConfig.enablDataTracks;
      $scope.countryModel.countryRedirectionNo = [];

      if ($scope.countryModel.recordAudio) {
        $scope.countryModel.enableRecording = true;
      }

      $scope.fromNo = '';
      $scope.redirectionNo = '';
      var flg = true;
      if (redirectionNumbers != null && redirectionNumbers.length > 0) {
        for (var index = 0; index < redirectionNumbers.length; index++) {
          if (flg) {
            flg = !flg;
            $scope.fromNo = redirectionNumbers[index].redirectNumber;
          }
          else {
            $scope.redirectionNo = redirectionNumbers[index].redirectNumber;
          }
        }

        $scope.countryModel.isRedirectionEnabled = false;
        if (redirectionNumbers.length >= 2) {
          $scope.countryModel.isRedirectionEnabled = true;
        }
      }
      /*if (redirectionNumbers != null && redirectionNumbers.length > 0) {
        for (var index = 0; index < redirectionNumbers.length; index++) {
          $scope.addRedirection(redirectionNumbers[index].redirectNumber);
        }
      }*/
      $scope.showCountrySettingModal();
    };

    //Before deleting the country settings confirmation modal popup will appear
    $scope.deleteCountrySetting = function (sid) {
      hideStatusMsg();
      openDeleteModal();
      $scope.sid = sid;
    };

    /*Helper routine to show/display country setting modal*/
    $scope.showCountrySettingModal = function () {
      $scope.countrySettingModalSelctor.style.display = 'block';
    };

    //Routine to open the delete confirmation model
    function openDeleteModal() {
      if (angular.element("#delete-confirmation").length > 0) {
        angular.element("#delete-confirmation")[0].style.display = 'block';
      }
    }

    //Routine to close delete confirmation modal
    $scope.closeDeleteModal = function (isConfirmed) {
      try {
        if (isConfirmed) {
          $rootScope.loader.showLoader = true;
          countryService.deleteCountrySetting($scope.sid).then(function (res) {
            $scope.processDeleteCountry(res);
          }, function (err) {
            $rootScope.loader.showLoader = false;
            commonService.logException({
              "methodName": "deleteCountrySetting",
              "exceptionDetails": err
            });
          });
        }
        if (angular.element("#delete-confirmation").length > 0) {
          angular.element("#delete-confirmation")[0].style.display = 'none';
        }

      } catch (logException) {
        $rootScope.loader.showLoader = false;
        commonService.logException({
          "methodName": "deleteCountrySetting",
          "exceptionDetails": logException
        });
      }
    };

    $scope.processDeleteCountry = function (res) {
      $scope.countrySettings.status = true;
      if (res.status) {
        hideStatusMsg();
        $scope.countrySettings.message = $scope.countryConfigLangTranslation.deleteCountrySettingsSaveStatus;
        $scope.countrySettings.errStatus = false;
        $scope.getCountrySetting();
      }
      else {
        //Get the code & display the proper message
        $scope.countrySettings.message = $scope.countryConfigLangTranslation.deleteCountrySettingsSaveStatus;
      }

      $rootScope.loader.showLoader = false;
    };

    /*Helper routine to validate country setting form fields beofre saving Or Updating*/
    $scope.validateCountrySettingForm = function (countrysettingmodel) {
      $scope.formfieldError = formFieldError();

      var isValidRedirectionNumber = function (redirectionNo) {
        var isValid = true;
        if (redirectionNo == undefined || redirectionNo === '') {
          isValid = false;
        }
        return isValid;
      };

      if (countrysettingmodel.countryCallTimeout == null || countrysettingmodel.countryCallTimeout == '') {
        $scope.formfieldError.hasError = true;
        $scope.formfieldError.countryCallTimeoutMsg = $scope.countryConfigLangTranslation.countrySettingModalTimeOutEmptyError;
      }

      if (countrysettingmodel.mediaRegion == '') {
        $scope.formfieldError.hasError = true;
        $scope.formfieldError.countryMediaRegion = $scope.countryConfigLangTranslation.mediaRegionEmptyErr;
      }

      countrysettingmodel.recordAudio = countrysettingmodel.enableRecording;
      if (!countrysettingmodel.enableRecording) {
        countrysettingmodel.dataRetentionPeriod = 0;
      }

      if (countrysettingmodel.recordVideo == true || countrysettingmodel.recordAudio == true) {
        if (countrysettingmodel.dataRetentionPeriod == null || countrysettingmodel.dataRetentionPeriod == '' || countrysettingmodel.dataRetentionPeriod == 0) {
          $scope.formfieldError.hasError = true;
          $scope.formfieldError.dataRetentionPeriod = $scope.countryConfigLangTranslation.dataRetentionPeriodEmptyError;
        }
      }
      
      if(countrysettingmodel.dateFormat != "" && countrysettingmodel.dateFormat != null) {
        countrysettingmodel.dateFormat = $filter('uppercase')(countrysettingmodel.dateFormat);

        //validate the dateformation
        if(!commonService.isValidDate(countrysettingmodel.dateFormat)) {
          $scope.formfieldError.hasError = true;
          $scope.formfieldError.countryDateformatMsg = $scope.countryConfigLangTranslation.invalidDateFormatMsg;
        }
        //assign the dateformat to rootScope of dateformation
      }

      countrysettingmodel.countryRedirectionNo = [];
      if (countrysettingmodel.isRedirectionEnabled) {
        if (countrysettingmodel.cultureSetting == null || countrysettingmodel.cultureSetting == '') {
          $scope.formfieldError.hasError = true;
          $scope.formfieldError.countrycultureSettingsMsg = $scope.countryConfigLangTranslation.emptyCultureCode;
        }
        
        if ($scope.fromNo != undefined && isValidRedirectionNumber($scope.fromNo)) {
          countrysettingmodel.countryRedirectionNo.push($scope.fromNo);
        } else {
          $scope.formfieldError.hasError = true;
          $scope.formfieldError.countryFromMsg = $scope.countryConfigLangTranslation.countrySettingModalFromEmptyError;
        }

        if ($scope.redirectionNo != undefined && isValidRedirectionNumber($scope.redirectionNo)) {
          countrysettingmodel.countryRedirectionNo.push($scope.redirectionNo);
        } else {
          $scope.formfieldError.hasError = true;
          $scope.formfieldError.countryRedirectionNoMsg = $scope.countryConfigLangTranslation.countrySettingModalRedirectionEmptyError;
        }
      }
      /*if (countrysettingmodel.countryRedirectionNo == null || countrysettingmodel.countryRedirectionNo.length == 0) {
        if ($scope.redirectionNo != undefined && isValidRedirectionNumber($scope.redirectionNo)) {
          countrysettingmodel.countryRedirectionNo.push($scope.redirectionNo);
        } else {
          $scope.formfieldError.hasError = true;
          $scope.formfieldError.countryRedirectionNoMsg = $scope.countryConfigLangTranslation.countrySettingModalRedirectionEmptyError;
        }
      }*/
    };

    /*Helper routine to validate redirection no entered by user in the form before adding it to list item to save*/
    $scope.validateRedirectionNumber = function (value) {
      var isValid = true;
      if (value == undefined || value == null || value == "") {
        //Validation to be done here
        return false;
      }

      angular.forEach($scope.countryModel.countryRedirectionNo, function (existingVal, index) {
        if (existingVal === value)
          isValid = false;
      });
      return isValid;
    };

    function hideStatusMsg() {
      $scope.formfieldError = formFieldError();
      $scope.countrySettings.status = false;
      $scope.countrySettings.errStatus = false;
    }
  }

  angular.module("CCApp").controller('countrycontroller', Implementation);
  Implementation.$inject = ['$rootScope', '$scope', 'countryService', 'commonService', 'languageService', 'SELECTED_COUNTRY', 'APP_CONFIG', 'MEDIA_REGION', '$filter'];
})();
