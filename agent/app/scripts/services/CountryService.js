//// Service Name: countryService
//// Description: This service has methods to achieve country configuration & settings.
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
(function() {
  'use strict';

  function ServiceImplementation(countryApi) {

    var GetCountrySetting = function() {
      return countryApi.getCountrySetting.get().$promise;
    };

    var GetConfigDispo = function(configId) {
      return countryApi.getCountryCopyDispo.get({
        configId: configId
      }).$promise;
    };

    var AddCountrySetting = function(countryModel) {
      if (countryModel.countryConfigurationId === 0) {
        return countryApi.addCountrySetting.post(countryModel).$promise;
      } else {
        return countryApi.editCountrySetting.post(countryModel).$promise;
      }
    };

    var GetCallDispositionByCountryId = function(countryConfigurationId, languageId) {
			return countryApi.getCallDispositionByCountryId.get({
				countryConfigurationId: countryConfigurationId,
        languageId: languageId
			}).$promise;
    };

    var SaveCountryCallDispo = function(callDispositionModel) {
      return countryApi.saveCountryCallDispo.post(callDispositionModel).$promise;
    };

    var DeleteCountryCallDispo = function(callDispositionId) {
      return countryApi.deleteCountryCallDispo.remove({
				callDispositionId: callDispositionId
			}).$promise;
    };

    var DeleteCountrySetting = function(countryConfigurationId) {
      return countryApi.deleteCountrySetting.remove({
        countryConfigurationId: countryConfigurationId
      }).$promise;
    };

    var ConvertValueToTime = function(value) {
      var d = new Date(value);
      var h = addZero(d.getHours(), 2);
      var m = addZero(d.getMinutes(), 2);
      var s = addZero(d.getSeconds(), 2);
      var ms = addZero(d.getMilliseconds(), 7);
      value = h + ":" + m + ":" + s + "." + ms;
      return value;
    };

    function addZero(x, n) {
      while (x.toString().length < n) {
        x = "0" + x;
      }
      return x;
    }

    return {
      getCountrySetting: GetCountrySetting,
      addCountrySetting: AddCountrySetting,
      deleteCountrySetting: DeleteCountrySetting,
      convertValueToTime: ConvertValueToTime,
      getConfigDispo: GetConfigDispo,
			getCallDispositionByCountryId: GetCallDispositionByCountryId,
      saveCountryCallDispo: SaveCountryCallDispo,
			deleteCountryCallDispo: DeleteCountryCallDispo
    };
  }

  angular.module("CCApp").service("countryService", ServiceImplementation);
  ServiceImplementation.$inject = ['countryApi'];
})();
