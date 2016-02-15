/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc function
 * @name dashboard.controller:MeetingCtrl
 * @description
 * # MeetingCtrl
 * Controller of the dashboard
 */
angular.module('dashboard')
.factory('MEETING', function() {
    var Data = {};
    Data.set = function(key, val) { Data[key] = val; };
    Data.get = function(key) { return Data[key]; };
    return Data;
})
.controller('meetingCtrl',['$log','AhjoMeetingSrv','$stateParams','$rootScope','$scope','$state','MENU','BLOCKMODE','MEETING', function ($log, AhjoMeetingSrv, $stateParams, $rootScope, $scope, $state, MENU, BLOCKMODE, MEETING) {
    $log.debug("meetingCtrl: CONTROLLER");
    var self = this;
    self.error = null;
    self.state = BLOCKMODE.BOTH;
    $rootScope.menu = $stateParams.menu;
    var meetingItem = $stateParams.meetingItem;

    if (meetingItem) {
        AhjoMeetingSrv.getMeeting(meetingItem.meetingGuid)
        .then(function(response) {
            $log.debug("meetingCtrl: getMeeting then:");
            if (response && response.objects instanceof Array) {
                MEETING.set('OBJECT', response.objects[0]);
            }
            else {
                MEETING.set('OBJECT', {});
            }
        },
        function(error) {
            $log.error("meetingCtrl: getMeeting error: " +JSON.stringify(error));
            self.error = error;
        },
        function(notify) {
            $log.debug("meetingCtrl: getMeeting notify: " +JSON.stringify(notify));
        })
        .finally(function() {
            $log.debug("meetingCtrl: getMeeting finally: ");
        });
    }
    else {
        $state.go('app.home', {menu: MENU.CLOSED});
    }

    self.upperClicked = function() {
        $log.debug("meetingCtrl: upperClicked");
        self.state = (self.state === BLOCKMODE.BOTH || self.state === BLOCKMODE.LOWER) ? BLOCKMODE.UPPER : BLOCKMODE.BOTH;
        $log.debug(self.state);
    };

    self.lowerClicked = function() {
        $log.debug("meetingCtrl: lowerClicked");
        self.state = (self.state === BLOCKMODE.BOTH || self.state === BLOCKMODE.UPPER) ? BLOCKMODE.LOWER : BLOCKMODE.BOTH;
        $log.debug(self.state);
    };

    $scope.$on('$destroy', function() {
        $log.debug("meetingCtrl: DESTROY");
    });

}]);
