/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
* @ngdoc service
* @name dashboard.StorageSrv
* @description
* # StorageSrv
* Service in the dashboard.
*/
angular.module('dashboard')
.factory('StorageSrv', function() {
    var Data = {};
    Data.set = function(key, val) { Data[key] = val; };
    Data.get = function(key) { return Data[key]; };
    return Data;
});
