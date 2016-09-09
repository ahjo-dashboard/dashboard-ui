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
            self.record = null;
            self.supporter = null;
            self.voting = null;
            self.isTooltips = $rootScope.isTooltips;
            self.errorCode = 0;
            self.record = [];
            self.supporter = [];
            self.voting = [];
            var mtgTopicSelected = StorageSrv.getKey(CONST.KEY.TOPIC);
            var mtgItemSelected = StorageSrv.getKey(CONST.KEY.MEETING_ITEM);

            // FUNCTIONS

            function getDecisions(aMtg, aTopic) {
                $log.debug("dbDecisions.getDecisions", arguments);
                if (angular.isObject(aTopic) && angular.isObject(aMtg)) {

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
                    });
                }
                else {
                    $log.error("dbDecisions.getDecisions: bad args");
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
            }, function (topic, oldTopic) {
                if (!angular.equals(topic, oldTopic)) {
                    getDecisions(mtgItemSelected, topic);
                }
            });

            var updatedWatcher = $rootScope.$on(CONST.TOPICMINUTEUPDATED, function (aEvent, aData) {
                $log.debug("dbDecisions.updatedWatcher: ", arguments);
                if (angular.isObject(aData)) {
                    getDecisions(mtgItemSelected, mtgTopicSelected);
                }
            });

            $scope.$on('$destroy', function () {
                $log.debug("dbDecisions: DESTROY");
                if (angular.isFunction(updatedWatcher)) {
                    updatedWatcher();
                }
            });

            // CONSTRUCT

            angular.forEach(PROPS.TYPE, function (type) {
                if (angular.isObject(type) && type.decisionOrder) {
                    this.push(type);
                }
            }, self.types);

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
