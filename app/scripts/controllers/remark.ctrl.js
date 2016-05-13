/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
* @ngdoc function
* @name dashboard.controller:remarkCtrl
* @description
* # remarkCtrl
* Controller of the dashboard
*/
angular.module('dashboard')
    .controller('remarkCtrl', ['$log', '$scope', 'StorageSrv', 'CONST', function ($log, $scope, StorageSrv, CONST) {
        $log.debug("remarkCtrl: CONTROLLER");
        var self = this;
        self.topic = StorageSrv.getKey(CONST.KEY.TOPIC);

        if (!angular.isObject(self.topic)) {
            $log.error('remarkCtrl: topic missing');
        }

        $scope.$on('$destroy', function () {
            $log.debug("remarkCtrl: DESTROY");
        });
    }]);
