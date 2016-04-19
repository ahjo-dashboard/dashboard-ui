'use strict';

/**
 * @ngdoc function
 * @name dashboard.controller:attachmentCtrl
 * @description
 * # attachmentCtrl
 * Controller of the dashboard
 */
angular.module('dashboard')
    .controller('attachmentCtrl', ['$log', '$scope', 'StorageSrv', 'CONST', function ($log, $scope, StorageSrv, CONST) {
        $log.debug("attachmentCtrl: CONTROLLER");
        var self = this;
        self.data = StorageSrv.getKey(CONST.KEY.LISTPDF_DATA);

        $scope.$on('$destroy', function () {
            $log.debug("attachmentCtrl: DESTROY");
        });
    }]);
