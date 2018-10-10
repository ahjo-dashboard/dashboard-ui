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
            self.motionsCont = null;
            self.motions = null;
            self.meetingActive = null;
            self.meetingAborted = null;
            var selectedMotion = null;
            var mtgItemSelected = StorageSrv.getKey(CONST.KEY.MEETING_ITEM);
            var scrollTimer = null;
            var setDataTimer = null;

            // FUNCTIONS

            function setMotions(data) {
                self.motions = [];
                setDataTimer = $timeout(function () {
                    if (angular.isObject(data)) {
                        self.motions = (angular.isArray(data.objects)) ? data.objects : [];
                        self.motionsCont = data;

                    }
                    $log.debug("dbMotions.setMotions, after timeout data=", data);
                }, 0);
            }

            function signMotion(aMotion, aMeetingGuid, aSupport) {
                if (!angular.isObject(aMotion) || !angular.isString(aMeetingGuid)) {
                    $log.error("dbMotions.signMotion: bad args", arguments);
                    return;
                }
                $log.log("dbMotions.signMotion: ", arguments);

                var copyMotion = angular.copy(aMotion);
                copyMotion.actionPersonGuid = mtgItemSelected.dbUserPersonGuid;
                copyMotion.meetingGuid = aMeetingGuid;
                copyMotion.isUserSupported = aSupport;

                AhjoMeetingSrv.updateMotion(copyMotion).then(function (resp) {
                    if (angular.isObject(resp) && angular.isObject(resp.motion)) {
                        $log.log("dbMotions.signMotion done", resp);
                        angular.merge(aMotion, resp.motion);
                        aMotion.supporters = resp.motion.supporters; // Merge won't handle removals
                    }
                    else {
                        $log.error("dbMotions.signMotion done ", arguments);
                    }
                }, function (error) {
                    $log.error("dbMotions.signMotion: error: ", arguments);
                    Utils.showErrorForError(error);
                }, function (/*notification*/) {
                    aMotion.ongoing = true;
                }).finally(function () {
                    aMotion.ongoing = false;
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
                        $log.log("dbMotions.submitMotion done", resp);
                        angular.merge(aMotion, resp.motion);
                    }
                    else {
                        $log.error("dbMotions.submitMotion done ", resp);
                    }
                }, function (error) {
                    $log.error("dbMotions.submitMotion", error);
                    Utils.showErrorForError(error);
                }, function (/*notification*/) {
                    aMotion.ongoing = true;
                }).finally(function () {
                    aMotion.ongoing = false;
                });
            }

            function setMotionAsRead(aMotion) {
                if (!angular.isObject(aMotion)) {
                    $log.error("dbMotions.setMotionAsRead: bad args", arguments);
                    return;
                }
                $log.log("dbMotions: setMotionAsRead", arguments);

                var copyMotion = angular.copy(aMotion);
                copyMotion.isUserRead = true;
                copyMotion.actionPersonGuid = mtgItemSelected.dbUserPersonGuid;
                copyMotion.meetingGuid = mtgItemSelected.meetingGuid;

                AhjoMeetingSrv.updateMotion(copyMotion).then(function (resp) {
                    if (angular.isObject(resp) && angular.isObject(resp.motion)) {
                        $log.log("dbMotions.setMotionAsRead done", resp);
                        angular.merge(aMotion, resp.motion);
                    }
                    else {
                        $log.error("dbMotions.setMotionAsRead done ", resp);
                    }
                }, function (error) {
                    $log.error("dbMotions.setMotionAsRead: ", error);
                    Utils.showErrorForError(error);
                }, function (/*notification*/) {
                    aMotion.ongoing = true;
                }).finally(function () {
                    aMotion.ongoing = false;
                });
            }

            self.selectMotion = function (aMotion) {
                $log.log("dbMotions: selectMotion", arguments);
                if (self.isSelected(aMotion)) {
                    selectedMotion = null;
                }
                else {
                    selectedMotion = angular.isObject(aMotion) ? aMotion : null;
                }
                if (angular.isObject(aMotion) && aMotion.isUserRead === false) {
                    setMotionAsRead(aMotion);
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
                submitMotion(aMotion);
            };

            self.support = function (aMotion) {
                if (!angular.isObject(mtgItemSelected)) {
                    $log.error("dbMotions.support: invalid mtg item", mtgItemSelected);
                    return;
                }
                signMotion(aMotion, mtgItemSelected.meetingGuid, true);
            };

            self.removeSupport = function (aMotion) {
                if (!angular.isObject(mtgItemSelected)) {
                    $log.error("dbMotions.removeSupport: invalid mtg item", mtgItemSelected);
                    return;
                }
                signMotion(aMotion, mtgItemSelected.meetingGuid, false);
            };

            $scope.$watch(function () {
                return StorageSrv.getKey(CONST.KEY.MOTION_DATA);
            }, function (data) {
                $log.debug("dbMotions watch triggered: " + CONST.KEY.MOTION_DATA, arguments);
                setMotions(data);
            });

            $scope.$watch(function () {
                return $rootScope.meetingStatus;
            }, function (status) {
                self.meetingActive = (status === CONST.MTGSTATUS.ACTIVE.stateId);
                self.meetingAborted = (status === CONST.MTGSTATUS.ABORTED.stateId);
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

                if (angular.isFunction(setDataTimer)) {
                    setDataTimer();
                }

                if (angular.isFunction(scrollTimer)) {
                    scrollTimer();
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
