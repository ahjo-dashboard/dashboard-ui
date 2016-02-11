/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
* @ngdoc function
* @name dashboard.controller:meetingListCtrl
* @description
* # meetingListCtrl
* Controller of the dashboard
*/
angular.module('dashboard')
.controller('meetingListCtrl',['$log', '$rootScope', 'DEVICE', function ($log, $rootScope, DEVICE) {
    $log.debug("meetingListCtrl: CONTROLLER");
    var self = this;

    self.future = true;
    self.mobile = $rootScope.device === DEVICE.MOBILE;

}]);
