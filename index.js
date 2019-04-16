//// File Name: index.js
//// Description: This has APIs for client & server communications
//// Version: 1.1
//// Changes
////    1. Cron Scheduler is added
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/

var express = require('express');
var express_enforces_ssl = require('express-enforces-ssl');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var hsts = require('hsts')
//var session = require('express-session');
var session = require('cookie-session')
var csrf = require('csurf');
var cookieParser = require('cookie-parser');
var cron = require('node-cron');
let appInsights = require("applicationinsights");

var login = require('./server/services/login.js');
var user = require('./server/services/users.js');
var twilioInterface = require('./server/twilio_interface/twilioInterface.js');
var G3MSInterface = require('./server/G3MS_interface/G3MSInterface.js');
var tokenHandler = require('./server/helper/tokenHandler.js');
var logging = require('./server/services/logging.js');
var helperLogging = require('./server/helper/logging.js');
var setting = require('./server/services/settings.js');
var reports = require('./server/services/reports.js');
var bizCountryConfig = require('./server/services/country.js');
var callDetails = require('./server/services/callDetails.js');
var shutdown = require('./server/services/ShutdownReason.js');
var kvservice = require('./server/helper/keyVaultService');
var service = require('./server/helper/commonService');
var chatMsg = require('./server/services/chatMessages.js');

var constant = {
    otisCCC: "OtisCCC",
    hstsMaxAge: 15552000,
    sessMaxAge: 3600000,
    scheduleCRON: "*/5 * * * *",
    removeLogsCRON: "0 0 * * *"
};

var siteAddress = "";
function getSiteAddress() {
    kvservice.getSecret("siteAddress", function (result) {
        siteAddress = result;
    });
}

function runScheduler() {
    cron.schedule(constant.scheduleCRON, function () {
        twilioInterface.fetchSyncItems();
    });

    cron.schedule(constant.removeLogsCRON, function () {
        helperLogging.deleteExpiredLogs();
    });
}

getSiteAddress();
runScheduler();

//// Create Express webapp.
var app = express();
app.enable('trust proxy');
var secureRouter = express.Router();
var agent = path.join(__dirname, '/agent/app');
var log = path.join(__dirname, '/log');

//Uncomment when release
app.use(express_enforces_ssl());
app.use(cookieParser(constant.otisCCC, { httpOnly: true }));

//// This will help us to get the data from POST request
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    name: 'sessionID',
    secret: constant.otisCCC,
    cookie: {
        path: '/',
        httpOnly: true,
        secure: false,
        maxAge: constant.sessMaxAge
    },
    rolling: true,
    resave: false,
    saveUninitialized: true
}));
app.use(csrf({ cookie: true }));

app.use(hsts({
    maxAge: constant.hstsMaxAge
}));

//// Register routes and all APIs should start with sec-api
app.use('/sec-api', secureRouter);

app.use(function (req, res, next) {
    try {
        if (siteAddress == "") {
            getSiteAddress();
        }

        var origin = siteAddress;
        if (process.env.allowAll != null) {
            if (process.env.allowAll == 'true') {
                origin = "*";
            }
        }

        res.cookie('XSRF-TOKEN', req.csrfToken());
        res.header('Access-Control-Allow-Origin', (origin == null ? "*" : origin));
        //res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', "DELETE");
        res.header("Access-Control-Allow-Headers", "token, XSRF-TOKEN, isOngoingCall, emailId, userId, elevatorId, incidentId, Origin, x-ms-request-id, x-ms-request-root-id, X-Requested-With, Content-Type, Accept");
        next();
    }
    catch (e) {
    }
});

app.get('/api/get-csrf-token', function (req, res) {
    var keyError = kvservice.getKeyVaultError();
    var dbError = service.getDBError();

    var errObj = null;
    login.getLoadDetails(function (result) {
        res.send({ status: true, error: errObj, "data": result });
    });
});

app.get('/api/inbound-phone-call', (req, res) => {
    console.log("Twilio inbound call: ", req.query);
    const elevatorIdMapping = { "+18602158679": "Test_031", "+18446542364": "Test_032", "+18602158681": "Test_003" };
    const unitId = elevatorIdMapping[req.query.Called];
    console.log("Called To: ", req.query.Called, " unitId: ", unitId);
    req.body.elevatorId = unitId;

    G3MSInterface.elevtorCallBack(req, res, null, () => {
        res.type('text/xml');
        res.send('<?xml version="1.0" encoding="UTF-8"?><Response><Connect><Room>' + unitId + '</Room></Connect></Response>');
    });
});

app.get("/secrets/:sceret_name", (req, res) => {
    kvservice.getSecret(req.params.sceret_name, function (result) {
        res.send({ value: result });
    });
});

app.use('/', express.static(agent));

app.use('/log-file', express.static(log));

////login api, if it is success, Agent status will be changed to Idle, if logged-in user is not Admin
app.post('/api/login', login.login);

//This is included for settings
app.post('/api/save-settings', setting.saveSetting);
app.get('/api/retrieve-setting', function(req, res) {
    console.log("Receiving Request: ", req.query.setting)
    setting.retrieveSetting(req.query.setting, function(result) {
        res.send(result);
    })
});
app.get('/api/win/retrieve-settings', setting.retrieveSettings)

// This is for Simulator and will be removed.
app.get('/api/get-shutdown-reason', shutdown.getShutdownReasonTmp);

// To ping from CPIB bord for communication with CCC
app.get('/api/ccc-communication-check', function (req, res) {
    console.log("*** Requesting ****");
    console.log(req.query);
    res.status(200);
    res.send({ status: true });
});

//middle ware to verify the authentication & authorization
secureRouter.use(tokenHandler.validateAndAuthorize);

app.get('/api/call-disp', (req, response) => {
    var obj = {
        voice_uuid: '2a6169ce-7615-97fa-abb1-9c6e7a356d8a',
        unit_id: 854,
        voice_call_type: 1,
        call_initiator: 'Elevator',
        call_start_datetime: '2018-11-22T11:00:07.827Z',
        call_end_datetime: '2018-11-22T11:00:22Z',
        disposition_code: 20,
        video_quality: 3,
        audio_quality: 3,
        notes: 'Testing call disp'
    }

    G3MSInterface.sendAlarmDisposition(obj, 1, obj.unit_id, function (res) {
        response.send(res);
    });
});

////Update user activity api, will be avialble for everybody
app.post('/api/update-activity', twilioInterface.changeActivity);

////recover password
app.post('/api/recoverPassword', login.recoverPassword);

//// To get video token for CPIB
app.get("/api/get-video-token", twilioInterface.generateToken4CPIB);

//// To initiate phone call
app.get("/api/initiate-phone-call", twilioInterface.initiatePhoneCall);

////To log client exception
app.post('/api/log-exception', logging.logException);

////To log client exception
app.post('/api/log-message', logging.logMessage);

secureRouter.post('/win/token/:identity', twilioInterface.getIdentityTokenFromSIPVideo);

app.get('/api/get-worker-token', twilioInterface.getWorkerTokenForWinApp);

/// to get token on referesh
secureRouter.post('/win/user-token-app/:userId', login.getTokenRefreshForWin);

secureRouter.post('/token', twilioInterface.getIdentityTokenRequest);

secureRouter.post('/win/get-elevator-info/:elevatorId', function (req, resp) {
    console.log("getElevatorInfo: ", req.params.elevatorId)
    G3MSInterface.getElevatorInfo(req.params.elevatorId, function (res) {
        resp.send(res);
    })
});

//Elevator Callback Simulator
secureRouter.post('/win/callback-elevator', G3MSInterface.elevtorCallBackSimulator);

////remove or delete stored cache in server end
//secureRouter.post('/remove-lru-cache', login.removeLRUCache);
secureRouter.post('/remove-lru-cache', login.removeReqSession);

secureRouter.post('/workerToken', twilioInterface.getWorkerTokenRequest);

secureRouter.get('/get-all-languages', login.getAllLanguages);

secureRouter.post('/call-transfer', twilioInterface.transferTask)

////Logout api, will be avialble for everybody
secureRouter.post('/update-user-activity', login.updateUserActivity);

/// Retrieving user from the database
secureRouter.post('/get-user', user.getUser);

/// Adding the new user
secureRouter.post('/add-user', user.addUserDetails);

/// updating the user
secureRouter.post('/edit-user', user.updateUserDetails);

/// updating the user preferences
secureRouter.post('/edit-user-preferences', user.updateUserPreferences);

/// updating the user
secureRouter.post('/update-language', user.updateLanguage);

/// Deleting the user
//secureRouter.delete('/delete-user', user.deleteUserDetials);

///download the audio & video from twilio to  CCC DB
secureRouter.post('/download-audio-video', callDetails.downloadAudioVideo);

///Change password api, will be available for Agent, Supervisor & Admin
secureRouter.post('/change-password', login.changePassword);

////adding country configuration details api, and will be available for admin & supervisor
secureRouter.post('/add-country-config', bizCountryConfig.addCountryConfiguration);// secure routing

////Get all country config details api, will be available for Admin
secureRouter.post('/get-all-country-config', bizCountryConfig.getAllCountryConfigDetails);// secure routing

////Delete country config by Id api, will be available for Admin
secureRouter.delete('/delete-country-config-byId', bizCountryConfig.deleteCountryConfigurationById);// secure routing

////edit country config by Id api, will be available for Admin
secureRouter.post('/edit-country-config-byId', bizCountryConfig.editCountryConfigurationById);// secure routing

////retrieve  exceptions api, will be available for Admin
secureRouter.post('/retrieve-exception-detail', logging.getExceptionDetails);// secure routing

////G3MS communication
////To get the building information
secureRouter.post('/get-elevator-info', G3MSInterface.getElevatorDetails);

/// to get token on referesh: for testing
app.post('/api/refresh-token', login.getTokenRefreshForTesting);

/// to get token on referesh
secureRouter.post('/refresh-token', login.getTokenRefresh);

////Inserting call details (CallIncidents & Call details) to DB. This will be the first API for the call
secureRouter.post('/insert-call-details', callDetails.insertCallDetails);

secureRouter.post('/update-call-details', callDetails.updateCallDetails);

////Updating Agent's activity during different stages of the call, like accepted, completed etc.
secureRouter.post('/update-call', callDetails.updateCall);

////Retrieving call details country wise
secureRouter.post('/retrieve-call-details-country', callDetails.retrieveCallDetailsForCountry);

////get worker report by api, will be available for Admin
secureRouter.post('/get-call-summary', callDetails.getCallSummaryByUserId);

////get worker report by api, will be available for Admin
secureRouter.post('/export-callsummary-excel', callDetails.getCallSummaryByUserIdForExport);

secureRouter.post('/get-call-detail', callDetails.getCallDetail);

////retrieving call details incident wise
secureRouter.post('/retrieve-call-details-incident', callDetails.retrieveCallDetailsForIncident);

////retrieving call details incident wise
secureRouter.post('/retrieve-call-details-elevator', callDetails.retrieveCallDetailsForElevator);

//To verify user validation
secureRouter.post('/token-verification', login.verifyToken);

////Api is used to save call disposition details to DB. This is the final API for the call.
secureRouter.post('/save-call-disposition', callDetails.saveCallDisposition);

secureRouter.post('/save-call-message', callDetails.saveMessage);

//Plesae change the api to secure api by changing app to secureRouter
secureRouter.post('/insert-chat-message-details', callDetails.insertChatMsgDetails);

secureRouter.post('/retrieve-videos-duration', callDetails.retrieveVideoDetails);

secureRouter.post('/insert-calldispstn-details', callDetails.insertCallDispstnDetails);
secureRouter.post('/retrieve-call-dispstn-details', callDetails.retrieveCallDispstnDetails);
secureRouter.delete('/delete-call-dispstn-details', callDetails.deleteCallDispstnDetails);

secureRouter.post('/add-country-disposition', callDetails.addCountryDisposition);

////call disposition data
secureRouter.post('/retrieve-call-disposition', callDetails.retrieveCallDispositionData);
secureRouter.post('/save-call-disposition-data', callDetails.saveCallDispositionData);
secureRouter.delete('/delete-call-disposition', callDetails.deleteCallDispositionData);

//Shutdown Reason
secureRouter.post('/insert-shutdown-reason', shutdown.insertShutdownReason);
secureRouter.post('/retrieve-shutdown-reason', shutdown.retrieveShutdownReason);
secureRouter.delete('/delete-shutdown-reason', shutdown.deleteShutdownReason);

//Country Shutdown Reason
secureRouter.post('/retrieve-country-shutdown-reason', shutdown.retrieveCountryShutdownReason);
secureRouter.post('/save-country-shutdown-reason', shutdown.saveCountryShutdownReason);
secureRouter.delete('/delete-country-shutdown-reason', shutdown.deleteCountryShutdownReason);

//Chat Messages
secureRouter.post('/insert-chat-message', chatMsg.insertChatMessage);
secureRouter.post('/retrieve-chat-message', chatMsg.retrieveChatMessages);
secureRouter.delete('/delete-chat-message', chatMsg.deleteChatMessage);

//Country Chat Messages
secureRouter.post('/retrieve-country-chat-message', chatMsg.retrieveCountryQuestionText);
secureRouter.post('/save-country-chat-message', chatMsg.saveCountryQuestionText);
secureRouter.delete('/delete-country-chat-message', chatMsg.deleteCountryQuestionText);

//Reports to fetch the Worker Statistcs
secureRouter.post('/get-worker-report', reports.getWorkerStatistics);

//To get agents report by date & agent name
secureRouter.post('/get-agents-report', reports.getAgentsReport);

//Reports to fetch the Workers Statistcs
secureRouter.post('/get-workers-report', reports.getWorkersStatistics);

//Reports to fetch the Workers logged in for supervisor
secureRouter.post('/get-workers-report-for-supervisor', reports.getWorkersStatusForSupervisor);

//Reports to fetch the Workers logged in details for supervisor
secureRouter.post('/get-workers-report-details-for-supervisor', reports.getWorkersStatusDetailsForSupervisor);

secureRouter.post('/get-workers-call-activity', reports.getWorkersCallActivity);

//Elevator controls
secureRouter.post('/start-stop-elevator-video', G3MSInterface.startStopElevatorVideo);

//Elevator Callback Simulator
secureRouter.post('/callback-elevator-simulator', G3MSInterface.elevtorCallBackSimulator);

// Elevator callback
secureRouter.post('/callback-elevator', (req, res) => {
    console.log("Callback Elevator: Current UserId: ", req.get('userId'))
    var input = { userId: req.get('userId'), roomName: req.body.elevatorId, mediaRegion: req.body.mediaRegion };
    twilioInterface.createRoom(input, (result) => {
        if (result.status) {
            G3MSInterface.elevtorCallBack(req, res, result.roomSID);
        }
        else {
            res.send(result);
        }
    });
});

secureRouter.post('/modify-elevator-micgain', G3MSInterface.modifyMicGain);

secureRouter.post('/modify-elevator-speakervolume', G3MSInterface.modifySpeakerVolume);

//map
secureRouter.post('/get-geoCode-address', callDetails.getGeoAddress);

//To catch exception
process.on("uncaughtException", (err) => {
    if (err) {
        ////Activity Logging here, passing with Admin UserId
        var exception = { "isServer": 1, "methodName": "serverException", "exceptionDetails": err, "userId": 1 };
        helperLogging.logException(exception, () => {});
    }
});

//// Create Server and assign port to that
var server = http.createServer(app);
var port = process.env.PORT || 1351;
server.listen(port, () => {
    var message = { "isServer": 1, "methodName": "serverRunning", "message": "Express server is running", "userId": 1 };
    helperLogging.logMessage(message);
    console.log('Express server running on *:' + port);
});
console.log("Server running at http://localhost:%d", port);
