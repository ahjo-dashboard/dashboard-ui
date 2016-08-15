/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc directive
 * @name dashboard.proposalList:remarkDirective
 * @description
 * # remarkDirective
 */
angular.module('dashboard')
    .directive('dbRemark', [function () {

        var controller = ['$log', '$scope', 'AhjoRemarkSrv', '$rootScope', 'CONST', function ($log, $scope, AhjoRemarkSrv, $rootScope, CONST) {
            $log.log("dbRemark: CONTROLLER");
            var self = this;
            self.editorText = null;
            var previousText = null;
            self.remark = null;
            self.topic = null;
            self.loading = false;
            self.isUnsaved = false;
            self.isMobile = $rootScope.isMobile;

            function setUnsaved(unsaved) {
                if (unsaved !== self.isUnsaved) {
                    self.isUnsaved = unsaved;
                    $rootScope.$emit(CONST.REMARKISUNSAVED, self.isUnsaved);
                }
            }

            function getRemark(guid) {
                $log.debug("dbRemark: getRemark: " + guid);
                self.remark = null;
                self.editorText = null;
                if (angular.isString(guid)) {
                    self.loading = true;
                    AhjoRemarkSrv.get({ 'guid': guid }).$promise.then(function (response) {
                        $log.debug("dbRemark: get then");
                        if (angular.isObject(response) && angular.isObject(response.objects)) {
                            self.remark = response.objects;
                            self.editorText = self.remark.text;
                        }
                        else {
                            $log.error('dbRemark: getRemark invalid response');
                        }
                    }, function (error) {
                        $log.error("dbRemark: get error: " + JSON.stringify(error));
                    }).finally(function () {
                        $log.debug("dbRemark: get finally: ");
                        if (!self.remark) {
                            $rootScope.failedInfo('STR_REMARK_FAILED');
                        }
                        self.loading = false;
                    });
                }
                else {
                    $log.error('dbRemark: getRemark parameter invalid');
                }
            }

            function postRemark(remark) {
                $log.debug("dbRemark: postRemark: " + JSON.stringify(remark));
                var copy = angular.copy(remark);
                if (angular.isObject(copy)) {
                    self.loading = true;
                    AhjoRemarkSrv.post(remark).$promise.then(function (response) {
                        $log.debug("dbRemark: post then: " + JSON.stringify(response));
                        $rootScope.successInfo('STR_SAVE_SUCCESS');
                        setUnsaved(false);
                        if (angular.isObject(response) && angular.isObject(response.objects)) {
                            self.remark = response.objects;
                            self.editorText = self.remark.text;
                        }
                        else {
                            $log.error('dbRemark: postRemark response invalid');
                        }
                    }, function (error) {
                        $log.error("dbRemark: post error: " + JSON.stringify(error));
                        $rootScope.failedInfo('STR_SAVE_FAILED');
                    }).finally(function () {
                        $log.debug("dbRemark: post finally: ");
                        self.loading = false;
                    });
                }
                else {
                    $log.error('dbRemark: postRemark parameter invalid');
                }
            }

            self.clicked = function (ok) {
                $log.debug("dbRemark: clicked " + ok + ': ' + self.editorText);
                if (angular.isObject(self.remark)) {
                    if (ok) {
                        self.remark.text = self.editorText;
                        postRemark(self.remark);
                    }
                    else {
                        self.editorText = self.remark.text;
                        setUnsaved(false);
                    }
                }
                else {
                    $log.error('dbRemark: clicked remark missing');
                }
            };

            self.changed = function () {
                $log.debug("dbRemark: changed");
                if (angular.isObject(self.remark)) {
                    previousText = angular.isString(previousText) ? previousText : '';
                    self.editorText = angular.isString(self.editorText) ? self.editorText : '';
                    if (previousText.length !== self.editorText.length) {
                        previousText = self.editorText;
                        setUnsaved(true);
                    }
                    else {
                        setUnsaved(false);
                    }
                }
                else {
                    $log.error('dbRemark: changed remark missing');
                }
            };

            $scope.$watch(function () {
                return {
                    topic: $scope.topic
                };
            }, function (data) {
                if (angular.isObject(data) && angular.isObject(data.topic) && !angular.equals(data.topic, self.topic)) {
                    self.topic = data.topic;
                    previousText = null;
                    setUnsaved(false);
                    getRemark(data.topic.topicGuid);
                }
            }, true);

            $scope.$on('$destroy', function () {
                $log.debug("dbRemark: DESTROY");
            });
        }];

        return {
            scope: {
                topic: '='
            },
            templateUrl: 'views/remark.directive.html',
            restrict: 'AE',
            controller: controller,
            controllerAs: 'c',
            replace: 'true'
        };
    }]);
