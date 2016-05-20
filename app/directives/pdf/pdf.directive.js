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
    .directive('dbPdf', ['$rootScope', 'CONST', '$log', '$timeout', function ($rootScope, CONST, $log, $timeout) {
        return {
            scope: {
                uri: '=',
                hide: '=',
                size: '='
            },
            template: '<iframe></iframe>',
            restrict: 'AE',
            replace: 'true',
            link: function (scope, element/*, attrs*/) {

                var doc = (element[0].contentWindow || element[0].contentDocument);
                if (doc.document) {
                    doc = doc.document;
                }

                var SRC = 'src';
                var params = "secondary=false&amp;mixed=false#view=FitH&amp;toolbar=0&amp;statusbar=0&amp;messages=0&amp;navpanes=0";
                var isIe = $rootScope.isIe;
                var noContentUri = 'no.content.html';
                var loadingUri = 'loading.html';

                function paramSeparator(uri) {
                    if (angular.isString(uri)) {
                        return CONST.NOTFOUND === uri.indexOf('?') ? '?' : '&';
                    }
                    return true;
                }

                function hide() {
                    element.removeClass('db-visible-pdf');
                    element.addClass('db-hidden-pdf');
                }

                function show() {
                    element.removeClass('db-hidden-pdf');
                    element.addClass('db-visible-pdf');
                }

                scope.$watch(
                    function () {
                        return { uri: scope.uri };
                    },
                    function (data) {

                        var body = angular.element(doc.body);
                        body.empty();

                        element.attr(SRC, loadingUri);
                        show();

                        if (angular.isObject(data) && angular.isString(data.uri) && data.uri.length) {
                            $timeout(function () {
                                var newSrc = scope.uri + paramSeparator(scope.uri) + params;
                                element.attr(SRC, newSrc);
                            }, 500);
                        }
                        else {
                            element.attr(SRC, noContentUri);
                        }
                    },
                    true
                );

                scope.$watch(
                    function () {
                        return { hide: scope.hide };
                    },
                    function (data) {
                        if (angular.isObject(data)) {
                            if (data.hide) {
                                hide();
                            }
                            else {
                                show();
                            }
                        }
                    },
                    true
                );

                scope.$watch(
                    function () {
                        return scope.size;
                    },
                    function (size) {
                        if (angular.isObject(size)) {
                            element.css('height', size.height);
                            element.css('width', size.width);
                            $log.log('dbPdf size changed: height = ' + size.height + ', width = ' + size.width);
                        }
                    },
                    true
                );

                var confirmWatcher = $rootScope.$on(CONST.CONFIRMACTIVE, function (event, data) {
                    if (isIe && angular.isObject(data)) {
                        if (data.open === true) {
                            hide();
                        }
                        else if (data.open === false) {
                            show();
                        }
                    }
                });

                scope.$on('$destroy', confirmWatcher);
                scope.$on('$destroy', function () {
                    $log.debug("pdfDirective: DESTROY");
                });

                hide();
            }
        };
    }]);
