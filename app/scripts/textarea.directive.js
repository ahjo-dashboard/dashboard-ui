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
                scope.initialHeight = scope.initialHeight || element[0].style.height;
                var resize = function resize() {
                    element.css('height', element[0].scrollHeight + "px");
                };

                scope.$watch(
                    function () {
                        return element[0].scrollHeight;
                    },
                    function () {
                        $timeout(resize, 0);
                    },
                    true
                );
            }
        };
    }]);
