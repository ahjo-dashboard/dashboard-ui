/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc directive
 * @name dashboard.imgOnload:imgOnload
 * @description
 * # imgOnload
 */
var app = angular.module('dashboard');
app.directive('imgOnload', ['$log', function ($log) {
    return {
        scope: {
            imgUrl: '=',
            imgOnloadCb: '&'
        },
        restrict: 'A',
        link: function (scope, element/*, attrs*/) {
            $log.debug('imgOnload.link');
            element.bind('load', function () {
                $log.debug('imgOnload: loaded');

                scope.$apply(function () {
                    scope.imgOnloadCb({ data: { status: false } });
                });
            });
            element.bind('error', function () {
                $log.error('imgOnload: error');
                scope.$apply(function () {
                    scope.imgOnloadCb({ data: { status: false } });
                });
            });

            scope.$watch(function () {
                return scope.imgUrl;
            }, function (newVal, oldVal) {
                if (!angular.equals(newVal, oldVal)) {
                    $log.debug('imgOnload: url changed: ' + newVal);
                    scope.imgOnloadCb({ data: { status: true } });
                }
            });

        }
    };
}]);
