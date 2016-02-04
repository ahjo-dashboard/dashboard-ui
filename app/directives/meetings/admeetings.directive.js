/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc directive
 * @name dashboard.directive:adMeetingsDirective
 * @description
 * # adMeetingsDirective
 */
angular.module('dashboard')
  .directive('adMeetings', function () {
    return {
      scope: {
        header: '=header',
        meetings: '=meetings',
        selected: '&onSelected'
      },
      templateUrl: 'directives/meetings/adMeetings.Directive.html',
      restrict: 'AE',
      replace: 'true'
    };
  });
