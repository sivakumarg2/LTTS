//// File Name: keyVaultService.js
//// Description: This has the methods to get the information from Azure key vault
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/

var adalNode = require('adal-node');
var azureKeyVault = require('azure-keyvault');
var vaultDetails = require('../configs/config.js');
var clientId = vaultDetails.keyVaultClientid;
var clientSecret = vaultDetails.keyVaultClientSecret;
var credentials = new azureKeyVault.KeyVaultCredentials(authenticator);
var client = new azureKeyVault.KeyVaultClient(credentials);
var vaultUri = vaultDetails.keyVaultUri;
var mkdirp = require('mkdirp');
var fs = require('fs');
var keyVaultErr = null;

function getSecret(secretName, callback) {
    var secretId = vaultUri + '/secrets/' + secretName;
    logToFile({ "category": "Message", "methodName": "Keyvault:getSecret", "details": "Secret requested. Securet: " + secretName});        
    client.getSecret(secretId, function (err, result) {
        if (err) {
            logToFile({ "category": "Exception", "methodName": "Keyvault:getSecret", "details": "Exception from acquireTokenWithClientCredentials. " + err});  
            keyVaultErr = err;
            return;
        }
        logToFile({ "category": "Message", "methodName": "Keyvault:getSecret", "details": "Got Secret. Securet: " + secretName});
        callback(result.value);
    })
}

function getKeyVaultError() {
    return keyVaultErr;
}

function authenticator(challenge, callback) {
    // Create a new authentication context.   
    var context = new adalNode.AuthenticationContext(challenge.authorization);
    // Use the context to acquire an authentication token.   

    return context.acquireTokenWithClientCredentials(challenge.resource, clientId, clientSecret,
        function (err, tokenResponse) {
            if (err) {      
                logToFile({ "category": "Exception", "methodName": "Keyvault:authenticator", "details": "Exception from acquireTokenWithClientCredentials. " + err});        
                keyVaultErr = err;
                return;
            }
            logToFile({ "category": "Message", "methodName": "Keyvault:authenticator", "details": "AAD Token received to access KeyVault"});        
            // Calculate the value to be set in the request's Authorization header and resume the call.       
            var authorizationValue = tokenResponse.tokenType + ' ' + tokenResponse.accessToken;
            return callback(null, authorizationValue);
        });
}

//log to local file system
var logToFile = function (data) {
    try {
        var dirname = require('path').dirname;
        ////Write into file here     
        mkdirp(dirname("./log/log.log"), function (err) {
            fs.appendFile('./log/log.log', `
            \r\n************** ` + data.category + `: Date:(` + new Date() + `) ***************            
            \r\nMethodName: ` + data.methodName + `
            \r\nDetails: ` + data.details + `
            \r\n`, function (err) {
                    if (err) throw err;
                });
        });

        //const stats = fs.statSync('./log/log.log')
        //console.log("Size of the file is ", stats.size);
    }
    catch (e) {
        console.log("Exception from logToFile: ", e.message)
    }
}

module.exports = {
    getSecret: getSecret,
    getKeyVaultError: getKeyVaultError
}