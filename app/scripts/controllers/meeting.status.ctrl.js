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
.controller('meetingStatusCtrl',['$log','$scope','$rootScope','$stateParams','DEVICE','$state','MENU','MEETING','ENV', function ($log, $scope, $rootScope, $stateParams, DEVICE, $state, MENU, MEETING, ENV) {
    $log.debug("meetingStatusCtrl: CONTROLLER");
    var self = this;
    $rootScope.menu = $stateParams.menu;
    self.mobile = $rootScope.device === DEVICE.MOBILE;
    self.title = 'MOBILE TITLE';
    self.object = {};
    self.chairman = false;

    for (var i = 0; i < ENV.SupportedRoles.length; i++) {
        if (ENV.SupportedRoles[i].RoleID === 1) {
            self.chairman = true;
        }
    }

    $scope.$watch(
        // This function returns the value being watched. It is called for each turn of the $digest loop
        function() {
            return MEETING.get('OBJECT');
        },
        function(newObject, oldObject) {
            if (newObject !== oldObject) {
                self.object = newObject;
                // $log.debug("meetingStatusCtrl: new object: " + JSON.stringify(self.object));
            }
        }
    );

    self.goHome = function() {
        $state.go('app.home', {menu: MENU.CLOSED});
    };

    $scope.$on('$destroy', function() {
        $log.debug("meetingStatusCtrl: DESTROY");
    });

}]);
