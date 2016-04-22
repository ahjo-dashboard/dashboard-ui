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
    .controller('meetingStatusCtrl', ['$log', '$scope', '$rootScope', '$stateParams', '$state', 'CONST', 'StorageSrv', 'ENV', 'AhjoMeetingSrv', '$timeout', function ($log, $scope, $rootScope, $stateParams, $state, CONST, StorageSrv, ENV, AhjoMeetingSrv, $timeout) {
        $log.debug("meetingStatusCtrl: CONTROLLER");
        var self = this;
        $rootScope.menu = $stateParams.menu;
        self.title = 'MOBILE TITLE';
        self.meeting = null;
        self.chairman = false;
        self.loading = true;
        self.isEditing = false;
        self.unsavedConfig = { title: 'STR_CONFIRM', text: 'STR_WARNING_UNSAVED', yes: 'STR_CONTINUE' };
        var meetingItem = StorageSrv.getKey(CONST.KEY.MEETING_ITEM);
        self.isMobile = $rootScope.isMobile;
        var pollingTimer = null;
        var userPersonGuid = null;
        var lastEventId = null;
        var selectedTopicGuid = null;

        for (var i = 0; i < ENV.SupportedRoles.length; i++) {
            if (ENV.SupportedRoles[i].RoleID === CONST.MTGROLE.CHAIRMAN) {
                self.chairman = true;
            }
        }

        function meetingStatusChanged(event) {
            $log.debug("meetingStatusCtrl: meetingStatusChanged");
            if (angular.isObject(event) && angular.isObject(self.meeting)) {
                self.meeting.meetingStatus = event.MeetingStateType;
            }
        }

        function topicStatusChanged(event) {
            $log.debug("meetingStatusCtrl: topicStatusChanged");
            if (angular.isObject(event) && angular.isObject(self.meeting) && angular.isArray(self.meeting.topicList)) {
                for (var i = 0; i < self.meeting.topicList.length; i++) {
                    var topic = self.meeting.topicList[i];
                    if (angular.isObject(topic) && angular.equals(topic.topicGuid, event.TopicID)) {
                        topic.topicStatus = event.TopicStateType;
                    }
                }
            }
        }

        function proposalsStatusChanged(events) {
            $log.debug("meetingStatusCtrl: proposalsStatusChanged");
            if (angular.isArray(events) && angular.isObject(self.meeting) && angular.isArray(self.meeting.topicList)) {

                var changedTopicGuidArray = [];
                angular.forEach(events, function (topic) {
                    if (angular.isObject(topic) && angular.isObject(topic.Proposal) && topic.Proposal.topicGuid) {
                        changedTopicGuidArray.push(topic.Proposal.topicGuid);
                    }
                }, changedTopicGuidArray);

                for (var j = 0; j < self.meeting.topicList.length; j++) {
                    var topic = self.meeting.topicList[j];
                    if (angular.isObject(topic)) {
                        topic.isModified = (changedTopicGuidArray.indexOf(topic.topicGuid) > CONST.NOTFOUND);
                        if (!self.isMobile && angular.equals(topic.topicGuid, selectedTopicGuid)) {
                            StorageSrv.setKey(CONST.KEY.TOPIC, angular.copy(topic));
                        }
                    }
                }
            }
        }

        function getEvents() {
            $log.debug("meetingStatusCtrl: getEvents");
            if (lastEventId && meetingItem.meetingGuid) {
                var proposalEvents = [];
                AhjoMeetingSrv.getEvents(lastEventId, meetingItem.meetingGuid).then(function (response) {
                    $log.debug("meetingStatusCtrl: getEvents then: ");
                    if (response instanceof Array) {
                        response.forEach(function (event) {
                            switch (event.TypeName) {
                                case CONST.MTGEVENT.LASTEVENTID:
                                    lastEventId = event.LastEventId;
                                    break;
                                case CONST.MTGEVENT.REMARKPUBLISHED:
                                case CONST.MTGEVENT.REMARKUPDATED:
                                case CONST.MTGEVENT.REMARKDELETED:
                                    proposalEvents.push(event);
                                    break;
                                case CONST.MTGEVENT.MEETINGSTATECHANGED:
                                    meetingStatusChanged(event);
                                    break;
                                case CONST.MTGEVENT.TOPICSTATECHANGED:
                                    topicStatusChanged(event);
                                    break;
                                default:
                                    $log.error("meetingStatusCtrl: unsupported TypeName: " + event.TypeName);
                                    break;
                            }
                        }, this);
                    }
                }, function (error) {
                    $log.error("meetingStatusCtrl: getEvents error: " + JSON.stringify(error));
                }, function (notify) {
                    $log.debug("meetingStatusCtrl: getEvents notify: " + JSON.stringify(notify));
                }).finally(function () {
                    $log.debug("meetingStatusCtrl: getEvents finally: ");
                    $timeout.cancel(pollingTimer);
                    pollingTimer = $timeout(function () {
                        getEvents();
                    }, CONST.POLLINGTIMEOUT);

                    if (proposalEvents.length) {
                        var events = angular.copy(StorageSrv.getKey(CONST.KEY.PROPOSAL_EVENT_ARRAY));
                        if (angular.isArray(events)) {
                            var concated = events.concat(proposalEvents);
                            StorageSrv.setKey(CONST.KEY.PROPOSAL_EVENT_ARRAY, concated);
                        }
                    }
                });
            }
            else {
                $log.error("meetingStatusCtrl: getEvents invalid parameter:");
            }
        }

        if (meetingItem) {
            self.meeting = null;
            StorageSrv.deleteKey(CONST.KEY.TOPIC);
            AhjoMeetingSrv.getMeeting(meetingItem.meetingGuid).then(function (response) {
                $log.debug("meetingStatusCtrl: getMeeting then:");
                if (angular.isObject(response) && angular.isArray(response.objects) && response.objects.length) {
                    self.meeting = response.objects[0];
                    if (angular.isObject(self.meeting)) {
                        if (self.meeting.topicList.length) {
                            var topic = self.meeting.topicList[0];
                            if (angular.isObject(topic)) {
                                selectedTopicGuid = topic.topicGuid;
                                topic.userPersonGuid = self.meeting.userPersonGuid;
                                if (!self.isMobile) {
                                    StorageSrv.setKey(CONST.KEY.TOPIC, topic);
                                }
                            }
                            else {
                                $log.error("meetingStatusCtrl: getMeeting: invalid topic");
                            }
                        }
                        userPersonGuid = self.meeting.userPersonGuid;
                        lastEventId = self.meeting.lastEventId; // 19734, 20281;
                        $timeout.cancel(pollingTimer);
                        pollingTimer = $timeout(function () {
                            getEvents();
                        }, CONST.POLLINGTIMEOUT);
                    }
                }
            }, function (error) {
                $log.error("meetingStatusCtrl: getMeeting error: " + JSON.stringify(error));
                self.error = error;
            }, function (notify) {
                $log.debug("meetingStatusCtrl: getMeeting notify: " + JSON.stringify(notify));
            }).finally(function () {
                $log.debug("meetingStatusCtrl: getMeeting finally: ");
                self.loading = false;
            });
        }
        else {
            $state.go(CONST.APPSTATE.HOME, { menu: CONST.MENU.CLOSED });
        }

        self.goHome = function () {
            $state.go(CONST.APPSTATE.HOME, { menu: CONST.MENU.CLOSED });
        };

        self.topicSelected = function (topic) {
            if (angular.isObject(topic)) {
                selectedTopicGuid = topic.topicGuid;
                StorageSrv.setKey(CONST.KEY.TOPIC, angular.copy(topic));
                if (self.isMobile) {
                    $state.go(CONST.APPSTATE.MEETINGDETAILS, {});
                }
            }
            else {
                $log.error("meetingStatusCtrl: topicSelected: invalid parameter");
            }
        };

        self.isSelected = function (topic) {
            return (angular.isObject(topic) && topic.topicGuid === selectedTopicGuid);
        };

        self.isTopicPublic = function (topic) {
            return (angular.isObject(topic) && topic.publicity === CONST.PUBLICITY.PUBLIC);
        };

        self.statusIcon = function (topic) {
            if (angular.isObject(topic) && topic.topicStatus) {
                for (var item in CONST.TOPICSTATUS) {
                    if (CONST.TOPICSTATUS.hasOwnProperty(item) && topic.topicStatus === CONST.TOPICSTATUS[item].value) {
                        return CONST.TOPICSTATUS[item].iconPath;
                    }
                }
            }
            return null;
        };

        self.stringId = function (meeting) {
            for (var item in CONST.MTGSTATUS) {
                if (CONST.MTGSTATUS.hasOwnProperty(item)) {
                    if (angular.isObject(meeting) && meeting.meetingStatus === CONST.MTGSTATUS[item].value) {
                        return CONST.MTGSTATUS[item].stringId;
                    }
                }
            }
            return 'STR_TOPIC_UNKNOWN';
        };

        self.mtgStatusClass = function (meeting) {
            if (angular.isObject(meeting)) {
                var s = $rootScope.objWithVal(CONST.MTGSTATUS, CONST.KEY.VALUE, meeting.meetingStatus);
                return s ? s.badgeClass : 'db-badge-red';
            }
            return 'db-badge-red';
        };

        $scope.$watch(function () {
            return StorageSrv.getKey(CONST.KEY.PROPOSAL_EVENT_ARRAY);
        }, function (events, oldEvents) {
            if (!angular.equals(events, oldEvents)) {
                proposalsStatusChanged(events);
            }
        });

        var isEditingWatcher = $rootScope.$on(CONST.PROPOSALISEDITING, function (event, isEditing) {
            self.isEditing = isEditing;
        });

        $scope.$on('$destroy', isEditingWatcher);

        $scope.$on('$destroy', function () {
            $log.debug("meetingStatusCtrl: DESTROY");
            $timeout.cancel(pollingTimer);
        });

    }]);
