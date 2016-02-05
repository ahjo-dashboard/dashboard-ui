/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc service
 * @name dashboard.AgendaItemApiService
 * @description
 * # AgendaItemApiService
 * Service in the dashboard.
 */
angular.module('dashboard')
.factory('MthAgendaItemApi', function ($resource, ENV) {
    return $resource(ENV.MeetingsApiUrl_GetAgendaItem, {},
    {
        get: {
        method: "GET",
        cache: true
        }
    });
})
.factory('MthAgendaItemForMeetingApi', function ($resource, ENV) {
    return $resource(ENV.MeetingsApiUrl_GetAgendaItemForMeeting, {},
    {
        get: {
        method: "GET",
        cache: true
        }
    });
});
