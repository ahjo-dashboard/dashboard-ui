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
    .factory('StorageSrv', function (CONST, $log) {
        var data = {};
        var sessionStorageKeys = [CONST.KEY.MEETING_ITEM, CONST.KEY.TOPIC];
        var arrays = [CONST.KEY.PROPOSAL_EVENT_ARRAY];

        return {
            setKey: function (key, val) {
                if (typeof key === "string" && val !== undefined) {
                    data[key] = val;
                    if (val !== undefined && sessionStorageKeys.indexOf(key) > CONST.NOTFOUND) {
                        var dataToStore = JSON.stringify(val);
                        sessionStorage.setItem(key, dataToStore);
                    }
                }
                else {
                    $log.error("StorageSrv: setKey invalid parameter");
                }
            },
            getKey: function (key) {
                if (typeof key === "string") {
                    var val = data[key];
                    if (val === undefined && sessionStorageKeys.indexOf(key) > CONST.NOTFOUND) {
                        var localData = JSON.parse(sessionStorage.getItem(key));
                        data[key] = localData;
                        val = data[key];
                    }
                    if (val === undefined && arrays.indexOf(key) > CONST.NOTFOUND) {
                        data[key] = [];
                        val = data[key];
                    }
                    return val;
                }
                else {
                    $log.error("StorageSrv: getKey invalid parameter");
                }
                return null;
            },
            deleteKey: function (key, fully) {
                if (typeof key === "string") {
                    delete data[key];
                    if (fully) {
                        sessionStorage.removeItem(key);
                    }
                }
                else {
                    $log.error("StorageSrv: deleteKey invalid parameter");
                }
            },
            reset: function (excl) {
                var newData = {};

                for (var i = 0; angular.isArray(excl) && (i < excl.length); i++) {
                    var tmpVal = data[excl[i]];
                    if (angular.isDefined(tmpVal)) {
                        newData[excl[i]] = tmpVal;
                    }
                }

                data = newData;
                // $log.debug("StorageSrv.reset: excl=" + JSON.stringify(excl) + " result: " + JSON.stringify(data));
            }
        };
    });
