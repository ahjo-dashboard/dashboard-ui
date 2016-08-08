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
    .factory('PROPS', function (CONST) {
        return {
            'PUBLISHED': {
                NO: 0,
                YES: 1
            },
            'TYPE': [
                { value: 1, text: "Päätös", roles: [] },
                { value: 2, text: "Esityksen muutos", roles: [], cityCouncilRoles: [] },
                { value: 3, text: "Pöydällepanoehdotus", roles: [CONST.MTGROLE.PARTICIPANT_FULL], cityCouncilRoles: [CONST.MTGROLE.PARTICIPANT_FULL] },
                { value: 4, text: "Palautusehdotus", roles: [CONST.MTGROLE.PARTICIPANT_FULL], cityCouncilRoles: [CONST.MTGROLE.PARTICIPANT_FULL] },
                { value: 5, text: "Vastaehdotus", roles: [CONST.MTGROLE.PARTICIPANT_FULL], cityCouncilRoles: [CONST.MTGROLE.PARTICIPANT_FULL] },
                { value: 6, text: "Hylkäysehdotus", roles: [CONST.MTGROLE.PARTICIPANT_FULL], cityCouncilRoles: [CONST.MTGROLE.PARTICIPANT_FULL] },
                { value: 7, text: "Ponsi", roles: [], cityCouncilRoles: [CONST.MTGROLE.PARTICIPANT_FULL] },
                { value: 8, text: "Eriävä mielipide", roles: [CONST.MTGROLE.PARTICIPANT_FULL], cityCouncilRoles: [CONST.MTGROLE.PARTICIPANT_FULL] },
                { value: 9, text: "Esteellinen", roles: [], cityCouncilRoles: [] },
                { value: 10, text: "Esityksen poisto", roles: [], cityCouncilRoles: [] }
            ],
            'TOGGLE': 'PROPS.TOGGLE',
            'COUNT': 'PROPS.COUNT',
            'UPDATED': 'PROPS.UPDATED'
        };
    })
    .directive('dbProposalList', [function () {

        var controller = ['$log', '$scope', 'AhjoProposalsSrv', 'PROPS', '$rootScope', 'CONST', 'StorageSrv', function ($log, $scope, AhjoProposalsSrv, PROPS, $rootScope, CONST, StorageSrv) {
            $log.log("dbProposalList: CONTROLLER");
            var self = this;
            var role = CONST.MTGROLE.PARTICIPANT_FULL; // todo: pending support for other roles.
            var personGuid = null;
            var topicGuid = null;
            var isCityCouncil = null;
            self.proposals = null;
            self.tps = null;
            self.published = PROPS.PUBLISHED;
            self.isMobile = $rootScope.isMobile;
            self.isAllOpen = false;
            self.btnText = 'STR_OPEN_ALL';
            self.unsavedCount = 0;
            self.loading = false;
            self.publishedCount = 0;

            function setTypes() {
                $log.debug("dbProposalList: setTypes");
                self.tps = [];
                angular.forEach(PROPS.TYPE, function (type) {
                    if (angular.isObject(type)) {
                        var array = isCityCouncil ? type.cityCouncilRoles : type.roles;
                        if (angular.isArray(array) && array.indexOf(role) > CONST.NOTFOUND) {
                            this.push(type);
                        }
                    }
                }, self.tps);
            }

            function countProposals(proposals) {
                var drafts = 0;
                self.publishedCount = 0;

                angular.forEach(proposals, function (prop) {
                    if (angular.isObject(prop)) {
                        if (prop.isPublished === PROPS.PUBLISHED.YES) {
                            self.publishedCount++;
                        }
                        else if (prop.isPublished === PROPS.PUBLISHED.NO) {
                            drafts++;
                        }
                    }
                });

                $rootScope.$emit(PROPS.COUNT, { 'drafts': drafts, 'published': self.publishedCount });
            }

            function checkProposals(proposals) {
                var unsaved = 0;
                angular.forEach(proposals, function (item) {
                    if (angular.isObject(item) && item.isPublished === null) {
                        unsaved++;
                    }
                });

                if (!self.unsavedCount && unsaved) {
                    $rootScope.$emit(CONST.PROPOSALSHASUNSAVED, true);
                }
                else if (self.unsavedCount && !unsaved) {
                    $rootScope.$emit(CONST.PROPOSALSHASUNSAVED, false);
                }
                self.unsavedCount = unsaved;
            }

            function createDraft(type) {
                if (type) {
                    if (!personGuid || !topicGuid) {
                        $log.error('dbProposalList: createDraft personGuid or topicGuid missing');
                    }
                    return {
                        "personGuid": personGuid,
                        "topicGuid": topicGuid,
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

            function removeProposal(data) {
                $log.debug("dbProposalList: removeProposal: " + JSON.stringify(data));
                var value;
                if (angular.isString(data)) {
                    value = data;
                }
                else if (angular.isObject(data)) {
                    if (angular.isString(data.proposalGuid)) {
                        value = data.proposalGuid;
                    }
                    else {
                        value = data;
                    }
                }

                if (value) {
                    var search = angular.isArray(self.proposals);
                    for (var index = self.proposals.length + CONST.NOTFOUND; search && index > CONST.NOTFOUND; index--) {
                        var prop = self.proposals[index];
                        if (angular.equals(value, prop.proposalGuid) || angular.equals(value, prop)) {
                            self.proposals.splice(index, 1);
                            search = false;
                        }
                    }

                    if (angular.isString(value)) {
                        var events = angular.copy(StorageSrv.getKey(CONST.KEY.PROPOSAL_EVENT_ARRAY));
                        if (angular.isArray(events)) {
                            var found = false;
                            for (var i = events.length + CONST.NOTFOUND; !found && i > CONST.NOTFOUND; i--) {
                                var event = events[i];
                                if (angular.isObject(event.proposal) && angular.equals(event.proposal.proposalGuid, value)) {
                                    events.splice(i, 1);
                                    found = true;
                                }
                            }
                            if (found) {
                                StorageSrv.setKey(CONST.KEY.PROPOSAL_EVENT_ARRAY, events);
                            }
                        }
                    }

                    checkProposals(self.proposals);
                    countProposals(self.proposals);
                }
                else {
                    $log.error('dbProposalList: removeProposal parameter invalid');
                }
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
                    countProposals(self.proposals);
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
                            switch (event.typeName) {
                                case CONST.MTGEVENT.REMARKPUBLISHED:
                                case CONST.MTGEVENT.REMARKUPDATED:
                                    if (angular.isObject(event.proposal) && angular.equals(event.proposal.topicGuid, topicGuid)) {
                                        updateProposal(event.proposal);
                                    }
                                    break;
                                default:
                                    $log.error('dbProposalList: updateEvents unsupported type');
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
                if (angular.isString(guid)) {
                    self.loading = true;
                    self.proposals = [];
                    AhjoProposalsSrv.get({ 'guid': guid }).$promise.then(function (response) {
                        $log.debug("dbProposalList: get then");
                        if (angular.isObject(response) && angular.isArray(response.objects)) {
                            angular.forEach(response.objects, function (p) {
                                if (angular.isObject(p) && angular.isString(p.proposalGuid)) {
                                    this.push(angular.copy(p));
                                }
                            }, self.proposals);
                        }
                        else {
                            $log.error('dbProposalList: getProposals invalid response');
                        }
                    }, function (error) {
                        $log.error("dbProposalList: get error: " + JSON.stringify(error));
                    }).finally(function () {
                        $log.debug("dbProposalList: get finally: ");
                        var events = angular.copy(StorageSrv.getKey(CONST.KEY.PROPOSAL_EVENT_ARRAY));
                        updateEvents(events);
                        countProposals(self.proposals);
                        self.loading = false;
                    });
                }
                else {
                    $log.error('dbProposalList: getProposals parameter invalid');
                }
            }

            function addProposal(type) {
                $log.debug("dbProposalList: addProposal: " + JSON.stringify(type));
                if (angular.isObject(type)) {
                    if (!angular.isArray(self.proposals)) {
                        self.proposals = [];
                    }
                    var draft = createDraft(type.value);
                    self.proposals.splice(0, 0, draft);
                    countProposals(self.proposals);
                    checkProposals(self.proposals);
                }
                else {
                    $log.error('dbProposalList: addProposal parameter invalid');
                }
            }

            self.remove = function (data) {
                $log.debug("dbProposalList: remove: " + JSON.stringify(data));
                if (angular.isObject(data)) {
                    removeProposal(data.proposal);
                }
                else {
                    $log.error('dbProposalList: remove parameter invalid');
                }
            };

            self.add = function (data) {
                $log.debug("dbProposalList: add: " + JSON.stringify(data));
                if (angular.isObject(data) && angular.isObject(data.proposal)) {

                    var exists = false;
                    for (var index = 0; !exists && index < self.proposals.length; index++) {
                        var item = self.proposals[index];
                        if (angular.equals(item.proposalGuid, data.proposal.proposalGuid)) {
                            angular.merge(item, data.proposal);
                            exists = true;
                        }
                    }
                    if (!exists) {
                        self.proposals.splice(0, 0, data.proposal);
                    }


                }
                else {
                    $log.error('dbProposalList: add proposal missing');
                }
            };

            self.addProposalClicked = function (type) {
                addProposal(type);
            };

            self.toggleAll = function () {
                self.isAllOpen = !self.isAllOpen;
                self.btnText = self.isAllOpen ? 'STR_CLOSE_ALL' : 'STR_OPEN_ALL';
                $rootScope.$emit(PROPS.TOGGLE, self.isAllOpen);
            };

            $scope.$watch(function () {
                return {
                    topic: $scope.topic
                };
            }, function (data) {
                if (angular.isObject(data) && angular.isObject(data.topic) && !angular.equals(topicGuid, data.topic.topicGuid)) {
                    personGuid = data.topic.userPersonGuid;
                    topicGuid = data.topic.topicGuid;
                    isCityCouncil = data.topic.isCityCouncil;
                    getProposals(topicGuid);
                    setTypes();
                    self.isAllOpen = false;
                    self.btnText = 'STR_OPEN_ALL';
                }

            }, true);

            $scope.$watch(function () {
                return StorageSrv.getKey(CONST.KEY.PROPOSAL_EVENT_ARRAY);
            }, function (events, oldEvents) {
                if (!angular.equals(events, oldEvents)) {
                    updateEvents(events);
                }
            });

            var proposalWatcher = $rootScope.$on(PROPS.UPDATED, function (event, data) {
                if (angular.isObject(data) && angular.isObject(data.sender)) {
                    if (self.proposals.indexOf(data.sender) >= 0) {
                        checkProposals(self.proposals);
                    }
                }
            });

            var deleteWatcher = $rootScope.$on(CONST.PROPOSALDELETED, function (event, data) {
                if (angular.isObject(data) && angular.isArray(data.deleted)) {
                    angular.forEach(data.deleted, function (e) {
                        if (angular.isObject(e) && angular.equals(e.topicGuid, topicGuid)) {
                            removeProposal(e.deletedProposal);
                        }
                    }, this);
                }
            });

            $scope.$on('$destroy', proposalWatcher);
            $scope.$on('$destroy', deleteWatcher);

            $scope.$on('$destroy', function () {
                $log.debug("dbProposalList: DESTROY");
            });
        }];

        return {
            scope: {
                topic: '='
            },
            templateUrl: 'views/proposalList.directive.html',
            restrict: 'AE',
            controller: controller,
            controllerAs: 'c',
            replace: 'true'
        };
    }]);
