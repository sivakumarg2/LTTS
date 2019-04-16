//// API Name: countryApi
//// Description: This will have api methods to handle country configuration & settings related functionalities.
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
(function () {
  'use strict';

  angular.module('CCApp').factory('countryApi', Implementation);
  Implementation.$inject = ['$resource', 'API'];

  function Implementation($resource, API) {

    var getCountrySetting = $resource(API.getCountry, {}, {
      get: {
        method: 'POST'
      }
    });

    var getCountryCopyDispo = $resource(API.loadCopyDisposition, {}, {
      get: {
        method: 'GET'
      }
    });

    var addCountrySetting = $resource(API.addCountry, {}, {
      post: {
        method: 'POST'
      }
    });

    var editCountrySetting = $resource(API.editCountry, {}, {
      post: {
        method: 'POST'
      }
    });

    var deleteCountrySetting = $resource(API.deleteCountry, {
      countryConfigurationId: "@countryConfigurationId"
    }, {
        remove: {
          method: 'DELETE'
        }
      });

    var getCallDispositionByCountryId = $resource(API.getAllCountryCallDisposition, {
      countryConfigurationId: "@countryConfigurationId", languageId: "@languageId"
    }, {
        get: {
          method: 'POST'
        }
      });

    var saveCountryCallDispo = $resource(API.addCountryCallDisposition, {}, {
      post: {
        method: 'POST'
      }
    });

    var deleteCountryCallDispo = $resource(API.deleteCountryCallDisposition, {
      callDispositionId: "@callDispositionId"
    }, {
        remove: {
          method: 'DELETE'
        }
      });

    return {
      getCountrySetting: getCountrySetting,
      addCountrySetting: addCountrySetting,
      editCountrySetting: editCountrySetting,
      deleteCountrySetting: deleteCountrySetting,
      getCountryCopyDispo: getCountryCopyDispo,
      getCallDispositionByCountryId: getCallDispositionByCountryId,
      saveCountryCallDispo: saveCountryCallDispo,
      deleteCountryCallDispo: deleteCountryCallDispo
    }
  }
})();
