'use strict';

/**
 * @ngdoc function
 * @name dashboard.controller:listCtrl
 * @description
 * # listCtrl
 * Controller of the dashboard
 */
angular.module('dashboard')
    .controller('listCtrl', ['$log', '$scope', 'StorageSrv', 'CONST', function ($log, $scope, StorageSrv, CONST) {
        $log.debug("listCtrl: CONTROLLER");
        var self = this;
        self.data = StorageSrv.getKey(CONST.KEY.SELECTION_DATA);

        $scope.$on('$destroy', function () {
            $log.debug("listCtrl: DESTROY");
        });
    }]);
