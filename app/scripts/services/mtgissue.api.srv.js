/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc service
 * @name dashboard.IssueApiService
 * @description
 * # IssueApiService
 * Service in the dashboard.
 */
angular.module('dashboard')
.factory('MtgIssueApi', function ($resource, ENV) {
    return $resource(ENV.MeetingsApiUrl_GetIssues, {
        arg3 : 'last_modified_time'
    },
    {
        get: {
        method: "GET",
        cache: true
        }
    });
});
