/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
* @ngdoc function
* @name dashboard.controller:meetingStatusCtrl
* @description
* # meetingStatusCtrl
* Controller of the dashboard
*/
angular.module('dashboard')
.controller('meetingStatusCtrl',['$log','$scope','$rootScope','$stateParams','DEVICE','$state','MENU','StorageSrv','ENV', 'APPSTATE','TOPICSTATUS','MTGROLE','KEY','MTGSTATUS','AhjoMeetingSrv', function ($log, $scope, $rootScope, $stateParams, DEVICE, $state, MENU, StorageSrv, ENV, APPSTATE, TOPICSTATUS, MTGROLE, KEY, MTGSTATUS, AhjoMeetingSrv) {
    $log.debug("meetingStatusCtrl: CONTROLLER");
    var self = this;
    $rootScope.menu = $stateParams.menu;
    self.mobile = $rootScope.isScreenXs();
    self.title = 'MOBILE TITLE';
    self.meeting = {};
    self.chairman = false;
    var meetingItem = $stateParams.meetingItem;

    for (var i = 0; i < ENV.SupportedRoles.length; i++) {
        if (ENV.SupportedRoles[i].RoleID === MTGROLE.CHAIRMAN) {
            self.chairman = true;
        }
    }

    if (meetingItem) {
        AhjoMeetingSrv.getMeeting(meetingItem.meetingGuid)
        .then(function(response) {
            $log.debug("meetingStatusCtrl: getMeeting then:");
            if (response && response.objects instanceof Array && response.objects.length) {
                self.meeting = response.objects[0];
                if (self.meeting && self.meeting.topicList.length) {
                    var topic = self.meeting.topicList[0];
                    StorageSrv.set(KEY.TOPIC, topic);
                }
            }
            else {
                self.meeting = {};
                StorageSrv.set(KEY.TOPIC, {});
            }
        },
        function(error) {
            $log.error("meetingStatusCtrl: getMeeting error: " +JSON.stringify(error));
            self.error = error;
        },
        function(notify) {
            $log.debug("meetingStatusCtrl: getMeeting notify: " +JSON.stringify(notify));
        })
        .finally(function() {
            $log.debug("meetingStatusCtrl: getMeeting finally: ");
        });
    }
    else {
        $state.go(APPSTATE.HOME, {menu: MENU.CLOSED});
    }

    self.goHome = function() {
        $state.go(APPSTATE.HOME, {menu: MENU.CLOSED});
    };

    self.topicSelected = function(topic) {
        StorageSrv.set(KEY.TOPIC, topic);
    };

    self.isSelected = function(topic) {
        var selected = StorageSrv.get(KEY.TOPIC);
        if (topic instanceof Object && selected instanceof Object) {
            return (topic.topicGuid && topic.topicGuid === selected.topicGuid);
        }
        return false;
    };

    self.statusIcon = function(topic) {
        for (var item in TOPICSTATUS) {
            if( TOPICSTATUS.hasOwnProperty(item) ) {
                if (topic && topic.topicStatus && topic.topicStatus === TOPICSTATUS[item].value) {
                    return TOPICSTATUS[item].iconPath;
                }
            }
        }
    };

    self.stringId = function(meeting) {
        for (var item in MTGSTATUS) {
            if( MTGSTATUS.hasOwnProperty(item) ) {
                if (meeting && meeting.meetingStatus && meeting.meetingStatus === MTGSTATUS[item].value) {
                    return MTGSTATUS[item].stringId;
                }
            }
        }
    };

    $scope.$on('$destroy', function() {
        $log.debug("meetingStatusCtrl: DESTROY");
    });

}]);
