/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc function
 * @name dashboard.controller:progressDialogCtrl
 * @description
 * # progressDialogCtrl
 * Controller of the dashboard
 */
angular.module('dashboard')
    .controller('progressDialogCtrl', function (titleStrId, bodyStrId) {
        var self = this;
        self.titleStrId = titleStrId;
        self.bodyStrId = bodyStrId;
    });
