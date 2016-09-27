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
            require: 'ngModel',
            replace: 'true',
            link: function (scope, element, attrs, ngModel) {
                var value;
                scope.$watch(
                    function () {
                        return ngModel.$modelValue;
                    },
                    function (modelValue) {
                        if (!angular.equals(value, modelValue)) {
                            value = modelValue;
                            $timeout(function () {
                                var height = element[0].scrollHeight + 'px';
                                element.css('height', height);
                            }, 0);
                        }
                    },
                    true
                );
            }
        };
    }]);
