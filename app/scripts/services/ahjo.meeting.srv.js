/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
* @ngdoc service
* @name dashboard.AhjoMeetingSrv
* @description
* # AhjoMeetingSrv
* Service in the dashboard.
*/
angular.module('dashboard')
    .service('AhjoMeetingSrv', ['$log', '$http', 'ENV', '$q', '$timeout', function ($log, $http, ENV, $q, $timeout) {
        $log.log("AhjoMeetingSrv: SERVICE");
        var self = this;

        self.getMeeting = function (guid) {
            var deferred = $q.defer();
            $timeout(function () {
                deferred.notify({});
                $http({
                    method: 'GET',
                    cache: false,
                    url: ENV.AhjoApi_Meeting.replace('{GUID}', guid)
                }).then(function (response) {
                    deferred.resolve(response.data);
                }, function (error) {
                    $log.error("AhjoMeetingSrv: getMeeting error");
                    deferred.reject(error);
                });
            }, 0);

            return deferred.promise;
        };

        self.getEvents = function (eventId, meetingGuid) {
            var deferred = $q.defer();
            $timeout(function () {
                deferred.notify({});
                $http({
                    method: 'GET',
                    cache: false,
                    url: ENV.AhjoApi_Events.replace(':id', eventId).replace(':meetingGuid', meetingGuid)
                }).then(function (response) {
                    if (response.data.objects instanceof Array) {
                        deferred.resolve(response.data.objects);
                    }
                    else {
                        deferred.reject();
                    }
                }, function (error) {
                    $log.error("AhjoMeetingSrv: getEvents error");
                    deferred.reject(error);
                });
            }, 0);

            return deferred.promise;
        };

        self.login = function (meetingGuid, role) {
            var deferred = $q.defer();

            // length check is for testing and will be removed when backend is ready
            if (ENV.AhjoApi_MeetingLogin && ENV.AhjoApi_MeetingLogin.length) {
                $http({
                    method: 'GET',
                    cache: false,
                    url: ENV.AhjoApi_MeetingLogin.replace(':meetingGuid', meetingGuid).replace(':role', role)
                }).then(function () {
                    deferred.resolve();
                }, function (error) {
                    $log.error("AhjoMeetingSrv: login error");
                    deferred.reject(error);
                });
            }
            else {
                $timeout(function () {
                    if (meetingGuid && role) {
                        deferred.resolve();
                    }
                    else {
                        deferred.reject();
                    }
                }, 1000);
            }

            return deferred.promise;
        };

        self.logout = function (meetingGuid) {
            var deferred = $q.defer();

            // length check is for testing and will be removed when backend is ready
            if (ENV.AhjoApi_MeetingLogout && ENV.AhjoApi_MeetingLogout.length) {
                $http({
                    method: 'GET',
                    cache: false,
                    url: ENV.AhjoApi_MeetingLogout.replace(':meetingGuid', meetingGuid)
                }).then(function () {
                    deferred.resolve();
                }, function (error) {
                    $log.error("AhjoMeetingSrv: logout error");
                    deferred.reject(error);
                });
            }
            else {
                $timeout(function () {
                    if (meetingGuid) {
                        deferred.resolve();
                    }
                    else {
                        deferred.reject();
                    }
                }, 1000);
            }

            return deferred.promise;
        };

    }]);
