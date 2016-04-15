/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
* @ngdoc service
* @name dashboard.utils
* @description
* # utils
* Service in the dashboard.
*/
angular.module('dashboard')
    .factory('Utils', function($log, $window) {
        var Utils = {};

        Utils.isResoXs = function(argUa) {
            var ua = ua ? argUa : $window.navigator.userAgent;
            var device = document.getElementById("device");
            var res = (device && window.getComputedStyle(device, null).getPropertyValue("min-width") === '320px');
            $log.debug("Utils.isResoXs: " + res);
            return res;
        };

        Utils.isUaIe = function(argUa) {
            var ua = ua ? argUa : $window.navigator.userAgent;
            var res = ua.match(/Trident/i) || ua.match(/MSIE/i);
            return null !== res;
        };

        Utils.isUaMobile = function(argUa) {
            var ua = ua ? argUa : $window.navigator.userAgent;
            var dev = {
                Android: function() {
                    return ua.match(/Android/i);
                },
                BlackBerry: function() {
                    return ua.match(/BlackBerry/i);
                },
                iOS: function() {
                    return ua.match(/iPhone|iPad|iPod/i);
                },
                Opera: function() {
                    return ua.match(/Opera Mini/i);
                },
                Windows: function() {
                    return ua.match(/IEMobile/i);
                },
                isMobile: function() {
                    return (dev.Android() || dev.BlackBerry() || dev.iOS() || dev.Opera() || dev.Windows()) !== null;
                }
            };
            var res = dev.isMobile();
            $log.debug("Utils.isUaMobile: " + res);
            return res;
        };

        Utils.isClientMobile = function() {
            var ua = $window.navigator.userAgent;
            //console.log("Utils.isClientMobile: UA=" + ua);
            var res = Utils.isUaMobile(ua) || Utils.isResoXs(ua);
            // $$log.debug("Utils.isClientMobile: " + res);
            return res;
        };
        return Utils;
    });
