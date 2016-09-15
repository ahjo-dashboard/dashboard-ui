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
            self.motions = StorageSrv.getKey(CONST.KEY.MOTION_ARRAY);
            self.errorCode = 0;
            self.isTooltips = $rootScope.isTooltips;
            var selectedMotion = null;
            var personGuid = StorageSrv.getKey(CONST.KEY.MEETING_PERSONGUID);

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

            self.isSupportedByUser = function (supporters) {
                var result = false;
                angular.forEach(supporters, function (value) {
                    if (angular.isObject(value) && value.personGuid === personGuid) {
                        result = true;
                    }
                }, this);
                return result;
            };

            $scope.$watch(function () {
                return StorageSrv.getKey(CONST.KEY.MOTION_ARRAY);
            }, function (array, oldArray) {
                if (!angular.equals(array, oldArray)) {
                    self.motions = angular.isArray(array) ? array : [];
                }
            });

            $scope.$watch(function () {
                return $rootScope.isTooltips;
            }, function (isTooltips) {
                self.isTooltips = isTooltips;
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
