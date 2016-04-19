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
    .factory('StorageSrv', function () {
        var data = {};
        var sessionStorageKeys = ['meetingitem', 'topic'];

        return {
            setKey: function (key, val) {
                data[key] = val;
                if (val !== undefined && sessionStorageKeys.indexOf(key) > -1) {
                    var dataToStore = JSON.stringify(val);
                    sessionStorage.setItem(key, dataToStore);
                }
            },
            getKey: function (key) {
                var val = data[key];
                if (val === undefined && sessionStorageKeys.indexOf(key) > -1) {
                    var localData = JSON.parse(sessionStorage.getItem(key));
                    data[key] = localData;
                    val = data[key];
                }
                return val;
            },
            deleteKey: function (key) {
                delete data[key];
            }
        };
    });
