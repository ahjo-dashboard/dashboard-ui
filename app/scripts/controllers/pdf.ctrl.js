'use strict';

/**
 * @ngdoc function
 * @name dashboard.controller:pdfCtrl
 * @description
 * # pdfCtrl
 * Controller of the dashboard
 */
angular.module('dashboard')
.controller('pdfCtrl', ['$log','$scope','StorageSrv','KEY', function ($log, $scope, StorageSrv, KEY) {
    $log.debug("pdfCtrl: CONTROLLER");
    var self = this;
    self.data = StorageSrv.get(KEY.LISTPDF_DATA);

    $scope.$on('$destroy', function() {
        $log.debug("pdfCtrl: DESTROY");
    });
}]);
