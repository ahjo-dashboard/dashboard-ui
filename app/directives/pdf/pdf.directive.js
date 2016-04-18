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
    .directive('dbPdf', ['$compile', '$rootScope', '$window', 'CONST', '$log', '$interval', function ($compile, $rootScope, $window, CONST, $log, $interval) {
        return {
            scope: {
                uri: '=',
                mode: '=',
                hide: '='
            },
            templateUrl: 'directives/pdf/pdf.Directive.html',
            restrict: 'AE',
            replace: 'true',
            link: function (scope, element/*, attrs*/) {

                var HEIGHT = 'height';
                var WIDTH = 'width';
                var RESIZE = 'resize';
                var SRC = 'src';
                var params = "?secondary=false&amp;mixed=false#view=FitH&amp;toolbar=0&amp;statusbar=0&amp;messages=0&amp;navpanes=0";
                var timer;
                var pending = false;
                var hidden = false;
                var anim = false;

                if (scope.uri) {
                    element.attr(SRC, scope.uri + params);
                }

                element.css(HEIGHT, element.parent().height());
                element.css(WIDTH, element.parent().width());

                function hide() {
                    if (!hidden) {
                        hidden = true;
                        element.removeClass('db-visible-pdf');
                        element.removeClass('db-visible-pdf-anim');
                        element.addClass('db-hidden-pdf');
                    }
                }

                function show() {
                    pending = true;
                    if (!angular.isDefined(timer)) {
                        timer = $interval(function () {
                            if (!pending) {
                                $interval.cancel(timer);
                                timer = undefined;
                                element.css(HEIGHT, element.parent().height());
                                element.css(WIDTH, element.parent().width());
                                element.removeClass('db-hidden-pdf');
                                if (anim) {
                                    element.removeClass('db-visible-pdf');
                                    element.addClass('db-visible-pdf-anim');
                                }
                                else {
                                    element.removeClass('db-visible-pdf-anim');
                                    element.addClass('db-visible-pdf');
                                }
                                hidden = false;
                            }
                            else {
                                pending = false;
                            }
                        }, 100);
                    }
                }

                scope.$watch(
                    function () {
                        return { uri: scope.uri };
                    },
                    function () {
                        var src = element.attr(SRC);
                        var newSrc = scope.uri + params;
                        if (src !== newSrc) {
                            anim = false;
                            element.attr(SRC, newSrc);
                        }
                    },
                    true
                );

                scope.$watch(
                    function () {
                        return { mode: scope.mode };
                    },
                    function () {
                        hide();
                        anim = true;
                        show();
                    },
                    true
                );

                scope.$watch(
                    function () {
                        return { hide: scope.hide };
                    },
                    function (data) {
                        if (data.hide) {
                            hide();
                        }
                        else {
                            anim = false;
                            show();
                        }
                    },
                    true
                );

                angular.element($window).bind(RESIZE, function () {
                    hide();
                    anim = true;
                    show();
                });

                var watcher = $rootScope.$on(CONST.MENUACTIVE, function (event, data) {
                    if (data) {
                        hide();
                    }
                    else {
                        anim = true;
                        show();
                    }
                });

                scope.$on('$destroy', watcher);

                scope.$on('$destroy', function () {
                    $log.debug("pdfDirective: DESTROY");
                });
            }
        };
    }]);
