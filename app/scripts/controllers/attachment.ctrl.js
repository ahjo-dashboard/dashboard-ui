'use strict';

/**
 * @ngdoc function
 * @name dashboard.controller:attCtrl
 * @description
 * # attCtrl
 * Controller of the dashboard
 */
angular.module('dashboard')
    .controller('attCtrl', ['$log', '$scope', 'StorageSrv', 'CONST', function ($log, $scope, StorageSrv, CONST) {
        $log.debug("attCtrl");
        var self = this;
        self.att = StorageSrv.getKey(CONST.KEY.LIST_ATT);

        $scope.$on('$destroy', function () {
            $log.debug("attCtrl: DESTROY");
        });
    }]);
