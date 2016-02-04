/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc directive
 * @name dashboard.directive:adSelectionMenu
 * @description
 * # adSelectionMenu
 */
angular.module('dashboard')
.directive('adMenu', function () {
    return {
        scope: {
            items: '=items',
            state: '=state',
            item: '=item',
            selected: '&onSelected',
            subselected: '&onSubselected'
        },
        templateUrl: 'directives/menu/adMenu.Directive.html',
        restrict: 'AE',
        replace: 'true'
    };
});
