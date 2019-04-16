//// Service Name: shutdownReasonService
//// Description: This service has methods to handle shutdown reason functionality
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
(function () {
	'use strict';

	function ServiceImplementation(shutdownReasonApi) {

		var GetAllShutdownReason = function () {
			return shutdownReasonApi.getShutdownReason.get().$promise;
		};

		var AddShutdownReason = function (shutdownReason) {
				return shutdownReasonApi.addShutdownReason.post(shutdownReason).$promise;
		};

		var DeleteShutdownReason = function (shutdownReasonId) {
			return shutdownReasonApi.deleteShutdownReason.remove({ shutdownReasonId: shutdownReasonId }).$promise;
		};

		return { getAllShutdownReason: GetAllShutdownReason, addShutdownReason: AddShutdownReason, deleteShutdownReason: DeleteShutdownReason};
	}

	angular.module("CCApp").service("shutdownReasonService", ServiceImplementation);
	ServiceImplementation.$inject = ['shutdownReasonApi'];
})();
