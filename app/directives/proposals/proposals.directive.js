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
    .constant('PROPS', {
        'PUBLISHED': {
            NO: 0,
            YES: 1
        },
        'TYPE': [
            { value: 1, text: "Päätös" },
            { value: 2, text: "Esityksen muutos" },
            { value: 3, text: "Pöydällepanoehdotus" },
            { value: 4, text: "Palautusehdotus" },
            { value: 5, text: "Vastaehdotus" },
            { value: 6, text: "Hylkäysehdotus" },
            { value: 7, text: "Ponsi" },
            { value: 8, text: "Eriävä mielipide" },
            { value: 9, text: "Esteellinen" },
            { value: 10, text: "Esityksen poisto" }
        ],
        'TOGGLE': 'PROPS.TOGGLE',
        'COUNT': 'PROPS.COUNT'
    })
    .directive('dbProposals', [function() {

        var controller = ['$log', '$scope', 'AhjoProposalsSrv', 'PROPS', '$rootScope', function($log, $scope, AhjoProposalsSrv, PROPS, $rootScope) {
            $log.log("dbProposals: CONTROLLER");
            var self = this;
            self.proposals = null;
            self.tps = PROPS.TYPE;
            self.published = PROPS.PUBLISHED;
            self.isMobile = $rootScope.isMobile;
            self.isAllOpen = false;

            function countProposals() {
                var drafts = 0;
                var published = 0;

                angular.forEach(self.proposals, function(item) {
                    if (item instanceof Object) {
                        if (item.isPublished === PROPS.PUBLISHED.YES) {
                            published++;
                        }
                        else if (item.isPublished === PROPS.PUBLISHED.NO) {
                            drafts++;
                        }
                    }
                });

                $rootScope.$emit(PROPS.COUNT, { 'drafts': drafts, 'published': published });
            }

            function getProposals(guid) {
                $log.debug("dbProposals: getProposals: " + guid);
                if (typeof guid === 'string') {
                    var getResult = null;

                    AhjoProposalsSrv.get({ 'guid': guid }).$promise.then(function(response) {
                        $log.debug("dbProposals: get then: ");
                        getResult = (response instanceof Object) ? response.objects : null;
                    }, function(error) {
                        $log.error("dbProposals: get error: " + JSON.stringify(error));
                    }, function(notify) {
                        $log.debug("dbProposals: get notify: " + JSON.stringify(notify));
                    }).finally(function() {
                        $log.debug("dbProposals: get finally: ");
                        if (getResult instanceof Object) {
                            self.proposals = angular.copy(getResult);
                            countProposals();
                        }
                    });
                }
                else {
                    $log.error('dbProposals: getProposals parameter invalid');
                }
            }

            function postProposal(proposal) {
                $log.debug("dbProposals: postProposal: " + JSON.stringify(proposal));
                if (proposal instanceof Object) {
                    var postResult = null;

                    if (proposal.isNew) {
                        delete proposal.isNew;
                    }

                    AhjoProposalsSrv.post(proposal).$promise.then(function(response) {
                        $log.debug("dbProposals: post then: " + JSON.stringify(response));
                        postResult = (response instanceof Object) ? response.Data : null;
                    }, function(error) {
                        $log.error("dbProposals: post error: " + JSON.stringify(error));
                    }, function(notify) {
                        $log.debug("dbProposals: post notify: " + JSON.stringify(notify));
                    }).finally(function() {
                        $log.debug("dbProposals: post finally: ");
                        if (postResult instanceof Object) {
                            getProposals($scope.guid);
                        }
                    });
                }
                else {
                    $log.error('dbProposals: postProposal parameter invalid');
                }
            }

            function deleteProposal(proposal) {
                $log.debug("dbProposals: deleteProposal: " + JSON.stringify(proposal));
                if (proposal instanceof Object) {
                    if (proposal.isNew && self.proposals instanceof Array) {
                        for (var index = 0; index < self.proposals.length; index++) {
                            if (angular.equals(proposal, self.proposals[index])) {
                                self.proposals.splice(index, 1);
                            }
                        }
                    }
                    else {
                        var deleteResult = null;
                        AhjoProposalsSrv.delete(proposal).$promise.then(function(response) {
                            $log.debug("dbProposals: delete then: " + JSON.stringify(response));
                            deleteResult = (response instanceof Object) ? response : null;
                        }, function(error) {
                            $log.error("dbProposals: delete error: " + JSON.stringify(error));
                        }, function(notify) {
                            $log.debug("dbProposals: delete notify: " + JSON.stringify(notify));
                        }).finally(function() {
                            $log.debug("dbProposals: delete finally: ");
                            if (deleteResult instanceof Object) {
                                getProposals($scope.guid);
                            }
                        });
                    }
                }
                else {
                    $log.error('dbProposals: deleteProposal parameter invalid');
                }
            }

            function createDraft(item) {
                return {
                    "personGuid": "926eee0b-8e94-4a14-beec-d9b60590547f",
                    "proposalGuid": "",
                    "firstName": "",
                    "lastName": "",
                    "personName": "",
                    "topicGuid": $scope.guid,
                    "text": "",
                    "proposalType": item.value,
                    "remarkDescription": "",
                    "isPublished": 0,
                    "isTranslatedIcon": "",
                    "isPublishedIcon": "",
                    "translated": "",
                    "language": "fi",
                    "insertDateTime": "",
                    "orderNumber": "",
                    "translationText": "",
                    "translationTaskGuid": "",
                    "translationTime": "",
                    "isMinuteEntryBase": "",
                    "isModified": "",
                    "isCopy": "",
                    "isNew": true
                };
            }

            self.post = function(proposal) {
                postProposal(proposal);
            };

            self.delete = function(proposal) {
                deleteProposal(proposal);
            };

            self.addProposal = function(item) {
                if ((self.proposals instanceof Array) === false) {
                    self.proposals = [];
                }
                self.proposals.splice(0, 0, createDraft(item));
            };

            self.toggleAll = function() {
                self.isAllOpen = !self.isAllOpen;
                $rootScope.$emit(PROPS.TOGGLE, self.isAllOpen);
            };

            $scope.$watch(function() {
                return {
                    guid: $scope.guid
                };
            }, function(data) {
                getProposals(data.guid);
            }, true);

            $scope.$on('$destroy', function() {
                $log.debug("dbProposals: DESTROY");
            });

            getProposals($scope.guid);

        }];

        return {
            scope: {
                guid: '='
            },
            templateUrl: 'directives/proposals/proposals.Directive.html',
            restrict: 'AE',
            controller: controller,
            controllerAs: 'c',
            replace: 'true'
        };
    }]);
