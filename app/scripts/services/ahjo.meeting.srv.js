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

    self.getMeeting = function(guid) {
        $log.debug("AhjoMeetingSrv: getMeeting " + guid);
        var deferred = $q.defer();
        $timeout(function () {
            deferred.notify({});
            $http({
                method: 'GET',
                cache: true,
                url: ENV.AhjoApi_Meeting.replace('{GUID}', guid)
            }).then(function(response) {
                $log.debug("AhjoMeetingSrv: getMeeting then");
                deferred.resolve(response.data);
            }, function(error) {
                $log.error("AhjoMeetingSrv: getMeeting error");
                deferred.reject(error);
            });
        }, 0);

        return deferred.promise;
    };

}]);
