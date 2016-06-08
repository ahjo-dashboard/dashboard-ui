'use strict';

/**
* @ngdoc function
* @name dashboard.controller:loginCtrl
* @description
* # loginCtrl
* Controller of the dashboard
*/
angular.module('dashboard')
    .controller('loginCtrl', ['$log', '$http', '$state', 'ENV', 'CONST', '$timeout', function ($log, $http, $state, ENV, CONST, $timeout) {
        $log.log("loginCtrl.CONSTRUCT");

        var self = this;
        self.data = { selection: null, options: [] };
        self.meetings = [];
        self.loadingUsers = true;
        self.login = false;
        self.error = null;

        $log.debug("loginCtrl GET options start");
        $http({
            method: 'GET',
            url: ENV.AhjoApi_UserLogin
        }).then(function successCallback(response) {
            $log.debug("loginCtrl GET options success");
            $timeout(function () {
                // $log.debug("loginCtrl GET options find starting");
                var sel_resp = angular.element(response.data).find('option');

                var sel = [];
                // Collect only relevant properties
                angular.forEach(sel_resp, function (value) {
                    this.push(value);
                }, sel);

                self.data.options = sel;
                self.loadingUsers = false;
                $log.debug("loginCtrl GET options done, count=" + self.data.options.length);
            }, 0);
        }, function errorCallback(error) {
            $log.error(error);
            self.error = error;
            self.loadingUsers = false;
        }).finally(function () {
            $log.debug("loginCtrl GET options finally");
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
                $state.go(CONST.APPSTATE.HOME);
                // Don't remove progress bar when continuing with state transition
            }, function errorCallback(error) {
                $log.error(error);
                self.data.selection = null;
                self.error = error;
                self.login = false;
            }).finally(function () {
                // Don't remove progress bar when continuing with state transition
            });
        }

        self.select = function () {
            $log.debug('loginCtrl.select ' + self.data.selection);
            loginRest();
        };

    }]);
