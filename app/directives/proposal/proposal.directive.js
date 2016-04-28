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
        },
        'BTN': {
            OPEN: { icon: 'glyphicon-triangle-bottom', action: 'OPEN', type: 'db-btn-prim', tooltip: 'STR_OPEN', active: false },
            CLOSE: { icon: 'glyphicon-triangle-top', action: 'CLOSE', type: 'db-btn-prim', tooltip: 'STR_CLOSE', active: false },
            EDIT: { icon: 'glyphicon-pencil', action: 'EDIT', type: 'db-btn-prim', disabled: false, tooltip: 'STR_EDIT', active: false },
            OK: { icon: 'glyphicon-ok', action: 'OK', type: 'db-btn-prim', tooltip: 'STR_SAVE', active: false },
            CANCEL: { icon: 'glyphicon-remove', action: 'CANCEL', type: 'btn-warning', tooltip: 'STR_CANCEL', active: false },
            SEND: { icon: 'glyphicon-send', action: 'SEND', type: 'btn-success', tooltip: 'STR_PUBLISH', active: true, config: { title: 'STR_CNFM_SEND_PROP', text: null, yes: 'STR_PUBLISH' } },
            DISABLEDSEND: { icon: 'glyphicon-send', action: 'SEND', type: 'btn-success', disabled: true, tooltip: 'STR_PUBLISH', active: false },
            DELETE: { icon: 'glyphicon-trash', action: 'DELETE', type: 'btn-danger', tooltip: 'STR_DELETE', active: true, config: { title: 'STR_CNFM_DEL_PROP', text: null, yes: 'STR_DELETE' } }
        }
    })
    .filter('unsafe', function ($sce) {
        return function (val) {
            return $sce.trustAsHtml(val);
        };
    })
    .directive('dbProposal', [function () {

        var controller = ['$log', '$scope', 'PROPS', 'PROP', '$rootScope', 'AhjoProposalsSrv', 'StorageSrv', 'CONST', function ($log, $scope, PROPS, PROP, $rootScope, AhjoProposalsSrv, StorageSrv, CONST) {
            $log.debug("dbProposal: CONTROLLER");
            var self = this;
            self.isTooltips = $rootScope.isTooltips;
            self.uiProposal = null;

            self.mode = null;
            self.editedText = "";
            self.updating = false;
            var previousIsPublished = null;
            var createDisabled = false;

            self.eBtn = null;
            self.lBtn = null;
            self.mBtn = null;
            self.rBtn = null;

            self.editor = {
                'menu': []
            };

            function refreshButtons() {
                $log.debug("dbProposal: refreshButtons: " + createDisabled);
                if (angular.equals(self.eBtn, PROP.BTN.EDIT)) {
                    self.eBtn.disabled = createDisabled;
                }
                if (angular.equals(self.lBtn, PROP.BTN.EDIT)) {
                    self.lBtn.disabled = createDisabled;
                }
                if (angular.equals(self.mBtn, PROP.BTN.EDIT)) {
                    self.mBtn.disabled = createDisabled;
                }
                if (angular.equals(self.rBtn, PROP.BTN.EDIT)) {
                    self.rBtn.disabled = createDisabled;
                }
            }

            function setMode(mode) {
                if (mode === self.mode) {
                    return;
                }
                self.mode = mode;

                switch (self.mode) {
                    case PROP.MODE.COLLAPSED:
                        self.rBtn = PROP.BTN.OPEN;
                        self.mBtn = null;
                        self.lBtn = null;
                        self.eBtn = null;
                        break;

                    case PROP.MODE.OPEN:
                        self.rBtn = PROP.BTN.CLOSE;
                        self.mBtn = null;
                        self.lBtn = null;
                        self.eBtn = null;

                        if ($scope.proposal.isOwnProposal) {
                            if ($scope.proposal.isPublished === null || $scope.proposal.isPublished === PROPS.PUBLISHED.NO) {
                                self.mBtn = PROP.BTN.DELETE;
                                self.lBtn = PROP.BTN.SEND;
                                self.eBtn = PROP.BTN.EDIT;
                            }

                            else if ($scope.proposal.isPublished === PROPS.PUBLISHED.YES) {
                                self.mBtn = PROP.BTN.DELETE;
                            }
                            else {
                                $log.error('dbProposal: setMode unsupported status');
                            }
                            refreshButtons();
                        }
                        break;

                    case PROP.MODE.EDIT:
                        self.rBtn = PROP.BTN.CANCEL;
                        self.mBtn = PROP.BTN.OK;
                        self.lBtn = null;
                        self.eBtn = null;
                        break;

                    default:
                        break;
                }
            }

            function setProposal(proposal) {
                $log.debug("dbProposal: setProposal");
                if (angular.isObject(proposal)) {
                    self.uiProposal = proposal;

                    if (proposal.isOwnProposal) {
                        if (proposal.isPublished === null) {
                            setMode(PROP.MODE.EDIT);
                            previousIsPublished = proposal.isPublished;
                        }
                        else if (proposal.isPublished === PROPS.PUBLISHED.NO) {
                            setMode(PROP.MODE.COLLAPSED);
                        }
                        else {
                            setMode(PROP.MODE.COLLAPSED);
                        }
                    }
                    else {
                        setMode(PROP.MODE.COLLAPSED);
                    }
                    self.editedText = proposal.text;
                }
            }

            function postProposal(proposal) {
                $log.debug("dbProposal: postProposal: " + JSON.stringify(proposal));
                if (angular.isObject(proposal)) {
                    self.updating = true;

                    var copy = angular.copy(proposal);
                    if (copy.isPublished === null) {
                        copy.isPublished = PROPS.PUBLISHED.NO;
                    }
                    else if (copy.isPublished === PROPS.PUBLISHED.NO) {
                        copy.isPublished = PROPS.PUBLISHED.YES;
                    }

                    AhjoProposalsSrv.post(copy).$promise.then(function (response) {
                        $log.debug("dbProposal: post then: " + JSON.stringify(response));
                        if (angular.isObject(response) && angular.isObject(response.Data)) {
                            if (copy.isPublished === PROPS.PUBLISHED.NO) {
                                angular.merge($scope.proposal, response.Data);
                            }
                            else if (copy.isPublished === PROPS.PUBLISHED.YES) {
                                angular.merge(copy, response.Data);
                                $scope.onAdd({ data: { proposal: copy } });
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
                    }).finally(function () {
                        $log.debug("dbProposal: post finally: ");
                        self.updating = false;
                        $rootScope.$emit(PROPS.UPDATED, { sender: $scope.proposal });
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
                        AhjoProposalsSrv.delete(proposal).$promise.then(function (response) {
                            $log.debug("dbProposal: delete then: " + JSON.stringify(response));
                            if (angular.isObject(response) && angular.isObject(response.Data)) {
                                $scope.onRemove({ data: { guid: response.Data.proposalGuid } });
                            }
                        }, function (error) {
                            $log.error("dbProposal: delete error: " + JSON.stringify(error));
                        }).finally(function () {
                            $log.debug("dbProposal: delete finally: ");
                            self.updating = false;
                        });
                    }
                    else {
                        $scope.onRemove({ data: { guid: proposal.proposalGuid } });
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
                        if (angular.isObject(event.Proposal) && angular.equals(event.Proposal.proposalGuid, $scope.proposal.proposalGuid)) {
                            events.splice(index, 1);
                            found = true;
                        }
                    }
                    if (found) {
                        StorageSrv.setKey(CONST.KEY.PROPOSAL_EVENT_ARRAY, events);
                    }
                }
            }

            self.typeText = function (value) {
                var obj = $rootScope.objWithVal(PROPS.TYPE, 'value', value);
                return (obj && obj.text) ? obj.text : value;
            };

            self.isCollapsed = function () {
                return (self.mode === PROP.MODE.COLLAPSED);
            };

            self.isEditing = function () {
                return (self.mode === PROP.MODE.EDIT);
            };

            self.isDraft = function () {
                return ($scope.proposal.isPublished === null || $scope.proposal.isPublished === PROPS.PUBLISHED.NO);
            };

            self.act = function (action) {
                switch (action) {
                    case PROP.BTN.CLOSE.action:
                        setMode(PROP.MODE.COLLAPSED);
                        break;

                    case PROP.BTN.OPEN.action:
                        setMode(PROP.MODE.OPEN);
                        if (self.uiProposal.isModified) {
                            updatePolledEvents();
                            $scope.proposal.isModified = false;
                        }
                        break;

                    case PROP.BTN.CANCEL.action:
                        $scope.proposal.isPublished = previousIsPublished;
                        if ($scope.proposal.isPublished === null) {
                            deleteProposal($scope.proposal);
                        }
                        setMode(PROP.MODE.OPEN);
                        $rootScope.$emit(PROPS.UPDATED, { sender: $scope.proposal });
                        break;

                    case PROP.BTN.OK.action:
                        $scope.proposal.text = self.editedText ? self.editedText : '';
                        postProposal($scope.proposal);
                        setMode(PROP.MODE.OPEN);
                        break;

                    case PROP.BTN.DELETE.action:
                        deleteProposal($scope.proposal);
                        break;

                    case PROP.BTN.SEND.action:
                        postProposal($scope.proposal);
                        break;

                    case PROP.BTN.EDIT.action:
                        self.editedText = $scope.proposal.text;
                        previousIsPublished = $scope.proposal.isPublished;
                        $scope.proposal.isPublished = null;
                        setMode(PROP.MODE.EDIT);
                        $rootScope.$emit(PROPS.UPDATED, { sender: $scope.proposal });
                        break;

                    default:
                        $log.error("dbProposal: unsupported action");
                        break;
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
                        refreshButtons();
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

            $scope.$on('$destroy', watcher);

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
            templateUrl: 'directives/proposal/proposal.Directive.html',
            restrict: 'AE',
            controller: controller,
            controllerAs: 'c',
            replace: 'true'
        };
    }]);
