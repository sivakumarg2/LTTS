//// File Name: settings.js
//// Description: This has the methods to save & retrieve settings
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/

const fs = require('fs');
const sql = require('mssql');
var db = require("./db");

function settings() {
	return {
		saveSetting: saveSetting,
		retrieveSettings: retrieveSettings,
		retrieveSetting: retrieveSetting
	}
}

function retrieveSettings(callBack) {
	try {
		new sql.Request(db)
			.execute('spRetrieveSettings', (error, result) => {
				returnResult(error, result, callBack);
			});
	}
	catch (e) {
		//Exception logging here
	}
}

function retrieveSetting(setting, callBack) {
	try {
		new sql.Request(db)
			.input('setting', sql.NVarChar(100), setting)
			.execute('spRetrieveSetting', (error, result) => {
				returnResultSettings(error, result, callBack);
			});
	}
	catch (e) {
		//Exception logging here
	}
}

function saveSetting(setting, callBack) {
	try {
		console.log("Saving setting: ", setting)
		new sql.Request(db)
			.input('value', sql.NVarChar(100), setting.value)
			.input('setting', sql.NVarChar(100), setting.setting)
			.execute('spInsertSettings', (error, result) => {
				returnResultSettings(error, result, callBack);
			});
	}
	catch (e) {
	}
}

//common function to get results of above calling store procedure
function returnResultSettings(err, result, callBack) {
	if (err == null) {
		var res = {"status": true, data: result.recordset};
		if (callBack) {
			callBack(res);
		}
	}
	else {
		console.log("Error: ", err)
		var res = {"status": false, data: []};
		if (callBack) {
			callBack(res);
		}
	}
}

module.exports = settings();