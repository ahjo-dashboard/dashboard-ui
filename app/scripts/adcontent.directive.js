/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
* @ngdoc directive
* @name dashboard.directive:adContentDirective
* @description
* # adContentDirective
*/
angular.module('dashboard')
    .directive('adContent', [function () {
        return {
            scope: {
                header: '=header',
                content: '=content'
            },
            templateUrl: 'views/adcontent.directive.html',
            restrict: 'AE',
            replace: 'true'
        };
    }]);
