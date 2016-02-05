/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc function
 * @name dashboard.controller:meetingListCtrl
 * @description
 * # meetingListCtrl
 * Controller of the dashboard
 */
angular.module('dashboard')
.controller('meetingListCtrl', function ($log, AhjoMeetingService, $state) {
    $log.debug("meetingListCtrl: config");
    var self = this;
    self.meetingsHeader = 'Kokoukset';
    // Demo implementation where selecting a dropdown enables the next dropdown selection
    self.list_pmakers = ['Kaupunginhallitus', 'Nuorisolautakunta'];
    self.list_mtgs_init = ['Kokous 1', 'Kokous 2', 'Kokous 3', 'Kokous 4', 'Kokous 5', 'Kokous 6', 'Kokous 7', 'Kokous 8',
        'Kokous 9', 'Kokous 10', 'Kokous 11'];
    self.list_roles_init = ['Puheenjohtaja', 'Pöytäkirjanpitäjä', 'Osallistuja'];


    AhjoMeetingService.getMeetings()
    .then(function(response) {
        $log.debug("meetingListCtrl: getMeetings then"); //TODO: remove
        self.meetings = response.objects;
    },
    function(error) {
        $log.error("meetingListCtrl: getMeetings error: " +error);
    })
    .finally(function() {
        $log.debug("meetingListCtrl: getMeetings finally"); //TODO: re
    });

    self.meetingSelected = function(meeting) {
        $log.debug("meetingListCtrl: meetingSelected");
        $state.go('app.meeting', {meetingItem : meeting});
    };

});
