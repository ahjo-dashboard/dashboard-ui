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
    $log.debug("AhjoMeetingsSrv: SERVICE");
    var self = this;

    self.getMeetings = function() {
        $log.debug("AhjoMeetingsSrv: getMeetings");
        var deferred = $q.defer();
        $timeout(function () {
            deferred.notify({});
            $http({
                method: 'GET',
                cache: false,
                url: ENV.AhjoApi_Meetings
            }).then(function(response) {
                $log.debug("AhjoMeetingsSrv: getMeetings then");
                deferred.resolve(response.data);
            }, function(error) {
                $log.error("AhjoMeetingsSrv: getMeetings error");
                deferred.reject(error);
            });
        }, 0);

        return deferred.promise;
    };

}]);
