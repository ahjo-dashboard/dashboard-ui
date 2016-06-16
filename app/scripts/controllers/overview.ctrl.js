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
    .controller('overviewCtrl', ['$scope', '$log', 'ENV', 'SigningOpenApi', '$state', '$rootScope', 'CONST', '$stateParams', 'MTGD', 'StorageSrv', '$http', function ($scope, $log, ENV, SigningOpenApi, $state, $rootScope, CONST, $stateParams, MTGD, StorageSrv, $http) {
        $log.debug("overviewCtrl: CONTROLLER, mode: ", $stateParams.state);
        var self = this;
        self.loading = 0;
        self.signReqsHeader = 'Avoimet allekirjoituspyynnöt';
        self.signErr = null;
        self.blockMode = CONST.BLOCKMODE.DEFAULT;
        self.vbl = MTGD.VISIBLE;
        self.bms = CONST.BLOCKMODE;

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

        self.meetingItemSelected = function (meetingItem) {
            $log.debug("overviewCtrl.meetingItemSelected");
            StorageSrv.setKey(CONST.KEY.MEETING_ITEM, meetingItem);
            $state.go(CONST.APPSTATE.MEETING, { 'menu': CONST.MENU.FULL });
        };

        self.showInfo = function () {
            $log.debug("overviewCtrl: showInfo");
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

        function logoutRest() {
            $log.debug("overviewCtrl.logoutRest");
            self.logoutProm = $http({
                method: 'GET',
                withCredentials: true,
                url: ENV.AHJOAPI_USERLOGOUTREST
            }).then(function successCallback(/*response*/) {
                $log.debug("overviewCtrl.logoutRest: done");
                $state.go(CONST.APPSTATE.LOGIN);
            }, function errorCallback(error) {
                $log.error(error);
            }).finally(function () {
            });
        }

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
