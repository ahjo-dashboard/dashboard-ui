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
.directive('adMeetings', function () {

    var controller = ['$log', '$scope', 'ENV', 'AhjoMeetingsSrv', '$rootScope', 'DEVICE', function ($log, $scope, ENV, AhjoMeetingsSrv, $rootScope, DEVICE) {
        $log.log("adMeetings: CONTROLLER");
        var self = this;
        self.mtgErr = null;
        self.loading = false;
        self.responseData = {};
        self.data = [];
        self.date = new Date();
        self.date.setFullYear(self.date .getFullYear() - 4);  // this if for testing. to be removed
        self.mobile = $rootScope.device === DEVICE.MOBILE;

        self.agencyData = [];
        self.roleData = [];

        self.aF = null;
        self.rF = null;

        function setData() {
            self.data = [];
            var date = self.date.toJSON();
            if (self.responseData instanceof Object && self.responseData.objects instanceof Array) {
                for (var i = 0; i < self.responseData.objects.length; i++) {
                    var item = self.responseData.objects[i];
                    var time = item.meetingTime;
                    var aVisible = self.aF ? (self.aF === item.agencyName) : true;
                    var fVisible = ($scope.future && time) ? date < time : true;

                    for (var j = 0; j < item.roleIDs.length; j++) {
                        var role = item.roleIDs[j].RoleName;
                        var rVisible = self.rF ? (self.rF === role) : true;
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

        AhjoMeetingsSrv.getMeetings()
        .then(function(response) {
            self.loading = false;
            self.responseData = response;
        },
        function(error) {
            $log.error("adMeetings: getMeetings error: " +JSON.stringify(error));
            self.loading = false;
            self.mtgErr = error;
        },
        function(/*notify*/) {
            self.loading = true;
        })
        .finally(function() {
            setData();
            parseAgencyDropdown();
            parseRoleDropdown();
        });

        $scope.$watch('future', function() {
            setData();
            parseAgencyDropdown();
            parseRoleDropdown();
        });

        self.meetingSelected = function(meeting) {
            $log.debug("adMeetings: meetingSelected: "+ JSON.stringify(meeting));
            // $state.go('app.meeting', {meetingItem : meeting});
        };

        self.setAgencyFilter = function(agency) {
            $log.debug("adMeetings: setAgencyFilter: "+ agency);
            self.aF = agency;
            setData();
            parseRoleDropdown();
            if (!agency) {
                parseAgencyDropdown();
            }
            $scope.agencyIsOpen = false;
        };

        self.setRoleFilter = function(role) {
            $log.debug("adMeetings: setRoleFilter: "+ role);
            self.rF = role;
            setData();
            parseAgencyDropdown();
            if (!role) {
                parseRoleDropdown();
            }
            $scope.roleIsOpen = false;
        };
    }];

    return {
        scope: {
            future: '=',
            selected: '&onSelected'
        },
        templateUrl: 'directives/meetings/adMeetings.Directive.html',
        restrict: 'AE',
        controller: controller,
        controllerAs: 'ctrl',
        replace: 'true'
    };
});
