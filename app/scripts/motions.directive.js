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

        var controller = ['$log', 'AhjoMeetingSrv', 'StorageSrv', 'CONST', '$rootScope', function ($log, AhjoMeetingSrv, StorageSrv, CONST, $rootScope) {
            $log.log("dbMotions: CONTROLLER");
            var self = this;
            self.loading = false;
            self.motions = null;
            self.errorCode = 0;
            var selectedMotion = null;
            var mtgItem = StorageSrv.getKey(CONST.KEY.MEETING_ITEM);
            var personGuid = StorageSrv.getKey(CONST.KEY.MEETING_PERSONGUID);

            // FUNCTIONS

            function checkMotions(motions) {
                if (!angular.isArray(motions)) {
                    $log.error("dbMotions.checkMotions: bad args");
                    return;
                }
                $rootScope.$emit(CONST.MOTIONSUPDATED, { count: self.motions.length });
            }

            function getMotions(aMtg, aPersonGuid) {
                $log.debug("dbMotions.getMotions", arguments);
                if (angular.isObject(aMtg) && angular.isString(aPersonGuid)) {

                    AhjoMeetingSrv.getMotions(aMtg.meetingGuid, aPersonGuid).then(function (resp) {
                        $log.log("dbMotions.getMotions done", resp);
                        self.motions = angular.isArray(resp) ? resp : [];
                    }, function (error) {
                        $log.error("dbMotions.getMotions ", arguments);
                        self.errorCode = error.errorCode;
                    }, function (/*notification*/) {
                        self.loading = true;
                        self.motions = [];
                    }).finally(function () {
                        self.loading = false;
                        checkMotions(self.motions);
                    });
                }
                else {
                    $log.error("dbMotions.getMotions: bad args");
                }
            }

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
                var result = null;
                angular.forEach(CONST.MOTIONTYPES, function (value) {
                    if (angular.isObject(value) && value.id === id) {
                        result = value.stringId;
                    }
                }, this);
                return result ? result : '-';
            };

            self.supporting = function (supporters) {
                var result = false;
                angular.forEach(supporters, function (value) {
                    if (angular.isObject(value) && value.personGuid === personGuid) {
                        result = true;
                    }
                }, this);
                return result;
            };

            getMotions(mtgItem, personGuid);

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
