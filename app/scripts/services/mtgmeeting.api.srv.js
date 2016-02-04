/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc service
 * @name dashboard.MeetingApiService
 * @description
 * # MeetingApiService
 * Service in the dashboard.
 */
angular.module('dashboard')
.factory('MtgMeetingApi', function ($resource, ENV) {
    return $resource(ENV.MeetingsApiUrl_GetMeetings, {
        arg3 : 'date'
    },
    {
        get: {
        method: "GET",
        cache: true
        }
    });
});
