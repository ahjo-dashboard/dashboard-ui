/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc directive
 * @name dashboard.proposals:proposalsDirective
 * @description
 * # proposalsDirective
 */
angular.module('dashboard')
    .directive('dbProposals', [function () {

        var controller = ['$log', '$scope', 'AhjoProposalsSrv', function ($log, $scope, AhjoProposalsSrv) {
            $log.log("dbProposals: CONTROLLER");
            var self = this;
            self.proposals = [];
            var guid = $scope.guid;

            function getProposals(guid) {

                if (typeof guid === 'string') {
                    AhjoProposalsSrv.get(guid).then(function (response) {
                        $log.debug("meetingCtrl: get then: ");
                        if (response instanceof Object && response.objects instanceof Array) {
                            self.proposals = response.objects;
                        }
                        else {
                            self.proposals = [];
                        }
                    }, function (error) {
                        $log.error("meetingCtrl: get error: " + JSON.stringify(error));
                    }, function (notify) {
                        $log.debug("meetingCtrl: get notify: " + JSON.stringify(notify));
                    }).finally(function () {
                        $log.debug("meetingCtrl: get finally: ");
                    });
                }
            }

            getProposals(guid);

            $scope.$watch(function () {
                return {
                    guid: $scope.guid
                };
            }, function (data) {
                if (data instanceof Object) {
                    getProposals(data.guid);
                }
            }, true);

            $scope.$on('$destroy', function () {
                $log.debug("dbProposals: DESTROY");
            });

        }];

        return {
            scope: {
                guid: '='
            },
            templateUrl: 'directives/proposals/proposals.Directive.html',
            restrict: 'AE',
            controller: controller,
            controllerAs: 'ctrl',
            replace: 'true'
        };
    }]);
