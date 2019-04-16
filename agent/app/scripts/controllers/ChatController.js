//// Controller Name: chatController
//// Description: This controller will have the logic to maintain chat(question) master data for the calls
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
(function () {
  'use strict';

  function Implementation($rootScope, $scope, chatService, commonService, languageService) {
    var chatMessageModel = {
      "priority": "",
      "questionText": ""
    };

    var chatMessageFormError = {
      'priority': {
        'hasError': false,
        "message": ""
      },
      'questionText': {
        'hasError': false,
        "message": ""
      },
      'hasError': false
    };

    $scope.chatMessageModalModalSelctor = document.getElementById('chatMessageModal');
    var statusMessgaeContainer = "status-msg-fade";
    $scope.onlyNumberRegexPattren = '^[0-9]$';
    $scope.chatMsgTrans = {};
    $scope.chatMsgFormModel = {};
    $scope.chatMessages = []; //Initally table items will be empty
    $scope.formfieldError = {};
    $scope.numOfPages = 0;
    $scope.currentPage = 0;
    $scope.pageSize = 10;
    $scope.sid = '';
    $scope.chatMessageStatus = {
      save: false,
      delete: false
    };

    $scope.$emit("hidebars", false, false, true);
    $scope.$emit("topBarTitle", "settings", "questionText", 1);

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
        $scope.chatMessageModalModalSelctor.style.display = 'none';
        $("#delete-confirmation")[0].style.display = 'none';
      }
    });

    /*Routine to get language file based on user selection*/
    var getLanguageString = function (lang) {
      try {
        languageService.getLanguageString({
          "page": $rootScope.selectedCountryShortName + "_" + lang + '_chat.json'
        }).then(function (res) {
          $scope.chatMsgTrans = res;
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

    /*Scope function to add new Chat Message*/
    $scope.addNewChatMessage = function () {
      hideStatusMsg();
      $scope.chatMsgFormModel = angular.copy(chatMessageModel);
      showChatMessageModal($scope.chatMessageModalModalSelctor);
    };

    /*Scope function to hide/close chat modal*/
    $scope.hideChatModal = function () {
      $scope.chatMessageModalModalSelctor.style.display = 'none';
      $scope.formfieldError = angular.copy(chatMessageFormError);
    };

    /*
    * scope attached function to retrive all chat
    */
    $scope.getAllChatMessages = function () {
      try {
        $rootScope.loader.showLoader = true;
        chatService.getAllChatMessages().then(function (res) {
          $scope.processResult(res);
        }, function (err) {
          $rootScope.loader.showLoader = false;
          commonService.logException({
            "methodName": "getAllChatMessages",
            "exceptionDetails": err
          });
        });
      } catch (logException) {
        $rootScope.loader.showLoader = false;
        commonService.logException({
          "methodName": "getAllChatMessages",
          "exceptionDetails": logException
        });
      }
    };

    $scope.processResult = function (res) {
      ////if success
      if (res.status) {
        $scope.chatMessages = res.data.recordset;
        $scope.numOfPages = Math.ceil($scope.chatMessages.length / $scope.pageSize);
      }
      $rootScope.loader.showLoader = false;
    };

    /*
    * scope function to save or update Chat
    */
    $scope.saveOrUpdateChat = function (chatMessageModel) {
      try {
        $rootScope.loader.showLoader = true;
        validateChatForm(chatMessageModel);
        if ($scope.formfieldError.hasError) {
          $rootScope.loader.showLoader = false;
          return;
        }
        chatService.addChatMessage(chatMessageModel).then(function (res) {
          $scope.processSaveorUpdateResult(res);
        }, function (err) {
          $rootScope.loader.showLoader = false;
          commonService.logException({
            "methodName": "saveOrUpdateChat",
            "exceptionDetails": err
          });
        });
      } catch (logException) {
        $rootScope.loader.showLoader = false;
        commonService.logException({
          "methodName": "saveOrUpdateChat",
          "exceptionDetails": logException
        });
      }
    };

    $scope.processSaveorUpdateResult = function(res) {
      ////if success
      if (res.status) {
        hideStatusMsg();
        $scope.chatMessageStatus.save = true;
        commonService.showStatusMessage(statusMessgaeContainer);
        $scope.hideChatModal();
        $scope.getAllChatMessages();
      } else {
        if (isDuplicateRecord(res)) {
          $scope.chatMessageStatus.duplicate = true;
        }
      }
      $rootScope.loader.showLoader = false;
    };

    //On click of edit bind the rows data and shows in modal popup  (showChatMessageModal)
    $scope.editChatMessage = function (chatMessage) {
      hideStatusMsg();
      $scope.chatMsgFormModel = angular.copy(chatMessage);
      showChatMessageModal($scope.chatMessageModalModalSelctor);
    };

    //Before deleting the Chat shows confirmation modal popup
    $scope.deleteChatMessage = function (chatMsgId) {
      hideStatusMsg();
      openDeleteModal();
      $scope.chatMsgId = chatMsgId;
    };

    /*Helper routine to show/display Chat modal*/
    function showChatMessageModal(chatMessageModalModalSelctor) {
      chatMessageModalModalSelctor.style.display = 'block';
      $scope.chatMessageStatus.save = false;
      $scope.chatMessageStatus.delete = false;
      $scope.chatMessageStatus.duplicate = false;
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
          chatService.deleteChatMessage($scope.chatMsgId).then(function (res) {
           $scope.processDeleteModal(res);
          }, function (err) {
            $rootScope.loader.showLoader = false;
            commonService.logException({
              "methodName": "deleteChatMessage",
              "exceptionDetails": err
            });
          });
        }
        $("#delete-confirmation")[0].style.display = 'none';

      } catch (logException) {
        $rootScope.loader.showLoader = false;
        commonService.logException({
          "methodName": "deleteChatMessage",
          "exceptionDetails": logException
        });
      }
    };

    $scope.processDeleteModal = function(res) {
      if (res.status) {
        hideStatusMsg();
        $scope.chatMessageStatus.delete = true;
        commonService.showStatusMessage(statusMessgaeContainer);
        $scope.getAllChatMessages();
      }
      $rootScope.loader.showLoader = false;
    };

    /*Helper routine to validate chat form fields beofre saving Or Updating*/
    function validateChatForm(chatMessageModel) {

      $scope.formfieldError = angular.copy(chatMessageFormError);

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

      if (isEmpty(chatMessageModel.priority + "")) {
        hasError();
        $scope.formfieldError.priority.hasError = true;
        $scope.formfieldError.priority.message = $scope.chatMsgTrans.codeFieldEmpty;
      }
      if (isEmpty(chatMessageModel.questionText)) {
        hasError();
        $scope.formfieldError.questionText.hasError = true;
        $scope.formfieldError.questionText.message = $scope.chatMsgTrans.chatFieldEmpty;
      }
    }

    function hideStatusMsg() {
      $scope.chatMessageStatus.save = false;
      $scope.chatMessageStatus.delete = false;
    }

    function isDuplicateRecord(result) {
      if (result.data != null && result.data.code === "1001") {
        return true;
      }
      return false;
    }
  }

  angular.module("CCApp").controller('chatController', Implementation);
  Implementation.$inject = ['$rootScope', '$scope', 'chatService', 'commonService', 'languageService'];
})();
