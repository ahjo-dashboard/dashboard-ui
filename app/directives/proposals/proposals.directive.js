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
        'COUNT': 'PROPS.COUNT',
        'EDITING': 'PROPS.EDITING'
    })
    .directive('dbProposals', [function() {

        var controller = ['$log', '$scope', 'AhjoProposalsSrv', 'PROPS', '$rootScope', 'CONST', function($log, $scope, AhjoProposalsSrv, PROPS, $rootScope, CONST) {
            $log.log("dbProposals: CONTROLLER");
            var self = this;
            self.proposals = null;
            self.tps = PROPS.TYPE;
            self.published = PROPS.PUBLISHED;
            self.isMobile = $rootScope.isMobile;
            self.isAllOpen = false;
            var editCount = 0;

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
                        } else {
                            $log.error("dbProposals.countProposals: item ignored, bad properties");
                        }
                    } else {
                        $log.error("dbProposals.countProposals: item ignored, bad type");
                    }
                });

                $rootScope.$emit(PROPS.COUNT, { 'drafts': drafts, 'published': published });
            }

            function checkIsEditing() {
                var count = 0;
                angular.forEach(self.proposals, function(item) {
                    if (angular.isObject(item) && angular.isFunction(item.isEditing) && item.isEditing()) {
                        count++;
                    }
                });

                if (!editCount && count) {
                    $rootScope.$emit(CONST.PROPOSALISEDITING, true);
                }
                else if (editCount && !count) {
                    $rootScope.$emit(CONST.PROPOSALISEDITING, false);
                }
                editCount = count;
            }

            function createDraft(type) {
                return {
                    "personGuid": "926eee0b-8e94-4a14-beec-d9b60590547f",
                    "proposalGuid": "",
                    "firstName": "",
                    "lastName": "",
                    "personName": "",
                    "topicGuid": $scope.guid,
                    "text": "",
                    "proposalType": type,
                    "remarkDescription": "",
                    "isPublished": PROPS.PUBLISHED.NO,
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
                    "isOwnProposal": true,
                    "isNew": true
                };
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

                    delete proposal.isNew;
                    delete proposal.isEditing;

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

            function addProposal(item) {
                if (angular.isObject(item)) {
                    if ((self.proposals instanceof Array) === false) {
                        self.proposals = [];
                    }
                    if (item.isModified) {
                        self.proposals.splice(0, 0, item);
                    }
                    else {
                        self.proposals.splice(0, 0, createDraft(item.value));
                    }
                }
                else {
                    $log.error('dbProposals: addProposal parameter invalid');
                }
                countProposals();
            }

            function removeProposal(proposal) {
                $log.debug("dbProposals: removeProposal: " + JSON.stringify(proposal));
                for (var index = self.proposals.length + CONST.NOTFOUND; angular.isArray(self.proposals) && index > CONST.NOTFOUND; index--) {
                    var localProposal = self.proposals[index];
                    // proposal will be removed if proposal or proposalGuid equals
                    if (angular.equals(proposal, localProposal) || angular.equals(proposal, localProposal.proposalGuid)) {
                        self.proposals.splice(index, 1);
                    }
                }
                countProposals();
            }

            function deleteProposal(proposal) {
                $log.debug("dbProposals: deleteProposal: " + JSON.stringify(proposal));
                if (proposal instanceof Object) {
                    if (proposal.isPublished === PROPS.PUBLISHED.YES) {
                        AhjoProposalsSrv.delete(proposal).$promise.then(function(response) {
                            if (angular.isObject(response) && angular.isObject(response.Data) && angular.isObject(response.Data.Data)) {
                                removeProposal(response.Data.Data.ProposalGuid);
                            }
                        }, function(error) {
                            $log.error("dbProposals: delete error: " + JSON.stringify(error));
                        }, function(/*notify*/) {

                        }).finally(function() {

                        });
                    }
                    else {
                        removeProposal(proposal);
                    }
                }
                else {
                    $log.error('dbProposals: deleteProposal parameter invalid');
                }
            }

            self.post = function(proposal) {
                postProposal(proposal);
            };

            self.delete = function(proposal) {
                deleteProposal(proposal);
            };

            self.copy = function(proposal) {
                var draft = createDraft(proposal.proposalType);
                draft.text = proposal.text;
                self.proposals.splice(0, 0, draft);
            };

            self.addProposalClicked = function(item) {
                addProposal(item);
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

            var eventWatcher = $rootScope.$on(CONST.PROPOSALEVENT, function(event, data) {
                if (data instanceof Object) {
                    switch (data.TypeName) {
                        case CONST.MTGEVENT.REMARKPUBLISHED:
                            if (data.Proposal instanceof Object && data.Proposal.topicGuid === $scope.guid) {
                                addProposal(data.Proposal);
                            }
                            break;
                        case CONST.MTGEVENT.REMARKDELETED:
                            if (data.TopicGuid === $scope.guid) {
                                removeProposal(data.DeletedProposal);
                            }
                            break;
                        default:
                            $log.error("meetingStatusCtrl: unsupported TypeName: " + event.TypeName);
                            break;
                    }
                }
                else {
                    $log.error("meetingStatusCtrl: invalid parameter:");
                }
            });

            var editingWatcher = $rootScope.$on(PROPS.EDITING, function(event, sender) {
                if (angular.isObject(sender)) {
                    if (self.proposals.indexOf(sender) >= 0) {
                        checkIsEditing();
                    }
                }
            });

            $scope.$on('$destroy', eventWatcher);
            $scope.$on('$destroy', editingWatcher);

            $scope.$on('$destroy', function() {
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
            controllerAs: 'c',
            replace: 'true'
        };
    }]);
