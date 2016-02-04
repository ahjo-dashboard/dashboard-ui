/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc service
 * @name dashboard.MeetingDocumentApiService
 * @description
 * # MeetingDocumentApiService
 * Service in the dashboard.
 */
angular.module('dashboard')
.factory('MtgMeetingDocumentApi', function ($resource, ENV) {
    return $resource(ENV.MeetingsApiUrl_GetMeetingDocuments, {},
    {
        get: {
        method: "GET",
        cache: true
        }
    });
});
