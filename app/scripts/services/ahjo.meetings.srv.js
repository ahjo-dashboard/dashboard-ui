/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
* @ngdoc service
* @name dashboard.AhjoMeetingsSrv
* @description
* # AhjoMeetingsSrv
* Service in the dashboard.
*/
angular.module('dashboard')
.service('AhjoMeetingsSrv', ['$log', '$http', 'ENV', '$q', '$timeout', function ($log, $http, ENV, $q, $timeout) {
    $log.log("AhjoMeetingsSrv: SERVICE");
    var self = this;

    self.getMeetings = function() {
        $log.log("AhjoMeetingsSrv: getMeetings");
        var deferred = $q.defer();
        $timeout(function () {
            deferred.notify();
            $http({
                method: 'GET',
                cache: true,
                url: ENV.AhjoApi_Meetings
            }).then(function(response) {
                $log.log("AhjoMeetingsSrv: getMeetings then");
                self.data = response.data;
                deferred.resolve(self.data);
            }, function(error) {
                $log.log("AhjoMeetingsSrv: getMeetings error");
                deferred.reject(error);
            });
        }, 0);

        return deferred.promise;
    };

}]);
