'use strict';

/**
* @ngdoc function
* @name dashboard.controller:loginCtrl
* @description
* # loginCtrl
* Controller of the dashboard
*/
angular.module('dashboard')
    .controller('loginCtrl', ['$log', '$http', '$state', 'ENV', 'CONST', '$timeout', 'Utils', 'StorageSrv', 'DialogUtils', function ($log, $http, $state, ENV, CONST, $timeout, Utils, StorageSrv, DialogUtils) {
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
            var dlg = DialogUtils.showProgress('STR_LOGGING_IN', '' + self.data.selection);
            self.login = true;

            $http({
                method: 'POST',
                data: 'ADID=' + self.data.selection,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                withCredentials: true,
                url: ENV.AhjoApi_UserLoginRest
            }).then(function (resp) {
                $log.error("loginCtrl.loginRest: done");
                if (!Utils.processAhjoError(resp)) { // LoginRest result: OK
                    // Setting TESTENV_USERID to store doesn't reflect the userid used by backend if in some error cases if response doesn't include a  Set-Cookie or similar issue.
                    // That might happen e.g. due to backend completing 200OK but rejecting bad arguments for the request.
                    // Result would be client thinking user was set successfully but in fact userid authenticated by backend would be used.
                    StorageSrv.setKey(CONST.KEY.TESTENV_USERID, self.data.selection);

                    $state.go(CONST.APPSTATE.HOME).finally(function () {
                        $log.debug("loginCtrl.loginRest: state.go finally");
                    });

                } else { // LoginRest result: RESET error
                }

            }, function (error) { // LoginRest result: HTTP error
                $log.error("loginCtrl.loginRest");
                Utils.processAhjoError(error);
            }).finally(function () {
                $log.debug("loginCtrl.loginRest: finally");
                self.data.selection = null;
                self.login = false;
                DialogUtils.close(dlg);
                dlg = null;
            });
        }

        self.selectUser = function () {
            $log.debug('loginCtrl.selectUser: ' + self.data.selection);
            loginRest();
        };

        self.selectOwn = function () {
            $log.debug('loginCtrl.selectOwn');
            var dlg = DialogUtils.showProgress('STR_LOGGING_IN');
            $state.go(CONST.APPSTATE.HOME).finally(function () {
                $log.debug("loginCtrl.selectOwn: state.go finally");
                DialogUtils.close(dlg);
            });
        };

    }]);
