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
    .directive('dbConfirm', ['$log', function() {

        var controller = ['$log', '$scope', '$uibModal', function($log, $scope, $uibModal) {
            var conf;
            $scope.open = function() {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'directives/confirm/confirm.html',
                    controller: function($scope, $uibModalInstance, config) {
                        $scope.title = 'STR_CONFIRM';
                        $scope.text = 'STR_CNFM_TEXT';
                        $scope.yes = 'STR_CONFIRM';
                        $scope.no = 'STR_CANCEL';

                        if (config instanceof Object) {
                            conf = config; // Directive sets config.isOpen true/false when modal is open/closed
                            $scope.title = config.title === undefined ? $scope.title : config.title;
                            $scope.text = config.text === undefined ? $scope.text : config.text;
                            $scope.yes = config.yes === undefined ? $scope.yes : config.yes;
                            $scope.no = config.no === undefined ? $scope.no : config.no;
                        }
                        $scope.clicked = function(ok) {
                            if (ok) {
                                $uibModalInstance.close();
                            }
                            else {
                                $uibModalInstance.dismiss();
                            }
                        };
                    },
                    resolve: {
                        config: function() {
                            return $scope.confirmConfig;
                        }
                    }
                });

                modalInstance.result.then(function() {
                    $scope.ngClick();
                }, function() {
                    $scope.onReject();
                });

                modalInstance.opened.then(function() {
                    if (angular.isObject(conf)) {
                        console.log(conf);
                        conf.isOpen = true;
                    }
                });

                modalInstance.closed.then(function() {
                    if (angular.isObject(conf)) {
                        conf.isOpen = false;
                    }
                });

            };

            $scope.$on('$destroy', function() {
                //$log.debug("dbConfirm: DESTROY");
            });
        }];

        return {
            scope: {
                confirmEnabled: '=',
                confirmConfig: '=',
                ngClick: '&',
                onReject: '&'
            },
            restrict: 'A',
            controller: controller,
            replace: 'true',
            link: function(scope, element/*, attrs*/) {
                var CLK = "click";
                element.unbind(CLK).bind(CLK, function($event) {
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
