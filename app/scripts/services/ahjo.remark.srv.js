/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
* @ngdoc service
* @name dashboard.AhjoRemarkSrv
* @description
* # AhjoRemarkSrv
* Service in the dashboard.
*/
angular.module('dashboard')
    .factory('AhjoRemarkSrv', ['$resource', 'ENV', function ($resource, ENV) {
        return $resource(ENV.AhjoApi_OwnRemark, { guid: '@guid' }, {
            get: {
                method: ENV.HTTP_GET,
                cache: false
            },
            post: {
                method: ENV.HTTP_POST
            },
            delete: {
                method: ENV.HTTP_DELETE
            }
        });
    }]);
