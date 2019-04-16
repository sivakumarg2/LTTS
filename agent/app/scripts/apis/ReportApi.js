//// API Name: reportApi
//// Description: This will have api method to report related functionalities.
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
(function () {
  'use strict';

  angular.module('CCApp').factory('reportApi', Implementation);
  Implementation.$inject = ['$resource', 'API'];

  function Implementation($resource, API) {
    var getCallReport = $resource(API.getCallReport, {}, {
      post: {
        method: 'POST'
      }
    });

    var getWorkersStatistcs = $resource(API.getWorkersStatistcs, {}, {
      post: {
        method: 'POST'
      }
    });

    var getWorkersForSupervisor = $resource(API.getWorkersForSupervisor, {}, {
      post: {
        method: 'POST'
      }
    });

    var getWorkersDetailsForSupervisor = $resource(API.getWorkersDetailsForSupervisor, {}, {
      post: {
        method: 'POST'
      }
    });

    var getCallSummary = $resource(API.getCallSummary, {
      fromDate: "@fromDate", toDate: "@toDate"
    }, {
        get: {
          method: 'POST'
        }
      });

    var retriveCallDetailsByCountry = $resource(API.retrieveCallDetailsCountry, {
      fromDate: "@fromDate", toDate: "@toDate", countryId: "@countryId"
    }, {
        get: {
          method: 'POST'
        }
      });

    var addCallReport = $resource(API.addCallReport, {}, {
      post: {
        method: 'POST'
      }
    });

    var editCallReport = $resource(API.editCallReport, {
      callId: '@callId'
    }, {
        post: {
          method: 'POST'
        }
      });

    var exportCallReport = $resource(API.exportCallSummary, {
      callId: '@userId'
    }, {
        get: {
          method: 'POST'
        }
      });

    var getCallDetail = $resource(API.getCallDetail, {
      userId: '@userId',
      date: '@date',
      callFilter: "@callFilter"
    }, {
        get: {
          method: 'POST'
        }
      });

    var downloadAudioVideo = $resource(API.downloadAudioVideo, {}, {
      post: {
        method: 'post'
      }
    });

    var deleteAudioVideo = $resource(API.deleteAudioVideo,
      { callId: "@callId", incidentId: '@incidentId' },
      {
        get: { method: 'GET' }
      });

    var getAgentsReport = $resource(API.getAgentsReport, {}, {
      post: {
        method: 'POST'
      }
    });

    return {
      getCallReport: getCallReport,
      getCallSummary: getCallSummary,
      addCallReport: addCallReport,
      editCallReport: editCallReport,
      retriveCallDetailsByCountry: retriveCallDetailsByCountry,
      getWorkersStatistcs: getWorkersStatistcs,
      exportCallReport: exportCallReport,
      getCallDetail: getCallDetail,
      downloadAudioVideo: downloadAudioVideo,
      deleteAudioVideo: deleteAudioVideo,
      getWorkersForSupervisor: getWorkersForSupervisor,
      getWorkersDetailsForSupervisor: getWorkersDetailsForSupervisor,
      getAgentsReport: getAgentsReport
    }
  }
})();
