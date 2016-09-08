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
            var mtgTopicSelected = StorageSrv.getKey(CONST.KEY.TOPIC);
            var mtgItemSelected = StorageSrv.getKey(CONST.KEY.MEETING_ITEM);

            // FUNCTIONS

            function getDecisions(aMtg, aTopic) {
                $log.debug("dbDecisions.getDecisions", arguments);
                if (angular.isObject(aTopic) && angular.isObject(aMtg)) {
                    self.record = null;
                    self.supporter = null;
                    self.voting = null;

                    AhjoMeetingSrv.getDecisions(aMtg.meetingGuid, aTopic.topicGuid).then(function (resp) {
                        $log.log("dbDecisions.getDecisions done", resp);
                        self.record = resp.record;
                        self.supporter = resp.supporter;
                        self.voting = resp.voting;
                    }, function (error) {
                        $log.error("dbDecisions.getDecisions ", arguments);
                        self.error = error.error;
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

            // WATCHERS

            $scope.$watch(function () {
                return StorageSrv.getKey(CONST.KEY.TOPIC);
            }, function (topic, oldTopic) {
                if (!angular.equals(topic, oldTopic)) {
                    getDecisions(mtgItemSelected, topic);
                }
            });

            $scope.$on('$destroy', function () {
                $log.debug("dbDecisions: DESTROY");
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
