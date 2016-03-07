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
angular.module('dashboard')
    .directive('docSigners', [function () {

        var controller = ['$log', '$scope', '$rootScope', 'CONST', function ($log, $scope, $rootScope, CONST) {
            $log.log("docSigners.CONTROLLER");

            var self = this;
            self.isMobile = $rootScope.isMobile;
            self.listModel = $scope.listmodel;

            // $log.debug("docSigners: " + JSON.stringify(self.listModel));

            /* PRIVATE FUNCTIONS */


            /* PUBLIC FUNCTIONS */

            /* Resolve display text for item status */
            self.statusStrId = function (value) {
                var s = $rootScope.objWithVal(CONST.ESIGNSTATUS, 'value', value);
                return s ? s.stringId : '';
            };

            // Resolves l18n string id for document type display text
            self.docTypeStrId = function (value) {
                var s = $rootScope.objWithVal(CONST.ESIGNTYPE, 'value', value);
                return s ? s.stringId : '';
            };

            /* Resolve css class for signing status */
            self.statusStyle = function (status) {
                var s = $rootScope.objWithVal(CONST.ESIGNSTATUS, 'value', status);
                return s ? s.badgeClass : 'label-default';
            };

        }];

        return {
            controller: controller,
            controllerAs: 'ctrl',
            templateUrl: 'directives/docsigners/docsigners.directive.html',
            restrict: 'E',
            replace: 'true',
            scope: {
                listmodel: '='
            }
        };
    }]);
