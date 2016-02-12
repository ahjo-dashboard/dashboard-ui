/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
* @ngdoc function
* @name dashboard.controller:meetingStatusCtrl
* @description
* # meetingStatusCtrl
* Controller of the dashboard
*/
angular.module('dashboard')
.controller('meetingStatusCtrl',['$log','$scope','$rootScope','$stateParams','DEVICE','$state','MENU', function ($log, $scope, $rootScope, $stateParams, DEVICE, $state, MENU) {
    $log.debug("meetingStatusCtrl: CONTROLLER");
    var self = this;
    $rootScope.menu = $stateParams.menu;
    self.mobile = $rootScope.device === DEVICE.MOBILE;
    self.title = 'MOBILE TITLE';

    self.goHome = function() {
        $state.go('app.home', {menu: MENU.CLOSED});
    };

    $scope.$on('$destroy', function() {
        $log.debug("meetingStatusCtrl: DESTROY");
    });

}]);
