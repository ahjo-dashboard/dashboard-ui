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

    var controller = ['$log', '$scope', 'AhjoMeetingService', 'ENV', function ($log, $scope, AhjoMeetingService, ENV) {
        var self = this;
        self.meetings = [];
        self.mtgErr = null;
        self.data = [];

        self.organs = [];
        self.roles = [];

        self.meetingFilter = null;
        self.organFilter = null;
        self.roleFilter = null;

        function parseDropdowns() {
            self.organs = [];
            self.roles = [];
            for (var i = 0; i < self.meetings.length; i++) {
                var organ = self.meetings[i].policymaker_name;
                if (organ && self.organs.indexOf(organ) === -1) {
                    self.organs.push(organ);
                }
                var role = self.meetings[i].policymaker;
                if (role && self.roles.indexOf(role) === -1) {
                    self.roles.push(role);
                }
            }
        }

        function setData() {
            self.data = [];
            for (var i = 0; i < self.meetings.length; i++) {
                self.data.push({
                    'meeting': self.meetings[i].id,
                    'role': self.meetings[i].policymaker,
                    'organ': self.meetings[i].policymaker_name,
                    'visible': true
                });
            }
        }

        function filterData() {
            $log.debug("adMeetings: filterData:");
            for (var i = 0; i < self.data.length; i++) {
                var showMeeting = self.meetingFilter ? self.data[i].meeting === self.meetingFilter : true;
                var showRole = self.roleFilter ? self.data[i].role === self.roleFilter : true;
                var showOrgan = self.organFilter ? self.data[i].organ === self.organFilter : true;
                self.data[i].visible = showMeeting && showRole && showOrgan;
            }
        }

        AhjoMeetingService.getMeetings(ENV.MeetingsApi_OverviewLimit, ENV.MeetingsApi_DefaultOffset)
    	.then(function(response) {
    		self.meetings = response.objects;
    		self.mtgErr = null;
    	},
    	function(error) {
    		self.mtgErr = error.status;
    	})
    	.finally(function() {
            parseDropdowns();
            setData();
    	});

        self.meetingSelected = function(meeting) {
            $log.debug("adMeetings: meetingSelected: "+ JSON.stringify(meeting));
            // $state.go('app.meeting', {meetingItem : meeting});
        };

        self.setOrganFilter = function(organ) {
            $log.debug("adMeetings: setOrganFilter: "+ organ);
            self.organFilter = organ;
            filterData();
            $scope.organIsOpen = false;
        };

        self.setMeetingFilter = function(meeting) {
            $log.debug("adMeetings: setMeetingFilter: "+ meeting);
            self.meetingFilter = meeting;
            filterData();
            $scope.meetingIsOpen = false;
        };

        self.setRoleFilter = function(role) {
            $log.debug("adMeetings: setRoleFilter: "+ role);
            self.roleFilter = role;
            filterData();
            $scope.roleIsOpen = false;
        };
    }];

    return {
        scope: {
            header: '=header',
        },
        templateUrl: 'directives/meetings/adMeetings.Directive.html',
        restrict: 'AE',
        controller: controller,
        controllerAs: 'ctrl',
        replace: 'true'
    };
});
