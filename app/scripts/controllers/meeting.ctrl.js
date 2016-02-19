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
.controller('meetingCtrl',['$log','AhjoMeetingSrv','$stateParams','$rootScope','$scope','$state','MENU','BLOCKMODE','StorageSrv', 'APPSTATE','KEY', function ($log, AhjoMeetingSrv, $stateParams, $rootScope, $scope, $state, MENU, BLOCKMODE, StorageSrv, APPSTATE, KEY) {
    $log.debug("meetingCtrl: CONTROLLER");
    var self = this;
    self.upperUrl = {};
    self.lowerUrl = 'http://www.orimi.com/pdf-test.pdf';
    self.error = null;
    self.blockMode = BLOCKMODE.BOTH;
    $rootScope.menu = $stateParams.menu;
    var meetingItem = $stateParams.meetingItem;

    if (meetingItem) {
        AhjoMeetingSrv.getMeeting(meetingItem.meetingGuid)
        .then(function(response) {
            $log.debug("meetingCtrl: getMeeting then:");
            if (response && response.objects instanceof Array && response.objects.length) {
                var meeting = response.objects[0];
                if (meeting && meeting.topicList.length) {
                    var topic = meeting.topicList[0];
                    StorageSrv.set(KEY.TOPIC, topic);
                }
                StorageSrv.set(KEY.MEETING, meeting);
            }
            else {
                StorageSrv.set(KEY.MEETING, {});
                StorageSrv.set(KEY.TOPIC, {});
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

    self.isBothMode = function() {
        return self.blockMode === BLOCKMODE.BOTH;
    };

    self.isUpperMode = function() {
        return self.blockMode === BLOCKMODE.UPPER;
    };

    self.isLowerMode = function() {
        return self.blockMode === BLOCKMODE.LOWER;
    };

    $scope.$watch(
        // This function returns the value being watched. It is called for each turn of the $digest loop
        function() {
            return StorageSrv.get(KEY.TOPIC);
        },
        function(newObject, oldObject) {
            if (newObject !== oldObject) {
                var link = newObject.esitykset[0].link;
                var array = link.split('?',1);
                if (array instanceof Array && array.length) {
                    self.upperUrl = array[0];
                }
            }
        }
    );

    $scope.$on('$destroy', function() {
        $log.debug("meetingCtrl: DESTROY");
    });

}]);
