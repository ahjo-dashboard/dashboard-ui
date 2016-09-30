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

        var controller = ['$log', 'StorageSrv', 'CONST', '$rootScope', '$scope', 'AhjoMeetingSrv', 'Utils', '$timeout', function ($log, StorageSrv, CONST, $rootScope, $scope, AhjoMeetingSrv, Utils, $timeout) {
            $log.log("dbMotions: CONTROLLER");
            var self = this;
            self.isIe = $rootScope.isIe;
            self.loading = false;
            self.motions = null;
            self.meetingActive = null;
            var selectedMotion = null;
            var mtgItemSelected = StorageSrv.getKey(CONST.KEY.MEETING_ITEM);

            // FUNCTIONS

            function setMotions(data) {
                self.motions = [];
                $timeout(function () {
                    if (angular.isObject(data)) {
                        self.motions = (angular.isArray(data.objects)) ? data.objects : [];
                    }
                }, 0);
            }

            function signMotion(aMotion, aMeetingGuid, aSupport) {
                if (!angular.isObject(aMotion) || !angular.isString(aMeetingGuid)) {
                    $log.error("dbMotions.sign: bad args", arguments);
                    return;
                }
                $log.log("dbMotions: sign", arguments);

                var copyMotion = angular.copy(aMotion);
                copyMotion.actionPersonGuid = mtgItemSelected.dbUserPersonGuid;
                copyMotion.meetingGuid = aMeetingGuid;
                copyMotion.isUserSupported = aSupport;

                AhjoMeetingSrv.updateMotion(copyMotion).then(function (resp) {
                    if (angular.isObject(resp) && angular.isObject(resp.motion)) {
                        $log.log("dbMotions.sign done", resp);
                        angular.merge(aMotion, resp.motion);
                    }
                    else {
                        $log.error("dbMotions.sign done ", resp);
                    }
                }, function (error) {
                    $log.error("dbMotions.sign ", error);
                    Utils.showErrorForError(error);
                }, function (/*notification*/) {
                    self.loading = true;
                }).finally(function () {
                    self.loading = false;
                });
            }

            function submitMotion(aMotion) {
                if (!angular.isObject(aMotion)) {
                    $log.error("dbMotions.submitMotion: bad args", arguments);
                    return;
                }
                $log.log("dbMotions: submitMotion", arguments);

                var copyMotion = angular.copy(aMotion);
                copyMotion.isSubmitted = true;
                copyMotion.actionPersonGuid = mtgItemSelected.dbUserPersonGuid;
                copyMotion.meetingGuid = mtgItemSelected.meetingGuid;

                AhjoMeetingSrv.updateMotion(copyMotion).then(function (resp) {
                    if (angular.isObject(resp) && angular.isObject(resp.motion)) {
                        $log.log("dbMotions.submit done", resp);
                        angular.merge(aMotion, resp.motion);
                    }
                    else {
                        $log.error("dbMotions.submit done ", resp);
                    }
                }, function (error) {
                    $log.error("dbMotions.submit", error);
                    Utils.showErrorForError(error);
                }, function (/*notification*/) {
                    self.loading = true;
                }).finally(function () {
                    self.loading = false;
                });
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
                var result = '-';
                angular.forEach(CONST.MOTIONTYPES, function (value) {
                    if (angular.isObject(value) && value.id === id) {
                        result = value.stringId;
                    }
                }, this);
                return result;
            };

            self.submit = function (aMotion) {
                $log.log("dbMotions: submit", arguments);
                submitMotion(aMotion);
            };

            self.support = function (aMotion) {
                if (!angular.isObject(mtgItemSelected)) {
                    $log.error("dbMotions.support: invalid mtg item", mtgItemSelected);
                    return;
                }
                $log.log("dbMotions: support", arguments);
                signMotion(aMotion, mtgItemSelected.meetingGuid, true);
            };

            self.removeSupport = function (aMotion) {
                if (!angular.isObject(mtgItemSelected)) {
                    $log.error("dbMotions.removeSupport: invalid mtg item", mtgItemSelected);
                    return;
                }
                $log.log("dbMotions: removeSupport", arguments);
                signMotion(aMotion, mtgItemSelected.meetingGuid, false);
            };

            $scope.$watch(function () {
                return StorageSrv.getKey(CONST.KEY.MOTION_DATA);
            }, function (data) {
                setMotions(data);
                self.loading = (angular.isObject(data) && data.loading === true);
            });

            $scope.$watch(function () {
                return $rootScope.meetingStatus;
            }, function (status) {
                self.meetingActive = (status === CONST.MTGSTATUS.ACTIVE.stateId);
            });

            var modeWatcher = $rootScope.$on(CONST.MTGUICHANGED, function (event, data) {
                if (angular.isObject(data) && (data.blockMode === CONST.BLOCKMODE.SECONDARY || data.blockMode === CONST.BLOCKMODE.DEFAULT)) {
                    var motionData = StorageSrv.getKey(CONST.KEY.MOTION_DATA);
                    setMotions(motionData);
                }
            });

            $scope.$on('$destroy', function () {
                $log.debug("dbMotions: DESTROY");
                if (angular.isFunction(modeWatcher)) {
                    modeWatcher();
                }
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
