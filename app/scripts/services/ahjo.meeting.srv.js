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

        self.meetingLogin = function (meetingGuid, meetingRole) {
            var deferred = $q.defer();
            $http({
                method: 'POST',
                data: {
                    'meetingGuid': meetingGuid,
                    'meetingRole': meetingRole
                },
                cache: false,
                url: ENV.AhjoApi_MeetingLogin
            }).then(function () {
                // todo: some response needed
                deferred.resolve();
            }, function (error) {
                $log.error("AhjoMeetingSrv: login error");
                deferred.reject(error);
            });

            return deferred.promise;
        };

        self.meetingLogout = function (meetingGuid) {
            var deferred = $q.defer();
            $http({
                method: 'GET',
                data: {
                    'meetingGuid': meetingGuid
                },
                cache: false,
                url: ENV.AhjoApi_MeetingLogout.replace(':meetingGuid', meetingGuid)
            }).then(function () {
                // todo: some response needed
                deferred.resolve();
            }, function (error) {
                $log.error("AhjoMeetingSrv: logout error");
                deferred.reject(error);
            });

            return deferred.promise;
        };

    }]);
