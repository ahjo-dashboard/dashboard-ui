/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
* @ngdoc service
* @name dashboard.AhjoProposalsSrv
* @description
* # AhjoProposalsSrv
* Service in the dashboard.
*/
angular.module('dashboard')
    .service('AhjoProposalsSrv', ['$log', '$http', 'ENV', '$q', '$timeout', function ($log, $http, ENV, $q, $timeout) {
        $log.log("AhjoProposalsSrv: SERVICE");
        var self = this;

        self.getMeeting = function (guid) {
            $log.debug("AhjoProposalsSrv: getMeeting " + guid);
            var deferred = $q.defer();
            $timeout(function () {
                deferred.notify({});
                $http({
                    method: 'GET',
                    cache: false,
                    url: ENV.AhjoApi_Proposals.replace('{GUID}', guid)
                }).then(function (response) {
                    $log.debug("AhjoProposalsSrv: getMeeting then");
                    deferred.resolve(response.data);
                }, function (error) {
                    $log.error("AhjoProposalsSrv: getMeeting error");
                    deferred.reject(error);
                });
            }, 0);

            return deferred.promise;
        };

    }]);
