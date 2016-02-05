'use strict';

/**
 * @ngdoc function
 * @name dashboard.controller:homeCtrl
 * @description
 * # homeCtrl
 * Controller of the dashboard
 */
angular.module('dashboard')
.controller('homeCtrl', ['$log', '$scope', '$state', '$rootScope', '$stateParams', function ($log, $scope, $state, $rootScope, $stateParams) {
    $log.log("homeCtrl: CONTROLLER");
    $rootScope.menu = $stateParams.menu;

    $scope.$on('$destroy', function() {
        $log.log("homeCtrl: DESTROY");
    });
}]);
