/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc directive
 * @name dashboard.decisionsDirective
 * @description
 * # decisionsDirective
 */
angular.module('dashboard')
    .directive('dbDecisions', [function () {

        var controller = ['$log', '$scope', 'AhjoMeetingSrv', 'StorageSrv', 'CONST', 'PROPS', '$rootScope', function ($log, $scope, AhjoMeetingSrv, StorageSrv, CONST, PROPS, $rootScope) {
            $log.log("dbDecisions: CONTROLLER");
            var self = this;
            self.loading = false;
            self.types = [];
            self.selectedItem = null;
            self.errorCode = 0;
            self.record = [];
            self.voting = [];
            var mtgTopicSelected = StorageSrv.getKey(CONST.KEY.TOPIC);
            var mtgItemSelected = StorageSrv.getKey(CONST.KEY.MEETING_ITEM);

            // FUNCTIONS

            function setTypes(isCityCouncil) {
                if (isCityCouncil === true || isCityCouncil === false) {
                    $log.log("dbDecisions.setTypes", arguments);
                    var types = [];
                    angular.forEach(PROPS.TYPE, function (type) {
                        if (angular.isObject(type) && type.decisionOrder) {
                            var mgtType = isCityCouncil ? CONST.MTGTYPE.CITYCOUNCIL : CONST.MTGTYPE.DEFAULT;
                            if (angular.isArray(type.mgtTypes) && type.mgtTypes.indexOf(mgtType) > CONST.NOTFOUND) {
                                this.push(type);
                            }
                        }
                    }, types);
                    self.types = types;
                }
                else {
                    $log.error("dbDecisions.setTypes: bad args");
                }
            }

            function resetData() {
                self.record = [];
                self.voting = [];
            }

            function updateDecision(aDecision) {
                if (angular.isObject(aDecision)) {
                    $log.log("dbDecisions.updateDecision", arguments);
                    if (!angular.isArray(self.record)) {
                        self.record = [];
                    }
                    var found = false;

                    if (aDecision.typeName === CONST.MTGEVENT.MINUTEUPDATED) {
                        if (angular.isObject(mtgTopicSelected) && angular.equals(mtgTopicSelected.topicGuid, aDecision.topicGuid)) {

                            if (angular.isObject(aDecision.minuteEntry)) {
                                aDecision.minuteEntry.isModified = true;
                                for (var i = 0; !found && i < self.record.length; i++) {
                                    var entry = self.record[i];
                                    if (angular.isObject(entry) && angular.equals(entry.minuteEntryGuid, aDecision.minuteEntry.minuteEntryGuid)) {
                                        var supporters = aDecision.minuteEntry.entrySupporters;
                                        angular.merge(entry, aDecision.minuteEntry);
                                        entry.entrySupporters = supporters;
                                        found = true;
                                    }
                                }
                                if (!found) {
                                    self.record.push(aDecision.minuteEntry);
                                }
                            }
                            if (angular.isArray(aDecision.supporters) && aDecision.supporters.length) {
                                // todo: implement supporter updating
                            }
                        }
                    }
                    else if (aDecision.typeName === CONST.MTGEVENT.MINUTEDELETED) {
                        if (angular.isObject(mtgTopicSelected) && angular.equals(mtgTopicSelected.topicGuid, aDecision.topicGuid)) {

                            for (var k = self.record.length + CONST.NOTFOUND; !found && k > CONST.NOTFOUND; k--) {
                                var e = self.record[k];
                                if (angular.isObject(e) && angular.equals(e.minuteEntryGuid, aDecision.minuteEntryGuid)) {
                                    self.record.splice(k, 1);
                                    found = true;
                                }
                            }
                        }
                    }
                    else if (aDecision.typeName === CONST.MTGEVENT.MINUTETYPECHANGED) {
                        if (angular.isObject(mtgTopicSelected) && angular.equals(mtgTopicSelected.topicGuid, aDecision.topicGuid)) {
                            if (angular.isObject(aDecision.minuteEntry)) {
                                aDecision.minuteEntry.isModified = true;
                                for (var j = 0; !found && j < self.record.length; j++) {
                                    var entry2 = self.record[j];
                                    if (angular.isObject(entry2) && angular.equals(entry2.minuteEntryGuid, aDecision.oldMinuteentryguid)) {
                                        angular.merge(entry2, aDecision.minuteEntry);
                                        found = true;
                                    }
                                }
                            }
                        }
                    }
                    else {
                        $log.error("dbDecisions.updateDecision: unsupported typeName", aDecision.typeName);
                    }
                }
                else {
                    $log.error("dbDecisions.updateDecision", arguments);
                }
            }

            function getDecisions(aMtg, aTopic) {
                if (angular.isObject(aTopic) && angular.isObject(aMtg)) {
                    $log.log("dbDecisions.getDecisions", arguments);
                    resetData();
                    AhjoMeetingSrv.getDecisions(aMtg.meetingGuid, aTopic.topicGuid).then(function (resp) {
                        $log.log("dbDecisions.getDecisions done", arguments);
                        self.record = angular.isArray(resp.record) ? resp.record : [];
                        self.voting = angular.isArray(resp.voting) ? resp.voting : [];
                    }, function (error) {
                        $log.error("dbDecisions.getDecisions ", arguments);
                        self.errorCode = error.errorCode;
                    }, function (/*notification*/) {
                        self.loading = true;
                    }).finally(function () {
                        self.loading = false;
                        setTypes(aTopic.isCityCouncil);
                    });
                }
                else {
                    $log.error("dbDecisions.getDecisions", arguments);
                }
            }

            self.itemSelected = function (aItem) {
                $log.log("dbDecisions.itemSelected", arguments);
                if (angular.isObject(aItem) && aItem.isModified) {
                    aItem.isModified = false;
                }
                self.selectedItem = (self.selectedItem === aItem) ? null : aItem;
            };

            self.isSelected = function (item) {
                return self.selectedItem === item;
            };

            self.getVotingTitle = function getVotingTitle(aVoting) {
                var res = '';
                if (angular.isObject(aVoting)) {
                    res += aVoting.sequencenumber;
                    res += ': ';
                    res += $rootScope.dbLang === CONST.DBLANG.FI ? aVoting.proposal1TextFi : aVoting.proposal1TextSv;
                    res += ' - ';
                    res += $rootScope.dbLang === CONST.DBLANG.FI ? aVoting.proposal2TextFi : aVoting.proposal2TextSv;
                }
                return res;
            };

            // WATCHERS

            $scope.$watch(function () {
                return StorageSrv.getKey(CONST.KEY.TOPIC);
            }, function (topic) {
                if (!angular.equals(topic, mtgTopicSelected)) {
                    mtgTopicSelected = topic;
                    getDecisions(mtgItemSelected, mtgTopicSelected);
                }
            });

            var updateWatcher = $rootScope.$on(CONST.TOPICMINUTEUPDATED, function (aEvent, aData) {
                $log.log("dbDecisions.updatedWatcher: ", arguments);
                updateDecision(aData);
            });

            $scope.$on('$destroy', function () {
                $log.log("dbDecisions: DESTROY");
                if (angular.isFunction(updateWatcher)) {
                    updateWatcher();
                }
            });

            // CONSTRUCT

            getDecisions(mtgItemSelected, mtgTopicSelected);
        }];

        return {
            scope: {},
            templateUrl: 'views/decisions.directive.html',
            restrict: 'AE',
            controller: controller,
            controllerAs: 'c',
            replace: 'true'
        };
    }]);
