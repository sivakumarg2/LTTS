//// File Name: settings.js
//// Description: This has the method to save & retrieve settings
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/

var helperLogging = require('../helper/logging.js');
var dbSettings = require('../dataaccess_layer/settings.js');

function settings() {
    return {
        saveSetting: saveSetting,
        retrieveSettings: retrieveSettings,
        retrieveSetting: retrieveSetting        
    }
}

//Retrive the settings
function retrieveSettings(request, response) {
    try {
        dbSettings.retrieveSettings( function (res) {
            if (res) {
                response.send({ "status": true, data: res });
            }
            else {
                response.send({ "status": false, data: undefined });
            }
        });

    }
    catch (e) {
        response.send({ "status": false, data: undefined });
        console.log(e);
    }
}

//Retrive the settings
function retrieveSetting(setting, callBack) {
    try {
        dbSettings.retrieveSetting(setting, function (result) {
            callBack(result);
        });
    }
    catch (e) {        
        console.log(e);
    }
}

function saveSetting(req, res) {
    var setting = req.body;
    try {   
        dbSettings.saveSetting(setting, (result) => {
            res.send({ "status": true, "message": "Setting saved successfully" });
        });
    }
    catch (e) {
        console.log(e);
        res.send({ "status": false, "message": "Error while saving settings" });
    }    
}

module.exports = settings();