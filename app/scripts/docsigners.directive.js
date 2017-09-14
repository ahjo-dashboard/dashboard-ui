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
        self.documentType = $scope.item.DocumentType;
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

        /* Sort signings for policymaker by changedtime, others by role */
            self.signingComparator = function signingComparator(a1, a2) {
                // Comparator apparently guaranteed to receive objects with 'value' property so skipping validation for simplicity.
                var res = -1;
                if ((self.documentType === CONST.ESIGNTYPE.OFFICIAL.value) || (self.documentType === CONST.ESIGNTYPE.POLICYMAKER_MAJOR.value)) {
                    // Sort by changedtime
                    $log.debug("dbDocSigners.signingComparator: VIPA ", a1.value.statusChangedTime);
                    if (angular.isString(a1.value.statusChangedTime) && angular.isString(a2.value.statusChangedTime)){
                        res = a1.value.statusChangedTime.localeCompare(a2.value.statusChangedTime);
                    } 
                    else {
                        $log.debug("dbDocSigners.signingComparator: bad args: ", arguments);
                        res = a1.index < a2.index ? -1 : 1; // Default to sorting by index
                    }
                }
                else
                {
                    // Sort by role
                    $log.debug("dbDocSigners.signingComparator: EI VIPA ");
                    if (angular.isNumber(a1.value.role) && angular.isNumber(a2.value.role)){
                        res = a1.value.role < a2.value.role ? -1 : 1;
                    } 
                    else {
                        $log.debug("dbDocSigners.signingComparator: bad args 2: ", arguments);
                        res = a1.index < a2.index ? -1 : 1; // Default to sorting by index
                    }
                }
                return res;
            };

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
            return docType && ((docType === CONST.ESIGNTYPE.OFFICIAL.value) || (docType === CONST.ESIGNTYPE.POLICYMAKER_MAJOR.value)) ? 'STR_SROLE_PREP' : CONST.ESIGNROLE.SEC.stringId;
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
