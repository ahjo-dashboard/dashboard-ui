'use strict';

/**
 * @ngdoc function
 * @name dashboard.controller:listCtrl
 * @description
 * # listCtrl
 * Controller of the dashboard
 */
angular.module('dashboard')
    .controller('listCtrl', ['$log', '$scope', 'StorageSrv', 'CONST', '$state', function ($log, $scope, StorageSrv, CONST, $state) {
        $log.debug("listCtrl: CONTROLLER");
        var self = this;
        self.data = StorageSrv.get(CONST.KEY.SELECTION_DATA);
        self.publicity = CONST.PUBLICITY;

        self.select = function (item) {
            if (item && item.publicity !== CONST.PUBLICITY.SECRET) {
                StorageSrv.set(CONST.KEY.LISTPDF_DATA, item);
                $state.go(CONST.APPSTATE.LISTPDF);
            }
        };

        $scope.$on('$destroy', function () {
            $log.debug("listCtrl: DESTROY");
        });
    }]);
