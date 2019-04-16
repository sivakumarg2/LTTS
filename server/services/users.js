//// File Name: users.js
//// Description: This has the methods for user management
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/

'use strict';

var dbUser = require('../dataaccess_layer/users.js');
var twilioInterface = require('../twilio_interface/twilioInterface.js');
var crypto = require('../helper/cryptohelper.js');
var mail = require('../helper/mailHelper.js');
var appConfig = require('../configs/config.js');
var fs = require('fs');
var loginService = require('./login.js')
var helperLogging = require('../helper/logging.js');

function businessUser() {
    return {
        getUser: getUser,
        addUserDetails: addUser,
        updateUserDetails: updateUser,
        updateUserPreferences: updateUserPreferences,
        updateLanguage: updateLanguage,
        deleteUserDetials: deleteUser
    }
}

//Retrive the user list based on the country id
function getUser(req, res) {
    try {
        logActivity("getUser", req.get('userId'), req.get('elevatorID'));
        var objUser = {
            'countryId': req.query.countryId,
            'currentUserId': req.get('userId')
        };

        dbUser.getUsers(objUser, function (result) {
            if (result.recordset.length > 0) {
                res.send({ "status": true, data: result.recordset });
            }
            else {
                res.send({ "status": false, data: undefined });
            }
        });
    }
    catch (exception) {
        logException("getUser", exception.message, req.get('userId'));
        res.send({ "status": false, "code": "", data: undefined });
    }
}

function UpdateUserAndSendEmail(objUser, twilRes, response) {
    objUser.sId = twilRes.sId;
    //update the db with sid from twilio
    dbUser.updateUserBySId(objUser, function (result) {
        if (result.rowsAffected.length > 0) {
            
            //send a mail
            var mailObj = JSON.parse(fs.readFileSync('./server/configs/mail.js', 'utf8'));
            var objMailContent = mailObj[0]["eng"].newUser;
            var passwordDecrypt = crypto.decrypt(objUser.password);
            var objMailUser = { hour: objUser.hour, name: objUser.name, emailId: objUser.emailId, char: objUser.password, num: crypto.encrypt(objUser.userID+""), password: passwordDecrypt, role: objUser.roleName, currentUserName: objUser.currentUserName };
            var objMail = loginService.mailContent(objMailContent, objMailUser, true);
            mail.mailSender(objMail, function(res) {
                response.send({ "status": true, data: result.recordset });
            });                                            
        }
    });
}

// Adding a new User
function addUser(req, response) {
    try {
        logActivity("addUser", req.get('userId'), req.get('elevatorID'));
        var objUser = req.body;
        objUser.currentUserId = req.get('userId');

        //generate Password for new user
        var generatedPassword = crypto.generatePassword();
        objUser.password = crypto.encrypt(generatedPassword.trim());

        //send the generated password to agent's mail Id 'objUser.emailId'
        dbUser.addUser(objUser, function (result) {
            if (!result.originalError) {
                if (result.rowsAffected.length > 0) {
                    //create worker in Twilio
                    dbUser.getUserIdByEmailId(objUser.emailId, objUser.currentUserId, function (result) {
                        if (result.rowsAffected.length > 0) {
                            objUser.userID = result.recordset[0].userId;
                            twilioInterface.addWorker(objUser, function (twilRes) {
                                if (twilRes.status) {
                                    objUser.hour = appConfig.newUserLinkExpiredHours;
                                    UpdateUserAndSendEmail(objUser, twilRes, response);
                                }
                                else {

                                    var funUpdate = function () {
                                        objUser.name = (Math.floor(Math.random() * (+9 - +0)) + +0) + "-" + objUser.name;
                                        twilioInterface.addWorker(objUser, function (twilRes) {
                                            if (twilRes.status) {
                                                UpdateUserAndSendEmail(objUser, twilRes, response);
                                            }
                                        });
                                    };

                                   //If it is duplicate then, add random characterwith user and create user again
                                   /*console.log("Length", twilres.err.message.indexOf('ActivitySid ' + objUser.activitySid + ' was not found for'))
                                   console.log("Twil: ", twilRes.err.message, "-", 'ActivitySid ' + objUser.activitySid + ' was not found for')
                                   if(twilRes.err.message != null) {                                       
                                    if(twilres.err.message.indexOf('ActivitySid ' + objUser.activitySid + ' was not found for') >= 0) {
                                        logException("addUser", "Invalid ActivitySid for the Workspace", req.get('userId'));
                                        response.send({ "status": false, "code": "1001", data: "Invalid ActivitySid for the Workspace" });
                                    }
                                    else {
                                        funUpdate();
                                    }
                                   }
                                   else {
                                    funUpdate();
                                   }*/
                                   funUpdate();
                                }                              
                            });
                        }                        
                    });
                }
            }
            else {
                //email id already exsists & log the exception here
                logException("addUser", "User is registered with given EmailID", req.get('userId'));
                response.send({ "status": false, "code": "1001", data: "User / Email Id already exists" });
            }
        });
    }
    catch (exception) {
        logException("addUser", exception.message, req.get('userId'));
        response.send({ "status": false, "code": "", data: undefined });
    }
}

//updating the user
function updateUserPreferences(req, res) {
    try {
        logActivity("updateUserPreferences", req.get('userId'), req.get('elevatorID'));
        var objUser = req.body;
        objUser.currentUserId = req.get('userId');
        dbUser.updateUserPreferences(objUser, function (result) {
            if (result.rowsAffected.length > 0) {
                res.send({ "status": true, data: result.recordset });
            }
            else {
                res.send({ "status": false, "code": "", data: undefined });
            }
        });

    }
    catch (exception) {
        logException("updateUser", exception.message, req.get('userId'));
        res.send({ "status": false, "code": "", data: undefined });
    }
}

//updating the user
function updateUser(req, res) {
    try {
        logActivity("updateUser", req.get('userId'), req.get('elevatorID'));
        var objUser = req.body;
        objUser.currentUserId = req.get('userId');
        var emailId = objUser.emailId;
        var oldEmailId = objUser.oldEmailId;
        objUser.password = null;

        dbUser.updateUser(objUser, function (result) {
            if (result.rowsAffected != null) {
                if (result.rowsAffected.length > 0) {
                    if(result.recordset[0].code == '1000') {
                        //send email to the new person
                        if (emailId.toLowerCase() !== oldEmailId.toLowerCase()) {
                            var generatedPassword = crypto.generatePassword();
                            objUser.password = crypto.encrypt(generatedPassword.trim());
                            var mailObj = JSON.parse(fs.readFileSync('./server/configs/mail.js', 'utf8'));
                            var objMailContent = mailObj[0]["eng"].newUser;
                            var passwordDecrypt = crypto.decrypt(objUser.password);
                            var objMailUser = { name: objUser.name, emailId: objUser.emailId, password: passwordDecrypt, role: objUser.roleName, currentUserName: objUser.currentUserName };
                            var objMail = loginService.mailContent(objMailContent, objMailUser, true);
                            mail.mailSender(objMail, function(){});
                        }

                        //update to Twilio for the worker status
                        twilioInterface.updateWorker(objUser, function (twilRes) {
                            res.send({ "status": twilres.status, data: result.recordset });
                        });
                        res.send({ "status": true, data: result.recordset });
                    }
                    else {
                        res.send({ "status": false, "code": result.recordset[0].code, data: result.recordset });
                    }
                }
            }
            else {
                res.send({ "status": false, "code": "", data: undefined });
            }
        });

    }
    catch (exception) {
        logException("updateUser", exception.message, req.get('userId'));
        res.send({ "status": false, "code": "", data: undefined });
    }
}

//updating the user
function updateLanguage(req, res) {
    try {
        logActivity("updateLanguage", req.get('userId'), req.get('elevatorID'));
        var objUser = req.body;
        objUser.currentUserId = req.get('userId');
        dbUser.updateLanguage(objUser, function (result) {
            if (result.rowsAffected.length > 0) {
                res.send({ "status": true, data: "Updated sucessfully", langData: result.recordsets});
            }
        });

    }
    catch (exception) {
        logException("updateLanguage", exception.message, req.get('userId'));
        res.send({ "status": false, "code": "", data: undefined });
    }
}

//Deleting the user
function deleteUser(req, res) {
    try {
        logActivity("deleteUser", req.get('userId'), req.get('elevatorID'));
        var objUser = {
            userId: req.query.userId
        }
        twilioInterface.deleteWorker(req.query.workerSid, req.query.deleteSid, function (twilRes) {
            if (twilRes.status) {
                dbUser.deleteUser(objUser, function (result) {
                    if (result.rowsAffected > 0) {
                        res.send({ "status": true, "code": "1000", data: "Deleted sucessfully " });
                    }
                    else {
                        res.send({ "status": false, "code": "1001", data: "Error on deletion" });
                    }
                });
            }
            else {
                res.send({ "status": false, "code": "1010", "err": twilRes.err, data: undefined });
            }
        });
    }
    catch (exception) {
        logException("updateUser", exception.message, req.get('userId'));
        res.send({ "status": false, "code": "", data: undefined });
    }
}

var logException = function (methodName, exceptionDetails, userId) {
    console.log("Log exception");
    helperLogging.logException({ "isServer": 1, methodName: methodName, "exceptionDetails": exceptionDetails, "userId": userId });
}

var logActivity = function (activityName, userId, elevatorId) {
    helperLogging.logActivity({ "activityname": activityName, "userId": userId, "elevatorId": elevatorId });
}
module.exports = businessUser();