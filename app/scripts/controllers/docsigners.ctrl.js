'use strict';

/**
 * @ngdoc function
 * @name dashboard.controller:docSignersCtrl
 * @description
 * # docSignersCtrl
 * Controller of the dashboard
 */
angular.module('dashboard')
    .controller('docSignersCtrl', ['$log', '$scope', 'CONST', 'StorageSrv', '$state', function ($log, $scope, CONST, StorageSrv, $state) {
        $log.debug("docSignersCtrl: CONTROLLER");
        var self = this;

        var tmp = StorageSrv.getKey(CONST.KEY.SIGN_ITEM);
        if (!tmp || !tmp.ProcessGuid || !tmp.ProcessGuid.length) {
            $log.error("docSignersCtrl: item missing \n" + JSON.stringify(tmp));
            $state.go(CONST.APPSTATE.HOME);
            return;
        }

        self.item = tmp;

        // $scope.$on('$destroy', function () {
        //     $log.debug("docSignersCtrl: DESTROY");
        // });
    }]);
