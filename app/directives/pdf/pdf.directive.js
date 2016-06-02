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
    .directive('dbPdf', ['$rootScope', 'CONST', '$log', '$compile', function ($rootScope, CONST, $log, $compile) {
        return {
            scope: {
                uri: '=',
                hide: '='
            },
            template: '<div></div>',
            restrict: 'AE',
            replace: 'true',
            link: function (scope, element/*, attrs*/) {

                var params = "secondary=false&amp;mixed=false#view=FitH&amp;toolbar=0&amp;statusbar=0&amp;messages=0&amp;navpanes=0";
                var isIe = $rootScope.isIe;
                var noContentUri = 'no.content.html';
                element.addClass('db-directive');

                function paramSeparator(uri) {
                    return angular.isString(uri) && (CONST.NOTFOUND !== uri.indexOf('?')) ? '&' : '?';
                }

                function hide() {
                    element.removeClass('db-visible-pdf');
                    element.addClass('db-hidden-pdf');
                }

                function show() {
                    element.removeClass('db-hidden-pdf');
                    element.addClass('db-visible-pdf');
                }

                function composeContent(data) {
                    element.empty();
                    var content = '<iframe src="' + noContentUri + '"></iframe>';
                    if (angular.isObject(data) && angular.isString(data.uri) && data.uri.length) {
                        content = '<iframe src="' + data.uri + paramSeparator(data.uri) + params + '"></iframe>';
                    }
                    element.append($compile(content)(scope));
                    show();
                }

                scope.$watch(
                    function () {
                        return { uri: scope.uri };
                    },
                    composeContent,
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

                if (angular.isString(scope.uri) && scope.uri.length) {
                    composeContent({ uri: scope.uri });
                }
                else {
                    hide();
                }
            }
        };
    }]);
