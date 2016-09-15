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
    .service('AhjoMeetingSrv', ['$log', '$http', 'ENV', '$q', '$timeout', 'Utils', 'CONST', function ($log, $http, ENV, $q, $timeout, Utils, CONST) {
        $log.log("AhjoMeetingSrv: SERVICE");
        var self = this;

        function handleResult(aDeferred, aResult) {
            if (!angular.isObject(aDeferred)) {
                $log.error("AhjoMeetingSrv: handleResult missing deferred");
                return;
            }
            if (!angular.isObject(aResult)) {
                aDeferred.reject(CONST.GENERALERROR);
            }
            else if (angular.isObject(aResult.error)) {
                aDeferred.reject(aResult.error);
            }
            else if (angular.isObject(aResult.data)) {
                aDeferred.resolve(aResult.data);
            }
            else {
                aDeferred.reject(CONST.GENERALERROR);
            }
        }

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

        /*
        * @name dashboard.utils.getDecisions
        * @description Returned promise will resolve with response data
        * or reject with { error: } object containing an HTTP or REST error code or -1 for a badly formatted response.
        * @param {string} Meeting guid
        * @param {string} Topic guid
        * @returns {promise} Promise object
        */
        self.getDecisions = function (aMeetingGuid, aTopicGuid) {
            var def = $q.defer();
            $timeout(function () {
                def.notify({});

                $http({
                    method: 'GET',
                    cache: false,
                    url: ENV.AhjoApi_Decisions.replace(':meetingguid', aMeetingGuid).replace(':topicguid', aTopicGuid)
                }).then(function (resp) {
                    var res = Utils.parseResponse(resp);
                    handleResult(def, res);
                }, function (aError) {
                    $log.error("AhjoMeetingSrv.getDecisions: http error", aError);
                    var e = Utils.parseHtmlError(aError);
                    def.reject(e);
                });
            }, 0);

            return def.promise;
        };

        self.getMotions = function (aMeetingGuid, aPersonGuid) {
            var def = $q.defer();
            $timeout(function () {
                def.notify({});

                $http({
                    method: 'GET',
                    cache: false,
                    url: ENV.AhjoApi_Motions.replace(':meetingGuid', aMeetingGuid).replace(':personguid', aPersonGuid)
                }).then(function (resp) {
                    var res = Utils.parseResponse(resp);
                    handleResult(def, res);
                }, function (aError) {
                    $log.error("AhjoMeetingSrv.getMotions: http error", aError);
                    var e = Utils.parseHtmlError(aError);
                    def.reject(e);
                });
            }, 0);

            return def.promise;
        };

        self.meetingLogin = function meetingLoginFn(meetingGuid, meetingRole, personGuid) {
            var deferred = $q.defer();
            $http({
                method: 'POST',
                data: {
                    'meetingGuid': meetingGuid,
                    'meetingRole': meetingRole,
                    'personGuid': personGuid
                },
                cache: false,
                url: ENV.AhjoApi_MeetingLogin
            }).then(function (resp) {
                deferred.resolve(resp);
            }, function (error) {
                $log.error("AhjoMeetingSrv: login");
                deferred.reject(error);
            });

            return deferred.promise;
        };

        self.meetingLogout = function meetingLogoutFn(meetingGuid, meetingRole, personGuid) {
            var deferred = $q.defer();
            $http({
                method: 'POST',
                data: {
                    'meetingGuid': meetingGuid,
                    'meetingRole': meetingRole,
                    'personGuid': personGuid
                },
                cache: false,
                url: ENV.AhjoApi_MeetingLogout
            }).then(function (resp) {
                deferred.resolve(resp);
            }, function (error) {
                $log.error("AhjoMeetingSrv: logout");
                deferred.reject(error);
            });

            return deferred.promise;
        };

        self.setTopicStatus = function (topicGuid, meetingGuid, stateId) {
            var deferred = $q.defer();
            $timeout(function () {
                deferred.notify({});
                $http({
                    method: 'POST',
                    cache: false,
                    url: ENV.AhjoApi_TopicStatus.replace(':stateId', stateId).replace(':meetingGuid', meetingGuid).replace(':topicGuid', topicGuid)
                }).then(function (response) {
                    var result = Utils.parseResponse(response);
                    handleResult(deferred, result);
                }, function (error) {
                    var e = Utils.parseHtmlError(error);
                    deferred.reject(e);
                });

            }, 0);

            return deferred.promise;
        };

        self.setMeetingStatus = function (meetingGuid, stateId) {
            var deferred = $q.defer();
            $timeout(function () {
                deferred.notify({});
                $http({
                    method: 'POST',
                    cache: false,
                    url: ENV.AhjoApi_MeetingStatus.replace(':stateId', stateId).replace(':meetingGuid', meetingGuid)
                }).then(function (response) {
                    var result = Utils.parseResponse(response);
                    handleResult(deferred, result);
                }, function (error) {
                    var e = Utils.parseHtmlError(error);
                    deferred.reject(e);
                });
            }, 0);

            return deferred.promise;
        };

    }]);
