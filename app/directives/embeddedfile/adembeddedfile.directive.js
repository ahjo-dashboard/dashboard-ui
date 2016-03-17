/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
* @ngdoc directive
* @name dashboard.directive:adEmbeddedFile
* @description
* # adEmbeddedFile
*/
angular.module('dashboard')
    .directive('adEmbeddedFile', ['$timeout', '$log', '$compile', '$window', '$rootScope', function($timeout, $log, $compile, $window, $rootScope) {
        return {
            scope: {
                fileurl: '=',
                filename: '=',
                refresh: '='
            },
            templateUrl: 'directives/embeddedfile/adembeddedfile.directive.html',
            restrict: 'E',
            replace: 'true',
            link: function(scope, element/*, attrs */) {

                // As a workaround display only a download link on smartphone screens
                // TODO: do a waterproof multi-platform object-alttext solution.
                scope.useHtmlObject = !$rootScope.isMobile;

                // TODO: enable this on a platform where only a link should be displayed
                // scope.useHtmlObject = !$rootScope.isIe;

                $log.debug("adEmbeddedFile.setObj: " + scope.fileurl + " useHtmlObject: " + scope.useHtmlObject);

                if (!scope.fileurl) {
                    return;
                }

                var HEIGHT = 'height';
                var RESIZE = 'resize';
                var OPACITY = 'opacity';
                var TRANSITION = 'transition';
                var VISIBILITY = 'visibility';

                // Element replaced in link because IE 11 and Edge won't display the pdf object if url is passed via Angular property
                //TODO: check filetype and use pdf icon only for pdf
                function setObj() {
                    var altObj = '<a href="' + scope.fileurl + '" class="ad-pdfLink" title="' + scope.filename + '" target="_blank">Avaa tiedosto "' + scope.filename + '"</a>';
                    var html = '<object type="application/pdf" class="ad-embedded-pdf" data="' + scope.fileurl + '">' + altObj + '</object>';
                    if (!scope.useHtmlObject) {
                        html = altObj;
                    }

                    element.empty();

                    if (scope.fileurl) {
                        element.append($compile(html)(scope));
                        element.css(HEIGHT, element.parent().height());
                    }
                }

                scope.$watch(
                    function() { return { val: scope.fileurl }; },
                    function(/*data*/) { setObj(); },
                    true
                );

                scope.$watch(
                    function() {
                        return $rootScope.menu;
                    },
                    function() {
                        element.css(TRANSITION, 'opacity 0s, visibility 0s');
                        element.css(OPACITY, 0.0);
                        element.css(VISIBILITY, 'hidden');
                        $timeout(function() {
                            element.css(TRANSITION, 'opacity 1200ms, visibility 200ms');
                            element.css(VISIBILITY, 'visible');
                            element.css(OPACITY, 1.0);
                        },
                            100);
                    },
                    true
                );

                scope.$watch(
                    function() { return { val: scope.refresh }; },
                    function() {
                        $timeout(function() {
                            element.css(TRANSITION, 'opacity 0s, visibility 0s, height 200ms');
                            element.css(OPACITY, 0.0);
                            element.css(VISIBILITY, 'hidden');
                            element.css(HEIGHT, element.parent().height());
                            $timeout(function() {
                                element.css(TRANSITION, 'opacity 800ms, visibility 200ms');
                                element.css(VISIBILITY, 'visible');
                                element.css(OPACITY, 1.0);
                            },
                                100);
                        },
                            100);
                    },
                    true
                );

                angular.element($window).bind(RESIZE, function() {
                    element.css(HEIGHT, element.parent().height());
                });
            }
        };
    }]);
