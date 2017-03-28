/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc function
 * @name dashboard.controller:helpDialogCtrl
 * @description
 * # infoDialogCtrl
 * Controller of the dashboard
 */
angular.module('dashboard')
    .controller('helpDialogCtrl', ['$rootScope', '$log', '$location', '$anchorScroll', '$scope', '$timeout', function ($rootScope, $log, $location, $anchorScroll, $scope, $timeout) {
        $log.debug("helpDialogCtrl: anchorScroll");

        var self = this;
        self.mtgStatusClass = function mtgStatusClass(arg) {
            return $rootScope.mtgStatusClass(arg);
        };

        $location.hash('id-help-hdr'); // Fragment needed to have anchorScroll scroll to top. Must be removed later when controller dismissed.
        $anchorScroll();

        $scope.$on('$destroy', function () {
            $log.debug("helpDialogCtrl: DESTROY");
            // Location hash change here in destroy event handler needs and apply wrapper to update URL immediately if ngDialog was dismissed via backdrop click,
            // BUT not if event comes due to closing via close button because apply wrapper already applied by angular (!)
            // Workaround is to use $timeout zero which works for both.
            $timeout(function () {
                // Remove added URL hash when it serves no purpose anymore,
                // therwise scrolling does not works on second time because location is already at the added id.
                $location.hash('');
            }, 0);
        });
    }]);
