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
.controller('menuCtrl', ['$log', '$state', '$rootScope', 'DEVICE', 'AhjoMeetingsSrv', 'HOMEMODE', 'APPSTATE', function ($log, $state, $rootScope, DEVICE, AhjoMeetingsSrv, HOMEMODE, APPSTATE) {
    $log.log("menuCtrl: CONTROLLER");
    var self = this;
    self.title = 'Ahjo Dashboard';
    self.mtgCount = 0;
    self.sgnCount = 0;
    self.loading = false;

    AhjoMeetingsSrv.getMeetings()
    .then(function(response) {
        $log.debug("menuCtrl: getMeetings then:");
        self.loading = false;
        self.mtgCount = 0;
        if (response && response.objects instanceof Array ) {
            var date = new Date();
            date.setFullYear(date .getFullYear() - 4);  // this if for testing. to be removed
            date = date.toJSON();
            self.mtgCount = 0;

            for (var i = 0; i < response.objects.length; i++) {
                var item = response.objects[i];
                if (date && item && (date < item.meetingTime)) {
                    self.mtgCount++;
                }
            }
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
        $state.go(APPSTATE.OVERVIEW, {state: HOMEMODE.MEETINGS});
    };

    self.showSignings = function() {
        $log.debug("menuCtrl: showSignings");
        $state.go(APPSTATE.OVERVIEW, {state: HOMEMODE.ESIGN});
    };

    self.showInfo = function() {
        $log.debug("menuCtrl: showInfo");
        $state.go(APPSTATE.INFO);
    };

}]);
