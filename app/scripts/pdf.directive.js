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
                uri: '='
            },
            template: '<div></div>',
            restrict: 'AE',
            replace: 'true',
            link: function (scope, element/*, attrs*/) {

                var params = "secondary=false&amp;mixed=false#view=FitH&amp;toolbar=0&amp;statusbar=0&amp;messages=0&amp;navpanes=0";
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
                    if ($rootScope.modalActive) {
                        hide();
                    }
                    else {
                        show();
                    }
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
                        return { modalActive: $rootScope.modalActive };
                    },
                    function (data) {
                        if (angular.isObject(data)) {
                            if (data.modalActive) {
                                hide();
                            }
                            else {
                                show();
                            }
                        }
                    },
                    true
                );

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
