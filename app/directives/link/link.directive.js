/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc directive
 * @name dashboard.pdf:linkDirective
 * @description
 * # linkDirective
 */
angular.module('dashboard')
    .directive('dbLink', ['$log', function($log) {
        // .directive('dbLink', ['$log', '$http', function($log, $http) {
        return {
            scope: {
                config: '=',
                uri: '='
            },
            templateUrl: 'directives/link/link.Directive.html',
            restrict: 'AE',
            replace: 'true',
            link: function(scope/*, element, attrs */) {
                $log.debug("dbLink: link");

                scope.$on('$destroy', function() {
                    $log.debug("dbLink: DESTROY");
                });

            }
        };
    }]);
