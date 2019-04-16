//// Controller Name: elevatorController
//// Description: This controller will have the logic implementation to work with elevator calls
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
(function () {
  'use strict';

  function Implementation($rootScope, $scope, languageService, callService, commonService, APP_CONFIG, reportService) {
    $scope.volumeChange = false;
    $scope.micGain = false;
    var url = "https://video.twilio.com/v1/Recordings/";
    var elevatorDetails = document.getElementById('elevator-call-details');
    var videoStreamingModal = document.getElementById('video-streaming');
    var agentVideoControl = document.getElementById('streamAgentVideo');
    var agentAudioControl = document.getElementById('streamAgentAudio');
    var elevatorVideoControl = document.getElementById('streamElevatorVideo');
    var elevatorAudioControl = document.getElementById('streamElevatorAudio');
    var supposedCurrentTime = 0;
    var lang = "en";

    var getLanguageString = function (lang) {
      languageService.getLanguageString({
        "page": ($rootScope.selectedCountryShortName == undefined? "US": $rootScope.selectedCountryShortName) + "_" + ($rootScope.selectedCountryShortName == undefined? "eng": lang) + "_elevator_call_details.json"
      }).then(function (res) {
        $scope.translation = res;
      }, function (err) {
      });
    };

    var init = function () {
      if ($rootScope.languageShortName != null) {
        getLanguageString($rootScope.languageShortName);
      }
    };

    init();
    $rootScope.$on("changeLanguage", function (event) {
      getLanguageString($rootScope.languageShortName);
    });

    $scope.refreshSlider = function () {
      setTimeout(function () {
        $scope.$broadcast('reCalcViewDimensions');
      }, 10);
    };

    $rootScope.$on("callEvents", function (event, identifier) {
      if (identifier == "incoming") {
        $scope.closeVideoStreaming();
      }
    });

    $rootScope.$on("loadMap", function (event, address) {
      if (address != null || address != '') {
        callService.getGeoCodeAddress(address).then(function (res) {
          if(res.status){
            $scope.loadMap(res);
          }          
        });
      }
    });

    // When the user clicks on <span> (x), close the modal
    $scope.closeElevatorModal = function () {
      $scope.callAccept = false;
      elevatorDetails.style.display = "none";
    };

    $scope.loadMap = function (objGeoCord) {
      if (Microsoft) {
        $scope.map = new Microsoft.Maps.Map(
          document.getElementById('map'), {
            credentials: $rootScope.config.bingAPIKey
          });
        $scope.map.setView({
          zoom: APP_CONFIG.mapZoomLevel,
          center: new Microsoft.Maps.Location(objGeoCord.lat, objGeoCord.lng),
          mapTypeId: Microsoft.Maps.MapTypeId.canvasLight,
        });
        var center = $scope.map.getCenter();

        var pushpin = new Microsoft.Maps.Pushpin(center, { color: '#0033ab' });

        $scope.map.entities.push(pushpin);
      }

    };

    //TODO Add the below function in home controller//
    /*Pagination related code starts here*/
    $scope.currentPage = 0;
    $scope.pageSize = 10;
    $scope.numberOfPages = function () {
      //return Math.ceil($scope.callDetailsList.length / $scope.pageSize);
    };

    var av = document.getElementById('streamAgentVideo');
    var aa = document.getElementById('streamAgentAudio');
    var ev = document.getElementById('streamElevatorVideo');
    var ea = document.getElementById('streamElevatorAudio');
    var playControls = { av: false, aa: false, ev: false, ea: false };
    var videoDlay = 0;
    var audioDlay = 0;

    var checkFlags = function () {
      return playControls.av && playControls.aa && playControls.ev && playControls.ea && $scope.applyDelay;
    };

    var registerAll = function () {
      av.oncanplaythrough = function () {
        playControls.av = true;
        if (checkFlags()) {
          playAll();
        }
      };

      aa.oncanplaythrough = function () {
        playControls.aa = true;
        if (checkFlags()) {
          playAll();
        }
      };

      ev.oncanplaythrough = function () {
        playControls.ev = true;
        if (checkFlags()) {
          playAll();
        }
      };

      ea.oncanplaythrough = function () {
        playControls.ea = true;
        if (checkFlags()) {
          playAll();
        }
      };

      ev.onloadeddata = function () {
        videoDlay = Math.floor(ev.currentTime + localMedia.delay);
        ev.currentTime = videoDlay;
      };

      ea.onloadeddata = function () {
        audioDlay = Math.floor(ea.currentTime + localMedia.delay);
        ea.currentTime = audioDlay;
      };

      var audioPlaying = function () {
        angular.element("#btnPlayPause").css("visibility", "hidden").css("position", "absolute").prop("disabled", "");
        angular.element("#btnStop").css("visibility", "visible").css("position", "unset");
        angular.element('#spanLoading').html("&nbsp;");
      };

      if (ea.src.indexOf(location.host) < 0) {
        ea.onplaying = function () {
          audioPlaying();
        };
      }
      else {
        aa.onplaying = function () {
          audioPlaying();
        };
      }

      var audioEnding = function () {
        angular.element("#btnPlayPause").css("visibility", "visible").css("position", "unset");
        angular.element("#btnStop").css("visibility", "hidden").css("position", "absolute");
      };

      if (aa.src.indexOf(location.host) < 0) {
        aa.onended = function () {
          audioEnding();
        };
      }
      else {
        ea.onended = function () {
          audioEnding();
        };
      }
    };

    var playAll = function () {
      $scope.applyDelay = false;

      ev.play();
      ea.play();
      av.play();
      aa.play();
    };

    $scope.playVideo = function () {
      if (!isPaused) {
        if (ev.src.indexOf(location.host) < 0) {
          ev.currentTime = videoDlay;
        }

        ea.currentTime = audioDlay;
      }
      playAll();
      isPaused = false;
      angular.element("#btnStop").prop("disabled", "");
      angular.element("#btnPlayPause").prop("disabled", "");
    };

    var localMedia = {};    
    $scope.streamAudioVideo = function (callInfo) {
      try {
        $scope.noVideoFound = false;
        ev.src = "";
        ea.src = "";
        av.src = "";
        aa.src = "";
        angular.element('#spanLoading').html($scope.translation.loading + "...");
        $scope.applyDelay = true;
        angular.element("#btnPlayPause").prop("disabled", "disabled");
        angular.element("#btnPlayPause").css("visibility", "visible").prop("disabled", "disabled").css("position", "unset");
        angular.element("#btnStop").css("visibility", "hidden").css("position", "absolute");

        var checkEmpty = function (value) {
          if (value != "" && value != null) return true;
          return false;
        };

        var startStreaming = function () {
          localMedia.delay = callInfo.remVideoDuration - callInfo.videoDuration;
          playControls = { av: false, aa: false, ev: false, ea: false };

          av.src = localMedia.avvideourl;
          if (localMedia.avvideourl == "") {
            playControls.av = true;
          }

          aa.src = localMedia.aaaudiourl;
          if (localMedia.aaaudiourl == "") {
            playControls.aa = true;
          }

          ev.src = localMedia.evvideourl;
          if (localMedia.evvideourl == "") {
            playControls.ev = true;
          }

          ea.src = localMedia.evaudiourl;
          if (localMedia.evaudiourl == "") {
            playControls.ea = true;
          }
          registerAll();

          if (checkFlags()) {
            angular.element('#spanLoading').html($scope.translation.noFilesFound + "...");
          }

          if (playControls.av || playControls.ev) {
            $scope.noVideoFound = true;
          }
        };

        videoStreamingModal.style.display = "block";

        var downloadMedia = function () {
          callInfo.audioUrl = url + callInfo.audioSid;
          callInfo.videoUrl = url + callInfo.videoSid;
          callInfo.remAudioUrl = url + callInfo.remAudioSid;
          callInfo.remVideoUrl = url + callInfo.remVideoSid;

          reportService.downloadAudioVideo(callInfo)
            .then(function (res) {
              if (res.status) {
                localMedia.evvideourl = res.data.elevator.video.redirectUrl;
                localMedia.evaudiourl = res.data.elevator.audio.redirectUrl;
                localMedia.avvideourl = res.data.agent.video.redirectUrl;
                localMedia.aaaudiourl = res.data.agent.audio.redirectUrl;
                startStreaming();
              } else {
              }
            }, function (err) {
              commonService.logException({
                "methodName": "downloadAudioVideo",
                "ExceptionDetails": err
              });
            });
        };

        if (callInfo.remVideoDuration - callInfo.videoDuration > 0) {
          downloadMedia();
        }
        else {
          callService.retriveVideosDuration({ "remoteParticipantSid": callInfo.remoteParticipantSid, "localParticipantSid": callInfo.localParticipantSid, "callDetailsId": callInfo.callDetailsId, "incidentId": callInfo.incidentId, "roomSid": callInfo.roomSid })
            .then(function (res) {
              if (res.status) {
                callInfo.videoDuration = res.data.videoDuration;
                callInfo.remVideoDuration = res.data.remVideoDuration;
                downloadMedia();
              }
            }, function (err) {
              commonService.logException({
                "methodName": "downloadAudioVideo",
                "exceptionDetails": err
              });
            });
        }
      }
      catch (ex) {
        commonService.logException({
          "methodName": "downloadVideo",
          "ExceptionDetails": ex.message
        });
      }
    };

    $scope.closeVideoStreaming = function (media) {
      ev.pause();
      ea.pause();
      av.pause();
      aa.pause();
      videoStreamingModal.style.display = "none";
      $scope.applyDelay = false;
    };

    $scope.openVideoStreaming = function () {
      $scope.applyDelay = true;
      videoStreamingModal.style.display = "block";
    };

    var isPaused = false;
    $scope.stopVideo = function (media) {
      isPaused = true;
      ev.pause();
      ea.pause();
      av.pause();
      aa.pause();
      angular.element("#btnPlayPause").css("visibility", "visible").css("position", "unset");
      angular.element("#btnStop").css("visibility", "hidden").css("position", "absolute");
    };
  }

  angular.module("CCApp").controller("elevatorController", Implementation);
  Implementation.$inject = ['$rootScope', '$scope', 'languageService', 'callService', 'commonService', 'APP_CONFIG', 'reportService'];
})();
