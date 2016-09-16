/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc function
 * @name dashboard.controller:OverviewCtrl
 * @description
 * # OverviewCtrl
 * Controller of the dashboard
 */
angular.module('dashboard')
    .controller('overviewCtrl', ['$scope', '$log', 'ENV', 'SigningOpenApi', '$state', '$rootScope', 'CONST', '$stateParams', 'MTGD', 'StorageSrv', '$http', 'Utils', 'DialogUtils', 'AhjoMeetingSrv', function ($scope, $log, ENV, SigningOpenApi, $state, $rootScope, CONST, $stateParams, MTGD, StorageSrv, $http, Utils, DialogUtils, AhjoMeetingSrv) {
        $log.debug("overviewCtrl: CONTROLLER, mode: ", $stateParams.state);
        var self = this;
        self.loading = 0;
        self.signReqsHeader = 'Avoimet allekirjoituspyynnöt';
        self.signErr = null;
        self.blockMode = CONST.BLOCKMODE.DEFAULT;
        self.vbl = MTGD.VISIBLE;
        self.bms = CONST.BLOCKMODE;
        self.testEnvUserId = StorageSrv.getKey(CONST.KEY.TESTENV_USERID);

        var visibleMtgs = StorageSrv.getKey(CONST.KEY.VISIBLE_MTGS);
        switch (visibleMtgs) {
            case MTGD.VISIBLE.OPEN:
                self.vblMtgs = MTGD.VISIBLE.OPEN;
                break;
            case MTGD.VISIBLE.CLOSED:
                self.vblMtgs = MTGD.VISIBLE.CLOSED;
                break;
            default:
                self.vblMtgs = MTGD.VISIBLE.OPEN;
                break;
        }

        var signingRes = StorageSrv.getKey(CONST.KEY.SIGNING_RES);
        self.closedSignReqs = signingRes ? signingRes : false;

        $rootScope.menu = CONST.MENU.CLOSED;
        var mode = $stateParams.state;
        var storedMode = localStorage.overviewState;

        if (mode === CONST.HOMEMODE.ALL) {
            if (storedMode === '1') {
                mode = CONST.HOMEMODE.MEETINGS;
            }
            else if (storedMode === '2') {
                mode = CONST.HOMEMODE.ESIGN;
            }
        }

        switch (mode) {
            case CONST.HOMEMODE.MEETINGS:
                self.hasMeetings = true;
                break;
            case CONST.HOMEMODE.ESIGN:
                self.hasEsign = true;
                break;
            default:
                self.hasMeetings = true;
                self.hasEsign = true;
                break;
        }

        localStorage.overviewState = mode;

        function goToMeeting(meetingItem, meetingRole, personGuid) {
            $log.debug("overviewCtrl.goToMeeting");
            if (angular.isObject(meetingItem) && angular.isObject(meetingRole) && angular.isString(personGuid)) {

                meetingItem.dbUserRole = meetingRole;
                meetingItem.dbUserPersonGuid = personGuid;

                StorageSrv.setKey(CONST.KEY.MEETING_ITEM, meetingItem);
                $state.go(CONST.APPSTATE.MEETING, { 'menu': CONST.MENU.FULL });
            } else {
                $log.error("overviewCtrl.goToMeeting: bad args \n meeting=" + JSON.stringify(meetingItem) + "\n  role=" + JSON.stringify(meetingRole) + "\n person=" + JSON.stringify(personGuid));
                $rootScope.failedInfo('STR_LOGIN_FAILED');
            }
        }

        function logoutRest() {
            $log.debug("overviewCtrl.logoutRest");
            self.logoutProm = $http({
                method: 'GET',
                withCredentials: true,
                url: ENV.AHJOAPI_USERLOGOUTREST
            }).then(function successCallback(resp) {
                $log.debug("overviewCtrl.logoutRest: done");
                Utils.processAhjoError(resp); // Print any errors but transition state in any case.
            }, function errorCallback(error) {
                $log.error("overviewCtrl.logoutRest");
                Utils.processAhjoError(error);
            }).finally(function () {
                $state.go(CONST.APPSTATE.LOGIN);
            });
        }

        self.loginMeeting = function loginMeetingFn(meetingItem, meetingRole, personGuid) {
            $log.debug("overviewCtrl.loginMeeting: \n - meeting:\n" + JSON.stringify(meetingItem) + "\n - role: " + JSON.stringify(meetingRole) + "\n - personGuid: " + personGuid);
            var dlg = DialogUtils.showProgress('STR_MTG_LOGIN_PROGRESS');
            AhjoMeetingSrv.meetingLogin(meetingItem.meetingGuid, meetingRole.RoleID, personGuid).then(function (resp) {
                $log.debug("overviewCtrl.loginMeeting: result \n" + JSON.stringify(resp));
                if (!Utils.processAhjoError(resp)) {
                    goToMeeting(meetingItem, meetingRole, personGuid);
                }
            }, function (error) {
                Utils.processAhjoError(error);
            }).finally(function () {
                DialogUtils.close(dlg);
            });
        };

        self.showInfo = function () {
            $log.debug("overviewCtrl: showInfo");
            $state.go(CONST.APPSTATE.INFO);
        };

        self.upperClicked = function () {
            self.blockMode = (self.blockMode === CONST.BLOCKMODE.PRIMARY || self.blockMode === CONST.BLOCKMODE.SECONDARY) ? CONST.BLOCKMODE.DEFAULT : CONST.BLOCKMODE.PRIMARY;
        };

        self.lowerClicked = function () {
            self.blockMode = (self.blockMode === CONST.BLOCKMODE.SECONDARY || self.blockMode === CONST.BLOCKMODE.PRIMARY) ? CONST.BLOCKMODE.DEFAULT : CONST.BLOCKMODE.SECONDARY;
        };

        self.setMtgsVisible = function (mtgs) {
            self.vblMtgs = mtgs;
            StorageSrv.setKey(CONST.KEY.VISIBLE_MTGS, mtgs);
        };

        self.setClosedSignReqs = function (value) {
            self.closedSignReqs = value;
            StorageSrv.setKey(CONST.KEY.SIGNING_RES, value);
        };

        self.logout = function () {
            $log.debug("overviewCtrl.logout");
            if (!self.logoutProm) {
                logoutRest();
            }
            else {
                $log.error("overviewCtrl.logout: ignored");
            }
        };

        $scope.$on('$destroy', function () {
            $log.debug("overviewCtrl: DESTROY");
        });
    }]);
