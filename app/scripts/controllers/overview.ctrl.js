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
    .controller('overviewCtrl', ['$scope', '$log', 'ENV', 'SigningOpenApi', '$state', '$rootScope', 'CONST', '$stateParams', 'MTGD', 'StorageSrv', function($scope, $log, ENV, SigningOpenApi, $state, $rootScope, CONST, $stateParams, MTGD, StorageSrv) {
        $log.debug("overviewCtrl: CONTROLLER, mode: ", $stateParams.state);
        var self = this;
        self.loading = 0;
        self.signReqsHeader = 'Avoimet allekirjoituspyynnöt';
        self.signErr = null;
        self.blockMode = CONST.BLOCKMODE.BOTH;
        self.vbl = MTGD.VISIBLE;

        var visibleMtgs = StorageSrv.get(CONST.KEY.VISIBLE_MTGS);
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

        var signingRes = StorageSrv.get(CONST.KEY.SIGNING_RES);
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

        self.meetingItemSelected = function(meetingItem) {
            $log.debug("overviewCtrl.meetingItemSelected");
            StorageSrv.set(CONST.KEY.MEETING_ITEM, meetingItem);
            $state.go(CONST.APPSTATE.MEETING, { 'menu': CONST.MENU.FULL });
        };

        self.showInfo = function() {
            $log.debug("overviewCtrl: showInfo");
        };

        self.upperClicked = function() {
            self.blockMode = (self.blockMode === CONST.BLOCKMODE.BOTH || self.blockMode === CONST.BLOCKMODE.LOWER) ? CONST.BLOCKMODE.UPPER : CONST.BLOCKMODE.BOTH;
        };

        self.lowerClicked = function() {
            self.blockMode = (self.blockMode === CONST.BLOCKMODE.BOTH || self.blockMode === CONST.BLOCKMODE.UPPER) ? CONST.BLOCKMODE.LOWER : CONST.BLOCKMODE.BOTH;
        };

        self.setMtgsVisible = function(mtgs) {
            self.vblMtgs = mtgs;
            StorageSrv.set(CONST.KEY.VISIBLE_MTGS, mtgs);
        };

        self.setClosedSignReqs = function(value) {
            self.closedSignReqs = value;
            StorageSrv.set(CONST.KEY.SIGNING_RES, value);
        };

        $scope.$on('$destroy', function() {
            $log.debug("overviewCtrl: DESTROY");
        });
    }]);
