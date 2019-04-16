//// Service Name: reportService
//// Description: This service has methods for displaying filtering data
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
(function () {
  'use strict';

  function ServiceImplementation(userApi, reportApi) {
    var GetCallReport = function (objWorker) {
      return reportApi.getCallReport.post(objWorker).$promise;
    };

    var GetCallSummary = function (objFilter) {
      return reportApi.getCallSummary.get({
        fromDate: objFilter.fromDate,
        toDate: objFilter.toDate
      }).$promise;
    };

    var GetCallDetailsByCountry = function (objFilter) {
      return reportApi.retriveCallDetailsByCountry.get({
        fromDate: objFilter.fromDate,
        toDate: objFilter.toDate,
        countryId:objFilter.countryId
      }).$promise;
    };

    var AddReport = function (reportModel) {
      return userApi.addUser.post(reportModel).$promise;
    };

    var EditReport = function (callId) {
      return userApi.editUser.post(callId).$promise;
    };

    var ExportCallSummary = function (userId) {
      return reportApi.exportCallReport.get({
        userId: userId
      }).$promise;
    };

    var GetWorkersReport = function (objReport) {
      return reportApi.getWorkersStatistcs.post(objReport).$promise;
    };

    var GetWorkersForSupervisor = function (objReport) {
      return reportApi.getWorkersForSupervisor.post(objReport).$promise;
    };

    var GetWorkersDetailsForSupervisor = function (objReport) {
      return reportApi.getWorkersDetailsForSupervisor.post(objReport).$promise;
    };

    var GetCallDetail = function (userId, date, callFilter) {
      return reportApi.getCallDetail.get({
        userId: userId,
        date: date,
        callFilter: callFilter
      }).$promise;
    };

    var downloadAudioVideo = function (elevatorDetail) {
      return reportApi.downloadAudioVideo.post(elevatorDetail).$promise;
    };

    var deleteAudioVideo = function (callDetail) {
      return reportApi.deleteAudioVideo.get(callDetail).$promise;
    };

    var GetAgentsReport = function (objFilter) {
      return reportApi.getAgentsReport.post(objFilter).$promise;
    };

    return {
      getCallReport: GetCallReport,
      getCallSummary: GetCallSummary,
      addReport: AddReport,
      editReport: EditReport,
      getCallDetailsByCountry: GetCallDetailsByCountry,
      exportCallReport: ExportCallSummary,
      getWorkersReport: GetWorkersReport,
      getCallDetail: GetCallDetail,
      downloadAudioVideo: downloadAudioVideo,
      deleteAudioVideo: deleteAudioVideo,
      getWorkersForSupervisor: GetWorkersForSupervisor,
      getWorkersDetailsForSupervisor: GetWorkersDetailsForSupervisor,
      getAgentsReport: GetAgentsReport
    };
  }

  angular.module("CCApp").service("reportService", ServiceImplementation);
  ServiceImplementation.$inject = ['userApi', 'reportApi'];

})();
