//// API Name: userApi
//// Description: This will have api methods related to user functionality.
//// Version: 1.0
/*
The Source Code and the information it contains is the property of the Otis Elevator Company ("Otis"). The information it contains is highly confidential and is a trade secret of Otis. Access to this work is limited to those selected employees of Otis having a specific need to use it on behalf of Otis. It shall not be used by any other person for any purpose; it may not be reproduced, distributed, or disclosed by or to anyone, including any employee not having a specific need to use it without the express written permission of an officer of Otis. 

Any unauthorized reproduction, disclosure, or distribution of copies by any person of any portion of this work may be a violation of the copyright law of the United States of America and other countries, and could result in the awarding of statutory damages of up to $150,000 dollars (17 USC 504) for infringement, and may result in further civil and criminal penalties.

Unpublished Work - Copyright 2019, Otis Elevator Company
*/
(function () {
    'use strict';

    angular.module('CCApp').factory('userApi', Implementation);
    Implementation.$inject = ['$resource', 'API'];

    function Implementation($resource, API) {
        var getUsers = $resource(API.getUser,
            { countryId: "@countryId" },
            {
                get: { method: 'POST' }
            });

        var addUser = $resource(API.addUser,
            {},
            {
                post: { method: 'POST' }
            });

        var editUser = $resource(API.editUser,
            {},
            {
                post: { method: 'POST' }
            });

        var editUserPreferences = $resource(API.editUserPreferences,
            {},
            {
                post: { method: 'POST' }
            });

        var updateLanguage = $resource(API.updateLanguage,
            {},
            {
                post: { method: 'POST' }
            });

        var deleteUser = $resource(API.deleteUser,
            { userId: "@userId", workerSid: '@workerSid' },
            {
                get: { method: 'DELETE' }
            });

        var updateActivity = $resource(API.updateActivity,
            { activityId: "@activityId" },
            {
                post: { method: 'POST' }
            });

        var changePassword = $resource(API.changePassword,
            {},
            {
                post: { method: 'POST' }
            });

        var saveSettings = $resource(API.saveSettings,
            {},
            {
                post: { method: 'POST' }
            });

        var genRefreshToken = $resource(API.refreshToken,
            { userId: "@userId" },
            {
                get: { method: 'POST' }
            });

        var validateUserToken = $resource(API.validateToken, {}, {
            get: { method: 'POST' }
        });

        var getAllLanguages = $resource(API.getAvailableLanguages,
            {},
            {
                get: { method: 'GET' }
            });

        return {
            getUsers: getUsers, addUser: addUser, editUser: editUser, editUserPreferences: editUserPreferences, updateLanguage: updateLanguage, deleteUser: deleteUser, updateActivity: updateActivity, changePassword: changePassword, genRefreshToken: genRefreshToken, validateUserToken: validateUserToken, getAllLanguages: getAllLanguages, saveSettings: saveSettings
        }
    }
})();
