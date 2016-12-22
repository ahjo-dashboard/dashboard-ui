/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc directive
 * @name dashboard.directive:docSigners
 * @description
 * # docSigners
 */
var app = angular.module('dashboard');
app.directive('docSigners', [function () {

    var ctrl = ['$log', '$scope', '$rootScope', 'CONST', 'Utils', 'SigningDocSignaturesApi', function ($log, $scope, $rootScope, CONST, Utils, SigningDocSignaturesApi) {
        $log.log("docSigners.CONTROLLER");

        var self = this;

        if (!$scope.item || !("ProcessGuid" in $scope.item) || !$scope.item.ProcessGuid) {
            $log.error("signDetailsCtrl.getReqStatuses: bad args");
            return;
        }

        self.item = $scope.item;
        self.isMobile = $scope.ismobile;
        self.model = null;
        self.busy = false;
        self.errorCode = 0;


        // PRIVATE FUNCTIONS

        function getReqStatuses(item, resultCont) {
            $log.debug("signDetailsCtrl.getReqStatuses");
            self.errorCode = 0;

            if (!item || !("ProcessGuid" in item) || !item.ProcessGuid) {
                $log.error("signDetailsCtrl.getReqStatuses: bad args");
                return;
            }

            resultCont.busy = true;
            var prom = SigningDocSignaturesApi.get({ reqId: item.ProcessGuid }, function (data) {
                $log.log("signDetailsCtrl.getReqStatuses: done: ", arguments);
                self.model = data && data.Signers ? data : null;
                self.item.Signers = prom.Signers;
            }, function (error) {
                $log.error("signDetailsCtrl.getReqStatuses: error: ", arguments);
                if (angular.isObject(error)) {
                    self.errorCode = error.status;
                }
                });
            prom.$promise.finally(function () {
                resultCont.busy = false;
            });
        }


        // PUBLIC FUNCTIONS

        /* Resolve display text for item status */
        self.statusStrId = function (value) {
            var s = Utils.objWithVal(CONST.ESIGNSTATUS, 'value', value);
            return s ? s.stringId : '';
        };

        self.roleStrId = function (value) {
            var s = Utils.objWithVal(CONST.ESIGNROLE, 'value', value);
            return s ? s.stringId : '';
        };

        self.initiatorRoleStrId = function (docType) {
            // Special case for request status list roles, initiator role doesn't have a role code
            return docType && docType === CONST.ESIGNTYPE.OFFICIAL.value ? 'STR_SROLE_PREP' : CONST.ESIGNROLE.SEC.stringId;
        };

        /* Resolve css class for signing status */
        self.statusStyle = function (status) {
            var s = Utils.objWithVal(CONST.ESIGNSTATUS, 'value', status);
            return s ? s.badgeClass : 'label-default';
        };

        // CONSTRUCTION

        getReqStatuses(self.item, self);

    }];

    return {
        controller: ctrl,
        controllerAs: 'c',
        templateUrl: 'views/docsigners.directive.html',
        restrict: 'E',
        replace: 'true',
        scope: {
            item: '=',
            ismobile: '='
        }
    };
}]);
