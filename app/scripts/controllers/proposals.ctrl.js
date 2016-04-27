/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
* @ngdoc function
* @name dashboard.controller:proposalsCtrl
* @description
* # proposalsCtrl
* Controller of the dashboard
*/
angular.module('dashboard')
    .controller('proposalsCtrl', ['$log', '$scope', 'StorageSrv', 'CONST', function ($log, $scope, StorageSrv, CONST) {
        $log.debug("proposalsCtrl: CONTROLLER");
        var self = this;
        self.topic = StorageSrv.getKey(CONST.KEY.TOPIC);

        if (!angular.isObject(self.topic)) {
            $log.error('proposalsCtrl: topic missing');
        }

        $scope.$on('$destroy', function () {
            $log.debug("proposalsCtrl: DESTROY");
        });
    }]);
