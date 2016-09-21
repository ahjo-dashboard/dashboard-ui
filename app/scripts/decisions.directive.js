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
            self.isTooltips = $rootScope.isTooltips;
            self.errorCode = 0;
            self.record = [];
            self.supporter = [];
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
                self.supporter = [];
                self.voting = [];
            }

            function updateDecision(aDecision) {
                if (angular.isObject(aDecision)) {
                    $log.log("dbDecisions.updateDecision", arguments);

                    if (aDecision.typeName === CONST.MTGEVENT.MINUTEUPDATED) {
                        if (angular.isObject(mtgItemSelected) && angular.equals(mtgItemSelected.meetingGuid, aDecision.meetingID)) {
                            if (angular.isObject(mtgTopicSelected) && angular.equals(mtgTopicSelected.topicGuid, aDecision.topicGuid)) {

                                if (angular.isObject(aDecision.minuteEntry)) {
                                    if (!angular.isArray(self.record)) {
                                        self.record = [];
                                    }
                                    if (!angular.isArray(self.supporter)) {
                                        self.supporter = [];
                                    }
                                    var updated = false;
                                    for (var index = 0; !updated && index < self.record.length; index++) {
                                        var entry = self.record[index];
                                        if (angular.isObject(entry) && angular.equals(entry.minuteEntryGuid, aDecision.minuteEntry.minuteEntryGuid)) {
                                            angular.merge(entry, aDecision.minuteEntry);
                                            updated = true;
                                        }
                                    }
                                    if (!updated) {
                                        self.record.push(aDecision.minuteEntry);
                                    }
                                }
                                if (angular.isArray(aDecision.supporters) && aDecision.supporters.length) {
                                    // todo: implement supporter updating
                                }
                            }
                        }
                    }
                    else if (aDecision.typeName === CONST.MTGEVENT.MINUTEDELETED) {
                        if (angular.isObject(mtgItemSelected) && angular.equals(mtgItemSelected.meetingGuid, aDecision.meetingID)) {
                            if (angular.isObject(mtgTopicSelected) && angular.equals(mtgTopicSelected.topicGuid, aDecision.topicGuid)) {

                                var search = angular.isArray(self.record);
                                for (var i = self.record.length + CONST.NOTFOUND; search && i > CONST.NOTFOUND; i--) {
                                    var e = self.record[i];
                                    if (angular.isObject(e) && angular.equals(e.minuteEntryGuid, aDecision.minuteEntryGuid)) {
                                        self.record.splice(i, 1);
                                        search = false;
                                    }
                                }
                            }
                        }
                    }
                }
                else {
                    $log.error("dbDecisions.updateDecision", arguments);
                }
            }

            function getDecisions(aMtg, aTopic) {
                if (angular.isObject(aTopic) && angular.isObject(aMtg)) {
                    $log.debug("dbDecisions.getDecisions", arguments);
                    resetData();
                    AhjoMeetingSrv.getDecisions(aMtg.meetingGuid, aTopic.topicGuid).then(function (resp) {
                        $log.log("dbDecisions.getDecisions done", resp);
                        self.record = angular.isArray(resp.record) ? resp.record : [];
                        self.supporter = angular.isArray(resp.supporter) ? resp.supporter : [];
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

            self.itemSelected = function (item) {
                self.selectedItem = (self.selectedItem === item) ? null : item;
            };

            self.isSelected = function (item) {
                return self.selectedItem === item;
            };

            self.isSupported = function (item) {
                var found = false;
                if (angular.isObject(item)) {
                    angular.forEach(self.supporter, function (s) {
                        if (angular.isObject(s) && angular.equals(s.minuteEntryGuid, item.minuteEntryGuid)) {
                            found = true;
                        }
                    });
                }
                return found;
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
                $log.debug("dbDecisions.updatedWatcher: ", arguments);
                updateDecision(aData);
            });

            $scope.$on('$destroy', function () {
                $log.debug("dbDecisions: DESTROY");
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
