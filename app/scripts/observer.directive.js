/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc directive
 * @name dashboard.observerDirective
 * @description
 * # observerDirective
 */
angular.module('dashboard')
    .directive('dbObs', ['$log', '$timeout', function ($log, $timeout) {
        return {
            scope: false,
            restrict: 'A',
            replace: 'true',
            link: function (scope, element/*, attrs*/) {
                var e = element;
                var size = { 'height': null, 'width': null };
                var ZERO = '0';

                element.ready(function () {
                    if (angular.isFunction(scope.sizeWhenReady)) {
                        $timeout(function () {
                            size.height = e.css('height');
                            size.width = e.css('width');
                            scope.sizeWhenReady({ 'element': e, 'size': size });
                        }, 0);
                    }
                });

                scope.$watch(
                    function () {
                        return element.attr('class');
                    },
                    function () {
                        if (angular.isFunction(scope.sizeChangedByClass)) {
                            $timeout(function () {
                                var height = e.css('height');
                                var width = e.css('width');
                                if (ZERO === e.css('flex-grow')) {
                                    height = 0;
                                    width = 0;
                                }
                                var newSize = { 'height': height, 'width': width };
                                if (!angular.equals(size, newSize)) {
                                    size = newSize;
                                    scope.sizeChangedByClass({ 'element': e, 'size': size });
                                }
                            }, 100);
                        }
                    },
                    true
                );

                scope.$on('$destroy', function () {
                    $log.debug("dbObs: DESTROY");
                });
            }
        };
    }]);
