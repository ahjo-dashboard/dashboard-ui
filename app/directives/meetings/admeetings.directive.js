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
    .directive('adMeetings', [function() {

        var controller = ['$log', '$scope', 'ENV', 'AhjoMeetingsSrv', '$translate', '$rootScope', 'MTGD', function($log, $scope, ENV, AhjoMeetingsSrv, $translate, $rootScope, MTGD) {
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
            self.agencyTitle = null;

            function setTitle() {
                if (!self.aF) {
                    $translate('STR_AGENCY').then(function(agency) {
                        self.agencyTitle = agency;
                    });
                }
                else {
                    self.agencyTitle = self.aF;
                }
            }

            function setData() {
                self.data = [];
                if (self.responseData instanceof Object && self.responseData.objects instanceof Array) {
                    for (var i = 0; i < self.responseData.objects.length; i++) {
                        var item = self.responseData.objects[i];
                        var aVisible = self.aF ? (self.aF === item.agencyName) : true;
                        var fVisible = false;

                        if ($scope.visibleMeetings === MTGD.VISIBLE.OPEN && item.state) {
                            fVisible = item.state <= MTGD.VISIBLE.OPEN;
                        }
                        else if ($scope.visibleMeetings === MTGD.VISIBLE.CLOSED && item.state) {
                            fVisible = item.state >= MTGD.VISIBLE.CLOSED;
                        }

                        for (var j = 0; j < item.roleIDs.length; j++) {
                            var role = item.roleIDs[j].RoleName;
                            var roleId = item.roleIDs[j].RoleID;

                            var rVisible = (roleId === 2);
                            self.data.push({
                                'meeting': item,
                                'role': role,
                                'visible': aVisible && rVisible && fVisible
                            });
                        }
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
                    var agency = self.data[i].meeting.agencyName;
                    var visible = self.data[i].visible;
                    if (agency && self.agencyData.indexOf(agency) === -1 && visible) {
                        self.agencyData.push(agency);
                    }
                }
            }

            AhjoMeetingsSrv.getMeetings().then(function(response) {
                self.responseData = response;
                if ("objects" in self.responseData) {
                    $log.debug("adMeetings: getMeetings done: " + self.responseData.objects.length);
                }
            }, function(error) {
                $log.error("adMeetings: getMeetings error: " + JSON.stringify(error));
                self.mtgErr = error;
            }, function(/*notify*/) {
            }).finally(function() {
                setData();
                parseAgencyDropdown();
                parseRoleDropdown();
                self.loading = false;
            });

            $scope.$watch(function() {
                return {
                    visibleMeetings: $scope.visibleMeetings
                };
            }, function(data) {
                $log.debug("adMeetings: WATCH " + JSON.stringify(data));
                setData();
                parseAgencyDropdown();
                parseRoleDropdown();
            }, true);

            self.setAgencyFilter = function(agency) {
                $log.debug("adMeetings: setAgencyFilter: " + agency);
                self.aF = agency;
                setData();
                parseRoleDropdown();
                if (!agency) {
                    parseAgencyDropdown();
                }
                setTitle();
                $scope.agencyIsOpen = false;
            };

            self.setRoleFilter = function(role) {
                $log.debug("adMeetings: setRoleFilter: " + role);
                self.rF = role;
                setData();
                parseAgencyDropdown();
                if (!role) {
                    parseRoleDropdown();
                }
                setTitle();
                $scope.roleIsOpen = false;
            };

            setTitle();
        }];

        return {
            scope: {
                visibleMeetings: '=',
                selected: '&onSelected'
            },
            templateUrl: 'directives/meetings/adMeetings.Directive.html',
            restrict: 'AE',
            controller: controller,
            controllerAs: 'ctrl',
            replace: 'true'
        };
    }]);
