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
.controller('overviewCtrl',['$scope','$log','ENV','SigningOpenApi','$state','$rootScope','BLOCKMODE','MENU', 'HOMEMODE','$stateParams', function ($scope, $log, ENV, SigningOpenApi, $state, $rootScope, BLOCKMODE, MENU, HOMEMODE, $stateParams) {
    $log.debug("overviewCtrl: CONTROLLER, mode: ", $stateParams.state);
    var self = this;
    self.loading = 0;
    self.signReqsHeader = 'Avoimet allekirjoituspyynnöt';
    self.signErr = null;
    self.blockMode = BLOCKMODE.BOTH;
    self.future = true;
    self.closedSignReqs = false;

    switch ($stateParams.state) {
        case HOMEMODE.MEETINGS:
            self.hasMeetings = true;
            break;
        case HOMEMODE.ESIGN:
            self.hasEsign = true;
            break;
        default:
            self.hasMeetings = true;
            self.hasEsign = true;
            break;
    }

    self.meetingItemSelected = function(meetingItem) {
        $log.debug("overviewCtrl.meetingItemSelected");
        $state.go('app.meeting', {'meetingItem': meetingItem, 'menu': MENU.FULL});
    };

    self.signItemSelected = function(signingItem) {
        $log.debug("overviewCtrl.signItemSelected");
        $state.go('app.signitem', {signItem: signingItem});
    };

    self.showInfo = function() {
        $log.debug("overviewCtrl: showInfo");
    };

    self.upperClicked = function() {
        self.blockMode = (self.blockMode === BLOCKMODE.BOTH || self.blockMode === BLOCKMODE.LOWER) ? BLOCKMODE.UPPER : BLOCKMODE.BOTH;
    };

    self.lowerClicked = function() {
        self.blockMode = (self.blockMode === BLOCKMODE.BOTH || self.blockMode === BLOCKMODE.UPPER) ? BLOCKMODE.LOWER : BLOCKMODE.BOTH;
    };

    $scope.$on('$destroy', function() {
        $log.debug("overviewCtrl: DESTROY");
    });
}]);
