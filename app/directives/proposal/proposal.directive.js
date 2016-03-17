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
            OPEN: { icon: 'glyphicon-plus', action: 'OPEN', type: 'db-btn-prim' },
            CLOSE: { icon: 'glyphicon-minus', action: 'CLOSE', type: 'db-btn-prim' },
            EDIT: { icon: 'glyphicon-pencil', action: 'EDIT', type: 'btn-success' },
            OK: { icon: 'glyphicon-ok', action: 'OK', type: 'db-btn-prim' },
            CANCEL: { icon: 'glyphicon-remove', action: 'CANCEL', type: 'btn-warning' },
            SEND: { icon: 'glyphicon-send', action: 'SEND', type: 'db-btn-prim' },
            DELETE: { icon: 'glyphicon-trash', action: 'DELETE', type: 'btn-danger' }
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

            self.leftBtn = null;
            self.middleBtn = null;
            self.rightBtn = null;

            self.editor = {
                'menu': []
            };

            function setMode(mode) {
                $log.debug("dbProposal: setMode " + mode);
                self.mode = mode;

                switch (self.mode) {
                    case PROP.MODE.COLLAPSED:
                        if (self.isDraft()) {
                            self.leftBtn = PROP.BTN.EDIT;
                            self.middleBtn = PROP.BTN.SEND;
                            self.rightBtn = PROP.BTN.DELETE;
                        }
                        else {
                            self.rightBtn = PROP.BTN.OPEN;
                        }
                        break;

                    case PROP.MODE.OPEN:
                        if (self.isPublic()) {
                            self.rightBtn = PROP.BTN.CLOSE;
                        }
                        if (self.isDraft()) {
                            self.leftBtn = PROP.BTN.OK;
                            self.middleBtn = PROP.BTN.CANCEL;
                            self.rightBtn = null;
                        }
                        break;

                    case PROP.MODE.COLLAPSED:
                        if (self.isDraft()) {
                            self.leftBtn = PROP.BTN.EDIT;
                            self.middleBtn = PROP.BTN.SEND;
                            self.rightBtn = PROP.BTN.DELETE;
                        }
                        break;

                    default:
                        break;
                }
            }

            function setStatus(status) {
                $log.debug("dbProposal: setStatus " + status);
                self.status = status;

                switch (self.status) {
                    case PROP.STATUS.PUBLIC:
                        self.rightBtn = PROP.BTN.OPEN;
                        break;

                    case PROP.STATUS.PUBLISHED:
                        self.middleBtn = PROP.BTN.DELETE;
                        self.rightBtn = PROP.BTN.OPEN;
                        break;

                    case PROP.STATUS.DRAFT:
                        self.leftBtn = PROP.BTN.EDIT;
                        self.middleBtn = PROP.BTN.SEND;
                        self.rightBtn = PROP.BTN.DELETE;
                        break;

                    default:
                        break;
                }
            }

            function setProposal(proposal) {
                if (proposal instanceof Object) {
                    if (proposal.isOwnProposal) {
                        setStatus((proposal.isPublished === 1) ? PROP.STATUS.PUBLISHED : PROP.STATUS.DRAFT);
                    }
                    else {
                        setStatus(PROP.STATUS.PUBLIC);
                    }
                    self.editedText = proposal.text;

                    if (proposal.isNew) {
                        setMode(PROP.MODE.OPEN);
                    }
                }
            }

            function startEditing() {
                self.editedText = $scope.proposal.text;
            }

            function endEditing() {
                if ($scope.proposal.text !== self.editedText) {
                    $scope.proposal.text = self.editedText;
                    $scope.onPost({ proposal: $scope.proposal });
                }
            }

            self.typeText = function(value) {
                var obj = $rootScope.objWithVal(PROPS.TYPE, 'value', value);
                return (obj && obj.text) ? obj.text : value;
            };

            self.toggleOpen = function() {
                if (self.status === PROP.STATUS.DRAFT) {
                    if (self.mode === PROP.MODE.COLLAPSED) {
                        startEditing();
                    }
                    else {
                        endEditing();
                    }
                }
                setMode(self.mode === PROP.MODE.COLLAPSED ? PROP.MODE.OPEN : PROP.MODE.COLLAPSED);
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
                $log.debug("dbProposal: act " + action);
                if (action === PROP.BTN.CLOSE.action) {
                    setMode(PROP.MODE.COLLAPSED);
                }
                else if (action === PROP.BTN.OPEN.action) {
                    setMode(PROP.MODE.OPEN);
                }
                else if (action === PROP.BTN.CANCEL.action) {
                    setMode(PROP.MODE.COLLAPSED);
                }
                else if (action === PROP.BTN.OK.action) {
                    endEditing();
                    setMode(PROP.MODE.COLLAPSED);
                }
                else if (action === PROP.BTN.DELETE.action) {
                    $scope.onDelete({ proposal: $scope.proposal });
                }
                else if (action === PROP.BTN.SEND.action) {
                    $scope.proposal.isPublished = PROPS.PUBLISHED.YES;
                    $scope.onPost({ proposal: $scope.proposal });
                }
                else if (action === PROP.BTN.EDIT.action) {
                    startEditing();
                    setMode(PROP.MODE.OPEN);
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
                onDelete: '&'
            },
            templateUrl: 'directives/proposal/proposal.Directive.html',
            restrict: 'AE',
            controller: controller,
            controllerAs: 'c',
            replace: 'true'
        };
    }]);
