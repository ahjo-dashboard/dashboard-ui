/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc directive
 * @name dashboard.proposals:contenteditableDirective
 * @description
 * # contenteditableDirective
 */
angular.module('dashboard')
    .directive('contenteditable', ['$log', function () {

        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {

                function read() {
                    ngModel.$setViewValue(element.html());
                }

                ngModel.$render = function () {
                    element.html(ngModel.$viewValue || "");
                };

                element.bind("blur keyup change", function () {
                    scope.$apply(read);
                });

            }
        };
    }]);
