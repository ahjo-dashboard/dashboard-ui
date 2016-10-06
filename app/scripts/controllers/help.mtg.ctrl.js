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
    .controller('helpDialogCtrl', ['$rootScope', '$log', '$location', '$anchorScroll', function ($rootScope, $log, $location, $anchorScroll) {
        $log.debug("helpDialogCtrl: anchorScroll");

        var self = this;
        self.mtgStatusClass = function mtgStatusClass(arg) {
            return $rootScope.mtgStatusClass(arg);
        };

        $location.hash('id-help-hdr');
        $anchorScroll();
    }]);
