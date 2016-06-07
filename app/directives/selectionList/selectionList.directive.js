/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc directive
 * @name dashboard.selectionList:selectionListDirective
 * @description
 * # selectionListDirective
 */
angular.module('dashboard')
    .directive('dbSelectionList', [function () {

        var controller = ['$log', '$scope', 'AttachmentData', function ($log, $scope, AttachmentData) {
            $log.log("dbSelectionList: CONTROLLER");
            var self = this;
            self.data = null;

            self.selected = function (item) {
                $log.log("dbSelectionList: selected: " + JSON.stringify(item));
                $scope.onSelect({ data: item });
            };

            self.newTab = function (link) {
                if (angular.isString(link) && link.length) {
                    window.open(link, '_blank');
                }
                else {
                    $log.error("dbSelectionList: newTab: invalid link");
                }
            };

            self.isDisabled = function (att) {
                var res = false;
                if (!(att instanceof AttachmentData)) {
                    $log.error("dbSelectionList: isDisabled: unsupported arg type: " + JSON.stringify(att));
                } else {
                    res = !angular.isString(att.link) || !att.link.length;
                }
                return res;
            };

            $scope.$watch(function () {
                return {
                    selData: $scope.selData
                };
            }, function (data) {

                if (angular.isObject(data) && angular.isObject(data.selData)) {
                    self.data = data.selData;
                }
                else {
                    self.data = null;
                }
            }, true);

            $scope.$on('$destroy', function () {
                $log.debug("dbSelectionList: DESTROY");
            });
        }];

        return {
            scope: {
                selData: '=',
                onSelect: '&'
            },
            templateUrl: 'directives/selectionList/selectionList.Directive.html',
            restrict: 'AE',
            controller: controller,
            controllerAs: 'c',
            replace: 'true'
        };
    }]);
