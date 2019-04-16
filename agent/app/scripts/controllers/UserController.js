//// Controller Name: userController
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

  function Implementation($rootScope, $scope, $http, $window, userService, commonService, USER_PROFILE_TYPES, SELECTED_LANGUAGE, USER_ROLES, USER_WORKING_HOURS, USER_CALLTYPES, SELECTED_COUNTRY, languageService, STATUSTYPE, USER_CURRENT_STATUS, APP_CONFIG, $filter, USER_FILTER_TYPES, $cookies) {
    var statusMessgaeContainer = "status-msg-fade";
    $scope.$emit('hidebars', false, false, true);
    $scope.$emit("topBarTitle", "settings", "manageUsers", 1);
    $scope.model = $scope.userDetailModel;
    $scope.languages = $rootScope.SELECTED_LANGUAGE;
    $scope.roles = USER_ROLES;
    $scope.userStatus = USER_PROFILE_TYPES;
    $scope.userFilterStatus = USER_FILTER_TYPES;
    $scope.shiftTypes = USER_WORKING_HOURS;
    $scope.callTypes = USER_CALLTYPES;
    $scope.selectedUserFilter = $scope.userFilterStatus[1].text;
    $scope.selectedUsers = [];
    $scope.status = {
      display: false,
      type: '',
      message: ''
    };
    $scope.sortModel = {
      'columnName': 'name',
      'asc': false
    };
    $scope.userDetailModel = {};
    $scope.enableCancelbtn = false;
    $scope.editUserflag = {
      "status": false
    };
    $scope.translation = [];

    $scope.getFilteredLanguage = function() {
      if (localStorage.getItem("CCApp-SelectedLanguages") != null) {
        return $filter('filter')(JSON.parse(localStorage.getItem("CCApp-SelectedLanguages")), { isFirst: 1 });
      }
    };

    $rootScope.$on("changeLanguage", function (event, lang) {
      $scope.languages = $rootScope.SELECTED_LANGUAGE;
      $scope.getLanguageString($rootScope.languageShortName === "" ? lang : $rootScope.languageShortName);
    });

    $rootScope.$on('afterRefresh', function () {
      $scope.languages = $rootScope.SELECTED_LANGUAGE;
      if ($rootScope.languageShortName != null) {
        $scope.getLanguageString($rootScope.languageShortName);
      }

      if ($rootScope.selectedCountryId != "") {
        $scope.getUser($rootScope.selectedCountryId);
      }
    });

    $scope.adminCountrySelection = function (countryId) {
      //get country details here
      var selectedCountry = $.grep($rootScope.SELECTED_COUNTRY, function (item) {
        return item.id === countryId;
      });

      if (selectedCountry.length > 0) {
        $scope.userDetailModel.selCountry = selectedCountry[0].value;
        $scope.userDetailModel.countryName = selectedCountry[0].code;
      }
    };

    $scope.$watch("search.searchText", function (nv, ov) {
      if (nv != ov) {        
        $scope.currentPage = 0;
      }
    });

    $rootScope.$on('changeCountry', function (event, countryId) {
      $scope.numOfPages = 0;
      $scope.currentPage = 0;
      $scope.selectedUserFilter = $scope.userFilterStatus[1].text;
      $scope.adminCountrySelection(countryId);
      $scope.getUser(countryId);
    });

    $rootScope.$on("callEvents", function (event, data) {
      if (data === "incoming") {
        angular.element("#delete-confirmation")[0].style.display = 'none';
        angular.element("#agent-configuration")[0].style.display = 'none';
      }
    });

    $scope.getLanguageString = function (lang) {
      try {
        languageService.getLanguageString({ "page": $rootScope.selectedCountryShortName + "_" + lang + '_agent_config.json' }).then(function (res) {
          $scope.agentTranslation = res;
        }, function (err) {
          commonService.logException({
            "methodName": "getLanguageString",
            "ExceptionDetails": err
          });
        });
      } catch (ex) {
        commonService.logException({
          "methodName": "getLanguageString",
          "ExceptionDetails": ex
        });
      }
    };

    $scope.userFilter = function (selectedText) {
      if (selectedText == "All") {
        $scope.userList = $scope.selectedUsers;
        return;
      }
      $scope.userList = $filter('filter')($scope.selectedUsers, { userStatus: selectedText });
    };

    //generic code for checkbox toggle
    $scope.toggleSelection = function (selectedType) {
      try {
        var id = $scope.userDetailModel.callType.indexOf(selectedType);
        if (id > -1) {
          $scope.userDetailModel.callType.splice(id, 1);
        } else {
          $scope.userDetailModel.callType.push(selectedType);
        }
      } catch (ex) {
        commonService.logException({
          "methodName": "toggleSelection",
          "ExceptionDetails": ex
        });
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
          "ExceptionDetails": ex
        });
      }
    };

    $scope.numOfPages = 0;
    $scope.getUser = function (countryId) {
      try {
        $rootScope.loader.showLoader = true;
        userService.getUser(countryId).then(function (res) {
          $scope.userList = [];
          $scope.processGetUser(res);
        }, function (err) {
          $rootScope.loader.showLoader = false;
          commonService.logException({
            "methodName": "getUser",
            "ExceptionDetails": err
          });
        });
      } catch (ex) {
        $rootScope.loader.showLoader = false;
        commonService.logException({
          "methodName": "getUser",
          "ExceptionDetails": ex
        });
      }
    };

    $scope.processGetUser = function (res) {
      if (res.status) {
        //fetching the country Name
        $scope.userList = res.data;
        $scope.selectedUsers = res.data;
        $scope.userFilter($scope.selectedUserFilter);
        $scope.numberOfPages();
      }
      $rootScope.loader.showLoader = false;
    };

    var init = function () {
      //Calling language by default
      if ($rootScope.languageShortName != null) {
        $scope.getLanguageString($rootScope.languageShortName);
      }

      if ($rootScope.selectedCountryId != "") {
        $scope.getUser($rootScope.selectedCountryId);
      }      
    };

    init();

    /*Pagination related code starts here*/
    $scope.currentPage = 0;
    $scope.pageSize = 10;
    $scope.numberOfPages = function () {
      $scope.numOfPages = Math.ceil($scope.userList.length / $scope.pageSize);
    };

    $scope.newUser = function () {
      $scope.adminCountrySelection($rootScope.selectedCountryId);
      $rootScope.$broadcast("newConfig", $scope.agentTranslation);
      $scope.resetAgentForm();
      $scope.addCountryDetail();
      $scope.openAgentModal();
    };

    $scope.unlockUser = function(user) {  
      $rootScope.loader.showLoader = false;
      var langSkills = user.languageSkillsId.split(',');
      var newLanguageSkillsId = [];
      var filtrLangs = $filter('filter')($scope.languages, { isFirst: 1 });
      for (var j = 0; j < filtrLangs.length; j++) {
        if (langSkills.indexOf(filtrLangs[j].code) >= 0) {
          newLanguageSkillsId.push(filtrLangs[j]);
        }
      }

      $scope.userDetailModel = {
        "name": user.name,
        "countryName": user.countryShortName,
        "selCountry": user.countryName,
        "countryId": user.countryId,
        "preCountryId": user.countryId,
        "shiftType": user.shiftType + "",
        "callType": user.callType.split(','),
        "userStatusId": user.userStatusId + "",
        "userOldStatusId": user.userStatusId + "",
        "emailId": user.emailId,
        "roleId": user.roleId + "",
        "userID": user.userID,
        "sId": user.sId,
        "languageId": user.languageId,
        "languageSkillsId": newLanguageSkillsId,
        "video": user.video,
        "oldEmailId": user.emailId,
        "isLocked": 'N'
      };
      $scope.updateUser($scope.userDetailModel, true);
    };

    $scope.editUser = function (user) {
      try {
        $scope.addNew = false;
        var langSkills = user.languageSkillsId.split(',');
        var newLanguageSkillsId = [];
        var filtrLangs = $filter('filter')($scope.languages, { isFirst: 1 });
        for (var j = 0; j < filtrLangs.length; j++) {
          if (langSkills.indexOf(filtrLangs[j].code) >= 0) {
            newLanguageSkillsId.push(filtrLangs[j]);
          }
        }

        $scope.editUserflag.status = true;
        $scope.userDetailModel = {
          "name": user.name,
          "countryName": user.countryShortName,
          "selCountry": user.countryName,
          "countryId": user.countryId,
          "preCountryId": user.countryId,
          "shiftType": user.shiftType + "",
          "callType": user.callType.split(','),
          "userStatusId": user.userStatusId + "",
          "userOldStatusId": user.userStatusId + "",
          "emailId": user.emailId,
          "roleId": user.roleId + "",
          "userID": user.userID,
          "sId": user.sId,
          "languageId": user.languageId,
          "languageSkillsId": newLanguageSkillsId,
          "video": user.video,
          "oldEmailId": user.emailId
        };
        $scope.openAgentModal();
      } catch (ex) {
        commonService.logException({
          "methodName": "editUser",
          "ExceptionDetails": ex
        });
      }
    };

    // Generic Code for Add and update user
    $scope.saveUser = function (userDetailModel) {
      $scope.operationMsg = "";
      try {
        $rootScope.loader.showLoader = true;
        //validating the user
        $scope.validateAgentConfigurationForm(userDetailModel);
        if ($scope.savUserErrorModel.validated) {
          $rootScope.loader.showLoader = false;
          return;
        }

        //If flag is set to true,it will update the user Details
        if ($scope.editUserflag.status) {
          userDetailModel.isStausModified = false;
          if(userDetailModel.userOldStatusId != null && userDetailModel.userOldStatusId != userDetailModel.userStatusId) {
            userDetailModel.isStausModified = true;
          }
          $scope.updateUser(userDetailModel);
        } else {
          //If flag is set to false, new user will be added
          var langSkills = [];
          for (var i = 0; i < userDetailModel.languageSkillsId.length; i++) {
            langSkills.push(userDetailModel.languageSkillsId[i].code);
          }
          userDetailModel.languageSkillsIdTemp = langSkills;

          //get country details here
          var selectedCountry = $.grep($rootScope.SELECTED_COUNTRY, function (item) {
            return item.value === userDetailModel.selCountry;
          });

          if (selectedCountry.length > 0) {
            userDetailModel.countryId = selectedCountry[0].id;
            userDetailModel.countryName = selectedCountry[0].code;
            userDetailModel.countrysId = selectedCountry[0].code;
          }

          userDetailModel.roleName = $filter('filter')($scope.roles, { id: userDetailModel.roleId })[0].role;
          userDetailModel.currentUserName = $rootScope.currentUser.name;
          var selectedLanguages = $.grep($rootScope.allLanguages, function (item) {
            return item.countryId == userDetailModel.countryId;
          });

          if (selectedLanguages.length > 0) {
            userDetailModel.languageId = selectedLanguages[0].id;
          }

          userService.addUser(userDetailModel).then(function (res) {
            ////if success
            $scope.processAddUser(res);
          }, function (err) {
            $rootScope.loader.showLoader = false;
            commonService.logException({
              "methodName": "saveUser",
              "ExceptionDetails": err
            });
          });
        }
      } catch (ex) {
        $rootScope.loader.showLoader = false;
        commonService.logException({
          "methodName": "saveUser",
          "ExceptionDetails": ex
        });
      }
    };

    $scope.processAddUser = function (res) {
      if (res.status) {
        $scope.operationMsg = $scope.agentTranslation.addUserSuccessMsg;
        commonService.showStatusMessage(statusMessgaeContainer);
        if (res.data.length > 0) {
          $scope.userList.push(res.data[0]);
        }
        $scope.getUser($rootScope.selectedCountryId);
        $scope.numberOfPages();
        $scope.closeAgentModal();
      } else {
        $scope.errorMessage = $scope.agentTranslation[res.code + ""];
      }
      $rootScope.loader.showLoader = false;
    };

    // updating the user details
    $scope.updateUser = function (userModel, isUnlock) {
      $scope.operationMsg = "";
      try {
        var langSkills = [];
        for (var i = 0; i < userModel.languageSkillsId.length; i++) {
          langSkills.push(userModel.languageSkillsId[i].code);
        }

        //get country details here
        var selectedCountry = $.grep($rootScope.SELECTED_COUNTRY, function (item) {
          return item.value === userModel.selCountry;
        });

        if (selectedCountry.length > 0) {
          userModel.countryId = selectedCountry[0].id;
          userModel.countryName = selectedCountry[0].code;
          userModel.countrysId = selectedCountry[0].code;
        }

        userModel.languageSkillsIdTemp = langSkills;

        userModel.proUpdate = "others";
        // iflogged in user and profile same, don't modify the user activity.
        if ($rootScope.currentUser.userID == userModel.userID) {
          userModel.proUpdate = "self";
        }

        //if it is active, activity id should be offline, deleted otherwise
        if (userModel.userStatusId == 1) {
          userModel.activitySid = APP_CONFIG.offlineSid;
        }
        else {
          userModel.activitySid = APP_CONFIG.deleteSid;
        }

        if (userModel.countryId != userModel.preCountryId) {
          var selectedLanguages = $.grep($rootScope.allLanguages, function (item) {
            return item.countryId == userModel.countryId;
          });

          if (selectedLanguages.length > 0) {
            userModel.languageId = selectedLanguages[0].id;
          }
        }
        userService.editUser(userModel).then(function (res) {
          //if success
          $scope.processEditUser(res, isUnlock);
        }, function (err) {
          $rootScope.loader.showLoader = false;
          commonService.logException({
            "methodName": "updateUser",
            "ExceptionDetails": err
          });
        });
      } catch (ex) {
        $rootScope.loader.showLoader = false;
        commonService.logException({
          "methodName": "updateUser",
          "ExceptionDetails": ex
        });
      }
    };

    $scope.processEditUser = function (res, isUnlock) {
      if (res.status) {
        $scope.operationMsg = isUnlock? $scope.agentTranslation.unlockedUserSuccessMsg :$scope.agentTranslation.updateUserSuccessMsg;
        commonService.showStatusMessage(statusMessgaeContainer);
        $scope.getUser($rootScope.selectedCountryId);
        $scope.numberOfPages();
        $scope.closeAgentModal();
      }
      else {
        $scope.errorMessage = $scope.agentTranslation[res.code + ""];
      }
      $rootScope.loader.showLoader = false;
    };

    //Routine to open the delete confirmation model
    var delUser = {};
    $scope.openDeleteModal = function (user) {
      delUser = user;
      if (angular.element("#delete-confirmation").length > 0) {
        angular.element("#delete-confirmation")[0].style.display = 'block';
      }

    };

    $scope.closeDeleteModal = function (flag) {
      if (flag) {
        $rootScope.loader.showLoader = true;
        //delete user here
        $scope.deleteUser(delUser.userID, delUser.sId);
      }
      if (angular.element("#delete-confirmation").length > 0) {
        angular.element("#delete-confirmation")[0].style.display = 'none';
      }

    };

    $scope.deleteUser = function (userId, workerSid) {
      try {
        userService.deleteUser({ userId: userId, workerSid: workerSid, deleteSid: APP_CONFIG.deleteSid }).then(function (res) {
          $scope.processDeleteUser(res);
        }, function (err) {
          $rootScope.loader.showLoader = false;
          commonService.logException({
            "methodName": "deleteUser",
            "ExceptionDetails": err
          });
        });
      } catch (ex) {
        $rootScope.loader.showLoader = false;
        commonService.logException({
          "methodName": "deleteUser",
          "ExceptionDetails": ex
        });
      }
    };

    $scope.processDeleteUser = function (res) {
      if (res.status) {
        $scope.getUser($rootScope.selectedCountryId);
        $scope.operationMsg = $scope.agentTranslation.deletionSuccess;
        commonService.showStatusMessage(statusMessgaeContainer);
      }
      else {
        if (res.code === "1010") {
          $scope.operationMsg = $scope.agentTranslation.twilioError;
        }
        else {
          $scope.operationMsg = $scope.agentTranslation.deletionError;
        }
      }
      $rootScope.loader.showLoader = false;
    };

    //Routine to close agent modal (on closing modal need to reset tht form)
    $scope.closeAgentModal = function () {
      if (angular.element("#agent-configuration").length > 0) {
        angular.element("#agent-configuration")[0].style.display = 'none';
      }
      $scope.resetAgentForm();
    };

    $scope.resetAgentForm = function () {
      $scope.editUserflag.status = false;
      $scope.savUserErrorModel = {};
      $scope.errorMessage = '';
      $scope.userDetailModel = {
        userId: '',
        name: '',
        emailId: '',
        password: '',
        sId: '',
        userStatusId: "1",
        countryId: '',
        languageSkillsId: [],
        languageId: 1,
        roleId: "0",
        createdDateTime: '',
        createdBy: $rootScope.currentUser.userID,
        shiftType: null,
        callType: [],
        activitySid: USER_CURRENT_STATUS[3].sId,
        countrysId: '',
        countryName: '',
        selCountry: $rootScope.currentUser.countryName,
        video: false
      };
    };

    $scope.addCountryDetail = function () {
      $scope.userDetailModel.countryName = $rootScope.currentUser.countryShortName;
      $scope.userDetailModel.countrysId = $rootScope.currentUser.countryShortName;
      $scope.userDetailModel.countryId = $rootScope.currentUser.countryId;
      $scope.addNew = true;
    };

    $scope.clickOnSelection = function (obj) {
      console.log("Selected Model: ", obj);
    };

    $scope.loadCountry = function ($query) {
      return $rootScope.SELECTED_COUNTRY.filter(function (country) {
        return country.value.toLowerCase().indexOf($query.toLowerCase()) != -1 && country.value.toLowerCase().indexOf("select") === -1;
      });
    };

    $scope.validateEmail = function (userDetailModel) {
      if (userDetailModel.emailId.trim() == "" || userDetailModel.emailId == undefined) {
        $scope.savUserErrorModel.validated = true;
        $scope.savUserErrorModel.emailIdError = $scope.agentTranslation.emailRequired;
      } else {
        var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var check = regex.test(userDetailModel.emailId);
        if (!check) {
          $scope.savUserErrorModel.validated = true;
          $scope.savUserErrorModel.emailIdError = $scope.agentTranslation.emailIdError;
        }
      }
    };

    $scope.validateShiftCallType = function (userDetailModel) {
      if (userDetailModel.shiftType == undefined || userDetailModel.shiftType == null) {
        $scope.savUserErrorModel.validated = true;
        $scope.savUserErrorModel.employeetypeError = $scope.agentTranslation.employeetypeError;
      }

      if (userDetailModel.callType == undefined || userDetailModel.callType.length <= 0) {
        $scope.savUserErrorModel.validated = true;
        $scope.savUserErrorModel.callTypeError = $scope.agentTranslation.callTypeError;
      }
    };

    $scope.validateUserStatus = function (userDetailModel) {
      if ((userDetailModel.userStatusId == 0) ? true : false) {
        $scope.savUserErrorModel.validated = true;
        $scope.savUserErrorModel.statusError = $scope.agentTranslation.statusError;
      }

      if ((userDetailModel.roleId == 0) ? true : false) {
        $scope.savUserErrorModel.validated = true;
        $scope.savUserErrorModel.rolesError = $scope.agentTranslation.rolesError;
      }
    };

    //Helper function to validate agent form
    $scope.validateAgentConfigurationForm = function (userDetailModel) {
      $scope.savUserErrorModel = {
        nameError: "",
        emailIdError: "",
        statusError: "",
        rolesError: "",
        employeetypeError: "",
        callTypeError: "",
        languageError: "",
        validated: false
      };

      var name = userDetailModel.name;
      if ((name == "" || name == undefined) ? true : false) {
        $scope.savUserErrorModel.validated = true;
        $scope.savUserErrorModel.nameError = $scope.agentTranslation.nameError;
      }

      $scope.validateEmail(userDetailModel);
      $scope.validateUserStatus(userDetailModel);
      $scope.validateShiftCallType(userDetailModel);

      if (userDetailModel.languageSkillsId == undefined || userDetailModel.languageSkillsId == null || ((userDetailModel.languageSkillsId.length == 0) ? true : false)) {
        $scope.savUserErrorModel.validated = true;
        $scope.savUserErrorModel.languageError = $scope.agentTranslation.languageError;
      }
    };

    //Routine to open the agent model
    $scope.openAgentModal = function () {
      if ($rootScope.currentUser.roleId == 2) {
        $scope.userDetailModel.selCountry = $rootScope.currentUser.countryName;
      }
      else {
        $scope.adminCountrySelection($rootScope.selectedCountryId);
      }

      if (angular.element("#agent-configuration") != undefined) {
        if (angular.element("#agent-configuration").length > 0) {
          angular.element("#agent-configuration")[0].style.display = 'block';
        }
      }
    };

    function showStatusMessage(context, type, message) {
      $scope.status = {
        display: false,
        type: type,
        message: message
      };
    }
  }

  angular.module('CCApp').controller('userController', Implementation);
  Implementation.$inject = ['$rootScope', '$scope', '$http', '$window', 'userService', 'commonService', 'USER_PROFILE_TYPES', 'SELECTED_LANGUAGE', 'USER_ROLES', 'USER_WORKING_HOURS', 'USER_CALLTYPES', 'SELECTED_COUNTRY', 'languageService', 'STATUSTYPE', 'USER_CURRENT_STATUS', 'APP_CONFIG', '$filter', 'USER_FILTER_TYPES', '$cookies'];
})();
