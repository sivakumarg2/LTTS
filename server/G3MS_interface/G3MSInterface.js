//// File Name: G3MSInterface.js
//// Description: This has the methods to communicate with G3MS & CIMS for call related functionalities
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/

"use strict";
var helperLogging = require("../helper/logging.js");
const PB_SCHEMA_DIR = "server/G3MS_interface/schemas";
var APP_Config = require("../configs/config.js");
var dbCalls = require('../dataaccess_layer/callDetails.js');
var defaultUUID = "09197062-9738-4071-9bee-6d745485e1a2";

const G3MS_URI = APP_Config.g3msUri;
const G3MS_API_URL = "/api/G3MS"; //G3MS Api path

const CIMS_URI = APP_Config.cimsUri;
const CIMS_API_URL = "/api/IoT"; //CIMS Api path
const https = require("https");
var protobuf = require("protocol-buffers");
var fs = require("fs");
const azureClientCredentials = require('azure-client-credentials');
var messages = require('../message/callMessage.js');

var sendMessage = protobuf(
  fs.readFileSync(PB_SCHEMA_DIR + "/ccc_message.proto")
);

function G3MSInteraction() {
  return {
    getElevatorDetails: getElevatorDetails,
    getElevatorInfo: getElevatorInfo,
    startStopElevatorVideo: startStopElevatorVideo,
    elevtorCallBack: elevatorCallBack,
    elevatorHangup: elevatorHangup,
    initiateCPIBCall: initiateCall,
    modifyMicGain: modifyMicGain,
    modifySpeakerVolume: modifySpeakerVolume,
    sendChatMsg: sendChatMsg,
    sendAlarmDisposition: sendAlarmDisposition,
    elevtorCallBackSimulator: elevtorCallBackSimulator
  };
}

var info = {};
function getElevatorDetailsFromDB(response, elevatorId, userId, unitInfo, isUnitInfoLoaded) {
  console.log("Getting elevator details from db: ", elevatorId);
  logMessage("getElevatorDetails", messages.getElevatorDetailsFromDB, userId, elevatorId);
  var infor = {
    contractInfo: {
      uuid: defaultUUID,
      controllerType: "CT Type",
      buildingName: "",
      buildingAddress: "",
      contractInformation: "BWER125697",
      contractStatus: "Active",
      customerName: "",
      otisBranch: "Farmington"
    }
  };
  dbCalls.retrieveCallDetailsByElevatorId({ elevatorId: elevatorId, currentUserId: userId }, function (result) {
    if (result.recordset.length > 0) {      
      if(isUnitInfoLoaded && unitInfo != null) {
        logMessage("getElevatorDetails", messages.gotElevatorDetailsButUUID, userId, elevatorId);
        infor = {
          contractInfo: {
            uuid: result.recordset[0].alarmId,
            controllerType: unitInfo.controllerType,
            buildingName: unitInfo.buildingName,
            buildingAddress: unitInfo.buildingAddress,
            contractInformation: unitInfo.contractInformation,
            contractStatus: unitInfo.contractStatus,
            customerName: unitInfo.customerName,
            otisBranch: unitInfo.otisBranch
          }
        };
      }
      else {
        logMessage("getElevatorDetails", messages.getElevatorDetailsFromDB, userId, elevatorId);
        infor = {
          contractInfo: {
            uuid: result.recordset[0].alarmId,
            controllerType: result.recordset[0].controllerType,
            buildingName: result.recordset[0].buildingName,
            buildingAddress: result.recordset[0].buildingAddress,
            contractInformation: result.recordset[0].contractInformation,
            contractStatus: result.recordset[0].contractStatus,
            customerName: result.recordset[0].customerName,
            otisBranch: result.recordset[0].otisBranch
          }
        };
      }
    }
    response.send({
      status: true,
      data: infor
    });
  });
}

function getAccessToken(callBack) {
  try {
    var tenant = APP_Config.g3msTenantId; // AAD Tenant name.
    var clientid = APP_Config.g3msClientId; // Application Id of app registered under AAD.
    var clientSecret = APP_Config.g3msClientSecret; // Secret generated for app. Read this environment variable.
    var resource = APP_Config.g3msResourceId; // URI that identifies the resource for which the token is valid.

    const credentials = new azureClientCredentials(tenant, clientid, clientSecret);
    credentials.getAccessToken(resource).then(token => {
      callBack(null, token);
    }).catch(err => {
      callBack(err, null);
    });
  } catch (exception) {
    console.log("G3MS API Exceptions", exception.message);
  }
}

function getCIMSAccessToken(callBack) {
  try {
    const tenant = APP_Config.cimsTenantId;
    const clientid = APP_Config.cimsClientId;
    var clientSecret = APP_Config.cimsclientSecret;
    var resource = APP_Config.cimsResourceId;

    const credentials = new azureClientCredentials(tenant, clientid, clientSecret);
    credentials.getAccessToken(resource).then(token => {
      callBack(null, token);
    }).catch(err => {
      callBack(err, null);
    });
  } catch (exception) {
    console.log("CIMS API Exceptions", exception.message);
  }
}

function getElevatorDetails(request, response) {
  try {
    console.log("Getting Elevator Details Started.")
    logMessage("getElevatorDetails", messages.getAccessTknInitiated, request.get('userId'), request.query.elevatorId);
    getAccessToken(function (err, tokenResponse) {
      if (err) {
        logMessage("getElevatorDetails", messages.accessTknErrorUsedDefault + " " + err.stack, request.get('userId'), request.query.elevatorId);
        logException("getElevatorDetails", messages.accessTknErrorUsedDefault + " " + err.stack, request.get("userId"), request.query.elevatorId);
        getElevatorDetailsFromDB(response, request.query.elevatorId, request.get('userId'), null, false);
      } else {

        logMessage("getElevatorDetails", messages.gotAccessTknG3MS, request.get('userId'), request.query.elevatorId);
        var options = {
          host: G3MS_URI,
          path: G3MS_API_URL + "/GetUnitInfoForCCC/" + request.query.elevatorId,
          method: "GET",
          headers: {
            Authorization: "bearer " + tokenResponse
          },
          timeout: (APP_Config.retryTimeout == null? 3000: parseInt(APP_Config.retryTimeout))
        };

        console.log("Option is: ", options)
        logMessage("getElevatorDetails", messages.G3MSCommunicationStarted, request.get('userId'), request.query.elevatorId);
        var req = https.request(options, function (res) {
          //console.log("Error : ", res);
          console.log("Got Response from G3MS: ", res.statusCode)
          if (res.statusCode == 200) {
            logMessage("getElevatorDetails", messages.gotUnitInfoSuccess, request.get('userId'), request.query.elevatorId);

            var data = []; // List of Buffer objects
            res.on("data", function (chunk) {
              logMessage("getElevatorDetails", messages.elevatorInfoCollStarted, request.get('userId'), request.query.elevatorId);
              data.push(chunk); // Append Buffer object
            });

            res.on("end", function () {
              logMessage("getElevatorDetails", messages.elevatorInfoCollected, request.get('userId'), request.query.elevatorId);

              data = Buffer.concat(data);

              //create instance of voice_unit_information proto schema
              var unitInformationInput = protobuf(
                fs.readFileSync(
                  PB_SCHEMA_DIR + "/voice_unit_information.proto"
                )
              );

              //decode the response using the UnitInformation message object
              logMessage("getElevatorDetails", messages.decodeOfUnitInfoStarted, request.get('userId'), request.query.elevatorId);
              var message = unitInformationInput.UnitInformation.decode(data);

              console.log("Got Message: ", message);
              logMessage("getElevatorDetails", messages.unitInfoDecoded + JSON.stringify(message), request.get('userId'), request.query.elevatorId);
              var addressBuilder = function (preva, newa) {
                newa = (newa == null ? "" : newa);
                if (preva != "") {
                  if (newa != "") {
                    preva += ", " + newa
                  }
                }
                else {
                  preva = newa;
                }

                return preva;
              }

              var address = "";
              address = addressBuilder("", message.address1);
              address = addressBuilder(address, message.address2);
              address = addressBuilder(address, message.city);
              address = addressBuilder(address, message.state);
              address = addressBuilder(address, message.postal_code);
              message.address = address;

              var deviceMessage = protobuf(
                fs.readFileSync(PB_SCHEMA_DIR + "/deviceInput.proto")
              );

              // input_type is hardcode for testing purpose.
              var g3MsData = deviceMessage.DeviceInput.encode({
                input_type: 3,
                elevator_number: request.query.elevatorId
              });

              getAccessToken(function (err, tokenResponse) {
                if (err) {
                  logMessage("getElevatorDetails", messages.gettingUUIDElevator + err.stack, request.get('userId'), request.query.elevatorId);
                  return "";
                } else {
                  var options = {
                    host: G3MS_URI,
                    path: G3MS_API_URL + "/GetDeviceByUnitNumber",
                    method: "POST",
                    headers: {
                      Authorization: "bearer " + tokenResponse
                    },
                    timeout: (APP_Config.retryTimeout == null? 3000: parseInt(APP_Config.retryTimeout))
                  };

                  logMessage("getElevatorDetails", messages.callGetDeviceByUnitNumber + options.host, request.get('userId'), request.query.elevatorId);
                  var req = https.request(options, function (res) {
                    logMessage("getElevatorDetails", messages.gotResponseForGetDeviceByUnitNum + res.statusCode, request.get('userId'), request.query.elevatorId);

                    if (res.statusCode == 200) {
                      var data = []; // List of Buffer objects
                      res.on("data", function (chunk) {
                        data.push(chunk); // Append Buffer object
                      });

                      res.on("end", function () {
                        data = Buffer.concat(data); // Make one large Buffer of it
                        var deviceMessage = protobuf(
                          fs.readFileSync(PB_SCHEMA_DIR + "/DeviceInfo.proto")
                        );

                        logMessage("getElevatorDetails", messages.startDecodingG3MSResp, request.get('userId'), request.query.elevatorId);
                        var objDeviceInfo = deviceMessage.DeviceInfo.decode(data);
                        if (objDeviceInfo.devices.length > 0) {
                          logMessage("getElevatorDetails", messages.availableDeviceInfo + objDeviceInfo.devices[0], request.get('userId'), request.query.elevatorId);
                          logMessage("getElevatorDetails", messages.sendingDeviceCmdtoCIMS + objDeviceInfo.devices[0].uuid, request.get('userId'), request.query.elevatorId);

                          info = {
                            contractInfo: {
                              uuid: objDeviceInfo.devices[0].uuid,
                              controllerType: message.car_number,
                              buildingName: message.building_name,
                              buildingAddress: address,
                              contractInformation: message.contract_number,
                              contractStatus: message.contract_status,
                              customerName: message.customer_name,
                              otisBranch: message.otis_branch
                            }
                          };
                          logMessage("getElevatorDetails", messages.elevatorInfoSentBack + JSON.stringify(info), request.get('userId'), request.query.elevatorId);
                          response.send({
                            status: true,
                            data: info
                          });

                        } else {
                          logException("getElevatorDetails", messages.noDeviceFound, request.get('userId'), request.query.elevatorId);
                          getElevatorDetailsFromDB(response, request.query.elevatorId, request.get('userId'), message, true);
                        }
                      });
                    }
                    else {
                      logException("getElevatorDetails", messages.noDeviceFound, request.get('userId'), request.query.elevatorId);
                      getElevatorDetailsFromDB(response, request.query.elevatorId, request.get('userId'), message, true);
                    }
                  });
                  req.write(g3MsData);
                  req.on("error", function (err) {
                    // Handle error
                    logException("getElevatorDetails", err, request.get('userId'), request.query.elevatorId);
                    getElevatorDetailsFromDB(response, request.query.elevatorId, request.get('userId'), message, true);
                  });
                  req.on('timeout', () => {
                    logException("getElevatorDetails", messages.requestGetDeviceByUnitTimeout, request.get('userId'), request.query.elevatorId);
                    getElevatorDetailsFromDB(response, request.query.elevatorId, request.get('userId'), message, true);
                  });
                  req.end();
                }
              });
            });
          } else {
            logMessage("getElevatorDetails", messages.gotUnitInfoFailed, request.get('userId'), request.query.elevatorId);
            logException("getElevatorDetails", messages.gotUnitInfoFailedExp + res.statusCode, request.get("userId"), request.query.elevatorId);
            getElevatorDetailsFromDB(response, request.query.elevatorId, request.get('userId'), null, false);
          }
        });
        req.on("error", function (err) {
          // Handle error
          logException("getElevatorDetails", err, request.get('userId'), request.query.elevatorId);
          getElevatorDetailsFromDB(response, request.query.elevatorId, request.get('userId'), null, false);
        });
        req.on('timeout', () => {
          logException("getElevatorDetails", messages.requestGetUnitInfoTimeout, request.get('userId'), request.query.elevatorId);
          getElevatorDetailsFromDB(response, request.query.elevatorId, request.get('userId'), null, false);
        });
        req.end();
      }
    });
  } catch (exception) {
    logMessage("getElevatorDetails", messages.gotUnexpectedException, request.get('userId'), request.query.elevatorId);
    logException("getElevatorDetails", messages.gotUnexpectedException, request.get("userId"), request.query.elevatorId);
    getElevatorDetailsFromDB(response, request.query.elevatorId, request.get('userId'), null, false);
  }
}

function getElevatorInfo(elevatorId, callBack) {
  var info = {
    contractInfo: {
      buildingName: messages.errWhileRetrievingInfo,
      buildingAddress: ""
    }
  };

  try {
    getAccessToken(function (err, tokenResponse) {
      if (err) {
        console.log("Getting Access Token Error: ", err);
        callBack({
          status: true,
          data: info
        });
      } else {

        var options = {
          host: G3MS_URI,
          path: G3MS_API_URL + "/GetUnitInfoForCCC/" + elevatorId,
          method: "GET",
          headers: {
            Authorization: "bearer " + tokenResponse
          }
        };

        console.log("Option is: ", options)
        var req = https.request(options, function (res) {
          //console.log("Error : ", res);
          console.log("Got Response from G3MS: ", res.statusCode)
          if (res.statusCode == 200) {

            var data = []; // List of Buffer objects
            res.on("data", function (chunk) {
              data.push(chunk); // Append Buffer object
            });

            res.on("end", function () {

              data = Buffer.concat(data);

              //create instance of voice_unit_information proto schema
              var unitInformationInput = protobuf(
                fs.readFileSync(
                  PB_SCHEMA_DIR + "/voice_unit_information.proto"
                )
              );

              //decode the response using the UnitInformation message object
              var message = unitInformationInput.UnitInformation.decode(data);

              console.log("Got Message: ", message);
              var addressBuilder = function (preva, newa) {
                newa = (newa == null ? "" : newa);
                if (preva != "") {
                  if (newa != "") {
                    preva += ", " + newa
                  }
                }
                else {
                  preva = newa;
                }

                return preva;
              }

              var address = addressBuilder("", message.address1);
              address = addressBuilder(address, message.address2);
              address = addressBuilder(address, message.city);
              address = addressBuilder(address, message.state);
              address = addressBuilder(address, message.postal_code);

              console.log("Message: ", message);
              info = {
                contractInfo: {
                  uuid: defaultUUID,
                  controllerType: message.car_number,
                  buildingName: message.building_name,
                  buildingAddress: address,
                  contractInformation: message.contract_number,
                  contractStatus: message.contract_status,
                  customerName: message.customer_name,
                  otisBranch: message.otis_branch
                }
              };

              callBack({
                status: true,
                data: info
              });

            });
          } else {
            callBack({
              status: true,
              data: info
            });
          }
        });
        req.on("error", function (err) {
          // Handle error
          logException("getElevatorInfo", 1, elevatorId);
          callBack({
            status: true,
            data: info
          });
        });
        req.end();
      }
    });
  } catch (exception) {
    callBack({
      status: true,
      data: info
    });
  }
}

function startStopElevatorVideo(request, response) {
  try {
    logActivity("startStopElevatorVideo", request.get("userId"), request.get("elevatorID"));
    console.log("start or stop the elevator video: ", request.body);
    response.send({
      status: true,
      data: info
    });
  } catch (exception) {
    response.send({
      status: false,
      err: exception.message,
      data: undefined
    });
  }
}

function elevtorCallBackSimulator(request, response, roomSid) {
  try {
    //logActivity("elevtorCallBack", request.get("userId"), request.get("elevatorID"));
    var objAlarm = { 'elevatorId': request.query.elevatorId, "currentUserId": request.get("userId") }
    response.send({
      status: true,
      data: {
        join_room: { roomname: request.query.elevatorId, sipUri: request.query.sipUri }
      },
    });
  } catch (exception) {
    response.send({
      status: false,
      err: exception,
      data: undefined
    });
  }
}

function elevtorCallBackSimulator1(request, response) {
  try {
    console.log(request.body.elevatorId, request.body.sipUri)
    var elevatorId = request.body.elevatorId;
    var userId =  request.body.userId;
    logMessage("elevatorCallBackApp", messages.startElevatorCallBack, userId, elevatorId);
    var deviceMessage = protobuf(
      fs.readFileSync(PB_SCHEMA_DIR + "/deviceInput.proto")
    );

    var objAlarm = { 'elevatorId': elevatorId, "currentUserId": userId }
    logMessage("elevatorCallBack", messages.gettingExistingAlarmID, userId, elevatorId);
    dbCalls.getAlarmIDByElevatorId(objAlarm, function (result) {
      if (result.recordset.length <= 0) {
        console.log("No record in database");
        returnResponse(null, response, {
          status: false,
          data: {},
          err: "error"
        });
      }
      else {
        logMessage("elevatorCallBack", messages.startDeviceMsgEncoding, userId, elevatorId);
        var data = deviceMessage.DeviceInput.encode({
          input_type: 3,
          elevator_number: request.body.elevatorId
        });

        logMessage("elevatorCallBack", messages.initiateGetAccessTkn, userId, elevatorId);
        //Access token to call G3MS API
        getAccessToken(function (err, tokenResponse) {
          if (err) {
            logMessage("elevatorCallBack", messages.gettingAccessTknErr + err.stack, userId, elevatorId);
            return "";
          } else {
            var options = {
              host: G3MS_URI,
              path: G3MS_API_URL + "/GetDeviceByUnitNumber",
              method: "POST",
              headers: {
                Authorization: "bearer " + tokenResponse
              }
            };

            logMessage("elevatorCallBack", messages.callGetDeviceByUnitNumber + options.host, userId, elevatorId);
            var req = https.request(options, function (res) {
              logMessage("elevatorCallBack", messages.gotResponseForGetDeviceByUnitNum + res.statusCode, userId, elevatorId);

              if (res.statusCode == 200) {
                var data = []; // List of Buffer objects
                res.on("data", function (chunk) {
                  data.push(chunk); // Append Buffer object
                });

                res.on("end", function () {
                  data = Buffer.concat(data); // Make one large Buffer of it
                  var deviceMessage = protobuf(
                    fs.readFileSync(PB_SCHEMA_DIR + "/DeviceInfo.proto")
                  );

                  logMessage("elevatorCallBack", messages.startDecodingG3MSResp, userId, elevatorId);
                  var objDeviceInfo = deviceMessage.DeviceInfo.decode(data);
                  if (objDeviceInfo.devices.length > 0) {
                    var appMessage = protobuf(
                      fs.readFileSync(PB_SCHEMA_DIR + "/ccc_message_winapp.proto")
                    );
                    var encodedMessage = appMessage.CCCMessage.encode({
                      join_room: {
                        roomname: objDeviceInfo.devices[0].unit_number,
                        sip_uri: request.body.sipUri
                      }
                    });

                    logMessage("elevatorCallBack", messages.availableDeviceInfo + JSON.stringify(objDeviceInfo.devices[0]), userId, elevatorId);
                    logMessage("elevatorCallBack", messages.sendingDeviceCmdtoCIMS + objDeviceInfo.devices[0].uuid, userId, elevatorId);
                    sendCommandToCIMS(objDeviceInfo.devices[0].uuid, encodedMessage, function (res) {
                      logMessage("elevatorCallBack", messages.gotRespFromCIMS + res.statusCode, userId, elevatorId);

                      if (res.status) {
                        var decodeMessage = appMessage.CCCMessage.decode(res.data);
                        returnResponse(null, response, {
                          status: true,
                          data: decodeMessage,
                          alarmId: result.recordset[0].alarmId,
                          isDBGenerated: result.recordset[0].isDBGenerated,
                          failure: result.recordset[0].failure
                        });
                      } else {
                        returnResponse(null, response, {
                          status: false,
                          data: res.data,
                          err: res.err
                        });
                      }
                    }, "elevatorCallBack", userId, elevatorId);
                  } else {
                    logException("elevatorCallBack", messages.noDeviceFound, userId, elevatorId);
                    returnResponse(null, response, {
                      status: false,
                      data: undefined,
                      err: res = {
                        statusCode: 400
                      }
                    });
                  }
                });
              }
              else {
                returnResponse(null, response, {
                  status: false,
                  err: res = {
                    statusCode: res.statusCode
                  }
                });
              }
            });
            req.write(data);
            req.on("error", function (err) {
              // Handle error
              logException("elevatorCallBack", err, userId, elevatorId);
              returnResponse(null, response, {
                status: false,
                err: err,
                data: undefined
              });
            });
            req.end();
          }
        });
      }
    }, null);
  } catch (exception) {
    logException("elevatorCallBack", exception.message, userId, request.body.elevatorId);
    returnResponse(null, response, {
      status: false,
      err: exception,
      data: undefined
    });
  }
}

function initiateCall(request, response) {
  try {
    var deviceMessage = protobuf(
      fs.readFileSync(PB_SCHEMA_DIR + "/deviceInput.proto")
    );

    // input_type is hardcode for testing purpose.
    var data = deviceMessage.DeviceInput.encode({
      input_type: 3,
      elevator_number: request.query.elevatorId
    });

    //Access token to call G3MS API
    getAccessToken(function (err, tokenResponse) {
      if (err) {
        return "";
      } else {
        var options = {
          host: G3MS_URI,
          path: G3MS_API_URL + "/GetDeviceByUnitNumber",
          method: "POST",
          headers: {
            Authorization: "bearer " + tokenResponse
          }
        };
        var req = https.request(options, function (res) {
          if (res.statusCode == 200) {
            var data = []; // List of Buffer objects
            res.on("data", function (chunk) {
              data.push(chunk); // Append Buffer object
            });

            res.on("end", function () {
              data = Buffer.concat(data); // Make one large Buffer of it
              var deviceMessage = protobuf(
                fs.readFileSync(PB_SCHEMA_DIR + "/DeviceInfo.proto")
              );
              var objDeviceInfo = deviceMessage.DeviceInfo.decode(data);
              if (objDeviceInfo.devices.length > 0) {
                var encodedMessage = sendMessage.CCCMessage.encode({
                  join_room: {
                    roomname: objDeviceInfo.devices[0].unit_number
                  }
                });

                sendCommandToCIMS(objDeviceInfo.devices[0].uuid, encodedMessage, function (res) {
                  if (res.status) {
                    var decodeMessage = sendMessage.CCCMessage.decode(res.data);
                    response.send({
                      status: true,
                      data: decodeMessage,
                      alarmId: ""
                    });
                  } else {
                    response.send({
                      status: false,
                      data: res.data,
                      err: res.err
                    });
                  }
                });

              } else {
                response.send({
                  status: false,
                  data: undefined
                });
              }
            });
          } else {
            response.send({
              status: false,
              data: undefined
            });
          }
        });
        req.write(data);
        req.on("error", function (err) {
          // Handle error
          response.send({
            status: false,
            err: err,
            data: undefined
          });
        });
        req.end();
      }
    });
  } catch (exception) {
    response.send({
      status: false,
      err: exception,
      data: undefined
    });
  }
}

function returnResponse(callBack, response, json) {
  if (callBack != null) {
    callBack();
  }
  else {
    response.send(json)
  }
}

function elevatorCallBack(request, response, roomSid, callBack) {
  try {
    var userId = request.get("userId") == null ? 1 : request.get("userId");
    var elevatorId = request.body.elevatorId;
    logActivity("elevatorCallBack", userId, elevatorId);
    logMessage("elevatorCallBack", messages.startElevatorCallBack, userId, elevatorId);
    var deviceMessage = protobuf(
      fs.readFileSync(PB_SCHEMA_DIR + "/deviceInput.proto")
    );

    var objAlarm = { 'elevatorId': elevatorId, "currentUserId": userId }
    logMessage("elevatorCallBack", messages.gettingExistingAlarmID, userId, elevatorId);
    dbCalls.getAlarmIDByElevatorId(objAlarm, function (result) {
      if (result.recordset.length <= 0) {
        returnResponse(callBack, response, {
          status: false,
          data: {},
          err: "error"
        });
      }
      else {
        logMessage("elevatorCallBack", messages.startDeviceMsgEncoding, userId, elevatorId);
        var data = deviceMessage.DeviceInput.encode({
          input_type: 3,
          elevator_number: request.body.elevatorId
        });

        logMessage("elevatorCallBack", messages.initiateGetAccessTkn, userId, elevatorId);
        //Access token to call G3MS API
        getAccessToken(function (err, tokenResponse) {
          if (err) {
            logMessage("elevatorCallBack", messages.gettingAccessTknErr + err.stack, userId, elevatorId);
            return "";
          } else {
            var options = {
              host: G3MS_URI,
              path: G3MS_API_URL + "/GetDeviceByUnitNumber",
              method: "POST",
              headers: {
                Authorization: "bearer " + tokenResponse
              }
            };

            logMessage("elevatorCallBack", messages.callGetDeviceByUnitNumber + options.host, userId, elevatorId);
            var req = https.request(options, function (res) {
              logMessage("elevatorCallBack", messages.gotResponseForGetDeviceByUnitNum + res.statusCode, userId, elevatorId);

              if (res.statusCode == 200) {
                var data = []; // List of Buffer objects
                res.on("data", function (chunk) {
                  data.push(chunk); // Append Buffer object
                });

                res.on("end", function () {
                  data = Buffer.concat(data); // Make one large Buffer of it
                  var deviceMessage = protobuf(
                    fs.readFileSync(PB_SCHEMA_DIR + "/DeviceInfo.proto")
                  );

                  logMessage("elevatorCallBack", messages.startDecodingG3MSResp, userId, elevatorId);
                  var objDeviceInfo = deviceMessage.DeviceInfo.decode(data);
                  if (objDeviceInfo.devices.length > 0) {
                    var encodedMessage = sendMessage.CCCMessage.encode({
                      join_room: {
                        roomname: objDeviceInfo.devices[0].unit_number
                      }
                    });

                    logMessage("elevatorCallBack", messages.availableDeviceInfo + JSON.stringify(objDeviceInfo.devices[0]), userId, elevatorId);
                    logMessage("elevatorCallBack", messages.sendingDeviceCmdtoCIMS + objDeviceInfo.devices[0].uuid, userId, elevatorId);
                    sendCommandToCIMS(objDeviceInfo.devices[0].uuid, encodedMessage, function (res) {
                      logMessage("elevatorCallBack", messages.gotRespFromCIMS + res.statusCode, userId, elevatorId);

                      if (res.status) {
                        var decodeMessage = sendMessage.CCCMessage.decode(res.data);
                        returnResponse(callBack, response, {
                          status: true,
                          data: decodeMessage,
                          alarmId: result.recordset[0].alarmId,
                          isDBGenerated: result.recordset[0].isDBGenerated,
                          failure: result.recordset[0].failure,
                          roomSid: roomSid
                        });
                      } else {
                        returnResponse(callBack, response, {
                          status: false,
                          data: res.data,
                          err: res.err
                        });
                      }
                    }, "elevatorCallBack", userId, elevatorId);
                  } else {
                    logException("elevatorCallBack", messages.noDeviceFound, userId, elevatorId);
                    returnResponse(callBack, response, {
                      status: false,
                      data: undefined,
                      err: res = {
                        statusCode: res.statusCode
                      }
                    });
                  }
                });
              }
              else {
                returnResponse(callBack, response, {
                  status: false,
                  err: res = {
                    statusCode: res.statusCode
                  }
                });
              }
            });
            req.write(data);
            req.on("error", function (err) {
              // Handle error
              logException("elevatorCallBack", err, userId, elevatorId);
              returnResponse(callBack, response, {
                status: false,
                err: err,
                data: undefined
              });
            });
            req.end();
          }
        });
      }
    }, callBack);
  } catch (exception) {
    logException("elevatorCallBack", exception.message, userId, request.body.elevatorId);
    returnResponse(callBack, response, {
      status: false,
      err: exception,
      data: undefined
    });
  }
}

function elevatorHangup(userId, elevatorId, uuid) {
  try {
    logActivity("elevatorHangup", userId, elevatorId);
    logMessage("elevatorHangup", messages.startElevatorHangup + " uuid: "+ uuid, userId, elevatorId);
    var encodedMessage = sendMessage.CCCMessage.encode({
      hangup: {}
    });

    logMessage("elevatorHangup", messages.sendElevatorHangup + uuid, userId, elevatorId);
    sendCommandToCIMS(uuid, encodedMessage, function (res) {
      if (res.status) {
        logMessage("elevatorHangup", messages.decodeRespFromCIMS, userId, elevatorId);
        var decodeMessage = sendMessage.CCCMessage.decode(res.data);
        logMessage("elevatorHangup", messages.decodeRespFromCIMSMsg + decodeMessage, userId, elevatorId);
      } else {
        logMessage("elevatorHangup", messages.CIMSCmdFailed + JSON.stringify(res.err), userId, elevatorId);
      }
    }, "elevatorHangup", userId, elevatorId);
  } catch (exception) {
    logException("elevatorHangup", exception.message, userId, elevatorId)
  }
}

// initiating a call to Elevator using CIMS API
function sendCommandToCIMS(device_uuid, encodedMessage, callBack, methodName, userId, elevatorId) {
  try {
    logMessage(methodName + ":sendCommandToCIMS", messages.getAccessTknForCmd, userId, elevatorId);
    getCIMSAccessToken(function (err, tokenResponse) {
      if (err) {
        logMessage(methodName + ":sendCommandToCIMS", messages.getAccessTknForCmdErr + err.stack, userId, elevatorId);
        console.log("well that didn't work: " + err.stack);
        callBack({
          status: false,
          statusCode: 3001,
          err: err.stack,
          data: undefined
        });
      } else {
        logMessage(methodName + ":sendCommandToCIMS", messages.gotAccessTknForCmd + {
          "Authorization": "Bearer ......",
          "Component": APP_Config.component,
          "Channel": APP_Config.channel,
          "Source": APP_Config.source,
          "UUID": device_uuid,
          "SessionID": null,
          "Priority": null,
          "MethodName": APP_Config.methodName,
          "Content-Type": "application/x-protobuf"
        }, userId, elevatorId);
        var options = {
          host: CIMS_URI,
          path: CIMS_API_URL + "/SendMessageToDeviceUsingDMI",
          method: "POST",
          headers: {
            "Authorization": "Bearer " + tokenResponse,
            "Component": APP_Config.component,
            "Channel": APP_Config.channel,
            "Source": APP_Config.source,
            "UUID": device_uuid,
            "SessionID": null,
            "Priority": null,
            "MethodName": APP_Config.methodName,
            "Content-Type": "application/x-protobuf"
          }
        };
        logMessage(methodName + ":sendCommandToCIMS", messages.callingCIMS + options.host, userId, elevatorId);
        var req = https.request(options, function (res) {
          logMessage(methodName + ":sendCommandToCIMS", messages.gotResponseFromCIMS + res.statusCode, userId, elevatorId);

          var data = []; // List of Buffer objects
          res.on("data", function (chunk) {
            data.push(chunk); // Append Buffer object
          });
          res.on("end", function () {
            data = Buffer.concat(data); // Make one large Buffer of it
            if (res.statusCode == 200) {
              logMessage(methodName + ":sendCommandToCIMS", messages.sendingCMDToCIMSSuccess, userId, elevatorId);
              callBack({
                status: true,
                statusCode: res.statusCode,
                data: data
              });
            } else {
              var responseMessage = protobuf(
                fs.readFileSync(PB_SCHEMA_DIR + "/responseMsg.proto")
              );

              var decodeMessage = responseMessage.GenerateMsg.decode(data);

              logMessage(methodName + ":sendCommandToCIMS", messages.sendingCMDToCIMSFailed + JSON.stringify(decodeMessage), userId, elevatorId);
              callBack({
                status: false,
                data: decodeMessage,
                statusCode: res.statusCode,
                err: {
                  statusCode: res.statusCode,
                  message: res.statusMessage
                }
              });
            }
          });
        });
        req.write(encodedMessage);
        req.on("error", function (err) {
          logException(methodName + ":sendCommandToCIMS", err, userId, elevatorId);
          callBack({
            status: false,
            err: err,
            statusCode: 3001,
            data: undefined
          });
        });
        req.end();
      }
    });
  } catch (exception) {
    callBack({
      status: false,
      err: exception.message,
      statusCode: 3001,
      data: undefined
    });
  }
}

function modifyMicGain(request, response) {
  try {
    var userId = request.get("userId");
    var elevatorId = request.get("elevatorID");
    logActivity("modifyMicGain", userId, elevatorId);
    logMessage("modifyMicGain", messages.startModifyMICGain, userId, elevatorId);
    var encodedMessage = sendMessage.CCCMessage.encode({
      adjust_microphone: {
        percentage: request.body.value
      }
    });

    logMessage("modifyMicGain", messages.sendModifyMICGain + request.body.uuid, userId, elevatorId);
    sendCommandToCIMS(request.body.uuid, encodedMessage, function (res) {
      if (res.status) {
        logMessage("modifyMicGain", messages.decodeRespFromCIMS, userId, elevatorId);
        var decodeMessage = sendMessage.CCCMessage.decode(res.data);
        logMessage("modifyMicGain", messages.decodeRespFromCIMSMsg + decodeMessage, userId, elevatorId);
        response.send({
          status: true,
          data: decodeMessage
        });
      } else {
        console.log("Error: ", res.err)
        logMessage("modifyMicGain", messages.CIMSCmdFailed + res.err, userId, elevatorId);
        response.send({
          status: false,
          data: res.data,
          err: res.err
        });
      }
    }, "modifyMicGain", userId, elevatorId);
  } catch (exception) {
    response.send({
      status: false,
      err: exception.message,
      data: undefined
    });
  }
}

function modifySpeakerVolume(request, response) {
  try {
    var userId = request.get("userId");
    var elevatorId = request.get("elevatorID");
    logActivity(
      "modifySpeakerVolume",
      userId,
      elevatorId
    );
    logMessage("modifySpeakerVolume", messages.startModifySpeakerVol, userId, elevatorId);

    var encodedMessage = sendMessage.CCCMessage.encode({
      adjust_volume: {
        percentage: request.body.value
      }
    });
    logMessage("modifySpeakerVolume", messages.sendModifySpeakerVol, userId, elevatorId);
    sendCommandToCIMS(request.body.uuid, encodedMessage, function (res) {
      if (res.status) {
        logMessage("modifySpeakerVolume", messages.decodeRespFromCIMS, userId, elevatorId);
        var decodeMessage = sendMessage.CCCMessage.decode(res.data);
        logMessage("modifySpeakerVolume", messages.decodeRespFromCIMSMsg + decodeMessage, userId, elevatorId);

        response.send({
          status: true,
          data: decodeMessage
        });
      } else {
        logMessage("modifySpeakerVolume", messages.CIMSCmdFailed + res.err, userId, elevatorId);
        response.send({
          status: false,
          data: res.data,
          err: res.err
        });
      }
    }, "modifySpeakerVolume", userId, elevatorId);
  } catch (exception) {
    response.send({
      status: false,
      err: exception.message,
      data: undefined
    });
  }
}

function sendChatMsg(objChatDetails, callBack) {
  try {
    logActivity("sendChatMsg", objChatDetails.currentUserId, objChatDetails.elevatorUnitId);
    console.log(objChatDetails);
    var encodedMessage = sendMessage.CCCMessage.encode({
      display_text: {
        text: objChatDetails.message
      }
    });
    sendCommandToCIMS(defaultUUID, encodedMessage, function (res) {
      if (res.status) {
        var decodeMessage = sendMessage.CCCMessage.decode(res.data);
        callBack({ status: true, data: decodeMessage.display_text });
      } else {
        callBack({ status: false, data: res.data, err: res.err });
      }
    });
  } catch (exception) {
    callBack({
      status: false,
      err: exception.message,
      data: undefined
    });
  }
}

function sendAlarmDisposition(alarmDispoObj, userId, elevatorId, callBack, isRetried=false) {
  console.log("dispo obj: ", alarmDispoObj)
  logActivity("sendAlarmDisposition", userId, elevatorId);
  logMessage("sendAlarmDisposition", messages.startAlarmDisp, userId, elevatorId);

  var alarmDispositionMessage = protobuf(
    fs.readFileSync(PB_SCHEMA_DIR + "/alarm_disposition.proto")
  );

  var alarmDispositionData = alarmDispositionMessage.DispositionInput.encode(alarmDispoObj);

  logMessage("sendAlarmDisposition", messages.decodeAlarmDispData, userId, elevatorId);

  logMessage("sendAlarmDisposition", messages.initiateGetAccessTkn, userId, elevatorId);
  getAccessToken(function (err, tokenResponse) {
    if (err) {
      logMessage("sendAlarmDisposition", messages.gettingAccessTknErr + err.stack, userId, elevatorId);
      console.log("well that didn't work: " + err.stack);
      return "";
    } else {
      logMessage("sendAlarmDisposition", messages.gotAccessTknG3MS, userId, elevatorId);
      logMessage("sendAlarmDisposition", messages.initiateSendingAlarmDisp, userId, elevatorId);

      var options = {
        host: G3MS_URI,
        path: G3MS_API_URL + "/WriteAlarmDisposition",
        method: "POST",
        headers: {
          Authorization: "bearer " + tokenResponse
        },
        timeout: (APP_Config.retryTimeout == null? 3000: parseInt(APP_Config.retryTimeout))
      };

      logMessage("sendAlarmDisposition", messages.callG3MSAPI + options.host + options.path, userId, elevatorId);
      var req = https.request(options, function (res) {
        logMessage("sendAlarmDisposition", messages.gotRespFromG3MS + res.statusCode, userId, elevatorId);

        if (res.statusCode == 200) {
          var data = []; // List of Buffer objects
          res.on("data", function (chunk) {
            data.push(chunk); // Append Buffer object
          });

          res.on("end", function () {
            data = Buffer.concat(data); // Make one large Buffer of it
            if(!isRetried) {
              callBack({
                status: true,
                data: "Success",
                statusCode: res.statusCode
              });
            }            
          });
        } else {
          logMessage("sendAlarmDisposition", messages.writeAlarmDispFailed, userId, elevatorId);
          if(!isRetried) {
            callBack({
              status: true,
              data: undefined,
              statusCode: res.statusCode
            });
          }
        }
      });
      req.write(alarmDispositionData);
      req.on("error", function (err) {
        // Handle error
        logException("sendAlarmDisposition", err, userId, elevatorId);
        if(!isRetried) {
          callBack({
            status: true,
            err: err,
            data: undefined
          });
        }        
      });
      req.on("timeout", function () {
        logException("sendAlarmDisposition", messages.saveDispTimeout, userId, elevatorId);
        if(!isRetried) {
          callBack({
            status: true,
            err: err,
            data: undefined
          });
          sendAlarmDisposition(alarmDispoObj, userId, elevatorId, callBack, true);
        }        
      });
      req.end();
    }
  });
}

var logActivity = function (activityName, userId, elevatorId) {
  helperLogging.logActivity({
    activityname: activityName,
    userId: userId,
    elevatorId: elevatorId
  });
};

var logException = function (methodName, exceptionDetails, userId, elevatorId) {
  helperLogging.logException({
    isServer: 1,
    methodName: methodName,
    exceptionDetails: exceptionDetails,
    userId: userId,
    elevatorId: elevatorId
  });
};

var logMessage = function (methodName, message, userId, elevatorId) {
  helperLogging.logMessage({
    "isServer": 1,
    "methodName": methodName,
    "message": message,
    "userId": userId,
    "elevatorId": elevatorId
  });
}

module.exports = G3MSInteraction();