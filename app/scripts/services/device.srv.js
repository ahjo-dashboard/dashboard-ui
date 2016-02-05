/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc service
 * @name dashboard.Device
 * @description
 * # Device
 * Service in the dashboard.
 */
angular.module('dashboard')
.service('Device', function (ENV, $rootScope, $log, $window) {
    var self = this;
    var width = $window.innerWidth;
    var ua_isIe = false; //TODO: this is hard-coded to allow object testing on IE. Remove to force IE to use pdf.js

    self.current = function() {
        if (width >= 1200) {
            return ENV.Device_Large;
        }
        else if (width >= 992) {
            return ENV.Device_Medium;
        }
        else if (width >= 768) {
            return ENV.Device_Small;
        }
        return ENV.Device_Extra_Small;
    };

    window.addEventListener('resize', function() {
        $rootScope.$apply(function() {
            width = $window.innerWidth;
        });
    });

    // Resolves using User Agent if browser is Microsoft Internet Explorer
    self.isUaMsIe = function() {
        if(ua_isIe === undefined) {
            var ua = $window.navigator.userAgent;
            ua_isIe = ua.indexOf('Trident') > 0 || navigator.userAgent.indexOf('MSIE') > 0;
            $log.debug("Device.isUaMsIe: " +ua_isIe +", userAgent=" +ua);
       }
       return ua_isIe;
    };
});
