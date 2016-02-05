/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc service
 * @name dashboard.MessageService
 * @description
 * # MessageService
 * Service in the dashboard.
 */
angular.module('dashboard')
.factory('MessageService', function ($rootScope) {
    var self = this;

    self.send = function(event, data) {
        $rootScope.$emit(event, data);
    };

    return self;
});
