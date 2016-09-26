/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc directive
 * @name dashboard.textareaDirective
 * @description
 * # textareaDirective
 */
angular.module('dashboard')
    .directive('dbTextarea', ['$timeout', function ($timeout) {
        return {
            scope: false,
            restrict: 'A',
            replace: 'true',
            link: function (scope, element/*, attrs*/) {
                var e = element[0];
                var timer;
                scope.$watch(
                    function () {
                        return e.scrollHeight;
                    },
                    function (scrollHeight) {
                        if (scrollHeight) {
                            // timer is used to avoid $digest() loop error
                            $timeout.cancel(timer);
                            timer = $timeout(function () {
                                e.style.height = scrollHeight + 'px';
                            }, 100);
                        }
                    },
                    true
                );
            }
        };
    }]);
