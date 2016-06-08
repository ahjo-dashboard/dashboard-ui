/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc directive
 * @name dbSelection
 * @description
 * # dbSelection
 */
angular.module('dashboard')
    .directive('dbSelection', ['$compile', '$log', '$timeout', function ($compile, $log, $timeout) {
        return {
            scope: {
                selItems: '='
            },
            restrict: 'AE',
            replace: 'true',
            link: function (scope, el /*, attrs*/) {
                // $log.debug("dbSelection.link");

                function setChildren(arr) {
                    if (!angular.isArray(arr)) {
                        $log.log("dbSelection.setChildren: bad arg");
                        return;
                    }
                    $log.debug("dbSelection.setChildren: options count=" + arr.length);

                    el.empty();

                    angular.forEach(arr, function (value) {
                        el.append(value);
                    }, scope);
                }

                if (scope.selItems && angular.isArray(scope.selItems)) {
                    setChildren(scope.selItems);
                }

                scope.$watch(
                    function () {
                        // Only length watched instead of entire array to avoid digest loops and bad perf.
                        return scope.selItems.length;
                    },
                    function (newVal, oldVal) {
                        $log.debug("dbSelection items watch triggered " + newVal + " " + oldVal);
                        if (!angular.equals(newVal, oldVal)) {

                            $timeout(function () {
                                setChildren(scope.selItems);
                            }, 0);
                        }
                    }, true
                );

            }
        };
    }]);
