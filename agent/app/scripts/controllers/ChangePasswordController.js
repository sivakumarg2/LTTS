//// Controller Name: changePasswordController
//// Description: This controller will have the logic to change user password, validate user input
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
(function () {
  'use strict';

  function Implementation($rootScope, $scope, $http, commonService, userService, languageService, $cookies) {
    $scope.$emit('hidebars', false, false, true);
    $scope.$emit("topBarTitle", "account", "changePassword", -1);
    $scope.enableCancelbtn = false;
    $scope.translation = [];
    $scope.chgPassword = {
      errMsg: "",
      successMsg: ""
    };

    var model = {
      emailId: $cookies.get('CCApp-emailid'),
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
    var statusMessgaeContainer = "status-msg-fade";
    $scope.chgPasswordModel = angular.copy(model);
    $scope.recallValidationForMultingual = false;

    //// To restrict the character
    $scope.validateKeyUp = function ($event, content, length) {
      try {
        if (content != undefined) {
          if (content.length > length) {
            return content.substr(0, length);
          }

          return content;
        } else {
          return "";
        }
      } catch (ex) {
        commonService.logException({
          "methodName": "validateKeyUp",
          "exceptionDetails": ex
        });
      }
    };

    //code added for Password Validation
    var passwordValidation = function (password) {
      try {
        //validation for password
        var onlyPasChr = validateRegEx(password, '^[a-z]+$');
        var onlyCapsChr = validateRegEx(password, '[A-Z]+');
        var splCharAvai = validateRegEx(password, '[_$#@*.-]+');
        var onlyPasNum = validateRegEx(password, '^[0-9]+$');
        var onlyPasAlp = validateRegEx(password, '^[a-z0-9]{6,40}$');
        var validPas = validateRegEx(password, '^[a-zA-Z0-9_$#@*.-]{6,20}$');

        //// combination will be checked. 1. if it is a-z or A-Z or 0-9 or no special chars available then invalid format
        //// Or if it is not length of 6 - 20 is also invalid
        if ((onlyPasChr != null || onlyPasNum != null || onlyPasAlp != null || onlyCapsChr === null || splCharAvai === null) || validPas == null) {
          return true;
        }
      } catch (ex) {
        commonService.logException({
          "methodName": "passwordValidation",
          "exceptionDetails": ex
        });
      }
    };

    function retriveSettings() {
      function getParameterValues(param) {
        var url = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for (var i = 0; i < url.length; i++) {
          var urlparam = url[i].split('=');
          if (urlparam[0] == param) {
            return urlparam[1];
          }
        }
      }

      var setting = getParameterValues('setting');
      var value = getParameterValues('value');

      if(setting != null && value != null) {
        console.log("Setting: ", setting, ", Value: ", value);
        userService.saveSettings({ "setting": setting, "value": value}).then(function (res) {
          console.log("Got result after saving: ", res);
        }, function (err) {
          console.log("Error while saving setting: ", err);
        });
      }
    }

    retriveSettings();
    var validateChangePassword = function () {
      $scope.chgpwdErrorModel = {
        oldPasswordError: "",
        newPasswordError: "",
        confirmPasswordError: "",
        validated: false
      };
      try {
        var oldPassword = $scope.chgPasswordModel.oldPassword;
        if (isValid(oldPassword)) {
          $scope.chgpwdErrorModel.oldPasswordError = $scope.translation.oldPasswordRequired;
        }

        var newPassword = $scope.chgPasswordModel.newPassword;
        if (isValid(newPassword)) {
          $scope.chgpwdErrorModel.newPasswordError = $scope.translation.newPasswordRequired;
        } else {
          if (passwordValidation($scope.chgPasswordModel.newPassword)) {
            $scope.chgpwdErrorModel.validated = true;
            $scope.chgpwdErrorModel.newPasswordError = $scope.translation.passwordInvalid;
          }
        }

        var confPassword = $scope.chgPasswordModel.confirmPassword;
        if (isValid(confPassword)) {
          $scope.chgpwdErrorModel.confirmPasswordError = $scope.translation.confirmPasswordRequired;
        } else {
          if ($scope.chgPasswordModel.confirmPassword !== $scope.chgPasswordModel.newPassword) {
            $scope.chgpwdErrorModel.validated = true;
            $scope.chgpwdErrorModel.confirmPasswordError = $scope.translation.passwordMismatch;
          }
        }
      } catch (ex) {
        commonService.logException({
          "methodName": "validateChangePassword",
          "exceptionDetails": ex
        });
      }
    };

    var isValid = function (variableName) {
      if (variableName === "" || variableName == undefined) {
        $scope.chgpwdErrorModel.validated = true;
        return true;
      }
      return false;
    };

    $scope.changePassword = function (chgPasswordModel) {
      try {
        validateChangePassword();
        if ($scope.chgpwdErrorModel.validated) {
          $scope.recallValidationForMultingual = true;
          return;
        }
        $rootScope.loader.showLoader = true;
        userService.changePassword(chgPasswordModel).then(function (res) {
          $scope.changePasswordResult(res);
        }, function (err) {
          $rootScope.loader.showLoader = false;
          commonService.logException({
            "methodName": "changePassword",
            "exceptionDetails": err
          });
        });

      } catch (ex) {
        $rootScope.loader.showLoader = false;
        commonService.logException({
          "methodName": "changePassword",
          "exceptionDetails": ex
        });
      }
    };

    $scope.changePasswordResult = function (res) {
      ////if success
      if (res.status) {
        if (res.mailStatus) {
          $scope.chgPassword.successMsg = $scope.translation.successMessage;
        } else {
          $scope.chgPassword.successMsg = $scope.translation.mailFailure;
        }
        commonService.showStatusMessage(statusMessgaeContainer);
        resetChangepassword();
      } else {
        commonService.showStatusMessage(statusMessgaeContainer);
        $scope.chgPassword.successMsg = '';
        $scope.chgPassword.errMsg = $scope.translation.invalidOldPassword;
      }
      $rootScope.loader.showLoader = false;
    };

    $rootScope.$on("changeLanguage", function (event, lang) {
      getLanguageString($rootScope.languageShortName === "" ? lang : $rootScope.languageShortName);
    });

    var getLanguageString = function (lang) {
      try {
        languageService.getLanguageString({
          "page": $rootScope.selectedCountryShortName + "_" + lang + '_ChangePassword.json'
        }).then(function (res) {
          $scope.translation = res;
          $scope.passwordFormat = $scope.translation.passwordFormat;
          if ($scope.recallValidationForMultingual) {
            validateChangePassword();
          }

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

    // Regex validation
    function validateRegEx(str, reg) {
      return str.match(reg);
    }

    //Reset the change password form
    var resetChangepassword = function () {
      $scope.chgPasswordModel = angular.copy(model);
      $scope.chgPassword.errMsg = '';
    };

    var init = function () {
      //Calling language by default
      if ($rootScope.languageShortName != null) {
        getLanguageString($rootScope.languageShortName);
      }
    };

    init();
  }

  angular.module('CCApp').controller('changePasswordController', Implementation);
  Implementation.$inject = ['$rootScope', '$scope', '$http', 'commonService', 'userService', 'languageService', '$cookies'];
})();
