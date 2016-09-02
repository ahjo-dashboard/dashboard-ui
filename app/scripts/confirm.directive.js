/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc directive
 * @name dashboard.proposals:confirmDirective
 * @description
 * # confirmDirective
 */
angular.module('dashboard')
    .directive('dbConfirm', ['$log', function () {

        var controller = ['$log', '$scope', '$uibModal', '$rootScope', 'CONST', 'DialogUtils', function ($log, $scope, $uibModal, $rootScope, CONST, DialogUtils) {
            var conf;
            $scope.open = function () {
                var modalInstance = $uibModal.open({
                    animation: false,
                    templateUrl: 'views/confirm.directive.html',
                    controller: function ($scope, $uibModalInstance, config) {
                        $scope.title = 'STR_CONFIRM';
                        $scope.text = 'STR_CNFM_TEXT';
                        $scope.yes = 'STR_CONFIRM';
                        $scope.no = 'STR_CANCEL';
                        $scope.option = { text: null, value: false };

                        if (angular.isObject(config)) {
                            conf = config; // Directive sets config.isOpen true/false when modal is open/closed
                            $scope.title = config.title === undefined ? $scope.title : config.title;
                            $scope.text = config.text === undefined ? $scope.text : config.text;
                            $scope.yes = config.yes === undefined ? $scope.yes : config.yes;
                            $scope.no = config.no === undefined ? $scope.no : config.no;
                            $scope.option.text = config.optionText === undefined ? null : config.optionText;
                            $scope.option.value = config.optionValue === true ? true : false;
                        }
                        $scope.clicked = function (ok) {
                            if (ok) {
                                $uibModalInstance.close($scope.option);
                            }
                            else {
                                $uibModalInstance.dismiss();
                            }
                        };
                    },
                    resolve: {
                        config: function () {
                            return $scope.confirmConfig;
                        }
                    }
                });

                modalInstance.result.then(function (val) {
                    $scope.ngClick({ data: val });
                }, function () {
                    $scope.confirmReject();
                });

                modalInstance.opened.then(function () {
                    if (angular.isObject(conf)) {
                        conf.isOpen = true;
                    }
                    DialogUtils.setModalActiveFlag(true);
                });

                modalInstance.closed.then(function () {
                    if (angular.isObject(conf)) {
                        conf.isOpen = false;
                    }
                    DialogUtils.setModalActiveFlag(false);
                });

            };

            $scope.$on('$destroy', function () {
                //$log.debug("dbConfirm: DESTROY");
            });
        }];

        return {
            scope: {
                confirmEnabled: '=',
                confirmConfig: '=',
                ngClick: '&',
                confirmReject: '&'
            },
            restrict: 'A',
            controller: controller,
            replace: 'true',
            link: function (scope, element/*, attrs*/) {
                var CLK = "click";
                element.unbind(CLK).bind(CLK, function ($event) {
                    $event.preventDefault();

                    if (scope.confirmEnabled === undefined || scope.confirmEnabled) {
                        scope.open();
                    }
                    else {
                        scope.$apply(scope.ngClick);
                    }
                });
            }
        };
    }]);
