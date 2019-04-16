//// File Name: mediaDownloader.js
//// Description: This has the methods to download the video & audio files.
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/

'use strict';

var dbCalls = require('../dataaccess_layer/callDetails.js');
var helperLogging = require('../helper/logging.js');
var fs = require('fs');
var twilioInterface = require('../twilio_interface/twilioInterface.js');
var https = require('https');
var mime = require('mime');
var Promise = require('promise');
var isDebugMode = true; //TODO for development envirnoment
var customError = null;
var MediaType = {
    AUDIO: "audio",
    VIDEO: "video"
}

function MediaDownloader() {
    return {
        downlodCompleteMedia: downlodCompleteMedia,
        downloadAgent: downloadAgent,
        downloadElevator: downloadElevator
    }
}

/*
*   Routine to download complete media(agent & Elevator) from twilio to application DB
*   @param1 : downloadDetail 
*                (!IMPORTANT Note : downloadDetail object should be proper any missing 
*                    attribute may fail )
*   @param2 : successCallback (callback function)
*   @param3 : errorCallback (callback function)
*/
function downlodCompleteMedia(downloadDetail, successCallback, errorCallback) {
    debugMode("downlodCompleteMedia", "Downloading complete media from Twilio", downloadDetail);
    try {
        downloadAgent(downloadDetail)
            .then(downloadElevator)
            .then(function (result) {
                successCallback(result);
            })
            .catch(function (error) {                
                errorCallback(error);
            });
    } catch (exception) {
        logException("downlodCompleteMedia", exception.message, req.get('userId'));
    }
}

/*
*   Routine to download agent media(audio & video) from twilio to application DB
*   @param1 : downloadDetail 
*                (!IMPORTANT Note : downloadDetail object should be proper any missing 
*                    attribute may fail )
*   @param2 : onlyAgent (boolean: if true only agent video & audio recoding will be downloaded)
*   @param2 : successCallback (callback function)
*   @param3 : errorCallback (callback function)
*/
function downloadAgent(downloadDetail, onlyAgent, successCallback, errorCallback) {
    debugMode("downloadAgent", "Downloading agent media");
    downloadDetail.downloadFor = "agent";
    if (onlyAgent) {
        _downloadMedia(downloadDetail)
            .then(function (result) {
                debugMode("downlodCompleteMedia", "Agent media data", downloadDetail.agent);
                successCallback(result)
            })
            .catch(function (error) {
                errorCallback(error);
            });
    } else {
        return _downloadMedia(downloadDetail);
    }
}

/*
*   Routine to download elevator media(audio & video) from twilio to application DB
*   @param1 : downloadDetail 
*                (!IMPORTANT Note : downloadDetail object should be proper any missing 
*                    attribute may fail )
*   @param2 : onlyAgent (boolean: if true only elevator video & audio recoding will be downloaded)
*   @param2 : successCallback (callback function)
*   @param3 : errorCallback (callback function)
*/
function downloadElevator(downloadDetail, onlyAgent, successCallback, errorCallback) {
    debugMode("downloadElevator", "Downloading elevator media");
    downloadDetail.downloadFor = "elevator";
    if (onlyAgent) {
        _downloadMedia(downloadDetail)
            .then(function (result) {
                debugMode("downloadElevator", "Elevator media data", downloadDetail.agent);
                successCallback(result);
            })
            .catch(function (error) {
                errorCallback(error);
            });
    } else {
        return _downloadMedia(downloadDetail);
    }
}

/*
* private routine to download media (ie recordingds) from Twilio
*/
function _downloadMedia(downloadDetail) {
    debugMode("_downloadMedia", "Started downloading " + downloadDetail.downloadFor + " media");
    var audioUrl = null, videoUrl = null;
    audioUrl = downloadDetail[downloadDetail.downloadFor].audioUrl;
    videoUrl = downloadDetail[downloadDetail.downloadFor].videoUrl;
    if ((!isMedialUrlEmpty(audioUrl) && !isMedialUrlEmpty(videoUrl))) {
        return new Promise(function (success, failure) {
            try {
                _downloadAudio(downloadDetail)
                    .then(_downloadvideo)
                    .then(function (result) {
                        success(result)
                    })
                    .catch(function (error) {
                        failure(error)
                    })
            } catch (exception) {
                logException("_downloadMedia", exception.message, req.get('userId'));
                customError = new CustomError("EXCEPTION", "_downloadMedia", exception);
                failure(customError)
            }
        });

    } else if (!isMedialUrlEmpty(audioUrl) && isMedialUrlEmpty(videoUrl)) {
        try {
            return new Promise(function (success, failure) {
                _downloadAudio(downloadDetail)
                    .then(function (result) {
                        success(result)
                    })
                    .catch(function (error) {
                        failure(error)
                    });
            });
        } catch (exception) {
            logException("_downloadMedia", exception.message, req.get('userId'));
            customError = new CustomError("EXCEPTION", "_downloadMedia", exception);
            failure(customError)
        }

    } else if (isMedialUrlEmpty(audioUrl) && !isMedialUrlEmpty(videoUrl)) {
        try {
            return new Promise(function (success, failure) {
                _downloadvideo(downloadDetail)
                    .then(function (result) {
                        success(result)
                    })
                    .catch(function (error) {
                        failure(error);
                    });
            });
        } catch (exception) {
            logException("_downloadMedia", exception.message, req.get('userId'));
            customError = new CustomError("EXCEPTION", "_downloadMedia", exception);
            failure(customError)
        }
    } else {
        return Promise.resolve(media);
    }
}

/*
* private routine to download audio from twilio
*/
function _downloadAudio(downloadDetail) {
    debugMode("_downloadAudio", "Started downloading audio recording");
    var objDetails = downloadDetail[downloadDetail.downloadFor];
    var audioMedia = new MediaObject(objDetails.audioUrl, MediaType.AUDIO);
    var customError = null;
    return new Promise(function (onFulfill, onReject) {
        try {
            audioMedia.authenticatedUrl = twilioInterface.createAuthenticatedMediaUrl(audioMedia.url);
            _getAWSRedirectUrl(audioMedia)
                .then(function (result) {
                    debugMode("_downloadAudio", "<<<<< Audio downloaded successfully for " + downloadDetail.downloadFor + ">>>>");
                    result.status = "Downloaded"
                    objDetails.audio = result;
                    onFulfill(downloadDetail);
                })
                .catch(function (err) {
                    objDetails.status = "Error"
                    onReject(err);
                });
        } catch (exception) {
            logException("_downloadAudio", exception.message, req.get('userId'));
            customError = new CustomError("EXCEPTION", "_downloadAudio", exception);
            onReject(customError);
        }
    });
}

/*
* Helper routine to download video from twilio
*/
function _downloadvideo(downloadDetail) {
    debugMode("_downloadvideo", "Started downloading video recording");
    var objDetails = downloadDetail[downloadDetail.downloadFor];
    var videoMedia = new MediaObject(objDetails.videoUrl, MediaType.VIDEO);
    return new Promise(function (onFulfill, onReject) {
        try {
            videoMedia.authenticatedUrl = twilioInterface.createAuthenticatedMediaUrl(videoMedia.url);
            _getAWSRedirectUrl(videoMedia)                
                .then(function (result) {
                    debugMode("_downloadvideo", "<<<<< Video downloaded successfully for " + downloadDetail.downloadFor + ">>>>");
                    result.status = "Downloaded"
                    objDetails.video = result;
                    onFulfill(downloadDetail);
                })
                .catch(function (err) {
                    objDetails.status = "Error"
                    onReject(err);
                });
        } catch (exception) {
            logException("_downloadvideo", exception.message, req.get('userId'));
            customError = new CustomError("EXCEPTION", "_downloadvideo", exception.message, exception);
            onReject(customError);
        }
    });
}


/*
*	Helper routine to retrive Audio/Video url from TWILIO
*	@param: downloadDetails (json object)
* 	@return: Promise (return  callback function on fulfil/reject)
*/
function _getAWSRedirectUrl(mediaObject) {
    debugMode("_getAWSRedirectUrl", "Fetching " + mediaObject.type + " redirect url from TWILIO Server", mediaObject.authenticatedUrl);
    var authenticatedUrl = mediaObject.authenticatedUrl;
    return new Promise(function (onFulfill, onReject) {
        try {
            https.get(authenticatedUrl, function (result) {
                let rawData = '';
                result.on('data', (chunk) => {
                    rawData += chunk;
                });
                result.on('end', (chunk) => {
                    const parsedData = JSON.parse(rawData);
                    debugMode("_getAWSRedirectUrl", "recived redirectUrl", rawData);
                    if (parsedData.redirect_to == undefined) {
                        mediaObject.redirectUrl = "";
                        onFulfill(mediaObject);
                    } else {
                        mediaObject.redirectUrl = parsedData.redirect_to;
                        onFulfill(mediaObject);
                    }
                });
            }, function (err) {
                var customError = new CustomError(null, "_getAWSRedirectUrl", err);
                onReject(customError);
            });
        } catch (exception) {
            logException("_getAWSRedirectUrl", exception.message, req.get('userId'));
            customError = new CustomError("EXCEPTION", "_getAWSRedirectUrl", exception);
            onReject(customError);
        }
    });
}

/*
*	Helper routine to dowload Audio/Video from AWS Server
*	@param: downloadDetails (json object)
* 	@return: Promise (return  callback function on fulfil/reject)
*/
function _downloadMediaFromAWS(mediaObject) {
    debugMode("_downloadMediaFromAWS", "Downloading " + mediaObject.type + " from amazon server");
    return new Promise(function (onFulfill, onReject) {
        var redirectUrl = mediaObject.redirectUrl;
        try {
            https.get(redirectUrl, function (result) {
                var chunks = [];
                result.on('data', function (chunk) {
                    chunks.push(chunk);
                });

                result.on("end", function () {
                    var media = new Buffer.concat(chunks);
                    debugMode("_downloadMediaFromAWS", mediaObject.typ, media);
                    mediaObject.data = media
                    onFulfill(mediaObject);
                });
            }, function (err) {
                var customError = new CustomError(null, "_downloadMediaFromAWS", err);
                onReject(customError);
            });
        } catch (exception) {
            logException("_getAWSRedirectUrl", exception.message, req.get('userId'));
            customError = new CustomError("EXCEPTION", "_getAWSRedirectUrl", exception);
            onReject(customError);
        }
    });
}

function MediaObject(url, mediaType) {
    this.authenticatedUrl = null;
    this.redirectUrl = null;
    this.url = url;
    this.status = "";
    this.container_format = null,
        this.codec = null,
        this.duration = null;
    this.type = mediaType;
    this.size = null;
    this.data = null;
}

function CustomError(errorType, methodName, errorObj) {
    if (errorType == null) {
        errorType = "ERROR";
    }
    if (errorObj.message == undefined || errorObj.message == "") {
        errorObj.message = "Something went wrong while downloading media"
    }
    if (errorObj.code == null || errorObj.code == undefined) {
        errorObj.code = "1001"
    }
    this.data = {
        code: errorObj.code,
        type: errorType,
        message: errorObj.message,
        more_info: null,
    };
    this.detailederrorObj = errorObj;
    this.methodName = methodName;
}

function isMedialUrlEmpty(medialUrl) {
    if (medialUrl == null || medialUrl == "") {
        return true;
    }
    return false;
}

var logActivity = function (activityName, userId, elevatorId) {
    helperLogging.logActivity({ "activityname": activityName, "userId": userId, "elevatorId": elevatorId });
}

var logException = function (methodName, exceptionDetails, userId) {
    //console.log(exceptionDetails);
    helperLogging.logException({ "isServer": 1, "methodName": methodName, "exceptionDetails": exceptionDetails, "userId": userId });
}

var debugMode = function (methodName, message, object) {
    if (isDebugMode == false) {
        console.log("***************************");
        console.log("Method     :", methodName);
        console.log("Message    :", message);
        console.log("Object     :", object);
        console.log("***************************");
    }
};

module.exports = MediaDownloader();