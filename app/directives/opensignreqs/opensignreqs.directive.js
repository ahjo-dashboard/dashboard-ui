/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc directive
 * @name dashboard.directive:openSignreqs
 * @description
 * # openSignreqs
 */
angular.module('dashboard')
.directive('adOpenSignreqs', function ($log, ENV) {
  return {
    templateUrl: 'directives/opensignreqs/opensignreqs.directive.html',
    restrict: 'E',
    replace: 'true',
    scope: {
      header: '=',
      adSignitems: '=',
      onSelect: '&',
      adSelectId: '='
    },
    link: function (scope /*, element, attrs */) {

      scope.badgeClass = function(status) {
        var res = 'label-default';
        switch(status) {
          case ENV.SignApi_DocStatuses.unsigned.value:
            res = 'label-danger';
            break;
          case ENV.SignApi_DocStatuses.rejected.value:
            res = 'label-warning';
            break;
          case ENV.SignApi_DocStatuses.signed.value:
            res = 'label-success';
            break;
          case ENV.SignApi_DocStatuses.returned.value:
            res = 'label-info';
            break;
          case ENV.SignApi_DocStatuses.undecided.value:
            res = 'label-primary';
            break;
          default:
            res = 'label-default';
        }
        return res;
      };

      scope.signReqStatusTxt = function(value) {
        var res = null;
        for (var k in ENV.SignApi_DocStatuses) {
          //console.log("k: " +k +" v: " +ENV.SignApi_DocStatuses[k]); //TODO: remove, and check why array iterated many times
          if (ENV.SignApi_DocStatuses[k].value === value) {
            res = ENV.SignApi_DocStatuses[k].name;
            break;
          }
        }
        return res;
      };

      scope.DocTypePMaker = ENV.SignApi_DocTypePMaker; /* TODO: any better way to share the value? */
      scope.DocTypeOfficial = ENV.SignApi_DocTypeOfficial; /* TODO: any better way to share the value? */
      scope.$watch('adSignitems.$resolved', function(val) {
        if (val) {
          //$log.debug("adOpenSignreqs watch adSignitems resolved: " +val); TODO: remove me when you feel like it
          scope.openItems = scope.adSignitems;
        }
      });
    }
  };
});
