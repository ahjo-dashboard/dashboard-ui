/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc directive
 * @name dashboard.directive:adAttachmentDirective
 * @description
 * # adAttachmentDirective
 */
angular.module('dashboard')
    .directive('adAttachment', [function () {
        return {
            scope: {
                header: "=header",
                list: "=list",
                selected: '&onSelected'
            },
            templateUrl: 'views/adattachment.directive.html',
            restrict: 'AE',
            replace: 'true'
        };
    }]);
