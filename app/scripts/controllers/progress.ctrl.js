/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc function
 * @name dashboard.controller:progressCtrl
 * @description
 * # progressCtrl
 * Controller of the dashboard
 */
angular.module('dashboard')
    .controller('progressCtrl', function ($log, $sce, $scope, titleStrId) {
        // $log.debug('progressCtrl');

        var self = this;
        self.titleStrId = titleStrId;

        $scope.$on('$destroy', function () {
            // $log.debug("progressCtrl: $destroy");
        });

    });