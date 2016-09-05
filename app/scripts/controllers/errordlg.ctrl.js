/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc function
 * @name dashboard.controller:errordlgCtrl
 * @description
 * # errordlgCtrl
 * Controller of the dashboard
 */
angular.module('dashboard')
    .controller('errordlgCtrl', function (titleStrId, bodyStrId, isError) {
        var self = this;
        self.dbDlgTitleStrId = titleStrId;
        self.dbDlgbodyStrId = bodyStrId;
        self.isError = isError;
    });
