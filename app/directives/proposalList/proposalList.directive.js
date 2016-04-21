/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc directive
 * @name dashboard.proposalList:proposalListDirective
 * @description
 * # proposalListDirective
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
        'MODECHANGE': 'PROPS.MODECHANGE'
    })
    .directive('dbProposalList', [function () {

        var controller = ['$log', '$scope', 'AhjoProposalsSrv', 'PROPS', '$rootScope', 'CONST', 'StorageSrv', function ($log, $scope, AhjoProposalsSrv, PROPS, $rootScope, CONST, StorageSrv) {
            $log.log("dbProposalList: CONTROLLER");
            var self = this;
            self.proposals = null;
            self.tps = PROPS.TYPE;
            self.published = PROPS.PUBLISHED;
            self.isMobile = $rootScope.isMobile;
            self.isAllOpen = false;
            self.unsavedCount = 0;

            function countProposals() {
                var drafts = 0;
                var published = 0;

                angular.forEach(self.proposals, function (prop) {
                    if (angular.isObject(prop)) {
                        if (prop.isPublished === PROPS.PUBLISHED.YES) {
                            published++;
                        }
                        else if (prop.isPublished === PROPS.PUBLISHED.NO) {
                            drafts++;
                        }
                    }
                });

                $rootScope.$emit(PROPS.COUNT, { 'drafts': drafts, 'published': published });
            }

            function checkProposals() {
                var unsaved = 0;
                angular.forEach(self.proposals, function (item) {
                    if (angular.isObject(item) && item.isPublished === null) {
                        unsaved++;
                    }
                });

                if (!self.unsavedCount && unsaved) {
                    $rootScope.$emit(CONST.PROPOSALISEDITING, true);
                }
                else if (self.unsavedCount && !unsaved) {
                    $rootScope.$emit(CONST.PROPOSALISEDITING, false);
                }
                self.unsavedCount = unsaved;
            }

            function createDraft(type) {
                if (type) {
                    return {
                        "personGuid": $scope.personGuid,
                        "topicGuid": $scope.guid,
                        "text": "",
                        "proposalType": type,
                        "isPublished": null,
                        "isOwnProposal": true
                    };
                }
                else {
                    return null;
                }
            }

            function removeProposal(guid) {
                $log.debug("dbProposalList: removeProposal");
                var search = angular.isArray(self.proposals);
                for (var index = self.proposals.length + CONST.NOTFOUND; search && index > CONST.NOTFOUND; index--) {
                    var prop = self.proposals[index];
                    if (angular.equals(guid, prop.proposalGuid)) {
                        self.proposals.splice(index, 1);
                        search = false;
                    }
                }
                checkProposals();
                countProposals();
            }

            function updateProposal(proposal) {
                $log.debug("dbProposalList: updateProposal");
                if (angular.isObject(proposal)) {
                    if (!angular.isArray(self.proposals)) {
                        self.proposals = [];
                    }
                    var notFound = true;
                    for (var index = 0; notFound && index < self.proposals.length; index++) {
                        var prop = self.proposals[index];
                        if (angular.isObject(prop) && angular.equals(proposal.proposalGuid, prop.proposalGuid)) {
                            angular.merge(prop, proposal);
                            notFound = false;
                        }
                    }
                    if (notFound) {
                        self.proposals.splice(0, 0, proposal);
                    }
                    countProposals();
                }
                else {
                    $log.error('dbProposalList: updateProposal parameter invalid');
                }
            }

            function updateEvents(events) {
                $log.debug("dbProposalList: updateEvents");
                if (angular.isArray(events)) {
                    angular.forEach(events, function (event) {
                        if (angular.isObject(event)) {
                            switch (event.TypeName) {
                                case CONST.MTGEVENT.REMARKPUBLISHED:
                                case CONST.MTGEVENT.REMARKUPDATED:
                                    if (angular.isObject(event.Proposal) && angular.equals(event.Proposal.topicGuid, $scope.guid)) {
                                        updateProposal(event.Proposal);
                                    }
                                    break;

                                case CONST.MTGEVENT.REMARKDELETED:
                                    if (angular.isObject(event) && angular.equals(event.TopicGuid, $scope.guid)) {
                                        removeProposal(event.DeletedProposal);
                                    }
                                    break;

                                default:
                                    break;
                            }
                        }
                    });
                }
                else {
                    $log.error('dbProposalList: updateEvents parameter invalid');
                }
            }

            function getProposals(guid) {
                $log.debug("dbProposalList: getProposals: " + guid);
                if (typeof guid === 'string') {
                    AhjoProposalsSrv.get({ 'guid': guid }).$promise.then(function (response) {
                        $log.debug("dbProposalList: get then");
                        if (angular.isObject(response) && angular.isArray(response.objects)) {
                            self.proposals = angular.copy(response.objects);
                        }
                        else {
                            $log.error('dbProposalList: getProposals invalid response');
                            self.proposals = null;
                        }
                    }, function (error) {
                        $log.error("dbProposalList: get error: " + JSON.stringify(error));
                    }, function (notify) {
                        $log.debug("dbProposalList: get notify: " + JSON.stringify(notify));
                    }).finally(function () {
                        $log.debug("dbProposalList: get finally: ");
                        var events = angular.copy(StorageSrv.getKey(CONST.KEY.PROPOSAL_EVENT_ARRAY));
                        updateEvents(events);
                        countProposals();
                    });
                }
                else {
                    $log.error('dbProposalList: getProposals parameter invalid');
                }
            }

            function addProposal(type) {
                $log.debug("dbProposalList: addProposal: " + type);
                if (angular.isObject(type)) {
                    if (!angular.isArray(self.proposals)) {
                        self.proposals = [];
                    }
                    var draft = createDraft(type.value);
                    self.proposals.splice(0, 0, draft);
                    countProposals();
                }
                else {
                    $log.error('dbProposalList: addProposal parameter invalid');
                }
            }

            self.remove = function (data) {
                $log.debug("dbProposalList: remove: " + JSON.stringify(data));
                if (angular.isObject(data)) {
                    removeProposal(data.guid);
                }
                else {
                    $log.error('dbProposalList: delete parameter invalid');
                }
            };

            self.copy = function (data) {
                $log.debug("dbProposalList: copy: " + JSON.stringify(data));
                if (angular.isObject(data)) {
                    var draft = createDraft(data.proposal.proposalType);
                    if (angular.isObject(draft)) {
                        draft.text = data.proposal.text;
                        self.proposals.splice(0, 0, draft);
                    }
                    else {
                        $log.error('dbProposalList: draft invalid');
                    }
                }
                else {
                    $log.error('dbProposalList: copy parameter invalid');
                }
            };

            self.addProposalClicked = function (type) {
                addProposal(type);
            };

            self.toggleAll = function () {
                self.isAllOpen = !self.isAllOpen;
                $rootScope.$emit(PROPS.TOGGLE, self.isAllOpen);
            };

            $scope.$watch(function () {
                return {
                    guid: $scope.guid
                };
            }, function (data) {
                getProposals(data.guid);
            }, true);

            $scope.$watch(function () {
                return StorageSrv.getKey(CONST.KEY.PROPOSAL_EVENT_ARRAY);
            }, function (events, oldEvents) {
                if (!angular.equals(events, oldEvents)) {
                    updateEvents(events);
                }
            });

            var modeWatcher = $rootScope.$on(PROPS.MODECHANGE, function (event, data) {
                if (angular.isObject(data) && angular.isObject(data.sender)) {
                    if (self.proposals.indexOf(data.sender) >= 0) {
                        checkProposals();
                    }
                }
            });

            $scope.$on('$destroy', modeWatcher);

            $scope.$on('$destroy', function () {
                $log.debug("dbProposalList: DESTROY");
            });

        }];

        return {
            scope: {
                guid: '=',
                personGuid: '='
            },
            templateUrl: 'directives/proposalList/proposalList.Directive.html',
            restrict: 'AE',
            controller: controller,
            controllerAs: 'c',
            replace: 'true'
        };
    }]);
