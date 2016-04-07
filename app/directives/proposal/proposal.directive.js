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

        var controller = ['$log', '$scope', 'PROPS', 'PROP', '$rootScope', function($log, $scope, PROPS, PROP, $rootScope) {
            $log.debug("dbProposal: CONTROLLER");
            var self = this;

            self.mode = PROP.MODE.COLLAPSED;
            self.status = PROP.STATUS.PUBLIC;
            self.editedText = "";

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
                        if (self.isDraft()) {
                            self.lBtn = PROP.BTN.EDIT;
                            self.mBtn = (($scope.proposal instanceof Object) && $scope.proposal.text) ? PROP.BTN.SEND : PROP.BTN.DISABLEDSEND;
                            self.rBtn = PROP.BTN.DELETE;
                        }
                        else {
                            self.rBtn = PROP.BTN.OPEN;
                        }
                        break;

                    case PROP.MODE.OPEN:
                        if (self.isPublic()) {
                            self.rBtn = PROP.BTN.CLOSE;
                        }
                        if (self.isDraft()) {
                            self.lBtn = PROP.BTN.OK;
                            self.mBtn = PROP.BTN.CANCEL;
                            self.rBtn = null;
                        }
                        break;

                    case PROP.MODE.COLLAPSED:
                        if (self.isDraft()) {
                            self.lBtn = PROP.BTN.EDIT;
                            self.mBtn = PROP.BTN.SEND;
                            self.rBtn = PROP.BTN.DELETE;
                        }
                        break;

                    default:
                        break;
                }
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
                if (proposal instanceof Object) {
                    if (proposal.isNew) {
                        setStatus(PROP.STATUS.DRAFT);
                        setMode(PROP.MODE.OPEN);
                    }
                    else if (proposal.isOwnProposal) {
                        setStatus((proposal.isPublished === 1) ? PROP.STATUS.PUBLISHED : PROP.STATUS.DRAFT);
                    }
                    else {
                        setStatus(PROP.STATUS.PUBLIC);
                    }
                    self.editedText = proposal.text;
                }
            }

            function startEditing() {
                self.editedText = $scope.proposal.text;
            }

            function endEditing() {
                if ($scope.proposal.text !== self.editedText || !self.editedText) {
                    $scope.proposal.text = self.editedText ? self.editedText : '';
                    $scope.onPost({ proposal: $scope.proposal });
                }
            }

            self.typeText = function(value) {
                var obj = $rootScope.objWithVal(PROPS.TYPE, 'value', value);
                return (obj && obj.text) ? obj.text : value;
            };

            self.isDraft = function() {
                return self.status === PROP.STATUS.DRAFT;
            };

            self.isEditing = function() {
                return (self.isDraft() && self.mode === PROP.MODE.OPEN);
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
                        if ($scope.proposal.isNew) {
                            delete $scope.proposal.isNew;
                        }
                        setMode(PROP.MODE.COLLAPSED);
                        break;

                    case PROP.BTN.OK.action:
                        if ($scope.proposal.isNew) {
                            delete $scope.proposal.isNew;
                        }
                        endEditing();
                        setMode(PROP.MODE.COLLAPSED);
                        break;

                    case PROP.BTN.DELETE.action:
                        $scope.onDelete({ proposal: $scope.proposal });
                        break;

                    case PROP.BTN.SEND.action:
                        $scope.proposal.isPublished = PROPS.PUBLISHED.YES;
                        $scope.onPost({ proposal: $scope.proposal });
                        break;

                    case PROP.BTN.EDIT.action:
                        startEditing();
                        setMode(PROP.MODE.OPEN);
                        break;

                    case PROP.BTN.COPY.action:
                        $scope.onCopy({ proposal: $scope.proposal });
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
                onPost: '&',
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
