//// File Name: db.js
//// Description: This will create the connection objects which is used in the application
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/

var mssql = require("mssql");
var kvservice = require('../helper/keyVaultService');
var service = require('../helper/commonService');
//var logging = require('../helper/logging');
var dbConfig, connection;

try {
	/*connection = mssql.connect({"user": "CCApp","password":"admins@123","server":"cccazureapp.database.windows.net","port":"1433", "requestTimeout": 120000,"database":"CCAppST01","options":{"encrypt":true}}, function (err) {
		if (err)
			throw err;
	});
	*/
	kvservice.getSecret("connectionString", function (result) {
		dbConfig = JSON.parse(result);		
		//var message = { "isServer": 1, "methodName": "getConnectionString", "message": "Keys are loading from KeyVault. Please wait for secs.....", "userId": 1 };
		//logging.logMessage(message);
		console.log("Keys are loading from KeyVault. Please wait for secs.....");
		connection = mssql.connect(dbConfig, function (err) {			
			if (err) {
				//var exception = { "isServer": 1, "methodName": "getConnectionString", "exceptionDetails": err, "userId": 1 };
    			//logging.logException(exception);
				service.setDBError(err);
				console.log("Connection string loading error...");
				return;
			}
			else {
				console.log("Connection string loaded...");
			}
		});
	});
} catch (ex) {
}

module.exports = connection; 