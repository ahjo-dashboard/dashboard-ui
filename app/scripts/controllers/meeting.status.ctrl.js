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
    .controller('meetingStatusCtrl', ['$log', '$scope', '$rootScope', '$stateParams', '$state', 'CONST', 'StorageSrv', 'ENV', 'AhjoMeetingSrv', function($log, $scope, $rootScope, $stateParams, $state, CONST, StorageSrv, ENV, AhjoMeetingSrv) {
        $log.debug("meetingStatusCtrl: CONTROLLER");
        var self = this;
        $rootScope.menu = $stateParams.menu;
        self.title = 'MOBILE TITLE';
        self.meeting = {};
        self.chairman = false;
        self.loading = true;
        var meetingItem = $stateParams.meetingItem;
        var isMobile = $rootScope.isMobile;

        for (var i = 0; i < ENV.SupportedRoles.length; i++) {
            if (ENV.SupportedRoles[i].RoleID === CONST.MTGROLE.CHAIRMAN) {
                self.chairman = true;
            }
        }

        if (meetingItem) {
            AhjoMeetingSrv.getMeeting(meetingItem.meetingGuid).then(function(response) {
                $log.debug("meetingStatusCtrl: getMeeting then:");
                if (response && response.objects instanceof Array && response.objects.length) {
                    self.meeting = response.objects[0];
                    if (self.meeting && self.meeting.topicList.length) {
                        var topic = self.meeting.topicList[0];
                        if (!isMobile) {
                            StorageSrv.set(CONST.KEY.TOPIC, topic);
                        }
                    }
                }
                else {
                    self.meeting = {};
                    StorageSrv.set(CONST.KEY.TOPIC, {});
                }
            }, function(error) {
                $log.error("meetingStatusCtrl: getMeeting error: " + JSON.stringify(error));
                self.error = error;
            }, function(notify) {
                $log.debug("meetingStatusCtrl: getMeeting notify: " + JSON.stringify(notify));
            }).finally(function() {
                $log.debug("meetingStatusCtrl: getMeeting finally: ");
                self.loading = false;
            });
        }
        else {
            $state.go(CONST.APPSTATE.HOME, { menu: CONST.MENU.CLOSED });
        }

        self.goHome = function() {
            $state.go(CONST.APPSTATE.HOME, { menu: CONST.MENU.CLOSED });
        };

        self.topicSelected = function(topic) {
            StorageSrv.set(CONST.KEY.TOPIC, topic);
            if (isMobile) {
                $state.go(CONST.APPSTATE.MEETINGDETAILS, {});
            }
        };

        self.isSelected = function(topic) {
            var selected = StorageSrv.get(CONST.KEY.TOPIC);
            if (topic instanceof Object && selected instanceof Object) {
                return (topic.topicGuid && topic.topicGuid === selected.topicGuid);
            }
            return false;
        };

        self.statusIcon = function(topic) {
            for (var item in CONST.TOPICSTATUS) {
                if (CONST.TOPICSTATUS.hasOwnProperty(item)) {
                    if (topic && topic.topicStatus && topic.topicStatus === CONST.TOPICSTATUS[item].value) {
                        return CONST.TOPICSTATUS[item].iconPath;
                    }
                }
            }
            return null;
        };

        self.stringId = function(meeting) {
            for (var item in CONST.MTGSTATUS) {
                if (CONST.MTGSTATUS.hasOwnProperty(item)) {
                    if (meeting && meeting.meetingStatus && meeting.meetingStatus === CONST.MTGSTATUS[item].value) {
                        return CONST.MTGSTATUS[item].stringId;
                    }
                }
            }
            return 'STR_TOPIC_UNKNOWN';
        };

        self.mtgStatusClass = function(meeting) {
            var s = $rootScope.objWithVal(CONST.MTGSTATUS, 'value', meeting.meetingStatus);
            return s ? s.badgeClass : 'label-default';
        };

        $scope.$on('$destroy', function() {
            $log.debug("meetingStatusCtrl: DESTROY");
        });

    }]);
