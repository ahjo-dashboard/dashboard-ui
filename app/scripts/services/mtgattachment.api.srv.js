/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc service
 * @name dashboard.AttachmentApiService
 * @description
 * # AttachmentApiService
 * Service in the dashboard.
 */
angular.module('dashboard')
.factory('MtgAttachmentApi', function ($resource, ENV) {
    return $resource(ENV.MeetingsApiUrl_GetAttachment, {},
    {
        get: {
        method: "GET",
        cache: true
        }
    });
});
