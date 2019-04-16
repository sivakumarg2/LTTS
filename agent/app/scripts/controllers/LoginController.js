//// Controller Name: loginController
//// Description: This controller will have the logic to validate the user inputs and send valid input to server for validatio,
//// recover password & change user password for the first time login functionalities
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
(function () {
    'use strict';

    function Implementation($rootScope, $scope, loginService, commonService, $state, $cookies, languageService, USER_CURRENT_STATUS, APP_CONFIG, $location) {
        $scope.loginModel = { emailId: "", password: "", confirmPassword: "", newPassword: "", recoverEmailID: "" };
        $scope.login = { errMsg: "" };
        $scope.$emit("hidebars", true, true, true, 'login');
        $scope.pwdModal = document.getElementById('forgot-password-modal');
        $scope.rememberFlag = false;
        $rootScope.languageShortName = APP_CONFIG.defaultLanguageShortName;
        $scope.isLogin = 0;
        $scope.userStatus = USER_CURRENT_STATUS;
        $rootScope.unsupportedBroser = false;
        
        // WebRTC check for other than CHROME Browser
        if (!navigator.webkitGetUserMedia && !navigator.mozGetUserMedia) {
            $rootScope.unsupportedBroser = true;
        }

        function getParameterValues(param) {  
            var url = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');  
            for (var i = 0; i < url.length; i++) {  
                var urlparam = url[i].split('=');  
                if (urlparam[0] == param) {  
                    return urlparam[1];  
                }  
            }  
        } 
    
        var chr = getParameterValues('chr');
        var num = getParameterValues('num');
        var ident = getParameterValues('id');

        if(chr && num && (ident == 'rp' || ident == 'nu')) {
            $scope.isLogin = 2;
        }
        else {
            $scope.isLogin = 0;
        }

        $scope.assignLinkValue = function(chr, num, ident) {
            $scope.loginModel.chr = chr;
            $scope.loginModel.num = num;
            $scope.loginModel.ident = ident;
        };

        $scope.validate = function (object, isLoad) {
            if (object.error) {
                $rootScope.loader.showLoader = false;
                if (object.error.errSource == "1") {
                    if (object.error.code == "ENOTFOUND") {
                        $scope.login.errMsg = $scope.loginTranslation["kvENOTFOUND"];
                        commonService.showStatusMessage("login-msg");
                    }
                    else {
                        $scope.login.errMsg = $scope.loginTranslation["commonError"];
                        commonService.showStatusMessage("login-msg");
                    }
                }
                else {
                    if (object.error.code == "ELOGIN") {
                        $scope.login.errMsg = $scope.loginTranslation["dbELOGIN"];
                        commonService.showStatusMessage("login-msg");
                    }
                    else {
                        $scope.login.errMsg = $scope.loginTranslation["commonError"];
                        commonService.showStatusMessage("login-msg");
                    }
                }
                return;
            }
            if (isLoad != null) {
                $rootScope.configuration = object.data;
                return;
            }

            $scope.loginModel.emailId = $scope.loginModel.emailId.toLowerCase();
            //send to controller to verify
            if(chr && num) { 
                $scope.assignLinkValue(chr, num, ident);
            }
            loginService.login($scope.loginModel).then(function (res) {
                $rootScope.loader.showLoader = false;
                $scope.assignLinkValue(undefined, undefined, undefined);
                if((res.emailId != "" || res.emailId != null) && (chr && num)) {
                    $scope.loginModel.emailId = res.emailId;
                }

                $scope.validateUser(res);
            }, function (err) {
                $rootScope.loader.showLoader = false;
                commonService.logException({ "methodName": "userLogin", "exceptionDetails": err });
            });
        };

        $scope.userLogin = function () {
            init();
            $scope.validateLogin();
            if ($scope.login.validated) {
                return;
            }

            try {
                $rootScope.sidemenu = { clicked: -1 };
                $scope.loginModel.isFirstLogin = false;
                $rootScope.loader.showLoader = true;
                $scope.loginModel.loginActivity = $scope.userStatus[0].sId;

                loginService.getCSRFToken().then(function (res) {
                    $scope.validate(res);
                }, function (err) {
                    $scope.validate(err);
                });
            }
            catch (ex) {
                $rootScope.loader.showLoader = false;
                commonService.logException({ "methodName": "userLogin", "exceptionDetails": ex.message });
            }
        };

        
        $scope.changeUserPassword = function () {
            init();
            $scope.validateChangePassword();
            if ($scope.login.validated) {
                return;
            }

            try {
                $rootScope.sidemenu = { clicked: -1 };
                $scope.loginModel.isFirstLogin = true;
                $scope.loginModel.loginActivity = $scope.userStatus[0].sId;

                var validateChangePwd = function () {
                    $scope.loginModel.emailId = $scope.loginModel.emailId.toLowerCase();
                    if(chr && num) { 
                        $scope.assignLinkValue(chr, num, ident);                        
                    }

                    loginService.login($scope.loginModel).then(function (res) {
                        $rootScope.loader.showLoader = false;
                        $scope.assignLinkValue(undefined, undefined, undefined);
                        $scope.validateUser(res);
                    }, function (err) {
                        $rootScope.loader.showLoader = false;
                        commonService.logException({ "methodName": "changeUserPassword", "exceptionDetails": err });
                    });
                };

                $rootScope.loader.showLoader = true;
                loginService.getCSRFToken().then(function () {
                    validateChangePwd();
                }, function () {
                    validateChangePwd();
                });
            }
            catch (ex) {
                commonService.logException({ "methodName": "changeUserPassword", "exceptionDetails": ex.message });
            }
        };

        $scope.validatePassword = function () {
            var newPassword = $scope.loginModel.newPassword;
            if ((newPassword === "" || newPassword == undefined) ? true : false) {
                $scope.login.validated = true;
                $scope.login.newPasswordError = $scope.loginTranslation.newPasswordRequired;
            }
            else {
                var onlyPasChr = validateRegEx(newPassword, '^[a-z]+$');
                var onlyCapsChr = validateRegEx(newPassword, '[A-Z]+');
                var splCharAvai = validateRegEx(newPassword, '[_$#@*.-]+');
                var onlyPasNum = validateRegEx(newPassword, '^[0-9]+$');
                var onlyPasAlp = validateRegEx(newPassword, '^[a-z0-9]{6,40}$');
                var validPas = validateRegEx(newPassword, '^[a-zA-Z0-9_$#@*.-]{6,20}$');

                //// combination will be checked. 1. if it is a-z or A-Z or 0-9 or no special chars available then invalid format
                //// Or if it is not length of 6 - 20 is also invalid
                if ((onlyPasChr != null || onlyPasNum != null || onlyPasAlp != null || onlyCapsChr === null || splCharAvai === null) || validPas == null) {
                    $scope.login.validated = true;
                    $scope.login.newPasswordError = $scope.loginTranslation.confirmPasswordInvalidFormat;
                    return true;
                }
            }
            return false;
        };

        $scope.validateChangePassword = function () {
            $scope.login.validated = false;
            $scope.login.newPasswordError = "";
            $scope.login.confirmPasswordError = "";
            try {
                if ($scope.validatePassword()) {
                    return true;
                }

                var confPassword = $scope.loginModel.confirmPassword;
                if ((confPassword === "" || confPassword == undefined) ? true : false) {
                    $scope.login.validated = true;
                    $scope.login.confirmPasswordError = $scope.loginTranslation.confirmPasswordRequired;
                }
                else {
                    if ($scope.loginModel.confirmPassword !== $scope.loginModel.newPassword) {
                        $scope.login.validated = true;
                        $scope.login.confirmPasswordError = $scope.loginTranslation.passwordMismatch;
                    }
                }
            }
            catch (ex) {
                commonService.logException({ "methodName": "validateChangePassword", "exceptionDetails": ex.message });
            }
        };

        // Regex validation
        function validateRegEx(str, reg) {
            try {
                return str.match(reg);
            }
            catch (ex) {
                commonService.logException({ "methodName": "validateRegEx", "exceptionDetails": ex.message });
            }
        }

        $scope.gotoLogin = function () {
            $scope.isLogin = 0;
            $scope.login.errMsg = "";
            $scope.assignLinkValue(undefined, undefined, undefined);
            var chr = num = ident = undefined;
            $location.url('/login');
        };

        $scope.validateUser = function (res) {
            try {
                // Validate login and to get the result code from stored procedure
                if (res.code) {
                    if(res.code == "2000") {
                        $scope.login.errMsg = $scope.loginTranslation["commonError"];
                    }
                    else if(res.code == "2001" || res.code == "2002") {
                        //link expired
                        $scope.isLogin = 2;
                        $scope.login.errMsg = $scope.loginTranslation["linkExpired"];
                    }
                    else {
                        $scope.login.errMsg = $scope.loginTranslation[res.code + ""];
                    }
                    
                    commonService.showStatusMessage("login-msg");
                }

                if (res.code == '1004') {
                    $scope.isLogin = 1;
                }

                if (res.status) {
                    var now = new Date();
                    var exp = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

                    // If user checks the remember me, value will be  true.
                    if ($scope.rememberFlag) {
                        $cookies.put('CCApp-userIdentity', res.data.user.emailId, { expires: exp });
                    }
                    else {
                        $cookies.remove('CCApp-userIdentity');
                    }

                    $rootScope.$emit("initializeAgent", res.data);
                    if (res.data.user.roleId === 3) {
                        $state.go('report');
                        return;
                    }
                    $state.go('dashboard');
                }
            }
            catch (ex) {
                commonService.logException({ "methodName": "validateUser", "exceptionDetails": ex.message });
            }
        };

        $scope.validateLogin = function () {
            $scope.login = { loginError: "", passwordError: "", validated: false };
            try {
                if ($scope.loginModel.emailId.trim() === "") {
                    $scope.login.validated = true;
                    $scope.login.loginError = $scope.loginTranslation.emailRequired;
                }
                else {
                    var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    var check = regex.test($scope.loginModel.emailId);
                    if (!check) {
                        $scope.login.validated = true;
                        $scope.login.loginError = $scope.loginTranslation.invalidEmailFormat;
                    }
                }

                if ($scope.loginModel.password.trim() === "") {
                    $scope.login.validated = true;
                    $scope.login.passwordError = $scope.loginTranslation.passwordRequired;
                }
            }
            catch (ex) {
                commonService.logException({ "methodName": "validateLogin", "exceptionDetails": ex.message });
            }
        };

        $scope.forgotPassword = function (emailId) {
            validateForgotPassword();
            if ($scope.recover.validated)
                return;
            try {
                $rootScope.loader.showLoader = true;
                loginService.forgotPassword(emailId).then(function (res) {
                    $rootScope.loader.showLoader = false;
                    $scope.validateForgotResult(res);
                }, function (err) {
                    $rootScope.loader.showLoader = false;
                    commonService.logException({ "methodName": "forgotPassword", "exceptionDetails": err });
                });
            }
            catch (ex) {
                commonService.logException({ "methodName": "forgotPassword", "exceptionDetails": ex.message });
            }
        };

        $scope.validateForgotResult = function (res) {
            try {
                $scope.recover.successMsg = '';
                if (res.status && res.mailStatus) {
                    $scope.recover.successMsg = $scope.loginTranslation.successMsg;
                    resetForgotPassword();
                }
                else if (!res.mailStatus && res.status) {
                    $scope.recover.errMsg = $scope.loginTranslation.successButMail;
                    commonService.showStatusMessage("flash-msg");
                }
                else {
                    $scope.recover.errMsg = $scope.loginTranslation.invalidMailId;
                    commonService.showStatusMessage("flash-msg");
                }
            }
            catch (ex) {
                commonService.logException({ "methodName": "validateForgotResult", "exceptionDetails": ex.message });
            }
        };

        var resetForgotPassword = function () {
            $scope.loginModel.recoverEmailID = '';
            $scope.recover.errMsg = '';
        };

        $scope.openPWDModal = function () {
            $scope.loginModel.recoverEmailID = "";
            $scope.recover = { "errMsg": "", "recoverError": "", "validated": false, "successMsg": "" };
            $scope.pwdModal.style.display = "block";
        };

        // When the user clicks on <span> (x), close the modal
        $scope.closePWDModal = function () {
            $scope.pwdModal.style.display = "none";
        };

        window.onclick = function (event) {
            if (event.target === $scope.pwdModal) {
                $scope.pwdModal.style.display = "none";
            }
        };

        var getLanguageString = function () {
            try {
                languageService.getLanguageString({ "page": $rootScope.languageShortName + "_login.json" }).then(function (res) {
                    $scope.loginTranslation = res;
                }, function (err) {
                });
            }
            catch (ex) {
                commonService.logException({ "methodName": "getLanguageString", "exceptionDetails": ex.message });
            }
        };

        // if user is checked the remember me it checks and loads the username in login screen.
        $scope.checkUser = function () {
            try {
                if ($cookies.get('CCApp-userIdentity') != undefined) {
                    $scope.loginModel.emailId = $cookies.get('CCApp-userIdentity');
                    $scope.rememberFlag = true;
                }
                else {
                    $scope.loginModel.emailId = '';
                }
            }
            catch (ex) {
                commonService.logException({ "methodName": "checkUser", "exceptionDetails": ex.message });
            }
        };

        $scope.resetObjects = function () {
            $rootScope.currentUserId = undefined;
            $rootScope.appData.workers.identityToken = undefined;
            $rootScope.appData.workers.workerToken = undefined;
            $rootScope.appData.menuHtml = undefined;
            $rootScope.currentUser = undefined;
            $rootScope.languageShortName = APP_CONFIG.defaultLanguageShortName;
        };

        var init = function (label) {
            var removeCokie = function () {
                var cookies = $cookies.getAll();
                angular.forEach(cookies, function (v, k) {
                    if (k != "CCApp-userIdentity") {
                        $cookies.remove(k);
                    }
                });
            };

            try {
                ////Remove all the cookies excepts the remember me cookie
                if ($cookies.get('CCApp-sId') !== undefined) {
                    loginService.updateActivity($cookies.get('CCApp-sId'), $scope.userStatus[3].sId).then(function (res) {
                        removeCokie();
                    }, function (err) {
                        removeCokie();
                    });
                }

                $rootScope.loader.showLoader = false;
                $scope.main.selectedItem = 0;
                $scope.sidemenu.clicked = 0;
                var callNotifiModal = $("#call-notification")[0];
                if (callNotifiModal != null) {
                    callNotifiModal.style.display = "none";
                }
            }
            catch (ex) {
                $rootScope.loader.showLoader = false;
                removeCokie();
            }

            $scope.resetObjects();

            ////Load language here
            getLanguageString();
            if (label) {
                $scope.checkUser();

                loginService.getCSRFToken().then(function (res) {
                    $scope.validate(res, $scope.isLogin == 2? null: true);
                }, function (err) {
                    $scope.validate(err, $scope.isLogin == 2? null: true);
                });
            }

            $scope.$emit("hideWindows");            
        };
        init(true);

        //validating forgot password
        var validateForgotPassword = function () {
            {
                $scope.recover = { "errMsg": "", "recoverError": "", "validated": false, "successMsg": "" };
                try {
                    if ($scope.loginModel.recoverEmailID == "") {
                        $scope.recover.validated = true;
                        $scope.recover.recoverError = $scope.loginTranslation.recoverEmailRequired;
                    }
                    else {
                        if (!loginService.validateEmail($scope.loginModel.recoverEmailID)) {
                            $scope.recover.validated = true;
                            $scope.recover.recoverError = $scope.loginTranslation.invalidEmailFormat;
                        }
                    }
                }
                catch (ex) {
                    commonService.logException({ "methodName": "validateForgotPassword", "exceptionDetails": ex.message });
                }
            }
        };
    }

    angular.module("CCApp").controller('loginController', Implementation);
    Implementation.$inject = ['$rootScope', '$scope', 'loginService', 'commonService', '$state', '$cookies', 'languageService', 'USER_CURRENT_STATUS', 'APP_CONFIG', '$location'];
})();
