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
    .directive('dbProposalList', [function () {

        var controller = ['$log', '$scope', 'AhjoProposalsSrv', 'PROPS', '$rootScope', 'CONST', 'StorageSrv', function ($log, $scope, AhjoProposalsSrv, PROPS, $rootScope, CONST, StorageSrv) {
            $log.log("dbProposalList: CONTROLLER", $scope.topic);
            var self = this;
            var personGuid = null;
            var topicGuid = null;
            var isCityCouncil = null;
            self.proposals = null;
            self.published = PROPS.PUBLISHED;
            self.isMobile = $rootScope.isMobile;
            self.isAllOpen = false;
            self.btnText = 'STR_OPEN_ALL';
            self.unsavedCount = 0;
            self.loading = false;
            self.publishedCount = 0;

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

                $rootScope.$emit(PROPS.COUNT, { 'drafts': drafts, 'published': self.publishedCount, 'topicGuid': topicGuid });
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

            function removeProposal(proposal) {
                $log.debug("dbProposalList: removeProposal:");

                // remove proposal
                if (angular.isObject(proposal)) {
                    var search = angular.isArray(self.proposals);
                    for (var i = self.proposals.length + CONST.NOTFOUND; search && i > CONST.NOTFOUND; i--) {
                        var prop = self.proposals[i];
                        if (angular.isObject(prop) && angular.equals(proposal.proposalGuid, prop.proposalGuid)) {
                            self.proposals.splice(i, 1);
                            search = false;
                        }
                    }

                    // update is published icon
                    if (proposal.isPublished === PROPS.PUBLISHED.YES && proposal.isOwnProposal) {
                        var anotherSearch = angular.isArray(self.proposals);
                        for (var j = 0; anotherSearch && j < self.proposals.length; j++) {
                            var p = self.proposals[j];
                            if (angular.isObject(p) && angular.equals(proposal.proposalGuidCopy, p.proposalGuid)) {
                                p.isPublishedIcon = PROPS.PUBLISHED.NO;
                                anotherSearch = false;
                            }
                        }
                    }

                    // remove pending event
                    if (!proposal.isOwnProposal) {
                        var events = angular.copy(StorageSrv.getKey(CONST.KEY.PROPOSAL_EVENT_ARRAY));
                        if (angular.isArray(events)) {
                            var found = false;
                            for (var index = events.length + CONST.NOTFOUND; index > CONST.NOTFOUND; index--) {
                                var event = events[index];
                                if (angular.isObject(event.proposal) && angular.equals(event.proposal.proposalGuid, proposal.proposalGuid)) {
                                    events.splice(index, 1);
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
                                        event.proposal.isModified = true;
                                        updateProposal(event.proposal);
                                    }
                                    break;
                                case CONST.MTGEVENT.REMARKUNPUBLISHED:
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
                    self.error = false;
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
                        self.error = true;
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

            function addProposal() {
                $log.debug("dbProposalList: addProposal: ", arguments);
                if (!angular.isArray(self.proposals)) {
                    self.proposals = [];
                }
                var draft = createDraft();
                self.proposals.splice(0, 0, draft);
                countProposals(self.proposals);
                checkProposals(self.proposals);
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
                        countProposals(self.proposals);
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
                    $log.debug("dbProposalList.watch topic");
                    personGuid = data.topic.userPersonGuid;
                    topicGuid = data.topic.topicGuid;
                    isCityCouncil = data.topic.isCityCouncil;
                    getProposals(topicGuid);
                    self.isAllOpen = false;
                    self.btnText = 'STR_OPEN_ALL';
                    // reset unsaved count when topic is changed
                    self.unsavedCount = 0;
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
                if (angular.isObject(data)) {
                    removeProposal(data.proposal);
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
