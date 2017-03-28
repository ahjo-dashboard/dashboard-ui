/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
* @ngdoc directive
* @name dashboard.directive:adMeetingsDirective
* @description
* # adMeetingsDirective
*/
angular.module('dashboard')
    .constant('MTGD', {
        'VISIBLE': {
            OPEN: 4,
            CLOSED: 5
        }
    })
    .directive('adMeetings', [function () {

        var controller = ['$log', '$scope', 'ENV', 'AhjoMeetingsSrv', '$translate', '$rootScope', 'MTGD', 'CONST', 'Utils', function ($log, $scope, ENV, AhjoMeetingsSrv, $translate, $rootScope, MTGD, CONST, Utils) {
            $log.log("adMeetings: CONTROLLER");
            var self = this;
            self.mtgErr = null;
            self.loading = true;
            self.responseData = {};
            self.data = [];
            self.isMobile = $rootScope.isMobile;

            self.agencyData = [];
            self.roleData = [];

            self.aF = null;
            self.rF = null;

            function setData() {
                self.data = [];
                if (self.responseData instanceof Object && self.responseData.objects instanceof Array) {
                    for (var i = 0; i < self.responseData.objects.length; i++) {
                        var item = self.responseData.objects[i];
                        var aVisible = self.aF ? (self.aF === item[$rootScope.locProp('agencyName')]) : true;
                        var fVisible = false;

                        if ($scope.visibleMeetings === MTGD.VISIBLE.OPEN && item.state) {
                            fVisible = item.state <= MTGD.VISIBLE.OPEN;
                        }
                        else if ($scope.visibleMeetings === MTGD.VISIBLE.CLOSED && item.state) {
                            fVisible = item.state >= MTGD.VISIBLE.CLOSED;
                        }

                        self.data.push({
                            'meeting': item,
                            'visible': aVisible && fVisible
                        });
                    }
                }
            }

            function parseRoleDropdown() {
                self.roleData = [];
                for (var i = 0; i < self.data.length; i++) {
                    var item = self.data[i].meeting;
                    var visible = self.data[i].visible;
                    for (var j = 0; j < item.roleIDs.length && visible; j++) {
                        var role = item.roleIDs[j].RoleName;
                        if (role && self.roleData.indexOf(role) === -1) {
                            self.roleData.push(role);
                        }
                    }
                }
            }

            function parseAgencyDropdown() {
                self.agencyData = [];
                for (var i = 0; i < self.data.length; i++) {
                    var agency = self.data[i].meeting[$rootScope.locProp('agencyName')];
                    var visible = self.data[i].visible;
                    if (agency && self.agencyData.indexOf(agency) === -1 && visible) {
                        self.agencyData.push(agency);
                    }
                }
            }

            AhjoMeetingsSrv.getMeetings().then(function (response) {
                self.responseData = response;
                if (!angular.isObject(self.responseData) || !angular.isArray(self.responseData.objects) || !angular.isString(response.personGuid)) {
                    $log.error("adMeetings: bad response data: ", arguments);
                } else {
                    $log.debug("adMeetings: getMeetings done, count=" + self.responseData.objects.length, " personGuid=" + response.personGuid);
                }
            }, function (error) {
                $log.error("adMeetings: getMeetings error: " + JSON.stringify(error));
                self.mtgErr = error;
            }).finally(function () {
                setData();
                parseAgencyDropdown();
                parseRoleDropdown();
                self.loading = false;
            });

            $scope.$watch(function () {
                return {
                    visibleMeetings: $scope.visibleMeetings
                };
            }, function (data) {
                $log.debug("adMeetings: WATCH " + JSON.stringify(data));
                setData();
                parseAgencyDropdown();
                parseRoleDropdown();
            }, true);

            self.setAgencyFilter = function (agency) {
                $log.debug("adMeetings: setAgencyFilter: " + agency);
                self.aF = agency;
                setData();
                parseRoleDropdown();
                if (!agency) {
                    parseAgencyDropdown();
                }
                $scope.agencyIsOpen = false;
            };

            self.setRoleFilter = function (role) {
                $log.debug("adMeetings: setRoleFilter: " + role);
                self.rF = role;
                setData();
                parseAgencyDropdown();
                if (!role) {
                    parseRoleDropdown();
                }
                $scope.roleIsOpen = false;
            };

            self.statusStringId = function (arg) {
                if (angular.isObject(arg) && angular.isDefined(arg.meeting) && angular.isDefined(arg.meeting.state)) {
                    for (var item in CONST.MTGSTATUS) {
                        if (CONST.MTGSTATUS.hasOwnProperty(item)) {
                            if (arg.meeting.state === CONST.MTGSTATUS[item].stateId) {
                                return CONST.MTGSTATUS[item].stringId;
                            }
                        }
                    }
                }
                return 'STR_TOPIC_UNKNOWN';
            };

            self.mtgStatusClass = function mtgStatusClass(arg) {
                return $rootScope.mtgStatusClass(arg);
            };

            self.isRoleSupported = function isRoleSupportedFn(role) {
                return angular.isObject(role) && (CONST.MTGROLE.CHAIRMAN.value === role.RoleID || CONST.MTGROLE.PARTICIPANT_FULL.value === role.RoleID); // Roles supported by this interface
            };

            /*
            * @name dashboard.adMeetings.roleNameStrId
            * @description Resolves a string id for meeting role
            * @param {object} Role id object from meeting REST
            * @returns {string} String id for angular translate
            */
            self.roleNameStrId = function roleNameStrId(aRoleId) {
                var role = angular.isObject(aRoleId) ? Utils.objWithVal(CONST.MTGROLE, CONST.KEY.VALUE, aRoleId.RoleID) : null;
                var res = angular.isObject(role) && angular.isString(role.strId) ? role.strId : CONST.MTGROLE.NO_ROLE.strId;
                return res;
            };

            self.locProp = $rootScope.locProp;
        }];

        return {
            scope: {
                visibleMeetings: '=',
                selected: '&onSelected'
            },
            templateUrl: 'views/admeetings.directive.html',
            restrict: 'AE',
            controller: controller,
            controllerAs: 'c',
            replace: 'true'
        };
    }]);
