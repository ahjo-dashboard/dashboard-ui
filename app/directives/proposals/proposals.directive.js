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
        'MODECHANGE': 'PROPS.MODECHANGE'
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
            self.unsavedCount = 0;

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

            function checkProposals() {
                var unsaved = 0;
                angular.forEach(self.proposals, function(item) {
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

            function getProposals(guid) {
                $log.debug("dbProposals: getProposals: " + guid);
                if (typeof guid === 'string') {
                    AhjoProposalsSrv.get({ 'guid': guid }).$promise.then(function(response) {
                        $log.debug("dbProposals: get then");
                        if (angular.isObject(response) && angular.isArray(response.objects)) {
                            self.proposals = angular.copy(response.objects);
                        }
                        else {
                            $log.error('dbProposals: getProposals invalid response');
                            self.proposals = null;
                        }
                    }, function(error) {
                        $log.error("dbProposals: get error: " + JSON.stringify(error));
                    }, function(notify) {
                        $log.debug("dbProposals: get notify: " + JSON.stringify(notify));
                    }).finally(function() {
                        $log.debug("dbProposals: get finally: ");
                        countProposals();
                    });
                }
                else {
                    $log.error('dbProposals: getProposals parameter invalid');
                }
            }

            function addProposal(type) {
                $log.debug("dbProposals: addProposal: " + type);
                if (angular.isObject(type)) {
                    if (!angular.isArray(self.proposals)) {
                        self.proposals = [];
                    }
                    var draft = createDraft(type.value);
                    self.proposals.splice(0, 0, draft);
                }
                else {
                    $log.error('dbProposals: addProposal parameter invalid');
                }
                countProposals();
            }

            function removeProposal(guid) {
                var search = angular.isArray(self.proposals);
                for (var index = self.proposals.length + CONST.NOTFOUND; search && index > CONST.NOTFOUND; index--) {
                    var localProposal = self.proposals[index];
                    if (angular.equals(guid, localProposal.proposalGuid)) {
                        self.proposals.splice(index, 1);
                        search = false;
                    }
                }
                checkProposals();
                countProposals();
            }

            self.delete = function(data) {
                if (angular.isObject(data)) {
                    removeProposal(data.guid);
                }
                else {
                    $log.error('dbProposals: delete parameter invalid');
                }
            };

            self.copy = function(data) {
                $log.debug("dbProposals: copy: " + JSON.stringify(data));
                if (angular.isObject(data)) {
                    var draft = createDraft(data.proposal.proposalType);
                    if (angular.isObject(draft)) {
                        draft.text = data.proposal.text;
                        self.proposals.splice(0, 0, draft);
                    }
                    else {
                        $log.error('dbProposals: draft invalid');
                    }
                }
                else {
                    $log.error('dbProposals: copy parameter invalid');
                }
            };

            self.addProposalClicked = function(type) {
                addProposal(type);
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

                            }
                            break;
                        case CONST.MTGEVENT.REMARKDELETED:
                            if (data.TopicGuid === $scope.guid) {

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

            var modeWatcher = $rootScope.$on(PROPS.MODECHANGE, function(event, data) {
                if (angular.isObject(data) && angular.isObject(data.sender)) {
                    if (self.proposals.indexOf(data.sender) >= 0) {
                        checkProposals();
                    }
                }
            });

            $scope.$on('$destroy', eventWatcher);
            $scope.$on('$destroy', modeWatcher);

            $scope.$on('$destroy', function() {
                $log.debug("dbProposals: DESTROY");
            });

        }];

        return {
            scope: {
                guid: '=',
                personGuid: '='
            },
            templateUrl: 'directives/proposals/proposals.Directive.html',
            restrict: 'AE',
            controller: controller,
            controllerAs: 'c',
            replace: 'true'
        };
    }]);
