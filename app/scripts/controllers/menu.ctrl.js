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
    .controller('menuCtrl', ['$log', '$state', '$rootScope', 'AhjoMeetingsSrv', 'SigningOpenApi', 'CONST', function ($log, $state, $rootScope, AhjoMeetingsSrv, SigningOpenApi, CONST) {
        $log.log("menuCtrl: CONTROLLER");
        var self = this;
        self.title = 'Ahjo Dashboard';
        self.mtgCount = null;
        self.sgnCount = null;
        self.loadingMtg = false;
        self.loadingSgn = false;

        function getMeetings() {
            AhjoMeetingsSrv.getMeetings().then(function (response) {
                $log.debug("menuCtrl.getMeetings: getMeetings then:");
                self.mtgCount = 0;
                if (response && response.objects instanceof Array) {
                    var dt = new Date();
                    dt.setFullYear(dt.getFullYear() - 4);  // this if for testing. to be removed
                    var date = dt.toJSON();
                    self.mtgCount = 0;

                    for (var i = 0; i < response.objects.length; i++) {
                        var item = response.objects[i];
                        if (date && item && (date < item.meetingTime)) {
                            self.mtgCount++;
                        }
                    }
                }
            }, function (error) {
                $log.error("menuCtrl.getMeetings: getMeetings error: " + JSON.stringify(error));
            }, function (notify) {
                $log.debug("menuCtrl.getMeetings: getMeetings notify: " + JSON.stringify(notify));
                self.loadingMtg = true;
            }).finally(function () {
                $log.debug("menuCtrl.getMeetings: getMeetings finally");
                self.loadingMtg = false;
            });
        }

        function getOpenSignings() {
            //$log.debug("menuCtrl: SigningOpenApi.query open");
            self.loadingSgn = true;
            self.responseOpen = SigningOpenApi.query(function () {
                $log.debug("menuCtrl.getOpenSignings: SigningOpenApi.query open done: " + self.responseOpen.length);
                self.sgnCount = self.responseOpen.length;
                self.errOpen = null;
            }, function (error) {
                $log.error("menuCtrl.getOpenSignings: SigningOpenApi.query open error: " + JSON.stringify(error));
                self.errOpen = error;
            });
            self.responseOpen.$promise.finally(function () {
                $log.debug("menuCtrl.getOpenSignings: SigningOpenApi.query open finally");
                self.responseOpen = null;
                self.loadingSgn = false;
            });
        }

        // PUBLIC FUNCTIONS
        self.showMeetings = function () {
            $log.debug("menuCtrl: showMeetings" + CONST.HOMEMODE.MEETINGS);
            $state.go(CONST.APPSTATE.OVERVIEW, { state: CONST.HOMEMODE.MEETINGS });
        };

        self.showSignings = function () {
            $log.debug("menuCtrl: showSignings");
            $state.go(CONST.APPSTATE.OVERVIEW, { state: CONST.HOMEMODE.ESIGN });
        };

        self.showInfo = function () {
            $log.debug("menuCtrl: showInfo");
            $state.go(CONST.APPSTATE.INFO);
        };

        getMeetings();
        getOpenSignings();
    }]);
