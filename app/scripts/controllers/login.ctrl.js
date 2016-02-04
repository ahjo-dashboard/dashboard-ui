'use strict';

/**
* @ngdoc function
* @name dashboard.controller:loginCtrl
* @description
* # loginCtrl
* Controller of the dashboard
*/
angular.module('dashboard')
.controller('loginCtrl', ['$log', '$http', '$state', 'ENV', function ($log, $http, $state, ENV) {
    $log.log("loginCtrl.CONSTRUCT");
    $log.log(ENV.AhjoApi_UserLogin);

    var self = this;
    self.data = { selection : null, options : [] };
    self.meetings = [];

    $http({
        method: 'GET',
        url: ENV.AhjoApi_UserLogin
    }).then(function successCallback(response) {
        self.data.options = angular.element(response.data).find('option');
    }, function errorCallback(error) {
        $log.error(error);
    });

    function loginRest() {
        $http({
            method: 'POST',
            data: 'ADID=' + self.data.selection,
            headers : {
                'Upgrade-Insecure-Requests' : '1',
                'Content-Type' : 'application/x-www-form-urlencoded'
            },
            withCredentials: true,
            url: ENV.AhjoApi_UserLoginRest
        }).then(function successCallback(/*response*/) {
            self.data.selection = null;
            $state.go('app.overview');

        }, function errorCallback(error) {
            $log.error(error);
            self.data.selection = null;
        });
    }

    self.select = function() {
        $log.debug('loginCtrl.select ' + self.data.selection);
        loginRest();
    };

}]);
