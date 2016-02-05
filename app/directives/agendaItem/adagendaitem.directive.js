/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc directive
 * @name dashboard.directive:adAgendaItemDirective
 * @description
 * # adAgendaItemDirective
 */
angular.module('dashboard')
  .directive('adAgendaItem', function () {
    return {
      scope: {
       header: '=header',
       agenda: '=agenda',
       selected: '&onSelected'
      },
      templateUrl: 'directives/agendaItem/adAgendaItem.Directive.html',
      restrict: 'AE',
      replace: 'true'
    };
  });
