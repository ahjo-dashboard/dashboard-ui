/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc directive
 * @name dashboard.pdf:pdfDirective
 * @description
 * # pdfDirective
 */
angular.module('dashboard')
    .directive('dbPdf', ['$compile', '$rootScope', '$window', 'CONST', '$log', '$interval', function($compile, $rootScope, $window, CONST, $log, $interval) {
        return {
            scope: {
                uri: '=',
                mode: '=',
                hide: '='
            },
            templateUrl: 'directives/pdf/pdf.Directive.html',
            restrict: 'AE',
            replace: 'true',
            link: function(scope, element/*, attrs */) {

                var HEIGHT = 'height';
                var WIDTH = 'width';
                var RESIZE = 'resize';
                var timer;
                var pending = false;
                var hidden = false;

                function hide() {
                    if (!hidden) {
                        hidden = true;
                        element.removeClass('db-visible-pdf');
                        element.addClass('db-hidden-pdf');
                    }
                }

                function show() {
                    pending = true;
                    if (!angular.isDefined(timer)) {
                        timer = $interval(function() {
                            if (!pending) {
                                $interval.cancel(timer);
                                timer = undefined;
                                element.css(HEIGHT, element.parent().height());
                                element.css(WIDTH, element.parent().width());
                                element.removeClass('db-hidden-pdf');
                                element.addClass('db-visible-pdf');
                                hidden = false;
                            }
                            else {
                                pending = false;
                            }
                        }, 100);
                    }
                }

                scope.$watch(
                    function() {
                        return { uri: scope.uri };
                    },
                    function() {
                        hide();
                        element.empty();
                        element.append($compile('<iframe src=' + scope.uri + '></iframe>')(scope));
                        show();
                    },
                    true
                );

                scope.$watch(
                    function() {
                        return { mode: scope.mode };
                    },
                    function() {
                        hide();
                        show();
                    },
                    true
                );

                scope.$watch(
                    function() {
                        return { hide: scope.hide };
                    },
                    function(data) {
                        console.log(data);
                        if (data.hide) {
                            hide();
                        }
                        else {
                            show();
                        }
                    },
                    true
                );

                angular.element($window).bind(RESIZE, function() {
                    hide();
                    show();
                });

                var watcher = $rootScope.$on(CONST.MENUACTIVE, function(event, data) {
                    if (data) {
                        hide();
                    }
                    else {
                        show();
                    }
                });

                scope.$on('$destroy', watcher);

                scope.$on('$destroy', function() {
                    $log.debug("pdfDirective: DESTROY");
                });

            }
        };
    }]);
