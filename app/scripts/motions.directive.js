/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc directive
 * @name dashboard.motionsDirective
 * @description
 * # motionsDirective
 */
angular.module('dashboard')
    .directive('dbMotions', [function () {

        var controller = ['$log', 'StorageSrv', 'CONST', '$rootScope', '$scope', function ($log, StorageSrv, CONST, $rootScope, $scope) {
            $log.log("dbMotions: CONTROLLER");
            var self = this;
            self.loading = false;
            self.motions = null;
            self.errorCode = 0;
            self.isTooltips = $rootScope.isTooltips;
            self.meetingActive = null;
            var selectedMotion = null;

            // FUNCTIONS

            self.selectMotion = function (motion) {
                if (self.isSelected(motion)) {
                    selectedMotion = null;
                }
                else {
                    selectedMotion = angular.isObject(motion) ? motion : null;
                }
            };

            self.isSelected = function (motion) {
                return angular.equals(motion, selectedMotion);
            };

            self.typeString = function (id) {
                var result = '-';
                angular.forEach(CONST.MOTIONTYPES, function (value) {
                    if (angular.isObject(value) && value.id === id) {
                        result = value.stringId;
                    }
                }, this);
                return result;
            };

            self.submit = function(/*motion*/) {
                $log.log("dbMotions: submit", arguments);
            };

            self.support = function (/*motion*/) {
                $log.log("dbMotions: support", arguments);
            };

            $scope.$watch(function () {
                return StorageSrv.getKey(CONST.KEY.MOTION_DATA);
            }, function (data) {
                if (angular.isObject(data) && !angular.equals(data.objects, self.motions)) {
                    self.motions = (angular.isArray(data.objects)) ? data.objects : [];
                }
                self.loading = (angular.isObject(data) && data.loading === true);
            });

            $scope.$watch(function () {
                return $rootScope.isTooltips;
            }, function (isTooltips) {
                self.isTooltips = isTooltips;
            });

            $scope.$watch(function () {
                return $rootScope.meetingStatus;
            }, function (status) {
                self.meetingActive = (status === CONST.MTGSTATUS.ACTIVE.stateId);
            });

        }];

        return {
            scope: {},
            templateUrl: 'views/motions.directive.html',
            restrict: 'AE',
            controller: controller,
            controllerAs: 'c',
            replace: 'true'
        };
    }]);
