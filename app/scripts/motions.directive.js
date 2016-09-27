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
            self.loading = false;
            self.motions = null;
            self.error = null;
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

            function sign(aMotion, aMeetingGuid) {
                if (!angular.isObject(aMotion) || !angular.isString(aMeetingGuid)) {
                    $log.error("dbMotions.sign: bad args", arguments);
                    return;
                }
                $log.log("dbMotions: sign", arguments);
                AhjoMeetingSrv.signMotion(aMotion.motionGuid, aMotion.personGuid, aMeetingGuid).then(function (resp) {
                    if (angular.isObject(resp)) {
                        $log.log("dbMotions.sign done", resp);
                        aMotion.isUserSupported = resp.isSupported;

                        var supporter = {
                            firstName: null,
                            insertDateTime: null,
                            lastName: null,
                            motionGuid: aMotion.motionGuid,
                            name: aMotion.personName,
                            personGuid: aMotion.personGuid
                        };
                        if (angular.isArray(aMotion.supporters)) {
                            aMotion.supporters.push(supporter);
                        }
                        else {
                            aMotion.supporters = [supporter];
                        }
                    }
                    else {
                        $log.error("dbMotions.sign done ", resp);
                    }
                }, function (error) {
                    $log.error("dbMotions.sign ", error);
                    self.error = { 'errorCode': error.errorCode, 'errorString': Utils.stringIdForError(error.errorCode) };
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

            self.submit = function (/*motion*/) {
                $log.log("dbMotions: submit", arguments);
            };

            self.support = function (motion) {
                if (!angular.isObject(mtgItemSelected)) {
                    $log.error("dbMotions.support: invalid mtg item", mtgItemSelected);
                    return;
                }
                $log.log("dbMotions: support", arguments);
                sign(motion, mtgItemSelected.meetingGuid);
            };

            self.removeSupport = function (/*motion*/) {
                $log.log("dbMotions: removeSupport", arguments);
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
