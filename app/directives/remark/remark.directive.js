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

        var controller = ['$log', '$scope', 'AhjoOwnRemarkSrv', function ($log, $scope, AhjoOwnRemarkSrv) {
            $log.log("dbRemark: CONTROLLER");
            var self = this;
            self.editorText = null;
            self.remark = null;
            self.topic = null;
            self.loading = false;

            function getRemark(guid) {
                $log.debug("dbRemark: getRemark: " + guid);
                if (angular.isString(guid)) {
                    self.loading = true;
                    AhjoOwnRemarkSrv.get({ 'guid': guid }).$promise.then(function (response) {
                        $log.debug("dbRemark: get then");
                        if (angular.isObject(response) && angular.isObject(response.objects)) {
                            self.remark = response.objects;
                        }
                        else {
                            $log.error('dbRemark: getRemark invalid response');
                        }
                    }, function (error) {
                        $log.error("dbRemark: get error: " + JSON.stringify(error));
                    }).finally(function () {
                        $log.debug("dbRemark: get finally: ");
                        self.editorText = null;
                        if (angular.isObject(self.remark)) {
                            self.editorText = self.remark.text;
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
                    AhjoOwnRemarkSrv.post(remark).$promise.then(function (/*response*/) {
                        $log.debug("dbRemark: post then");
                        // todo: show success
                    }, function (error) {
                        $log.error("dbRemark: post error: " + JSON.stringify(error));
                        // todo: show failure
                    }).finally(function () {
                        $log.debug("dbRemark: post finally: ");
                        self.editorText = null;
                        if (angular.isObject(self.remark)) {
                            self.editorText = self.remark.text;
                        }
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
                    }
                }
                else {
                    $log.error('dbRemark: clicked remark missing');
                }
            };

            $scope.$watch(function () {
                return {
                    topic: $scope.topic
                };
            }, function (data) {
                if (angular.isObject(data) && angular.isObject(data.topic) && !angular.equals(data.topic, self.topic)) {
                    self.topic = data.topic;
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
            templateUrl: 'directives/remark/remark.Directive.html',
            restrict: 'AE',
            controller: controller,
            controllerAs: 'c',
            replace: 'true'
        };
    }]);
