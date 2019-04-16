//// File Name: country.js
//// Description: This has the methods work with country configuration & settings
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/

'use strict';

var dbCountry = require('../dataaccess_layer/country.js');
var dbLogging = require('../dataaccess_layer/logging.js');
var helperLogging = require('../helper/logging.js');
var twilioInterface = require('../twilio_interface/twilioInterface.js');
var crypto = require('../helper/cryptohelper.js');
var tokenHandler = require('../helper/tokenHandler.js');
var fs = require('fs');

function businessCountry() {
    return {
        getAllCountryConfigDetails: getAllCountryConfigDetails,
        addCountryConfiguration: addCountryConfiguration,
        editCountryConfigurationById: editCountryConfigurationById,
        deleteCountryConfigurationById: deleteCountryConfigurationById
    }
}

//Retrive the country details list for admin
function getAllCountryConfigDetails(request, response) {
    try {
        logActivity("getAllCountryConfigDetails", request.get('userId'), request.get('elevatorID'));
        var currentUserId = request.get('userId');

        dbCountry.getAllCountryConfigDetails(currentUserId, function (res) {
            if (res) {
                response.send({ "status": true, data: res.recordsets });
            }
            else {
                response.send({ "status": false, data: undefined });
            }
        });
    }
    catch (exception) {
        logException("getAllCountryConfigDetails", exception.message, request.get('userId'));
    }
}

// Adding a new country details
function addCountryConfiguration(request, response) {
    var config = request.body;
    config.currentUserId = request.get('userId');
    try {
        logActivity("addCountryConfiguration", request.get('userId'), request.get('elevatorID'));
        twilioInterface.addCountrySettings(config, function (twilioRes) {
            if (twilioRes.status) {
                config.sid = twilioRes.country.sid;
                dbCountry.addCountryConfiguration(config, function (res) {
                    if (res) {
                        dbCountry.getAllCountryConfigDetailsForTwilio(config.currentUserId, function (dbRes) {
                            if (dbRes) {
                                console.log("Country Settings: ", { timeout: config.workflowTimout, enableRedirection: config.isRedirectionEnabled, cultureSetting: config.cultureSetting });
                                var taskQueues = [];
                                for (var i = 0; i < dbRes.recordsets[2].length; i++) {
                                    var numbers = [];
                                    for (var j = 0, len = dbRes.recordset.length; j < len; j++) {
                                        //console.log("Redirection Numbers: ", dbRes.recordset[j]);
                                        //console.log("Result: ", dbRes.recordsets[2][i]);
                                        if (dbRes.recordset[j].countryConfigurationId == dbRes.recordsets[2][i].countryConfigurationId) {
                                            numbers.push(dbRes.recordset[j]);
                                        }
                                    }
                                    console.log("Result: ", numbers)
                                    taskQueues.push({
                                        "name": dbRes.recordsets[2][i].countryShortName + "_taskQueue",
                                        "sId": dbRes.recordsets[2][i].sid,
                                        "timeout": dbRes.recordsets[2][i].callTimeOut,
                                        "expression": "country==\"" + dbRes.recordsets[2][i].countryShortName + "\"",
                                        "isRedirectionEnabled": (numbers.length >= 2 ? true : false)
                                    });
                                }

                                twilioInterface.saveWorkflow({ timeout: config.workflowTimout, enableRedirection: config.isRedirectionEnabled }, taskQueues, function (twiliores) {
                                    if (twiliores) {
                                        response.send({ "status": true, data: "work flow created!!" });
                                    }
                                }, request.get('userId'));
                            }
                        });
                    }
                });
            }
            else {
                response.send({ "status": false, data: twilioRes.err });
            }
        });
    }
    catch (exception) {
        logException("addCountryConfiguration", exception.message, request.get('userId'));
    }
}

//updating the country details
function editCountryConfigurationById(request, response) {
    try {
        logActivity("editCountryConfigurationById", request.get('userId'), request.get('elevatorID'));
        var editCountryObject = request.body;
        editCountryObject.currentUserId = request.get('userId');
        twilioInterface.updateCountrySettings(editCountryObject, function (twilioRes) {
            if (twilioRes.status) {
                editCountryObject.sid = twilioRes.taskQueueSid;
                dbCountry.addCountryConfiguration(editCountryObject, function (res) {
                    if (res) {
                        dbCountry.getAllCountryConfigDetailsForTwilio(editCountryObject.currentUserId, function (dbRes) {
                            if (dbRes) {                                
                                console.log("Country Settings: ", { timeout: editCountryObject.workflowTimout, enableRedirection: editCountryObject.isRedirectionEnabled, cultureSetting: editCountryObject.cultureSetting });
                                var taskQueues = [];
                                for (var i = 0; i < dbRes.recordsets[2].length; i++) {
                                    //Redirection number                                    
                                    var numbers = [];
                                    for (var j = 0, len = dbRes.recordset.length; j < len; j++) {
                                        //console.log("Redirection Numbers: ", dbRes.recordset[j]);
                                        //console.log("Result: ", dbRes.recordsets[2][i]);
                                        if (dbRes.recordset[j].countryConfigurationId == dbRes.recordsets[2][i].countryConfigurationId) {
                                            numbers.push(dbRes.recordset[j]);
                                        }
                                    }
                                    console.log("Result: ", numbers)
                                    taskQueues.push({
                                        "name": dbRes.recordsets[2][i].countryShortName + "_taskQueue",
                                        "sId": dbRes.recordsets[2][i].sid,
                                        "timeout": dbRes.recordsets[2][i].callTimeOut,
                                        "expression": "country==\"" + dbRes.recordsets[2][i].countryShortName + "\"",
                                        "isRedirectionEnabled": (numbers.length >= 2 ? true : false)
                                    });
                                }
                                twilioInterface.saveWorkflow({ timeout: editCountryObject.workflowTimout, enableRedirection: editCountryObject.isRedirectionEnabled }, taskQueues, function (twiliores) {
                                    if (twiliores) {
                                        response.send({ "status": true, data: "work flow created!!" });
                                    }
                                }, request.get('userId'));
                            }
                        });

                    }
                });
            }
            else {
                response.send({ "status": false, data: undefined });
            }
        });
    }
    catch (exception) {
        logException("addCountryConfiguration", exception.message, request.get('userId'));
    }
}

//Deleting the country details
function deleteCountryConfigurationById(request, response) {
    try {
        logActivity("deleteCountryConfigurationById", request.get('userId'), request.get('elevatorID'));
        var countryObject = {
            'configurationId': request.query.countryConfigurationId,
            'currentUserId': request.get('userId')
        };

        dbCountry.getAllCountryConfigDetails(countryObject.currentUserId, function (dbRes) {
            if (dbRes) {
                var timeout = request.params.workflowTimout;
                var taskQueues = [];
                for (var i = 0; i < dbRes.recordsets[2].length; i++) {
                    if (dbRes.recordsets[2][i].sid != request.params.countryConfigurationId) {
                        taskQueues.push({
                            "name": dbRes.recordsets[2][i].countryShortName + "_taskQueue",
                            "sId": dbRes.recordsets[2][i].sid,
                            "timeout": dbRes.recordsets[2][i].callTimeOut,
                            "expression": "country==\"" + dbRes.recordsets[2][i].countryShortName + "\""
                        });
                    }
                }
                twilioInterface.saveWorkflow(timeout, taskQueues, function (twilWFRes) {
                    if (twilWFRes.status) {
                        twilioInterface.deleteCountrySettings(countryObject, function (twilioRes) {
                            if (twilioRes.status) {
                                dbCountry.deleteCountryConfigurationById(countryObject, function (res) {
                                    if (res) {
                                        response.send({ "status": true, data: "work flow created and deleted in db as well as in twilio server!!" });
                                    }
                                });
                            }
                            else {
                                response.send({ "status": false, data: undefined });
                            }
                        });
                    }
                }, request.get('userId'));
            }
        });
    }
    catch (exception) {
        logException("deleteCountryConfigurationById", exception.message, request.get('userId'));
    }
}
var logActivity = function (activityName, userId, elevatorId) {
    helperLogging.logActivity({ "activityname": activityName, "userId": userId, "elevatorId": elevatorId });
}

var logException = function (methodName, exceptionDetails, userId) {
    helperLogging.logException({ "isServer": 1, "methodName": methodName, "exceptionDetails": details, "userId": userId });
}

module.exports = businessCountry();