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
.controller('meetingCtrl',['$log','AhjoMeetingSrv','$stateParams','$rootScope','$scope','$state','MENU','BLOCKMODE','MEETING', 'APPSTATE', function ($log, AhjoMeetingSrv, $stateParams, $rootScope, $scope, $state, MENU, BLOCKMODE, MEETING, APPSTATE) {
    $log.debug("meetingCtrl: CONTROLLER");
    var self = this;
    self.error = null;
    self.blockMode = BLOCKMODE.BOTH;
    $rootScope.menu = $stateParams.menu;
    var meetingItem = $stateParams.meetingItem;

    if (meetingItem) {
        AhjoMeetingSrv.getMeeting(meetingItem.meetingGuid)
        .then(function(response) {
            $log.debug("meetingCtrl: getMeeting then:");
            if (response && response.objects instanceof Array) {
                MEETING.set('MEETING', response.objects[0]);
            }
            else {
                MEETING.set('MEETING', {});
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
        $state.go(APPSTATE.HOME, {menu: MENU.CLOSED});
    }

    self.upperClicked = function() {
        self.blockMode = (self.blockMode === BLOCKMODE.BOTH || self.blockMode === BLOCKMODE.LOWER) ? BLOCKMODE.UPPER : BLOCKMODE.BOTH;
    };

    self.lowerClicked = function() {
        self.blockMode = (self.blockMode === BLOCKMODE.BOTH || self.blockMode === BLOCKMODE.UPPER) ? BLOCKMODE.LOWER : BLOCKMODE.BOTH;
    };

    self.isUpperMode = function() {
        return self.blockMode === BLOCKMODE.UPPER;
    };

    self.isLowerMode = function() {
        return self.blockMode === BLOCKMODE.LOWER;
    };

    $scope.$on('$destroy', function() {
        $log.debug("meetingCtrl: DESTROY");
    });

}]);
