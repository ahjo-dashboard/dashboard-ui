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
.controller('menuCtrl', ['$log', '$state', '$rootScope', 'DEVICE', 'AhjoMeetingsSrv', function ($log, $state, $rootScope, DEVICE, AhjoMeetingsSrv) {
    $log.log("menuCtrl: CONTROLLER");
    var self = this;
    self.mobile = $rootScope.device === DEVICE.MOBILE;
    self.title = 'Ahjo Dashboard';
    self.mtgCount = 0;
    self.sgnCount = 0;
    self.loading = false;

    AhjoMeetingsSrv.getMeetings()
    .then(function(response) {
        $log.debug("menuCtrl: getMeetings then:");
        self.loading = false;
        if (response && response.objects instanceof Array ) {
            self.mtgCount = response.objects.length;
        }
        else {
            self.mtgCount = 0;
        }
    },
    function(error) {
        $log.error("menuCtrl: getMeetings error: " +JSON.stringify(error));
        self.loading = false;
    },
    function(notify) {
        $log.debug("menuCtrl: getMeetings notify: " +JSON.stringify(notify));
        self.loading = true;
    })
    .finally(function() {
        $log.debug("menuCtrl: getMeetings finally:");
    });

    // PUBLIC FUNCTIONS
    self.showMeetings = function() {
        $log.debug("menuCtrl: showMeetings");
        $state.go('app.meetings');
    };

    self.showSignings = function() {
        $log.debug("menuCtrl: showSignings");
        $state.go('app.signing');
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
