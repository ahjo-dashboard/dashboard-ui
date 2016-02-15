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
.controller('meetingCtrl',['$log','AhjoMeetingSrv','$stateParams','$rootScope','$scope','$state','MENU','BLOCKMODE', function ($log, AhjoMeetingSrv, $stateParams, $rootScope, $scope, $state, MENU, BLOCKMODE) {
    $log.debug("meetingCtrl: CONTROLLER");
    var self = this;
    self.error = null;
    self.blockMode = BLOCKMODE.BOTH;
    $rootScope.menu = $stateParams.menu;
    var meetingItem = $stateParams.meetingItem;

    if (meetingItem) {
        AhjoMeetingSrv.getMeeting(meetingItem.meetingGuid)
        .then(function(response) {
            $log.debug("meetingCtrl: getMeeting then: " +JSON.stringify(response));
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
        self.blockMode = (self.blockMode === BLOCKMODE.BOTH || self.blockMode === BLOCKMODE.LOWER) ? BLOCKMODE.UPPER : BLOCKMODE.BOTH;
    };

    self.lowerClicked = function() {
        self.blockMode = (self.blockMode === BLOCKMODE.BOTH || self.blockMode === BLOCKMODE.UPPER) ? BLOCKMODE.LOWER : BLOCKMODE.BOTH;
    };

    $scope.$on('$destroy', function() {
        $log.debug("meetingCtrl: DESTROY");
    });

}]);
