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
            link: function (scope, element/*, attrs, ngModel*/) {
                var timer = null;

                scope.$watch(
                    function () {
                        var res = angular.isObject(element) ? element[0].scrollHeight : null;
                        return res;
                    },
                    function () {
                        $timeout.cancel(timer);
                        timer = $timeout(function () {
                            var height = element[0].scrollHeight;
                            element.css('height', height + 'px');
                            // $log.debug("dbTextarea: watch new height=" + height + " old=" + aOld +" model: " +JSON.stringify(ngModel.$modelValue).substr(0,30));

                        }, 0); // Async updating avoids $digest max loop count limit

                    },
                    true
                );

                scope.$on('$destroy', function () {
                    $timeout.cancel(timer);
                });

            }
        };
    }]);
