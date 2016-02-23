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
    self.lowerUrl = {};
    self.error = null;
    self.topic = null;
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

    self.attachmentClicked = function(attachment) {
        self.lowerUrl = (attachment && attachment.link) ? attachment.link : {};
    };

    self.decisionClicked = function(decision) {
        self.lowerUrl = (decision && decision.link) ? decision.link : {};
    };

    self.additionalMaterial = function(material) {
        self.lowerUrl = (material && material.link) ? material.link : {};
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
        function(newTopic, oldTopic) {
            if (newTopic !== oldTopic) {
                self.topic = newTopic;
                if (self.topic) {
                    var link = self.topic .esitykset[0].link;
                    self.upperUrl = link ? link : {};
                }
            }
        }
    );

    $scope.$on('$destroy', function() {
        $log.debug("meetingCtrl: DESTROY");
    });

}]);
