'use strict';

/**
 * @ngdoc function
 * @name dashboard.controller:attachmentCtrl
 * @description
 * # attachmentCtrl
 * Controller of the dashboard
 */
angular.module('dashboard')
    .controller('attachmentCtrl', ['$log', '$scope', 'StorageSrv', 'KEY', function ($log, $scope, StorageSrv, KEY) {
        $log.debug("attachmentCtrl: CONTROLLER");
        var self = this;
        self.data = StorageSrv.get(KEY.LISTPDF_DATA);

        $scope.$on('$destroy', function () {
            $log.debug("attachmentCtrl: DESTROY");
        });
    }]);
