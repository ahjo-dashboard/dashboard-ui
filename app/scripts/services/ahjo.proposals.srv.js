/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
* @ngdoc service
* @name dashboard.AhjoProposalSrv
* @description
* # AhjoProposalSrv
* Service in the dashboard.
*/
angular.module('dashboard')
    .service('AhjoProposalSrv', ['$log', '$http', 'ENV', '$q', '$timeout', function ($log, $http, ENV, $q, $timeout) {
        $log.log("AhjoProposalSrv: SERVICE");
        var self = this;

        self.get = function (guid) {
            $log.debug("AhjoProposalSrv: get " + guid);
            var deferred = $q.defer();
            $timeout(function () {
                deferred.notify({});
                $http({
                    method: 'GET',
                    cache: false,
                    url: ENV.AhjoApi_Proposals.replace('{GUID}', guid)
                }).then(function (response) {
                    $log.debug("AhjoProposalSrv: get then");
                    deferred.resolve(response.data);
                }, function (error) {
                    $log.error("AhjoProposalSrv: get error");
                    deferred.reject(error);
                });
            }, 0);

            return deferred.promise;
        };

    }]);
