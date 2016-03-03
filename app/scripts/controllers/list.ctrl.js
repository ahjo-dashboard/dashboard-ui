'use strict';

/**
 * @ngdoc function
 * @name dashboard.controller:listCtrl
 * @description
 * # listCtrl
 * Controller of the dashboard
 */
angular.module('dashboard')
    .controller('listCtrl', ['$log', '$scope', 'StorageSrv', 'KEY', 'APPSTATE', '$state', 'PUBLICITY', function ($log, $scope, StorageSrv, KEY, APPSTATE, $state, PUBLICITY) {
        $log.debug("listCtrl: CONTROLLER");
        var self = this;
        self.data = StorageSrv.get(KEY.SELECTION_DATA);
        self.PUBLICITY = PUBLICITY;

        self.select = function (item) {
            if (item && item.publicity !== PUBLICITY.SECRET) {
                StorageSrv.set(KEY.LISTPDF_DATA, item);
                $state.go(APPSTATE.LISTPDF);
            }
        };

        $scope.$on('$destroy', function () {
            $log.debug("listCtrl: DESTROY");
        });
    }]);
