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
    .controller('meetingStatusCtrl', ['$log', '$scope', '$rootScope', '$stateParams', '$state', 'CONST', 'StorageSrv', 'ENV', 'AhjoMeetingSrv', '$timeout', 'Utils', 'DialogUtils', '$uibModal', function ($log, $scope, $rootScope, $stateParams, $state, CONST, StorageSrv, ENV, AhjoMeetingSrv, $timeout, Utils, DialogUtils, $uibModal) {
        $log.debug("meetingStatusCtrl: CONTROLLER");

        // VARIABLES

        var self = this;
        var pollingTimer = null;
        var lastEventId = null;
        var selectedTopicGuid = null;

        $rootScope.menu = $stateParams.menu;
        self.isMobile = $rootScope.isMobile;
        self.title = 'MOBILE TITLE';
        self.uiName = null;
        self.uiRole = 'Päätösvaltainen osallistuja'; // todo: update dynamically
        self.meeting = null;
        self.chairman = false;
        self.loading = true;
        self.hasUnsavedData = false;
        self.parallelModeActive = false;
        self.unsavedConfig = { title: 'STR_CONFIRM', text: 'STR_WARNING_UNSAVED', yes: 'STR_CONTINUE' };
        var mtgRole = StorageSrv.getKey(CONST.KEY.MEETING_ROLE);
        var mtgPersonGuid = StorageSrv.getKey(CONST.KEY.MEETING_PERSONGUID);
        var mtgItem = StorageSrv.getKey(CONST.KEY.MEETING_ITEM);

        // FUNTIONS

        self.logOut = function logOutFn() {
            $log.debug("meetingStatusCtrl.logOut: \n - meeting:\n" + JSON.stringify(mtgItem) + "\n - role: " + JSON.stringify(mtgRole) + "\n - mtgPersonGuid: " + mtgPersonGuid);
            if (angular.isObject(mtgItem) && angular.isObject(mtgRole) && mtgPersonGuid) {
                DialogUtils.openProgress('STR_MTG_EXIT_PROGRESS');
                AhjoMeetingSrv.meetingLogout(mtgItem.meetingGuid, mtgRole.RoleID, mtgPersonGuid).then(function () {
                }, function (error) {
                    $log.error("meetingStatusCtrl.logOut: " + JSON.stringify(error));
                }).finally(function () {
                    $state.go(CONST.APPSTATE.HOME, { menu: CONST.MENU.CLOSED });
                    DialogUtils.closeProgress();
                });
            } else {
                $log.error("meetingStatusCtrl.logOut: bad args \n - meeting:\n" + JSON.stringify(mtgItem) + "\n - role: " + JSON.stringify(mtgRole) + "\n - mtgPersonGuid: " + mtgPersonGuid);
                $state.go(CONST.APPSTATE.HOME, { menu: CONST.MENU.CLOSED });
            }
        };

        function openStatusChangeView(title, items, callback) {
            if (angular.isString(title) && angular.isArray(items) && angular.isFunction(callback)) {
                var modalInstance = $uibModal.open({
                    animation: false,
                    templateUrl: 'views/selection.modal.html',
                    controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                        $scope.title = title;
                        $scope.items = items;
                        $scope.selected = null;

                        $scope.isSelected = function (item) {
                            return angular.equals(item, $scope.selected);
                        };

                        $scope.clicked = function (ok) {
                            if (ok) {
                                $uibModalInstance.close($scope.selected);
                            }
                            else {
                                $uibModalInstance.dismiss();
                            }
                        };

                        $scope.itemSelected = function (selectedItem) {
                            $scope.selected = selectedItem;
                        };
                    }]
                });

                modalInstance.result.then(function (selectedItem) {
                    callback(selectedItem);
                });
            }
            else {
                $log.error("meetingStatusCtrl: openStatusChangeView invalid parameter:");
            }
        }

        function storeTopic(topic) {
            if (angular.isObject(topic)) {
                selectedTopicGuid = topic.topicGuid;
                StorageSrv.setKey(CONST.KEY.TOPIC, angular.copy(topic));
            }
            else {
                $log.error("meetingStatusCtrl: storeTopic invalid parameter:");
            }
        }

        function meetingStatusChanged(event) {
            $log.debug("meetingStatusCtrl: meetingStatusChanged");
            if (angular.isObject(event) && angular.isObject(self.meeting)) {
                self.meeting.meetingStatus = event.meetingStateType;
            }
        }

        function topicStatusChanged(event) {
            $log.debug("meetingStatusCtrl: topicStatusChanged");
            if (angular.isObject(event) && angular.isObject(self.meeting) && angular.isArray(self.meeting.topicList)) {
                for (var i = 0; i < self.meeting.topicList.length; i++) {
                    var topic = self.meeting.topicList[i];
                    if (angular.isObject(topic) && angular.equals(topic.topicGuid, event.topicID)) {
                        topic.topicStatus = event.topicStateType;
                    }
                }
            }
        }

        function proposalsStatusChanged(events) {
            $log.debug("meetingStatusCtrl: proposalsStatusChanged");
            if (angular.isArray(events) && angular.isObject(self.meeting) && angular.isArray(self.meeting.topicList)) {

                var changedTopicGuidArray = [];
                angular.forEach(events, function (topic) {
                    if (angular.isObject(topic) && angular.isObject(topic.proposal) && angular.isString(topic.proposal.topicGuid) && !topic.proposal.isOwnProposal) {
                        changedTopicGuidArray.push(topic.proposal.topicGuid);
                    }
                }, changedTopicGuidArray);

                for (var j = 0; j < self.meeting.topicList.length; j++) {
                    var topic = self.meeting.topicList[j];
                    if (angular.isObject(topic)) {
                        topic.isModified = (changedTopicGuidArray.indexOf(topic.topicGuid) > CONST.NOTFOUND);
                        if (!self.isMobile && angular.equals(topic.topicGuid, selectedTopicGuid)) {
                            storeTopic(topic);
                        }
                    }
                }
            }
        }

        function topicEdited(event, mtgGuid, mtg) {
            if (!angular.isObject(event) || !angular.isObject(event.topic) || !angular.isObject(mtg) || !mtgGuid || !angular.isArray(mtg.topicList)) {
                $log.error("meetingStatusCtrl.topicEdited: ignored, bad args");
                return;
            }

            if (!angular.equals(event.meetingID, mtgGuid)) {
                $log.debug("meetingStatusCtrl.topicEdited: ignored, not this meeting, event.meetingID=" + event.meetingID + " meeting=" + mtg.meetingGuid);
                return;
            }

            var eTopic = event.topic;
            $log.debug("meetingStatusCtrl: topicEdited, topicGuid=" + eTopic.topicGuid + " sequencenumber=" + eTopic.sequencenumber + " mtgGuid=" + mtgGuid);

            var matchInd;
            for (var i = 0; !angular.isDefined(matchInd) && i < mtg.topicList.length; i++) {
                if (angular.equals(eTopic.topicGuid, mtg.topicList[i].topicGuid)) {
                    matchInd = i;
                    $log.debug("meetingStatusCtrl: merging, topicGuid exists at matchInd=" + matchInd);
                    angular.merge(mtg.topicList[matchInd], eTopic);
                }
            }

            if (!angular.isDefined(matchInd)) {
                $log.debug("meetingStatusCtrl: adding a new topic sequenceNumber=" + eTopic.sequencenumber + " topicList.length=" + mtg.topicList.length);
                var ind = eTopic.sequencenumber - 1;
                if ((ind >= 0) && (ind < mtg.topicList.length)) {
                    mtg.topicList.splice(ind, 0, eTopic);
                } else {
                    $log.error("meetingStatusCtrl: ignored, bad sequencenumber");
                }
            }


        }

        function getEvents() {
            if (lastEventId && mtgItem.meetingGuid) {
                var proposalEvents = [];
                AhjoMeetingSrv.getEvents(lastEventId, mtgItem.meetingGuid).then(function (response) {
                    if (angular.isArray(response)) {
                        response.forEach(function (event) {
                            $log.debug("meetingStatusCtrl: getEvents then: " + event.typeName);
                            switch (event.typeName) {
                                case CONST.MTGEVENT.LASTEVENTID:
                                    lastEventId = event.lastEventId;
                                    break;
                                case CONST.MTGEVENT.REMARKPUBLISHED:
                                case CONST.MTGEVENT.REMARKUPDATED:
                                    if (angular.isObject(event) && angular.isObject(event.proposal) && !event.proposal.isOwnProposal) {
                                        proposalEvents.push(event);
                                    }
                                    break;
                                case CONST.MTGEVENT.REMARKDELETED:
                                    if (angular.isObject(event) && angular.isObject(event.proposal) && !event.proposal.isOwnProposal) {
                                        // spare some extra time to handle other events before deletion
                                        $timeout(function () {
                                            $rootScope.$emit(CONST.PROPOSALDELETED, event);
                                        }, 1000);
                                    }
                                    break;
                                case CONST.MTGEVENT.REMARKUNPUBLISHED:
                                    break;
                                case CONST.MTGEVENT.MEETINGSTATECHANGED:
                                    meetingStatusChanged(event);
                                    break;
                                case CONST.MTGEVENT.TOPICSTATECHANGED:
                                    topicStatusChanged(event);
                                    break;
                                case CONST.MTGEVENT.TOPICEDITED:
                                    topicEdited(event, mtgItem.meetingGuid, self.meeting);
                                    break;
                                default:
                                    $log.error("meetingStatusCtrl: unsupported typeName: " + event.typeName);
                                    break;
                            }
                        }, this);
                    }
                }, function (error) {
                    $log.error("meetingStatusCtrl: getEvents error: " + JSON.stringify(error));
                }).finally(function () {
                    $timeout.cancel(pollingTimer);
                    pollingTimer = $timeout(function () {
                        getEvents();
                    }, CONST.POLLINGTIMEOUT);

                    if (proposalEvents.length) {
                        var concated = proposalEvents;

                        if (angular.isObject(self.meeting) && angular.isArray(self.meeting.topicList)) {
                            angular.forEach(concated, function (e) {
                                angular.forEach(self.meeting.topicList, function (t) {
                                    if (angular.isObject(e) && angular.isObject(t) && angular.equals(e.proposal.topicGuid, t.topicGuid)) {
                                        t.includePublishedRemark = true;
                                    }
                                }, this);
                            }, this);
                        }

                        var events = angular.copy(StorageSrv.getKey(CONST.KEY.PROPOSAL_EVENT_ARRAY));
                        if (angular.isArray(events)) {
                            concated = events.concat(proposalEvents);
                        }
                        StorageSrv.setKey(CONST.KEY.PROPOSAL_EVENT_ARRAY, concated);
                    }
                });
            }
            else {
                $log.error("meetingStatusCtrl: getEvents invalid parameter:");
            }
        }

        function getMeeting(mtgItem) {
            $log.debug("meetingStatusCtrl.getMeeting");
            self.uiName = mtgItem.agencyName + ' ' + mtgItem.name;
            selectedTopicGuid = null;
            StorageSrv.deleteKey(CONST.KEY.TOPIC);
            $timeout.cancel(pollingTimer);
            pollingTimer = null;
            AhjoMeetingSrv.getMeeting(mtgItem.meetingGuid).then(function (response) {
                $log.debug("meetingStatusCtrl.getMeeting: done");
                if (angular.isObject(response) && angular.isArray(response.objects) && response.objects.length) {
                    self.meeting = response.objects[0];
                    if (angular.isObject(self.meeting) && angular.isArray(self.meeting.topicList)) {

                        angular.forEach(self.meeting.topicList, function (t) {
                            if (angular.isObject(t)) {
                                t.userPersonGuid = self.meeting.userPersonGuid;
                                t.isCityCouncil = self.meeting.isCityCouncil;
                                t.showClassifiedDocs = self.meeting.showClassifiedDocs;
                            }
                        }, this);

                        if (!self.isMobile) {
                            var storedTopic = StorageSrv.getKey(CONST.KEY.TOPIC);
                            if (angular.isObject(storedTopic)) {
                                selectedTopicGuid = storedTopic.topicGuid;
                            }
                            else {
                                self.meeting.topicList.forEach(function (topic) {
                                    if (!selectedTopicGuid && self.canAccess(topic)) {
                                        storeTopic(topic);
                                    }
                                }, this);
                            }
                        }

                        lastEventId = self.meeting.lastEventId;
                        $timeout.cancel(pollingTimer);
                        pollingTimer = $timeout(function () {
                            getEvents();
                        }, CONST.POLLINGTIMEOUT);

                        self.uiName = self.meeting.meetingTitle;
                    }
                }
            }, function (error) {
                $log.error("meetingStatusCtrl: getMeeting error: " + JSON.stringify(error));
                self.error = error;
            }).finally(function () {
                self.loading = false;
            });
        }

        self.topicSelected = function (topic) {
            if (angular.isObject(topic)) {
                $log.debug("meetingStatusCtrl.topicSelected: publicity=" + topic.publicity);
                if (!self.isSelected(topic)) {
                    topic.userPersonGuid = self.meeting.userPersonGuid;
                    topic.isCityCouncil = self.meeting.isCityCouncil;
                    storeTopic(topic);
                    if (self.isMobile) {
                        $state.go(CONST.APPSTATE.MEETINGDETAILS, {});
                    }
                    self.hasUnsavedData = false;
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

        self.canAccess = function (topic) {
            if (angular.isObject(topic)) {
                return (self.isTopicPublic(topic) || topic.showClassifiedDocs === true);
            }
            return false;
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

        self.topicStatusText = function (topic) {
            if (angular.isObject(topic) && topic.topicStatus) {
                for (var item in CONST.TOPICSTATUS) {
                    if (CONST.TOPICSTATUS.hasOwnProperty(item) && topic.topicStatus === CONST.TOPICSTATUS[item].value) {
                        return CONST.TOPICSTATUS[item].stringId;
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
                var s = Utils.objWithVal(CONST.MTGSTATUS, CONST.KEY.VALUE, meeting.meetingStatus);
                return s ? s.badgeClass : 'db-badge-red';
            }
            return 'db-badge-red';
        };

        self.toggleParallelMode = function () {
            $rootScope.parallelMode = $rootScope.parallelMode ? false : true;
        };

        self.changeMeetingStatus = function () {
            $log.debug("meetingStatusCtrl.changeMeetingStatus");
            var items = [];
            angular.forEach(CONST.MEETINGSTATUSACTIONS, function (status) {
                if (angular.isObject(status) && angular.isObject(self.meeting)) {
                    // todo: active status needs to be updated to app constants
                    console.log('TOPIC STATUS');
                    console.log(self.meeting.meetingStatus);
                    status.disabled = status.active.indexOf(self.meeting.meetingStatus) <= CONST.NOTFOUND;
                    this.push(status);
                }
            }, items);
            openStatusChangeView('STR_CHANGE_MEETING_STATUS', items, function (result) {
                $log.debug("meetingStatusCtrl.changeMeetingStatus: selected: " + JSON.stringify(result));
                // todo: update selected status to backend
            });
        };

        self.changeTopicStatus = function (topic) {
            if (angular.isObject(topic)) {
                $log.debug("meetingStatusCtrl.changeTopicStatus");
                var items = [];
                angular.forEach(CONST.TOPICSTATUSACTIONS, function (status) {
                    if (angular.isObject(status) && angular.isObject(topic)) {
                        // todo: active status needs to be updated to app constants
                        console.log('TOPIC STATUS');
                        console.log(topic.topicStatus);
                        status.disabled = status.active.indexOf(topic.topicStatus) <= CONST.NOTFOUND;
                        this.push(status);
                    }
                }, items);
                openStatusChangeView('STR_CHANGE_TOPIC_STATUS', items, function (result) {
                    $log.debug("meetingStatusCtrl.changeTopicStatus: selected: " + JSON.stringify(result));
                    // todo: update selected status to backend
                });
            }
            else {
                $log.error("meetingStatusCtrl: changeTopicStatus invalid parameter:");
            }
        };

        // CONSTRUCTION
        if (!mtgItem || !mtgRole) {
            $log.error("meetingStatusCtrl: bad meeting or role: \n " + JSON.stringify(mtgItem) + '\n' + JSON.stringify(mtgRole));
            self.logOut();
            return;
        } else {
            getMeeting(mtgItem);
        }

        if (angular.isObject(mtgRole)) {
            self.chairman = (mtgRole.RoleID === CONST.MTGROLE.CHAIRMAN);
        }

        $scope.$watch(function () {
            return StorageSrv.getKey(CONST.KEY.PROPOSAL_EVENT_ARRAY);
        }, function (events, oldEvents) {
            if (!angular.equals(events, oldEvents)) {
                proposalsStatusChanged(events);
            }
        });

        var unsavedWatcher = $rootScope.$on(CONST.UNSAVEMEETINGDDATA, function (event, hasUnsaved) {
            self.hasUnsavedData = hasUnsaved ? true : false;
        });

        var modeWatcher = $rootScope.$on(CONST.MEETINGPARALLELMODE, function (event, active) {
            self.parallelModeActive = active ? true : false;
        });

        $scope.$on('$destroy', unsavedWatcher);
        $scope.$on('$destroy', modeWatcher);

        $scope.$on('$destroy', function () {
            $log.debug("meetingStatusCtrl: DESTROY");
            $timeout.cancel(pollingTimer);
        });

    }]);
