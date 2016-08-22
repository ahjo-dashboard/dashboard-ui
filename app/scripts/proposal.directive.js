/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc directive
 * @name dashboard.proposal:proposalDirective
 * @description
 * # proposalDirective
 */
angular.module('dashboard')
    .constant('PROP', {
        'MODE': {
            COLLAPSED: 'COLLAPSED',
            OPEN: 'OPEN',
            EDIT: 'EDIT'
        }
    })
    .directive('dbProposal', [function () {

        var controller = ['$log', '$scope', 'PROPS', 'PROP', '$rootScope', 'AhjoProposalsSrv', 'StorageSrv', 'CONST', '$timeout', 'Utils', function ($log, $scope, PROPS, PROP, $rootScope, AhjoProposalsSrv, StorageSrv, CONST, $timeout, Utils) {
            var self = this;
            self.isTooltips = $rootScope.isTooltips;
            self.uiProposal = null;

            self.mode = null;
            self.modes = PROP.MODE;
            self.status = PROPS.PUBLISHED;
            self.editorText = null;
            self.updating = false;
            self.publishConfig = { title: 'STR_CONFIRM', text: 'STR_CNFM_SEND_PROP', yes: 'STR_YES' };
            self.deleteConfig = { title: 'STR_CONFIRM', text: 'STR_CNFM_DEL_PROP', yes: 'STR_YES' };
            self.deleteConfigPub = { title: 'STR_CONFIRM', text: 'STR_CNFM_DEL_PROP', yes: 'STR_YES', optionText: 'STR_CNFM_DEL_PROP_OPT' };
            var previousIsPublished = null;
            var createDisabled = false;

            self.editor = {
                'menu': []
            };

            function setMode(mode) {
                self.mode = mode;
                if (self.mode === PROP.MODE.OPEN) {
                    self.editorText = self.uiProposal.text;
                }
                else if (self.mode === PROP.MODE.EDIT) {
                    self.editorText = self.uiProposal.text;
                    previousIsPublished = $scope.proposal.isPublished;
                    $scope.proposal.isPublished = null;
                }
            }

            function setProposal(proposal) {
                if (angular.isObject(proposal)) {
                    self.uiProposal = proposal;
                    setMode(PROP.MODE.COLLAPSED);

                    if (proposal.isOwnProposal) {
                        if (proposal.isPublished === null) {
                            $timeout(function () {
                                setMode(PROP.MODE.EDIT);
                            }, 0);
                        }
                    }

                    // missing person name will be replaced by last name and first name
                    if (!self.uiProposal.personName) {
                        var lastName = self.uiProposal.lastName ? self.uiProposal.lastName : '';
                        var space = lastName ? ' ' : '';
                        var firstName = self.uiProposal.firstName ? self.uiProposal.firstName : '';
                        self.uiProposal.personName = lastName + space + firstName;
                    }
                }
            }

            function postProposal(proposal) {
                $log.debug("dbProposal: postProposal: " + JSON.stringify(proposal));
                if (angular.isObject(proposal)) {
                    self.updating = true;

                    if (proposal.isPublished === null) {
                        proposal.isPublished = PROPS.PUBLISHED.NO;
                    }
                    else if (proposal.isPublished === PROPS.PUBLISHED.NO) {
                        proposal.isPublished = PROPS.PUBLISHED.YES;
                    }

                    AhjoProposalsSrv.post(proposal).$promise.then(function (response) {
                        $log.debug("dbProposal: post then: " + JSON.stringify(response));
                        if (angular.isObject(response) && angular.isObject(response.Data)) {
                            if (proposal.isPublished === PROPS.PUBLISHED.NO) {
                                angular.merge($scope.proposal, response.Data);
                                $rootScope.successInfo('STR_SAVE_SUCCESS');
                            }
                            else if (proposal.isPublished === PROPS.PUBLISHED.YES) {
                                $scope.proposal.isPublishedIcon = PROPS.PUBLISHED.YES;
                                angular.merge(proposal, response.Data);
                                // proposal guid copy needs to be copied
                                // otherwise published version deletion is not working
                                $scope.proposal.proposalGuidCopy = proposal.proposalGuid;
                                $scope.onAdd({ data: { 'proposal': proposal } });
                                $rootScope.successInfo('STR_PUBLISH_SUCCESS');
                            }
                            else {
                                $log.error('dbProposal: postProposal unsupported status');
                            }
                        }
                        else {
                            $log.error('dbProposal: postProposal invalid response');
                        }
                    }, function (error) {
                        $log.error("dbProposal: post error: " + JSON.stringify(error));
                        proposal.saveAndPublish = false;
                        $rootScope.failedInfo('STR_SAVE_FAILED');
                    }).finally(function () {
                        $log.debug("dbProposal: post finally: ");
                        if (proposal.saveAndPublish) {
                            proposal.saveAndPublish = false;
                            self.saveOrPublishProposal();
                        }
                        self.updating = false;
                        $rootScope.$emit(PROPS.UPDATED, { sender: $scope.proposal });
                        setMode(PROP.MODE.COLLAPSED);
                    });
                }
                else {
                    $log.error('dbProposal: postProposal invalid parameter');
                }
            }

            function deleteProposal(proposal) {
                $log.debug("dbProposal: deleteProposal: " + JSON.stringify(proposal));
                if (angular.isObject(proposal)) {
                    if (proposal.isPublished === PROPS.PUBLISHED.NO || proposal.isPublished === PROPS.PUBLISHED.YES) {
                        self.updating = true;
                        var copy = angular.copy(proposal);
                        copy.text = null;
                        AhjoProposalsSrv.delete(copy).$promise.then(function (response) {
                            $log.debug("dbProposal: delete then: " + JSON.stringify(response));
                            if (angular.isObject(response) && angular.isObject(response.Data)) {
                                $scope.onRemove({ data: { 'proposal': response.Data } });
                                $rootScope.successInfo('STR_DELETE_SUCCESS');
                            }
                            else {
                                $log.error('dbProposal: deleteProposal invalid response');
                            }
                        }, function (error) {
                            $log.error("dbProposal: delete error: " + JSON.stringify(error));
                            $rootScope.failedInfo('STR_DELETE_FAILED');
                        }).finally(function () {
                            $log.debug("dbProposal: delete finally: ");
                            self.updating = false;
                        });
                    }
                    else {
                        $scope.onRemove({ data: { 'proposal': proposal } });
                    }
                }
                else {
                    $log.error('dbProposal: deleteProposal invalid parameter');
                }
            }

            function updatePolledEvents() {
                $log.debug("dbProposal: updatePolledEvents");
                var events = angular.copy(StorageSrv.getKey(CONST.KEY.PROPOSAL_EVENT_ARRAY));
                if (angular.isArray(events)) {
                    var found = false;
                    for (var index = events.length + CONST.NOTFOUND; index > CONST.NOTFOUND; index--) {
                        var event = events[index];
                        if (angular.isObject(event.proposal) && angular.equals(event.proposal.proposalGuid, $scope.proposal.proposalGuid)) {
                            events.splice(index, 1);
                            found = true;
                        }
                    }
                    if (found) {
                        StorageSrv.setKey(CONST.KEY.PROPOSAL_EVENT_ARRAY, events);
                    }
                }
            }

            self.saveOrPublishProposal = function () {
                var copy = angular.copy($scope.proposal);
                postProposal(copy);
            };

            self.saveAndPublishProposal = function () {
                $scope.proposal.text = self.editorText ? self.editorText : '';
                var copy = angular.copy($scope.proposal);
                copy.saveAndPublish = true;
                postProposal(copy);
                setMode(PROP.MODE.OPEN);
            };

            self.typeText = function (value) {
                var obj = Utils.objWithVal(PROPS.TYPE, 'value', value);
                return (obj && obj.text) ? obj.text : value;
            };

            self.itemClicked = function () {
                if (self.mode === PROP.MODE.COLLAPSED) {
                    setMode(PROP.MODE.OPEN);
                }
                else if (self.mode === PROP.MODE.OPEN) {
                    setMode(PROP.MODE.COLLAPSED);
                }
            };

            self.toggleCollapse = function () {
                if (self.mode === PROP.MODE.COLLAPSED) {
                    setMode(PROP.MODE.OPEN);
                    if (self.uiProposal.isModified) {
                        updatePolledEvents();
                        $scope.proposal.isModified = false;
                    }
                }
                else {
                    setMode(PROP.MODE.COLLAPSED);
                }
            };

            self.edit = function () {
                setMode(PROP.MODE.EDIT);
                $rootScope.$emit(PROPS.UPDATED, { sender: $scope.proposal });
            };

            self.remove = function (data) {
                deleteProposal($scope.proposal);
                if (angular.isObject(data) && data.value === true) {
                    $rootScope.$emit(PROPS.REMOVE, { guid: $scope.proposal.proposalGuidCopy });
                }
            };

            self.accept = function () {
                $scope.proposal.text = self.editorText ? self.editorText : '';
                self.saveOrPublishProposal();
                setMode(PROP.MODE.OPEN);
            };

            self.cancel = function () {
                $scope.proposal.isPublished = previousIsPublished;
                if ($scope.proposal.isPublished === null) {
                    deleteProposal($scope.proposal);
                }
                setMode(PROP.MODE.OPEN);
                $rootScope.$emit(PROPS.UPDATED, { sender: $scope.proposal });
            };

            self.send = function () {
                if ($scope.proposal.isPublished === null) {
                    self.saveAndPublishProposal();
                }
                else {
                    self.saveOrPublishProposal();
                }
            };

            setProposal($scope.proposal);

            $scope.$watch(function () {
                return {
                    proposal: $scope.proposal
                };
            }, function (data) {
                // scope.proposal is acting level and self.uiProposal is showing level
                // this is implemented for performance reasons to avoid two way binding
                // when data is changed in acting level it will be updated to showing level via setProposal function
                if (!angular.equals(data.proposal, self.uiProposal)) {
                    setProposal(data.proposal);
                }
            }, true);

            $scope.$watch(function () {
                return {
                    disableCreate: $scope.disableCreate
                };
            }, function (data) {
                if (angular.isObject(data)) {
                    if (createDisabled !== data.disableCreate) {
                        createDisabled = data.disableCreate;
                    }
                }
            }, true);

            var watcher = $rootScope.$on(PROPS.TOGGLE, function (event, data) {
                if (($scope.proposal.isPublished === PROPS.PUBLISHED.YES)) {
                    if (data) {
                        setMode(PROP.MODE.OPEN);
                    }
                    else {
                        setMode(PROP.MODE.COLLAPSED);
                    }
                }
            });

            var removeWatcher = $rootScope.$on(PROPS.REMOVE, function (event, data) {
                if (angular.isObject(data)) {
                    if (angular.equals(data.guid, $scope.proposal.proposalGuid)) {
                        deleteProposal($scope.proposal);
                    }
                }
                else {
                    $log.error('dbProposal: removeWatcher missing data');
                }
            });

            $scope.$on('$destroy', watcher);
            $scope.$on('$destroy', removeWatcher);

            $scope.$on('$destroy', function () {
                $log.debug("dbProposal: DESTROY");
            });
        }];

        return {
            scope: {
                proposal: '=',
                guid: '=',
                disableCreate: '=',
                onRemove: '&',
                onAdd: '&'
            },
            templateUrl: 'views/proposal.directive.html',
            restrict: 'AE',
            controller: controller,
            controllerAs: 'c',
            replace: 'true'
        };
    }]);
