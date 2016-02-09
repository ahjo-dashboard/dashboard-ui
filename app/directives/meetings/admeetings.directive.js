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

    var controller = ['$log', '$scope', 'ENV', 'AhjoMeetingsSrv', function ($log, $scope, ENV, AhjoMeetingsSrv) {
        $log.log("adMeetings: CONTROLLER");
        var self = this;
        self.mtgErr = null;
        self.loading = false;
        self.responseData = {};
        self.data = [];

        self.agencyData = [];
        self.meetingData = [];
        self.roleData = [];

        self.mF = null;
        self.aF = null;
        self.rF = null;

        function setData() {
            $log.log("adMeetings: setData");
            self.data = [];

            if (self.responseData instanceof Object && self.responseData.objects instanceof Array) {
                for (var i = 0; i < self.responseData.objects.length; i++) {
                    var item = self.responseData.objects[i];
                    var mVisible = self.mF ? (self.mF === item.name) : true;
                    var aVisible = self.aF ? (self.aF === item.agencyName) : true;

                    for (var j = 0; j < item.roleIDs.length; j++) {
                        var role = item.roleIDs[j].RoleName;
                        var rVisible = self.rF ? (self.rF === role) : true;
                        self.data.push({
                            'meeting': item,
                            'role': role,
                            'visible': mVisible && aVisible && rVisible
                        });
                    }
                }
            }
        }

        function parseDropdowns() {
            $log.log("adMeetings: parseDropdowns");
            self.agencyData = [];
            self.roleData = [];
            for (var i = 0; i < self.data.length; i++) {
                var agency = self.data[i].meeting.agencyName;
                if (agency && self.agencyData.indexOf(agency) === -1) {
                    self.agencyData.push(agency);
                }
                var name = self.data[i].meeting.name;
                if (name && self.meetingData.indexOf(name) === -1) {
                    self.meetingData.push(name);
                }
                var item = self.data[i].meeting;
                for (var j = 0; j < item.roleIDs.length; j++) {
                    var role = item.roleIDs[j].RoleName;
                    if (role && self.roleData.indexOf(role) === -1) {
                        self.roleData.push(role);
                    }
                }
            }
        }

        AhjoMeetingsSrv.getMeetings()
        .then(function(response) {
            $log.debug("adMeetings: getMeetings then:");
            self.loading = false;
            self.responseData = response;
        },
        function(error) {
            $log.error("adMeetings: getMeetings error: " +JSON.stringify(error));
            self.loading = false;
        },
        function(notify) {
            $log.debug("adMeetings: getMeetings notify: " +JSON.stringify(notify));
            self.loading = true;
        })
        .finally(function() {
            $log.debug("adMeetings: getMeetings finally:");
            setData();
            parseDropdowns();
        });

        self.meetingSelected = function(meeting) {
            $log.debug("adMeetings: meetingSelected: "+ JSON.stringify(meeting));
            // $state.go('app.meeting', {meetingItem : meeting});
        };

        self.setAgencyFilter = function(agency) {
            $log.debug("adMeetings: setAgencyFilter: "+ agency);
            self.aF = agency;
            setData();
            $scope.agencyIsOpen = false;
        };

        self.setMeetingFilter = function(meeting) {
            $log.debug("adMeetings: setMeetingFilter: "+ meeting);
            self.mF = meeting;
            setData();
            $scope.meetingIsOpen = false;
        };

        self.setRoleFilter = function(role) {
            $log.debug("adMeetings: setRoleFilter: "+ role);
            self.rF = role;
            setData();
            $scope.roleIsOpen = false;
        };
    }];

    return {
        scope: {

        },
        templateUrl: 'directives/meetings/adMeetings.Directive.html',
        restrict: 'AE',
        controller: controller,
        controllerAs: 'ctrl',
        replace: 'true'
    };
});
