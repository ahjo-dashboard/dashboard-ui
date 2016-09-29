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
    .constant('MTGST', {
        'YES': 0,
        'NO': 1,
        'MTG_NOT_ACTIVE': 2,
        'ANOTHER_TOPIC_ACTIVE': 3
    })
    .controller('meetingStatusCtrl', ['$log', '$scope', '$rootScope', '$stateParams', '$state', 'CONST', 'StorageSrv', 'ENV', 'AhjoMeetingSrv', '$timeout', 'Utils', 'DialogUtils', '$uibModal', 'PROPS', 'MTGST', function ($log, $scope, $rootScope, $stateParams, $state, CONST, StorageSrv, ENV, AhjoMeetingSrv, $timeout, Utils, DialogUtils, $uibModal, PROPS, MTGST) {
        $log.debug("meetingStatusCtrl: CONTROLLER");

        // VARIABLES

        $rootScope.menu = $stateParams.menu;
        $rootScope.meetingStatus = null;
        var pollingTimer = null;
        var lastEventId = null;
        var selectedTopicGuid = null;
        var mtgItemSelected = StorageSrv.getKey(CONST.KEY.MEETING_ITEM);
        var activeTopicGuid = null;
        var self = this;
        self.isMobile = $rootScope.isMobile;
        self.uiName = null;
        self.mtgDetails = null;
        self.chairman = false;
        self.loading = true;
        self.updatingStatus = false;
        self.hasUnsavedData = false;
        self.parallelModeActive = false;
        self.unsavedConfig = { title: 'STR_CONFIRM', text: 'STR_WARNING_UNSAVED', yes: 'STR_CONTINUE' };
        self.logoutConfig = { title: 'STR_CONFIRM', text: 'STR_MTG_LOGOUT_CONFIRM', yes: 'STR_CONTINUE' };

        // FUNTIONS

        function openStatusChangeView(title, items, callback) {
            if (angular.isString(title) && angular.isArray(items) && angular.isFunction(callback)) {
                var modalInstance = $uibModal.open({
                    animation: true,
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

                modalInstance.opened.then(function () {
                    DialogUtils.setModalActiveFlag(true);
                });

                modalInstance.closed.then(function () {
                    DialogUtils.setModalActiveFlag(false);
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
                StorageSrv.setKey(CONST.KEY.TOPIC, topic);
            }
            else {
                $log.error("meetingStatusCtrl: storeTopic invalid parameter:");
            }
        }

        function canCloseMeeting() {
            $log.debug("meetingStatusCtrl: canCloseMeeting");
            var result = true;
            if (angular.isObject(self.mtgDetails) && angular.isArray(self.mtgDetails.topicList)) {
                for (var i = 0; result && i < self.mtgDetails.topicList.length; i++) {
                    if (angular.isObject(self.mtgDetails.topicList[i]) && self.mtgDetails.topicList[i].topicStatus !== CONST.TOPICSTATUS.READY.stateId) {
                        // all topic states should be READY
                        result = false;
                    }
                }
            }
            return result;
        }

        function meetingStatusChanged(event) {
            $log.debug("meetingStatusCtrl: meetingStatusChanged", arguments);
            if (angular.isObject(event) && angular.isObject(self.mtgDetails)) {
                self.mtgDetails.meetingStatus = event.meetingState;
                $rootScope.meetingStatus = self.mtgDetails.meetingStatus;
            }
        }

        function topicStatusChanged(event) {
            $log.debug("meetingStatusCtrl: topicStatusChanged");
            if (angular.isObject(event) && angular.isObject(self.mtgDetails) && angular.isArray(self.mtgDetails.topicList)) {
                for (var i = 0; i < self.mtgDetails.topicList.length; i++) {
                    var topic = self.mtgDetails.topicList[i];
                    if (angular.isObject(topic) && angular.equals(topic.topicGuid, event.topicGuid)) {
                        topic.topicStatus = event.topicState;
                    }
                }
            }
        }

        function proposalsStatusChanged(events) {
            $log.debug("meetingStatusCtrl: proposalsStatusChanged");
            if (angular.isArray(events) && angular.isObject(self.mtgDetails) && angular.isArray(self.mtgDetails.topicList)) {

                var changedTopicGuidArray = [];
                angular.forEach(events, function (topic) {
                    if (angular.isObject(topic) && angular.isObject(topic.proposal) && angular.isString(topic.proposal.topicGuid) && !topic.proposal.isOwnProposal) {
                        changedTopicGuidArray.push(topic.proposal.topicGuid);
                    }
                }, changedTopicGuidArray);

                for (var j = 0; j < self.mtgDetails.topicList.length; j++) {
                    var topic = self.mtgDetails.topicList[j];
                    if (angular.isObject(topic)) {
                        topic.isModified = (changedTopicGuidArray.indexOf(topic.topicGuid) > CONST.NOTFOUND);
                        if (!self.isMobile && angular.equals(topic.topicGuid, selectedTopicGuid)) {
                            storeTopic(topic);
                        }
                    }
                }
            }
        }

        function topicEdited(event, mtgDetails) {
            if (!angular.isObject(event) || !angular.isObject(event.topic) || !angular.isObject(mtgDetails) || !mtgDetails.meetingGuid || !angular.isArray(mtgDetails.topicList)) {
                $log.error("meetingStatusCtrl.topicEdited: ignored, bad args");
                return;
            }

            if (!angular.equals(event.meetingID, mtgDetails.meetingGuid)) {
                $log.debug("meetingStatusCtrl.topicEdited: ignored, not this meeting, event.meetingID=" + event.meetingID + " meeting=" + mtgDetails.meetingGuid);
                return;
            }

            var eTopic = event.topic;
            $log.debug("meetingStatusCtrl: topicEdited, topicGuid=" + eTopic.topicGuid + " sequencenumber=" + eTopic.sequencenumber + " mtgGuid=" + mtgDetails.meetingGuid);

            var matchInd;
            for (var i = 0; !angular.isDefined(matchInd) && i < mtgDetails.topicList.length; i++) {
                if (angular.equals(eTopic.topicGuid, mtgDetails.topicList[i].topicGuid)) {
                    matchInd = i;
                    $log.debug("meetingStatusCtrl: merging, topicGuid exists at matchInd=" + matchInd);
                    angular.merge(mtgDetails.topicList[matchInd], eTopic);
                }
            }

            if (!angular.isDefined(matchInd)) {
                $log.debug("meetingStatusCtrl: adding a new topic sequenceNumber=" + eTopic.sequencenumber + " topicList.length=" + mtgDetails.topicList.length);
                var ind = eTopic.sequencenumber - 1;
                if ((ind >= 0) && (ind < mtgDetails.topicList.length)) {
                    mtgDetails.topicList.splice(ind, 0, eTopic);
                } else {
                    $log.error("meetingStatusCtrl: ignored, bad sequencenumber");
                }
            }
        }

        function personLoggedOut(aEvent) {
            $log.debug("meetingStatusCtrl.personLoggedOut: " + JSON.stringify(aEvent));
            if (angular.isObject(aEvent) && angular.isObject(mtgItemSelected) && angular.equals(aEvent.personGuid, mtgItemSelected.dbUserPersonGuid) && angular.equals(aEvent.meetingID, mtgItemSelected.meetingGuid)) {
                self.stopEventPolling();
                DialogUtils.showInfo('STR_INFO_TITLE', 'STR_FORCED_LOGOUT', false).closePromise.finally(function () {
                    $log.debug("meetingStatusCtrl.personLoggedOut: modal dialog finally closed");
                    $state.go(CONST.APPSTATE.HOME, { menu: CONST.MENU.CLOSED });
                });
            }
        }

        function minuteUpdated(aEvent) {
            if (angular.isObject(aEvent)) {
                $log.debug("meetingStatusCtrl.minuteUpdated", arguments);
                $rootScope.$emit(CONST.TOPICMINUTEUPDATED, aEvent);
            }
            else {
                $log.error("meetingStatusCtrl.minuteUpdated", arguments);
            }
        }

        function motionUpdated(aEvent) {
            if (angular.isObject(aEvent) && angular.isObject(aEvent.motion)) {
                $log.debug("meetingStatusCtrl.motionUpdated", arguments);
                var data = StorageSrv.getKey(CONST.KEY.MOTION_DATA);
                if (angular.isObject(data)) {
                    if (angular.isArray(data.objects)) {
                        var found = false;
                        for (var index = 0; !found && index < data.objects.length; index++) {
                            var element = data.objects[index];
                            if (angular.isObject(element) && angular.equals(element.motionGuid, aEvent.motion.motionGuid)) {
                                angular.merge(element, aEvent.motion);
                                found = true;
                            }
                        }
                        if (!found) {
                            data.objects.push(aEvent.motion);
                        }
                    }
                    else {
                        data.objects = [aEvent.motion];
                    }
                }
                else {
                    data = { loading: false, objects: [aEvent.motion] };
                }
                StorageSrv.setKey(CONST.KEY.MOTION_DATA, data);
            }
            else {
                $log.error("meetingStatusCtrl.motionUpdated", arguments);
            }
        }

        function motionUnpublished(aEvent) {
            if (angular.isObject(aEvent) && angular.isObject(aEvent.motion)) {
                $log.debug("meetingStatusCtrl.motionUnpublished", arguments);
                var data = StorageSrv.getKey(CONST.KEY.MOTION_DATA);
                if (angular.isObject(data)) {
                    if (angular.isArray(data.objects)) {
                        var found = false;
                        for (var index = data.objects.length + CONST.NOTFOUND; !found && index > CONST.NOTFOUND; index--) {
                            var element = data.objects[index];
                            if (angular.isObject(element) && angular.equals(element.motionGuid, aEvent.motion.motionGuid)) {
                                data.objects.splice(index, 1);
                                found = true;
                            }
                        }
                        if (found) {
                            StorageSrv.setKey(CONST.KEY.MOTION_DATA, data);
                        }
                    }
                }
            }
            else {
                $log.error("meetingStatusCtrl.motionUnpublished", arguments);
            }
        }

        function getEvents() {
            if (lastEventId && angular.isObject(self.mtgDetails) && self.mtgDetails.meetingGuid) {
                var proposalEvents = [];
                AhjoMeetingSrv.getEvents(lastEventId, self.mtgDetails.meetingGuid).then(function (response) {
                    $log.debug("meetingStatusCtrl: getEvents done: ", arguments);
                    if (angular.isArray(response)) {
                        response.forEach(function (event) {
                            if (angular.isObject(event)) {
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
                                        topicEdited(event, self.mtgDetails);
                                        break;
                                    case CONST.MTGEVENT.LOGGEDOUT:
                                        personLoggedOut(event);
                                        break;
                                    case CONST.MTGEVENT.MINUTEUPDATED:
                                    case CONST.MTGEVENT.MINUTEDELETED:
                                    case CONST.MTGEVENT.MINUTETYPECHANGED:
                                        minuteUpdated(event);
                                        break;
                                    case CONST.MTGEVENT.MOTIONSUPPORTED:
                                    case CONST.MTGEVENT.MOTIONSUPPORTREMOVED:
                                    case CONST.MTGEVENT.MOTIONPUBLISHED:
                                        motionUpdated(event);
                                        break;
                                    case CONST.MTGEVENT.MOTIONUNPUBLISHED:
                                        motionUnpublished(event);
                                        break;
                                    default:
                                        $log.error("meetingStatusCtrl: unsupported typeName: " + event.typeName);
                                        break;
                                }
                            }
                        }, this);
                    }
                }, function (error) {
                    $log.error("meetingStatusCtrl: getEvents error: " + JSON.stringify(error));
                }).finally(function () {
                    self.refreshEventPolling();
                    if (proposalEvents.length) {
                        var concated = proposalEvents;

                        if (angular.isObject(self.mtgDetails) && angular.isArray(self.mtgDetails.topicList)) {
                            angular.forEach(concated, function (e) {
                                angular.forEach(self.mtgDetails.topicList, function (t) {
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

        function getMeetingDetails(mtgItem) {
            if (!angular.isObject(mtgItem)) {
                $log.error("meetingStatusCtrl: getMeetingDetails invalid parameter:");
                return;
            }
            $log.debug("meetingStatusCtrl.getMeetingDetails");
            self.uiName = mtgItem.agencyName + ' ' + mtgItem.name;
            selectedTopicGuid = null;
            activeTopicGuid = null;
            StorageSrv.deleteKey(CONST.KEY.TOPIC);
            self.stopEventPolling();
            AhjoMeetingSrv.getMeeting(mtgItem.meetingGuid).then(function (response) {
                $log.debug("meetingStatusCtrl.getMeetingDetails: done");
                if (angular.isObject(response) && angular.isArray(response.objects) && response.objects.length) {
                    self.mtgDetails = response.objects[0];
                    if (angular.isObject(self.mtgDetails) && angular.isArray(self.mtgDetails.topicList)) {
                        // forward data from meeting item to meeting details
                        self.mtgDetails.dbUserRole = mtgItem.dbUserRole;
                        self.mtgDetails.dbUserPersonGuid = mtgItem.dbUserPersonGuid;

                        angular.forEach(self.mtgDetails.topicList, function (t) {
                            if (angular.isObject(t)) {
                                // forward data from meeting details to topic
                                t.dbUserRole = self.mtgDetails.dbUserRole;
                                t.dbUserPersonGuid = self.mtgDetails.dbUserPersonGuid;
                                t.userPersonGuid = self.mtgDetails.userPersonGuid;
                                t.isCityCouncil = self.mtgDetails.isCityCouncil;
                                t.showClassifiedDocs = self.mtgDetails.showClassifiedDocs;
                                // store active topic if any
                                if (!activeTopicGuid && t.topicStatus === CONST.TOPICSTATUS.ACTIVE.stateId) {
                                    activeTopicGuid = t.topicGuid;
                                }
                            }
                        }, this);

                        if (!self.isMobile) {
                            var storedTopic = StorageSrv.getKey(CONST.KEY.TOPIC);
                            if (angular.isObject(storedTopic)) {
                                selectedTopicGuid = storedTopic.topicGuid;
                            }
                            else {
                                self.mtgDetails.topicList.forEach(function (topic) {
                                    if (!selectedTopicGuid && self.canAccess(topic)) {
                                        storeTopic(topic);
                                    }
                                }, this);
                            }
                        }

                        lastEventId = self.mtgDetails.lastEventId;
                        $rootScope.meetingStatus = self.mtgDetails.meetingStatus;
                        self.startEventPolling();

                        self.uiName = self.mtgDetails.meetingTitle;
                        self.mtgDetails.meetingGuid = mtgItem.meetingGuid;
                    }
                }
            }, function (error) {
                $log.error("meetingStatusCtrl: getMeetingDetails: " + JSON.stringify(error));
                self.error = error;
            }).finally(function () {
                self.loading = false;
            });
        }

        function getMotions(aMtg) {
            $log.debug("meetingStatusCtrl.getMotions", arguments);
            if (angular.isObject(aMtg)) {
                var storedData = StorageSrv.getKey(CONST.KEY.MOTION_DATA);
                // Copy insures own instance of data. Otherwise $watch does not work correctly
                var resultData = storedData ? storedData : angular.copy(CONST.MOTIONDATA);

                AhjoMeetingSrv.getMotions(aMtg.meetingGuid, aMtg.dbUserPersonGuid).then(function (resp) {
                    $log.log("meetingStatusCtrl.getMotions done", resp);
                    resultData.objects = angular.isArray(resp) ? resp : [];
                }, function (error) {
                    $log.error("meetingStatusCtrl.getMotions ", error);
                    self.errorCode = error.errorCode;
                }, function (/*notification*/) {
                    var loadingData = angular.copy(resultData);
                    loadingData.loading = true;
                    StorageSrv.setKey(CONST.KEY.MOTION_DATA, loadingData);
                }).finally(function () {
                    $rootScope.$emit(CONST.MOTIONSUPDATED, { count: resultData.objects.length });
                    StorageSrv.setKey(CONST.KEY.MOTION_DATA, resultData);
                });
            }
            else {
                $log.error("meetingStatusCtrl.getMotions: bad args");
            }
        }

        self.stopEventPolling = function () {
            $timeout.cancel(pollingTimer);
            pollingTimer = null;
        };

        self.startEventPolling = function () {
            self.stopEventPolling();
            pollingTimer = $timeout(function () {
                getEvents();
            }, CONST.POLLINGTIMEOUT);
        };

        self.refreshEventPolling = function () {
            if (pollingTimer) {
                self.startEventPolling();
            }
        };

        self.topicSelected = function (topic) {
            if (angular.isObject(topic)) {
                $log.debug("meetingStatusCtrl.topicSelected: publicity=" + topic.publicity);
                if (!self.isSelected(topic)) {
                    topic.userPersonGuid = self.mtgDetails.userPersonGuid;
                    topic.isCityCouncil = self.mtgDetails.isCityCouncil;
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

        self.canOpenTopic = function (topic) {
            var result = MTGST.NO;
            if (angular.isObject(topic)) {
                if (angular.isObject(self.mtgDetails) && self.mtgDetails.meetingStatus === CONST.MTGSTATUS.ACTIVE.stateId) {
                    // is topic active
                    if (!activeTopicGuid || topic.topicGuid === activeTopicGuid) {
                        result = MTGST.YES;
                    }
                    else if (activeTopicGuid) {
                        result = MTGST.ANOTHER_TOPIC_ACTIVE;
                    }
                }
                else {
                    // meeting inactive
                    result = MTGST.MTG_NOT_ACTIVE;
                }
            }
            return result;
        };

        self.canChangeMtgStatus = function (aMtgDetails) {
            var result = self.chairman && (angular.isObject(aMtgDetails) && angular.isDefined(aMtgDetails.meetingStatus) && ((aMtgDetails.meetingStatus === CONST.MTGSTATUS.TECHNICALLY_OPEN.stateId) || (aMtgDetails.meetingStatus === CONST.MTGSTATUS.ACTIVE.stateId) || (aMtgDetails.meetingStatus === CONST.MTGSTATUS.ABORTED.stateId)));
            return result;
        };

        self.statusIcon = function (topic) {
            if (angular.isObject(topic) && topic.topicStatus) {
                for (var item in CONST.TOPICSTATUS) {
                    if (CONST.TOPICSTATUS.hasOwnProperty(item) && topic.topicStatus === CONST.TOPICSTATUS[item].stateId) {
                        return CONST.TOPICSTATUS[item].iconPath;
                    }
                }
            }
            return null;
        };

        self.topicStatusText = function (topic) {
            if (angular.isObject(topic) && topic.topicStatus) {
                for (var item in CONST.TOPICSTATUS) {
                    if (CONST.TOPICSTATUS.hasOwnProperty(item) && topic.topicStatus === CONST.TOPICSTATUS[item].stateId) {
                        return CONST.TOPICSTATUS[item].stringId;
                    }
                }
            }
            return null;
        };


        self.stringId = function (meeting) {
            for (var item in CONST.MTGSTATUS) {
                if (CONST.MTGSTATUS.hasOwnProperty(item)) {
                    if (angular.isObject(meeting) && meeting.meetingStatus === CONST.MTGSTATUS[item].stateId) {
                        return CONST.MTGSTATUS[item].stringId;
                    }
                }
            }
            return 'STR_TOPIC_UNKNOWN';
        };

        self.mtgStatusClass = function (meeting) {
            if (angular.isObject(meeting)) {
                var s = Utils.objWithVal(CONST.MTGSTATUS, CONST.KEY.STATE_ID, meeting.meetingStatus);
                return s ? s.badgeClass : 'db-badge-red';
            }
            return 'db-badge-red';
        };

        self.topicBtnTitle = function (topic) {
            var result = '';
            if (angular.isObject(topic)) {
                var canOpen = self.canOpenTopic(topic);
                switch (canOpen) {
                    case MTGST.YES:
                        result = 'STR_CHANGE_TOPIC_STATUS';
                        break;
                    case MTGST.NO:
                        result = 'STR_ERR_OP_FAIL';
                        break;
                    case MTGST.MTG_NOT_ACTIVE:
                        result = 'STR_INFO_MTG_INACTIVE';
                        break;
                    case MTGST.ANOTHER_TOPIC_ACTIVE:
                        result = 'STR_INFO_TOPIC_STATUS_CHANGE_DISABLED';
                        break;
                    default:
                        $log.error("meetingStatusCtrl: topicBtnTitle unsupported mode");
                        break;
                }
            }
            else {
                $log.error("meetingStatusCtrl: topicBtnTitle invalid parameter:");
            }
            return result;
        };

        self.toggleParallelMode = function () {
            $rootScope.parallelMode = $rootScope.parallelMode ? false : true;
        };

        self.changeMeetingStatus = function () {
            if (!angular.isObject(self.mtgDetails)) {
                $log.error("meetingStatusCtrl.changeMeetingStatus: meeting details missing");
            }
            else if (self.mtgDetails.isSaliEnabled) {
                DialogUtils.showInfo('STR_INFO_TITLE', 'STR_INFO_SALI_MODE', true).closePromise.finally(function () {
                    $log.debug("meetingStatusCtrl.changeMeetingStatus: modal dialog finally closed");
                });
            } else if (!self.canChangeMtgStatus(self.mtgDetails)) {
                DialogUtils.showInfo('STR_INFO_TITLE', 'STR_INFO_MTG_BAD_STATUS', true).closePromise.finally(function () {
                    $log.debug("meetingStatusCtrl.changeMeetingStatus: modal dialog finally closed");
                });
            }
            else {
                $log.debug("meetingStatusCtrl.changeMeetingStatus: current status=" + self.mtgDetails.meetingStatus);
                var items = [];
                angular.forEach(CONST.MEETINGSTATUSACTIONS, function (status) {
                    if (angular.isObject(status)) {
                        status.disabled = status.active.indexOf(self.mtgDetails.meetingStatus) <= CONST.NOTFOUND;
                        if (self.mtgDetails.meetingStatus === CONST.MTGSTATUS.ACTIVE.stateId && status.stateId === CONST.MEETINGSTATUSACTIONS.CLOSE.stateId) {
                            status.disabled = !canCloseMeeting();
                        }
                        this.push(status);
                    }
                }, items);

                openStatusChangeView('STR_CHANGE_MEETING_STATUS', items, function (status) {
                    if (!angular.isObject(status)) {
                        $log.error("meetingStatusCtrl.changeMeetingStatus: invalid status");
                        return;
                    }
                    $log.debug("meetingStatusCtrl.changeMeetingStatus: selected: " + JSON.stringify(status));
                    AhjoMeetingSrv.setMeetingStatus(self.mtgDetails.meetingGuid, status.actionId).then(function (result) {
                        $log.debug("meetingStatusCtrl.setMeetingStatus: " + JSON.stringify(result));

                        if (angular.isObject(result)) {
                            if (angular.isObject(self.mtgDetails)) {
                                self.mtgDetails.meetingStatus = result.newState;
                                $rootScope.meetingStatus = self.mtgDetails.meetingStatus;
                            }
                        }

                    }, function (error) {
                        $log.error("meetingStatusCtrl.setMeetingStatus: ", arguments);
                        if (angular.isObject(error)) {
                            Utils.showErrorForErrorCode(error.errorCode);
                        }
                    }, function (/*notification*/) {
                        self.updatingStatus = true;
                    }).finally(function () {
                        self.updatingStatus = false;
                    });
                });
            }
        };

        self.changeTopicStatus = function (topic) {
            if (!angular.isObject(self.mtgDetails)) {
                $log.error("meetingStatusCtrl.changeTopicStatus: meeting details missing");
            }
            else if (self.mtgDetails.isSaliEnabled) {
                DialogUtils.showInfo('STR_INFO_TITLE', 'STR_INFO_SALI_MODE', true).closePromise.finally(function () {
                    $log.debug("meetingStatusCtrl.changeTopicStatus: modal dialog finally closed");
                });
            }
            else if (angular.isObject(topic)) {
                $log.debug("meetingStatusCtrl.changeTopicStatus: current status" + topic.topicStatus);
                var canOpen = self.canOpenTopic(topic);

                switch (canOpen) {
                    case MTGST.YES:
                        var items = [];
                        angular.forEach(CONST.TOPICSTATUSACTIONS, function (status) {
                            if (angular.isObject(status) && status.hidden.indexOf(topic.topicStatus) <= CONST.NOTFOUND) {
                                status.disabled = status.active.indexOf(topic.topicStatus) <= CONST.NOTFOUND;
                                this.push(status);
                            }
                        }, items);

                        openStatusChangeView('STR_CHANGE_TOPIC_STATUS', items, function (status) {
                            if (!angular.isObject(status)) {
                                $log.error("meetingStatusCtrl.changeTopicStatus: invalid status");
                                return;
                            }
                            $log.debug("meetingStatusCtrl.changeTopicStatus: selected: " + JSON.stringify(status));

                            AhjoMeetingSrv.setTopicStatus(topic.topicGuid, self.mtgDetails.meetingGuid, status.actionId).then(function (result) {
                                activeTopicGuid = null;

                                if (angular.isObject(result)) {
                                    if (result.newState === CONST.TOPICSTATUS.ACTIVE.stateId) {
                                        // store active topic if any
                                        activeTopicGuid = topic.topicGuid;
                                    }
                                    angular.forEach(self.mtgDetails.topicList, function (t) {
                                        if (angular.isObject(t) && angular.equals(result.guid, t.topicGuid)) {
                                            t.topicStatus = result.newState;
                                        }
                                    }, this);
                                }
                            }, function (error) {
                                $log.error("meetingStatusCtrl.setTopicStatus: ", arguments);
                                if (angular.isObject(error)) {
                                    Utils.showErrorForErrorCode(error.errorCode);
                                }
                            }, function (/*notification*/) {
                                topic.updatingStatus = true;
                            }).finally(function () {
                                topic.updatingStatus = false;
                            });
                        });
                        break;
                    case MTGST.NO:
                        DialogUtils.showInfo('STR_INFO_TITLE', 'STR_ERR_OP_FAIL', false);
                        break;
                    case MTGST.MTG_NOT_ACTIVE:
                        DialogUtils.showInfo('STR_INFO_TITLE', 'STR_INFO_MTG_INACTIVE', false);
                        break;
                    case MTGST.ANOTHER_TOPIC_ACTIVE:
                        DialogUtils.showInfo('STR_INFO_TITLE', 'STR_INFO_TOPIC_STATUS_CHANGE_DISABLED', false);
                        break;
                    default:
                        $log.error("meetingStatusCtrl: changeTopicStatus unsupported mode");
                        break;
                }
            }
            else {
                $log.error("meetingStatusCtrl: changeTopicStatus invalid parameter:");
            }
        };

        self.logOut = function logOutFn() {
            if (angular.isObject(mtgItemSelected) && angular.isObject(mtgItemSelected.dbUserRole)) {
                $log.debug("meetingStatusCtrl.logOut:", mtgItemSelected);
                self.stopEventPolling();
                var dlg = DialogUtils.showProgress('STR_MTG_EXIT_PROGRESS');
                AhjoMeetingSrv.meetingLogout(mtgItemSelected.meetingGuid, mtgItemSelected.dbUserRole.RoleID, mtgItemSelected.dbUserPersonGuid).then(function () {
                    // Potential logout error code ignored, user has no means to recover.
                    // Proceed with state transition.
                }, function (error) {
                    $log.error("meetingStatusCtrl.logOut:", error);
                }).finally(function () {
                    $state.go(CONST.APPSTATE.HOME, { menu: CONST.MENU.CLOSED });
                    DialogUtils.close(dlg);
                });
            } else {
                $log.error("meetingStatusCtrl.logOut: bad args", mtgItemSelected);
                $state.go(CONST.APPSTATE.HOME, { menu: CONST.MENU.CLOSED });
            }
        };

        // CONSTRUCTION
        if (!angular.isObject(mtgItemSelected) || !angular.isObject(mtgItemSelected.dbUserRole) || !angular.isString(mtgItemSelected.dbUserPersonGuid)) {
            $log.error("meetingStatusCtrl: bad meeting, role or person:", mtgItemSelected);
            $state.go(CONST.APPSTATE.HOME, { menu: CONST.MENU.CLOSED });
            return;
        }

        getMeetingDetails(mtgItemSelected);
        getMotions(mtgItemSelected);
        self.chairman = (mtgItemSelected.dbUserRole.RoleID === CONST.MTGROLE.CHAIRMAN.value);

        $scope.$watch(function () {
            return StorageSrv.getKey(CONST.KEY.PROPOSAL_EVENT_ARRAY);
        }, function (events, oldEvents) {
            if (!angular.equals(events, oldEvents)) {
                proposalsStatusChanged(events);
            }
        });

        var proposalCountWatcher = $rootScope.$on(PROPS.COUNT, function (event, data) {
            if (angular.isObject(self.mtgDetails)) {
                angular.forEach(self.mtgDetails.topicList, function (t) {
                    if (angular.isObject(data) && angular.isObject(t) && angular.equals(data.topicGuid, t.topicGuid)) {
                        t.includePublishedRemark = (data.published > 0);
                    }
                }, this);
            }
        });

        var unsavedWatcher = $rootScope.$on(CONST.UNSAVEMEETINGDDATA, function (event, hasUnsaved) {
            self.hasUnsavedData = hasUnsaved ? true : false;
        });

        var modeWatcher = $rootScope.$on(CONST.MTGUICHANGED, function (event, data) {
            if (angular.isObject(data) && data.primaryBlockMode) {
                self.parallelModeActive = data.primaryBlockMode !== CONST.PRIMARYMODE.HIDDEN;
            }
        });

        $scope.$on('$destroy', function () {
            $log.debug("meetingStatusCtrl: DESTROY");
            $timeout.cancel(pollingTimer);
            $rootScope.meetingStatus = null;

            if (angular.isFunction(unsavedWatcher)) {
                unsavedWatcher();
            }
            if (angular.isFunction(modeWatcher)) {
                modeWatcher();
            }
            if (angular.isFunction(proposalCountWatcher)) {
                proposalCountWatcher();
            }
        });

    }]);
