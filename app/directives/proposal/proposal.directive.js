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
            EDITOR: 'EDITOR'
        }
    })
    .filter('unsafe', function($sce) {
        return function(val) {
            return $sce.trustAsHtml(val);
        };
    })
    .directive('dbProposal', [function() {

        var controller = ['$log', '$scope', 'PROPS', 'PROP','$rootScope', function($log, $scope, PROPS, PROP, $rootScope) {
            $log.debug("dbProposal: CONTROLLER");
            var self = this;

            self.testUserGuid = "926eee0b-8e94-4a14-beec-d9b60590547f"; // Elina Aalto

            self.mode = PROP.MODE.COLLAPSED;
            self.mds = PROP.MODE;
            self.isPbl = false;
            self.isUser = false;
            self.editedText = "";
            self.smallEditor = {
                'menu': [
                    ['bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript']
                ]
            };
            self.editor = {
                'menu': [
                    // ['bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript'],
                    // ['format-block'],
                    // ['font'],
                    // ['font-size'],
                    // ['font-color', 'hilite-color'],
                    // ['remove-format'],
                    // ['ordered-list', 'unordered-list', 'outdent', 'indent'],
                    // ['left-justify', 'center-justify', 'right-justify']
                ]
            };

            function setProposal(proposal) {
                if (proposal instanceof Object) {
                    self.isPbl = (proposal.isPublished === PROPS.PUBLISHED.YES);
                    self.isUser = (proposal.personGuid === self.testUserGuid);
                    self.editedText = proposal.text;

                    if (proposal.isNew) {
                        self.mode = PROP.MODE.EDITOR;
                    }
                }
            }

            self.startEditing = function() {
                self.editedText = $scope.proposal.text;
                self.mode = PROP.MODE.EDITOR;
            };

            self.endEditing = function() {
                if ($scope.proposal.text !== self.editedText) {
                    $scope.proposal.text = self.editedText;
                    $scope.onPost({ proposal: $scope.proposal });
                }
                self.mode = PROP.MODE.COLLAPSED;
            };

            self.cancelEditing = function() {
                self.mode = PROP.MODE.COLLAPSED;
            };

            self.deleteProposal = function() {
                $scope.onDelete({ proposal: $scope.proposal });
            };

            self.shareProposal = function() {
                $scope.proposal.isPublished = PROPS.PUBLISHED.YES;
                $scope.onPost({ proposal: $scope.proposal });
            };

            self.open = function() {
                self.mode = self.isPbl ? PROP.MODE.OPEN : PROP.MODE.EDITOR;
            };

            self.collapse = function() {
                self.mode = PROP.MODE.COLLAPSED;
            };

            self.typeText = function(value) {
                var obj  = $rootScope.objWithVal(PROPS.TYPE, 'value', value);
                return (obj && obj.text) ? obj.text : value;
            };

            $scope.$watch(function() {
                return {
                    proposal: $scope.proposal
                };
            }, function(data) {
                setProposal(data.proposal);
            }, true);

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
