/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
* @ngdoc service
* @name dashboard.AhjoOwnRemarkSrv
* @description
* # AhjoOwnRemarkSrv
* Service in the dashboard.
*/
angular.module('dashboard')
    .factory('AhjoOwnRemarkSrv', ['$resource', 'ENV', function ($resource, ENV) {
        return $resource(ENV.AhjoApi_OwnRemark, { guid: '@guid' }, {
            get: {
                method: ENV.HTTP_GET,
                cache: false
            },
            post: {
                method: ENV.HTTP_POST
            }
        });
    }]);
