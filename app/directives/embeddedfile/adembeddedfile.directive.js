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
.directive('adEmbeddedFile', ['Device', '$timeout', '$log', '$compile', '$window', function (Device, $timeout, $log, $compile, $window) {
    return {
        scope: {
            fileurl: '=',
            filename: '=',
            parallel: '='
        },
        templateUrl: 'directives/embeddedfile/adembeddedfile.directive.html',
        restrict: 'E',
        replace: 'true',
        link: function (scope, element/*, attrs */) {
            // IE displays <object> (embedded pdf) always on top so it covers modals, dropdowns, menus etc.
            // Quick workaround to revert to use pdf.js on IE
            scope.useHtmlObject = !Device.isUaMsIe();

            if (!scope.fileurl) {
                return;
            }

            var PARALLEL_TRUE = 'parallel-true';
            var PARALLEL_FALSE = 'parallel-false';
            var HEIGHT = 'height';
            var CLASS = 'class';
            var RESIZE = 'resize';

            // Element replaced in link because IE 11 and Edge won't display the pdf object if url is passed via Angular property
            //TODO: check filetype and use pdf icon only for pdf
            function setObj() {
                $log.debug("adEmbeddedFile.setObj: " +scope.fileurl);
                var altObj = '<a href="' +scope.fileurl +'" class="ad-pdfLink" title="' +scope.filename +'" target="_blank">Avaa tiedosto "' +scope.filename +'"</a>';
                var html = '<object type="application/pdf" class="ad-embedded-pdf" data="' +scope.fileurl +'">' +altObj +'</object>';
                if (!scope.useHtmlObject) {
                    html = altObj;
                }

                element.empty();
                element.append($compile(html)(scope));
            }

            scope.$watch(
                function() { return { val : scope.fileurl }; },
                function(/*data*/) { setObj(); },
                true
            );

            scope.$watch(
                function() {
                    return {
                        class: element.attr(CLASS)
                    };
                },
                function(data) {
                    if (data.class && (data.class.indexOf(PARALLEL_TRUE) !== -1 || data.class.indexOf(PARALLEL_FALSE) !== -1)) {
                        $timeout(function () {
                            element.css(HEIGHT, element.parent().height());
                        }, 100);
                    }
                },
                true
            );

            angular.element($window).bind(RESIZE, function() {
                element.css(HEIGHT, element.parent().height());
            });
        }
    };
}]);
