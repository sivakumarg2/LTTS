//// File Name: config.js
//// Description: This will retrieve the application settings from app-settings/ app.config.
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/

'use strict';

var fs = require('fs');
//var logging = require('../helper/logging.js');
//console.log(logging)
function readConfig() {
  var config = {};

  if (process.env.idleSid != null) {
    var appDetails = JSON.parse(fs.readFileSync('app.config', 'utf8'));
    config = {
      idleSid: process.env.idleSid,
      busySid: process.env.busySid,
      deleteSid: process.env.deleteSid,
      offlineSid: process.env.offlineSid,
      reservSid: process.env.reservSid,
      sendGridKey: process.env.sendGridKey,
      bingMapMasterKey: process.env.bingMapMasterKey,
      bingMapQueryKey: process.env.bingMapQueryKey,
      grant_type: process.env.grant_type,
      g3msUri: process.env.g3msUri,
      g3msApiTokenURI: process.env.g3msApiTokenURI,
      g3msClientId: process.env.g3msClientId,
      g3msClientSecret: process.env.g3msClientSecret,
      g3msTenantId: process.env.g3msTenantId,
      g3msResourceId: process.env.g3msResourceId,
      'Content-Type': process.env["Content-Type"],
      Secured: process.env.Secured,
      cimsClientId: process.env.cimsClientId,
      cimsUri: process.env.cimsUri,
      cimsApiTokenURI: process.env.cimsApiTokenURI,
      cimsTenantId: process.env.cimsTenantId,
      cimsResourceId: process.env.cimsResourceId,
      cimsclientSecret: process.env.cimsclientSecret,
      methodName: process.env.methodName,
      source: process.env.source,
      component: process.env.component,
      channel: process.env.channel,
      keyVaultClientid: process.env.keyVaultClientid,
      keyVaultClientSecret: process.env.keyVaultClientSecret,
      keyVaultUri: process.env.keyVaultUri,
      isOnlyAudio: process.env.isOnlyAudio,
      videoCodec: process.env.videoCodec,
      audioCodec: process.env.audioCodec,
      logRetentionPeriod: (process.env.logRetentionPeriod == null ? 10 : process.env.logRetentionPeriod),
      switchOffLogs: (process.env.switchOffLogs == null ? false : process.env.switchOffLogs),
      statusCallbackURL: process.env.statusCallbackURL,
      twiMLHandler: process.env.twiMLHandler,
      newUserLinkExpiredHours: process.env.newUserLinkExpiredHours,
      pwdResetLinkExpiredHours: process.env.pwdResetLinkExpiredHours,
      reservationTimeout: process.env.reservationTimeout,
      appName: appDetails.appName,
      version: appDetails.version,
      appVersion: appDetails.appVersion,
      buildDate: appDetails.buildDate,
      retryTimeout: appDetails.retryTimeout
    };

    //var message = { "isServer": 1, "methodName": "loadConfig", "message": "Config loaded from Azure", "userId": 1 };
    //logging.logMessage(message);
  }
  else {
    config = JSON.parse(fs.readFileSync('app.config', 'utf8'));
    //var message = { "isServer": 1, "methodName": "loadConfig", "message": "Config loaded from app.config", "userId": 1 };
    //logging.logMessage(message);
  }

  return config;
}
module.exports = readConfig();