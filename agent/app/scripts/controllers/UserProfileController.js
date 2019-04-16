//// Controller Name: userProfileController
//// Description: This controller will have the logic to validate the user inputs and verify the functionalities like add/ modify/ delete
//// user as well as change the password
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
(function () {
  'use strict';

  function Implementation($rootScope, $scope, commonService, userService, languageService, USER_WORKING_HOURS, USER_CALLTYPES, SELECTED_LANGUAGE, APP_CONFIG) {
    $scope.$emit('hidebars', false, false, true);
    $scope.$emit("topBarTitle", "account", "userProfile", -1);
    $scope.userTypes = USER_WORKING_HOURS;
    $scope.callTypes = USER_CALLTYPES;
    $scope.languages = $rootScope.SELECTED_LANGUAGE;
    $scope.translation = [];
    var statusMessgaeContainer = "status-msg-fade";

    $scope.saveChanges = function (currentUser) {
      try {
        $scope.successMessage = $scope.exceptionMsg = "";
        $rootScope.loader.showLoader = true;
        userService.editUserPreferences(currentUser).then(function (res) {
          $scope.processSaveChanges(res);
        }, function (err) {
          $rootScope.loader.showLoader = false;
          commonService.logException({
            "methodName": "saveChanges",
            "exceptionDetails": err
          });
        });

      } catch (ex) {
        $rootScope.loader.showLoader = false;
        commonService.logException({
          "methodName": "saveChanges",
          "exceptionDetails": ex
        });
      }
    };

    $scope.processSaveChanges = function(res) {
      if (res.status) {
        var appConfg = APP_CONFIG;
        appConfg.isOnlyAudio = !$rootScope.currentUser.video;

        $scope.successMessage = $scope.translation.successMsg;
      }
      else {
        $scope.errorMessage = $scope.translation.exceptionMsg;
      }
      commonService.showStatusMessage(statusMessgaeContainer);
      $rootScope.loader.showLoader = false;
    };

    $rootScope.$on("changeLanguage", function (event, lang) {
      getLanguageString($rootScope.languageShortName === "" ? lang : $rootScope.languageShortName);
    });

    var getLanguageString = function (lang) {
      try {
        languageService.getLanguageString({
          "page": $rootScope.selectedCountryShortName + "_" + lang + '_user_profile.json'
        }).then(function (res) {
          $scope.translation = res;
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

    var init = function () {
      //Calling language by default
      if($rootScope.languageShortName != null) {
        getLanguageString($rootScope.languageShortName);
      }
    };

    init();
  }

  angular.module('CCApp').controller('userProfileController', Implementation);
  Implementation.$inject = ['$rootScope', '$scope', 'commonService', 'userService', 'languageService', 'USER_WORKING_HOURS', 'USER_CALLTYPES', 'SELECTED_LANGUAGE', 'APP_CONFIG'];
})();
