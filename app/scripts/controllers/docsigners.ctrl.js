'use strict';

/**
 * @ngdoc function
 * @name dashboard.controller:docSignersCtrl
 * @description
 * # docSignersCtrl
 * Controller of the dashboard
 */
angular.module('dashboard')
    .controller('docSignersCtrl', ['$log', '$scope', '$stateParams', function ($log, $scope, $stateParams) {
        $log.debug("docSignersCtrl: CONTROLLER");
        var self = this;
        self.listMdl = $stateParams.signers;

        $scope.$on('$destroy', function () {
            $log.debug("docSignersCtrl: DESTROY");
        });
    }]);
