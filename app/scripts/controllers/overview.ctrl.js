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
    .controller('overviewCtrl', ['$scope', '$log', 'ENV', 'SigningOpenApi', '$state', '$rootScope', 'CONST', '$stateParams', 'MTGD', function($scope, $log, ENV, SigningOpenApi, $state, $rootScope, CONST, $stateParams, MTGD) {
        $log.debug("overviewCtrl: CONTROLLER, mode: ", $stateParams.state);
        var self = this;
        self.loading = 0;
        self.signReqsHeader = 'Avoimet allekirjoituspyynnöt';
        self.signErr = null;
        self.blockMode = CONST.BLOCKMODE.BOTH;
        self.vblMtgs = MTGD.VISIBLE.OPEN;
        self.vbl = MTGD.VISIBLE;
        self.closedSignReqs = false;

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
            $state.go(CONST.APPSTATE.MEETING, { 'meetingItem': meetingItem, 'menu': CONST.MENU.FULL });
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
        };

        $scope.$on('$destroy', function() {
            $log.debug("overviewCtrl: DESTROY");
        });
    }]);
