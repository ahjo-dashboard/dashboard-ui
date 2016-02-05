/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc function
 * @name dashboard.controller:MenuCtrl
 * @description
 * # MenuCtrl
 * Controller of the dashboard
 */
angular.module('dashboard')
.controller('menuCtrl', ['$log', '$state', '$rootScope', 'DEVICE', function ($log, $state, $rootScope, DEVICE) {
  	$log.log("menuCtrl: CONTROLLER");
    var self = this;
    self.mobile = $rootScope.device === DEVICE.MOBILE;
    self.title = 'Ahjo Dashboard';

    // PUBLIC FUNCTIONS
    self.showMeetings = function() {
        $log.debug("menuCtrl: showMeetings");
        // if (self.mobile) {
            $state.go('app.meetings');
        // }
    };

    self.showSignings = function() {
        $log.debug("menuCtrl: showSignings");
        // if (self.mobile) {
            $state.go('app.signing');
        // }
    };

    self.showInfo = function() {
        $log.debug("menuCtrl: showInfo");
        if (self.mobile) {
            $state.go('app.info');
        }
    };

    self.toggleMenu = function() {
        $log.debug("menuCtrl: toggleMenu");
		$rootScope.menu = !$rootScope.menu;
    };

}]);
