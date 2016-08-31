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

        var controller = ['$log', '$scope', 'AhjoMeetingSrv', 'StorageSrv', 'CONST', 'PROPS', function ($log, $scope, AhjoMeetingSrv, StorageSrv, CONST, PROPS) {
            $log.log("dbDecisions: CONTROLLER");
            var self = this;
            self.loading = false;
            self.types = [];
            self.selectedItem = null;
            self.record = null;
            self.supporter = null;
            self.voting = null;

            // FUNCTIONS

            function getDecisions(topic) {
                if (angular.isObject(topic)) {
                    self.record = null;
                    self.supporter = null;
                    self.voting = null;

                    AhjoMeetingSrv.getDecisions(topic.topicGuid).then(function (data) {
                        $log.log("dbDecisions.getDecisions");

                        if (angular.isObject(data) && angular.isObject(data.objects)) {
                            if (angular.isArray(data.objects.record)) {
                                self.record = data.objects.record;
                            }
                            if (angular.isArray(data.objects.supporter)) {
                                self.supporter = data.objects.supporter;
                            }
                            if (angular.isArray(data.objects.voting)) {
                                self.voting = data.objects.voting;
                            }
                        }
                        else {
                            $log.error("dbDecisions.getDecisions: invalid response");
                        }
                    }, function (/*error*/) {
                        $log.error("dbDecisions.getDecisions");
                    }, function (/*notification*/) {
                        self.loading = true;
                    }).finally(function () {
                        self.loading = false;
                    });
                }
                else {
                    $log.error("dbDecisions.getDecisions: invalid parameter");
                }
            }

            self.itemSelected = function (item) {
                self.selectedItem = (self.selectedItem === item) ? null : item;
            };

            self.isSelected = function (item) {
                return self.selectedItem === item;
            };

            // WATCHERS

            $scope.$watch(function () {
                return StorageSrv.getKey(CONST.KEY.TOPIC);
            }, function (topic, oldTopic) {
                if (!angular.equals(topic, oldTopic)) {
                    getDecisions(topic);
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

            getDecisions(StorageSrv.getKey(CONST.KEY.TOPIC));
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
