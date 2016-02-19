/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc directive
 * @name dashboard.directive:adCustomBtnsDirective
 * @description
 * # adCustomBtnsDirective
 */
angular.module('dashboard')
.directive('adCustomBtns', function () {
  var ctrl = ['$log', '$scope', function ($log, $scope) {
    $log.log("adCustomBtns.CONTROLLER");
    var self = this;
    self.btns = $scope.config;
  }];

  return {
      scope: {
       config: '='
      },
      controller: ctrl,
      controllerAs: 'ctrl',
      templateUrl: 'directives/custombtns/adcustombtns.directive.html',
      restrict: 'E',
      replace: 'true'
    };
  });
