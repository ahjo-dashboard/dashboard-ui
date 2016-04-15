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
            OPEN: 'OPEN'
        },
        'STATUS': {
            PUBLIC: 'PUBLIC',
            PUBLISHED: 'PUBLISHED',
            DRAFT: 'DRAFT'
        },
        'BTN': {
            OPEN: { icon: 'glyphicon-plus', action: 'OPEN', type: 'db-btn-prim', tooltip: 'STR_OPEN', active: false },
            CLOSE: { icon: 'glyphicon-minus', action: 'CLOSE', type: 'db-btn-prim', tooltip: 'STR_CLOSE', active: false },
            EDIT: { icon: 'glyphicon-pencil', action: 'EDIT', type: 'db-btn-prim', tooltip: 'STR_EDIT', active: false },
            OK: { icon: 'glyphicon-ok', action: 'OK', type: 'db-btn-prim', tooltip: 'STR_SAVE', active: false },
            CANCEL: { icon: 'glyphicon-remove', action: 'CANCEL', type: 'btn-warning', tooltip: 'STR_CANCEL', active: false },
            SEND: { icon: 'glyphicon-send', action: 'SEND', type: 'btn-success', tooltip: 'STR_PUBLISH', active: true, config: { title: 'STR_CNFM_SEND_PROP', text: null, yes: 'STR_PUBLISH' } },
            DISABLEDSEND: { icon: 'glyphicon-send', action: 'SEND', type: 'btn-success', disabled: true, tooltip: 'STR_PUBLISH', active: false },
            DELETE: { icon: 'glyphicon-trash', action: 'DELETE', type: 'btn-danger', tooltip: 'STR_DELETE', active: true, config: { title: 'STR_CNFM_DEL_PROP', text: null, yes: 'STR_DELETE' } },
            COPY: { icon: 'glyphicon-copyright-mark', action: 'COPY', type: 'db-btn-prim', tooltip: 'STR_COPY', active: true, config: { title: 'STR_CNFM_COPY_PROP', text: null } }
        }
    })
    .filter('unsafe', function($sce) {
        return function(val) {
            return $sce.trustAsHtml(val);
        };
    })
    .directive('dbProposal', [function() {

        var controller = ['$log', '$scope', 'PROPS', 'PROP', '$rootScope', 'AhjoProposalsSrv', function($log, $scope, PROPS, PROP, $rootScope, AhjoProposalsSrv) {
            $log.debug("dbProposal: CONTROLLER");
            var self = this;
            self.isTooltips = $rootScope.isTooltips;

            self.mode = PROP.MODE.COLLAPSED;
            self.status = PROP.STATUS.PUBLIC;
            self.editedText = "";
            self.isModified = false;
            var previousIsPublished = null;

            self.lBtn = null;
            self.mBtn = null;
            self.rBtn = null;

            self.editor = {
                'menu': []
            };

            function setMode(mode) {
                self.mode = mode;

                switch (self.mode) {
                    case PROP.MODE.COLLAPSED:
                        if (self.status === PROP.STATUS.DRAFT) {
                            self.lBtn = PROP.BTN.EDIT;
                            self.mBtn = (($scope.proposal instanceof Object) && $scope.proposal.text) ? PROP.BTN.SEND : PROP.BTN.DISABLEDSEND;
                            self.rBtn = PROP.BTN.DELETE;
                        }
                        else {
                            self.rBtn = PROP.BTN.OPEN;
                        }
                        break;

                    case PROP.MODE.OPEN:
                        if (self.status === PROP.STATUS.DRAFT) {
                            self.lBtn = PROP.BTN.OK;
                            self.mBtn = PROP.BTN.CANCEL;
                            self.rBtn = null;
                        }
                        else {
                            self.rBtn = PROP.BTN.CLOSE;
                        }
                        break;

                    default:
                        break;
                }
                $rootScope.$emit(PROPS.MODECHANGE, $scope.proposal);
            }

            function setStatus(status) {
                self.status = status;

                switch (self.status) {
                    case PROP.STATUS.PUBLIC:
                        self.rBtn = PROP.BTN.OPEN;
                        break;

                    case PROP.STATUS.PUBLISHED:
                        self.lBtn = PROP.BTN.COPY;
                        self.mBtn = PROP.BTN.DELETE;
                        self.rBtn = PROP.BTN.OPEN;
                        break;

                    case PROP.STATUS.DRAFT:
                        self.lBtn = PROP.BTN.EDIT;
                        self.mBtn = (($scope.proposal instanceof Object) && $scope.proposal.text) ? PROP.BTN.SEND : PROP.BTN.DISABLEDSEND;
                        self.rBtn = PROP.BTN.DELETE;
                        break;

                    default:
                        break;
                }
            }

            function setProposal(proposal) {
                if (angular.isObject(proposal)) {
                    if (proposal.isPublished === null) {
                        setStatus(PROP.STATUS.DRAFT);
                        setMode(PROP.MODE.OPEN);
                    }
                    else if (proposal.isOwnProposal) {
                        setStatus((proposal.isPublished === PROPS.PUBLISHED.YES) ? PROP.STATUS.PUBLISHED : PROP.STATUS.DRAFT);
                        setMode(PROP.MODE.COLLAPSED);
                    }
                    else {
                        setStatus(PROP.STATUS.PUBLIC);
                    }
                    self.isModified = proposal.isModified;
                    self.editedText = proposal.text;
                }
            }

            function postProposal(proposal) {
                $log.debug("dbProposal: postProposal: " + JSON.stringify(proposal));
                if (angular.isObject(proposal)) {

                    var copy = angular.copy(proposal);
                    if (copy.isPublished === null) {
                        copy.isPublished = PROPS.PUBLISHED.NO;
                    }
                    else if (copy.isPublished === PROPS.PUBLISHED.NO) {
                        copy.isPublished = PROPS.PUBLISHED.YES;
                    }

                    AhjoProposalsSrv.post(copy).$promise.then(function(response) {
                        $log.debug("dbProposal: post then: " + JSON.stringify(response));
                        if (angular.isObject(response) && angular.isObject(response.Data)) {
                            angular.merge($scope.proposal, response.Data);
                        }
                        else {
                            $log.error('dbProposal: postProposal invalid response');
                        }
                    }, function(error) {
                        $log.error("dbProposal: post error: " + JSON.stringify(error));
                    });
                }
                else {
                    $log.error('dbProposal: postProposal invalid parameter');
                }
            }

            function deleteProposal(proposal) {
                $log.debug("dbProposal: deleteProposal: " + JSON.stringify(proposal));
                if (angular.isObject(proposal)) {
                    if (proposal.proposalGuid) {
                        AhjoProposalsSrv.delete(proposal).$promise.then(function(response) {
                            if (angular.isObject(response) && angular.isObject(response.Data) && angular.isObject(response.Data.Data)) {
                                $scope.onDelete({ data: { guid: response.Data.Data.proposalGuid } });
                            }
                        }, function(error) {
                            $log.error("dbProposal: delete error: " + JSON.stringify(error));
                        });
                    }
                    else {
                        $scope.onDelete({ data: { guid: proposal.proposalGuid } });
                    }
                }
                else {
                    $log.error('dbProposal: deleteProposal invalid parameter');
                }
            }

            self.typeText = function(value) {
                var obj = $rootScope.objWithVal(PROPS.TYPE, 'value', value);
                return (obj && obj.text) ? obj.text : value;
            };

            self.isEditing = function() {
                return (self.status === PROP.STATUS.DRAFT && self.mode === PROP.MODE.OPEN);
            };

            self.isReading = function() {
                return (self.isPublic() && self.mode === PROP.MODE.OPEN);
            };

            self.isPublished = function() {
                return self.status === PROP.STATUS.PUBLISHED;
            };

            self.isPublic = function() {
                return (self.status === PROP.STATUS.PUBLIC || self.status === PROP.STATUS.PUBLISHED);
            };

            self.isCollapsed = function() {
                return (self.mode === PROP.MODE.COLLAPSED);
            };

            self.act = function(action) {

                switch (action) {
                    case PROP.BTN.CLOSE.action:
                        setMode(PROP.MODE.COLLAPSED);
                        break;

                    case PROP.BTN.OPEN.action:
                        setMode(PROP.MODE.OPEN);
                        break;

                    case PROP.BTN.CANCEL.action:
                        $scope.proposal.isPublished = previousIsPublished;
                        setMode(PROP.MODE.COLLAPSED);
                        break;

                    case PROP.BTN.OK.action:
                        $scope.proposal.text = self.editedText ? self.editedText : '';
                        postProposal($scope.proposal);
                        setMode(PROP.MODE.COLLAPSED);
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
                        setMode(PROP.MODE.OPEN);
                        break;

                    case PROP.BTN.COPY.action:
                        $scope.onCopy({ data: { proposal: $scope.proposal } });
                        break;

                    default:
                        $log.error("dbProposal: unsupported action");
                        break;
                }
            };

            $scope.$watch(function() {
                return {
                    proposal: $scope.proposal
                };
            }, function(data) {
                setProposal(data.proposal);
            }, true);

            var watcher = $rootScope.$on(PROPS.TOGGLE, function(event, data) {
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

            $scope.$on('$destroy', function() {
                $log.debug("dbProposal: DESTROY");
            });
        }];

        return {
            scope: {
                proposal: '=',
                guid: '=',
                onDelete: '&',
                onCopy: '&'
            },
            templateUrl: 'directives/proposal/proposal.Directive.html',
            restrict: 'AE',
            controller: controller,
            controllerAs: 'c',
            replace: 'true'
        };
    }]);
