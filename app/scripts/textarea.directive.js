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
                var timer;
                scope.$watch(
                    function () {
                        return ngModel.$modelValue;
                    },
                    function () {
                        $timeout.cancel(timer);
                        timer = $timeout(function () {
                            timer = null;
                            // Sometimes rarely scrollHeight is zero,
                            // workaround by trying first after a small delay
                            // and then for the second time if still zero
                            var height = element[0].scrollHeight;

                            if (height) {
                                // $log.debug("dbTextarea.link: 1st try on height ok");
                                element.css('height', height + 'px');
                            } else {
                                // $log.debug("dbTextarea.link: 1st try on height failed");
                                timer = $timeout(function () {
                                    timer = null;
                                    var heightB = angular.isObject(element) ? element[0].scrollHeight : undefined;
                                    if (heightB) {
                                        // $log.debug("dbTextarea.link: 2nd try on height=" + heightB);
                                        element.css('height', heightB + 'px');
                                    } else {
                                        // $log.debug("dbTextarea.link: 2nd try on height failed");
                                    }
                                }, 300);

                            }

                        }, 0);

                    },
                    true
                );

                scope.$on('$destroy', function () {
                    $timeout.cancel(timer);
                });

            }
        };
    }]);
