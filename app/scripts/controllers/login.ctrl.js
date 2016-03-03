'use strict';

/**
* @ngdoc function
* @name dashboard.controller:loginCtrl
* @description
* # loginCtrl
* Controller of the dashboard
*/
angular.module('dashboard')
    .controller('loginCtrl', ['$log', '$http', '$state', 'ENV', 'APPSTATE', function ($log, $http, $state, ENV, APPSTATE) {
        $log.log("loginCtrl.CONSTRUCT");
        $log.log(ENV.AhjoApi_UserLogin);

        var self = this;
        self.data = { selection: null, options: [] };
        self.meetings = [];
        self.loadingUsers = true;
        self.login = false;
        self.error = null;

        $http({
            method: 'GET',
            url: ENV.AhjoApi_UserLogin
        }).then(function successCallback(response) {
            self.data.options = angular.element(response.data).find('option');
        }, function errorCallback(error) {
            $log.error(error);
            self.error = error;
        }).finally(function () {
            self.loadingUsers = false;
        });

        function loginRest() {
            self.error = null;
            self.login = true;
            $http({
                method: 'POST',
                data: 'ADID=' + self.data.selection,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                withCredentials: true,
                url: ENV.AhjoApi_UserLoginRest
            }).then(function successCallback(/*response*/) {
                self.data.selection = null;
                $state.go(APPSTATE.HOME);

            }, function errorCallback(error) {
                $log.error(error);
                self.data.selection = null;
                self.error = error;
            }).finally(function () {
                self.login = false;
            });
        }

        self.select = function () {
            $log.debug('loginCtrl.select ' + self.data.selection);
            loginRest();
        };

    }]);
