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
        var sessionStorageKeys = ['meetingitem', 'topic'];

        Data.set = function(key, val) {
            Data[key] = val;
            if (val !== undefined && sessionStorageKeys.indexOf(key) > -1) {
                var dataToStore = JSON.stringify(val);
                sessionStorage.setItem(key, dataToStore);
            }
        };

        Data.get = function(key) {
            var val = Data[key];
            if (val === undefined && sessionStorageKeys.indexOf(key) > -1) {
                var localData = JSON.parse(sessionStorage.getItem(key));
                Data[key] = localData;
                val = Data[key];
            }
            return val;
        };

        Data.delete = function(key) {
            delete Data[key];
        };

        return Data;
    });
