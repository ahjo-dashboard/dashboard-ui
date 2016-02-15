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
.controller('menuCtrl', ['$log', '$state', '$rootScope', 'DEVICE', 'AhjoMeetingsSrv', 'HOMEMODE', function ($log, $state, $rootScope, DEVICE, AhjoMeetingsSrv, HOMEMODE) {
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
        $log.debug("menuCtrl: showMeetings" +HOMEMODE.MEETINGS);
        $state.go('app.overview', {state: HOMEMODE.MEETINGS});
    };

    self.showSignings = function() {
        $log.debug("menuCtrl: showSignings");
        $state.go('app.overview', {state: HOMEMODE.ESIGN});
    };

    self.showInfo = function() {
        $log.debug("menuCtrl: showInfo");
        if (self.mobile) {
            $state.go('app.info');
        }
    };

}]);
