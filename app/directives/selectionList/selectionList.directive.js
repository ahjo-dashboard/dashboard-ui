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

        var controller = ['$log', '$scope', 'AttachmentData', 'CONST', '$rootScope', 'Utils', function ($log, $scope, AttachmentData, CONST, $rootScope, Utils) {
            $log.log("dbSelectionList: CONTROLLER");
            var self = this;
            self.data = null;
            self.isMobile = $rootScope.isMobile;

            self.selected = function (item) {
                $log.log("dbSelectionList: selected: " + JSON.stringify(item));
                $scope.onSelect({ data: item });
            };

            self.newTab = function (link) {
                Utils.openNewWin(link);
            };

            self.isLinkDisabled = function (att) {
                var res = false;
                if (att instanceof AttachmentData) {
                    res = !angular.isString(att.link) || !att.link.length;
                } else {
                    $log.error("dbSelectionList: isLinkDisabled: unsupported arg type: " + JSON.stringify(att));
                }
                return res;
            };

            self.isOpenWindowDisabled = function (att) {
                var res = false;
                if (att instanceof AttachmentData) {
                    // disabled for secret docs because currently no easy way to popup them
                    res = (att.publicity === CONST.PUBLICITY.SECRET) || !angular.isString(att.link) || !att.link.length;
                } else {
                    $log.error("dbSelectionList: isOpenWindowDisabled: unsupported arg type: " + JSON.stringify(att));
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
