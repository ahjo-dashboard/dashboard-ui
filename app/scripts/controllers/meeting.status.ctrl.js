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
    .controller('meetingStatusCtrl', ['$log', '$scope', '$rootScope', '$stateParams', '$state', 'CONST', 'StorageSrv', 'ENV', 'AhjoMeetingSrv', '$interval', function($log, $scope, $rootScope, $stateParams, $state, CONST, StorageSrv, ENV, AhjoMeetingSrv, $interval) {
        $log.debug("meetingStatusCtrl: CONTROLLER");
        var self = this;
        $rootScope.menu = $stateParams.menu;
        self.title = 'MOBILE TITLE';
        self.meeting = {};
        self.chairman = false;
        self.loading = true;
        var meetingItem = StorageSrv.get(CONST.KEY.MEETING_ITEM);
        var isMobile = $rootScope.isMobile;
        var pollingTimer = null;
        var lastEventId = null;

        for (var i = 0; i < ENV.SupportedRoles.length; i++) {
            if (ENV.SupportedRoles[i].RoleID === CONST.MTGROLE.CHAIRMAN) {
                self.chairman = true;
            }
        }

        function remarkUpdated(event) {
            $log.debug("meetingStatusCtrl: remarkUpdated");
            if (event.MeetingID === meetingItem.meetingGuid) {
                $rootScope.$emit(CONST.PROPOSALEVENT, event);
            }
        }

        function getEvents() {
            $log.debug("meetingStatusCtrl: getEvents");
            if (lastEventId && meetingItem.meetingGuid) {
                AhjoMeetingSrv.getEvents(lastEventId, meetingItem.meetingGuid).then(function(response) {
                    $log.debug("meetingStatusCtrl: getEvents then: ");
                    if (response instanceof Array) {
                        response.forEach(function(event) {
                            switch (event.TypeName) {
                                case CONST.MTGEVENT.LASTEVENTID:
                                    lastEventId = event.LastEventId;
                                    break;
                                case CONST.MTGEVENT.REMARKPUBLISHED:
                                case CONST.MTGEVENT.REMARKDELETED:
                                    remarkUpdated(event);
                                    break;
                                default:
                                    $log.error("meetingStatusCtrl: unsupported TypeName: " + event.TypeName);
                                    break;
                            }
                        }, this);
                    }
                }, function(error) {
                    $log.error("meetingStatusCtrl: getEvents error: " + JSON.stringify(error));
                }, function(notify) {
                    $log.debug("meetingStatusCtrl: getEvents notify: " + JSON.stringify(notify));
                }).finally(function() {
                    $log.debug("meetingStatusCtrl: getEvents finally: ");
                });
            }
            else {
                $log.error("meetingStatusCtrl: getEvents invalid parameter:");
            }
        }

        if (meetingItem) {
            self.meeting = {};
            StorageSrv.delete(CONST.KEY.TOPIC);
            AhjoMeetingSrv.getMeeting(meetingItem.meetingGuid).then(function(response) {
                $log.debug("meetingStatusCtrl: getMeeting then:");
                if (response && response.objects instanceof Array && response.objects.length) {
                    self.meeting = response.objects[0];
                    if (self.meeting instanceof Object) {
                        if (self.meeting.topicList.length) {
                            var topic = self.meeting.topicList[0];
                            if (!isMobile) {
                                StorageSrv.set(CONST.KEY.TOPIC, topic);
                            }
                        }
                        lastEventId = self.meeting.lastEventId; // 19734;
                        pollingTimer = $interval(getEvents, 10000);
                    }
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

        self.isTopicPublic = function(topic) {
            return topic.publicity === CONST.PUBLICITY.PUBLIC;
        };

        self.hasTopicNewProps = function(/*topic*/) {
            return true; //TODO: implement
        };

        self.statusIcon = function(topic) {
            if (topic && topic.topicStatus) {
                for (var item in CONST.TOPICSTATUS) {
                    if (CONST.TOPICSTATUS.hasOwnProperty(item) && topic.topicStatus === CONST.TOPICSTATUS[item].value) {
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
            return s ? s.badgeClass : 'label-danger';
        };

        $scope.$on('$destroy', function() {
            $log.debug("meetingStatusCtrl: DESTROY");
            $interval.cancel(pollingTimer);
        });

    }]);
