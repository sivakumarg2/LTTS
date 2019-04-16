﻿//// Service Name: azureAppInsightsService
//// Description: This service has the methods to log the trackpageView & events
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
(function () {
    'use strict';

    angular.module('CCApp')
      .service('azureAppInsightsService', [azAppInsightService]);

    /**
     * Custom Angular service.
     * 
     */
    function azAppInsightService() {

        return {
            trackPageView: trackPageView,
            trackEvent: trackEvent
        };

        init();

        /** *********************************************************** */

        function init() {
            var config = appInsights.config;

            config.enableDebug = true;
            config.verboseLogging = true;

            appInsights.config = config;
        }

        /**
         * Track a page view. 
         */
        function trackPageView(pageName, url, leagueId, teamId) {
            var configData = {
                App: 'CCApp'
            };

            if (leagueId !== null && leagueId !== undefined) {
                configData.LeagueId = leagueId;
            }
            if (teamId !== null && teamId !== undefined) {
                configData.TeamId = teamId;
            }

            appInsights.trackPageView(pageName, url, configData);
        }

        /**
         * Track custom event.
         */
        function trackEvent(event, leagueId, teamId, data) {
            var configData = {};

            if (data !== null && data !== undefined) {
                configData = data;
            }

            configData.App = 'CCApp';

            if (leagueId !== null && leagueId !== undefined) {
                configData.LeagueId = leagueId;
            }
            if (teamId !== null && teamId !== undefined) {
                configData.TeamId = teamId;
            }

            appInsights.trackEvent(event, configData);
        }
    }

})();