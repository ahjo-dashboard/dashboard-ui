/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc directive
 * @name
 * @description
 * # respDropd
 */
angular.module('dashboard')
    .directive('respDropd', ['$log', '$window', '$timeout', function ($log, $window, $timeout) {
        return {
            scope: {},
            restrict: 'A',
            replace: 'true',
            link: function (scope, el, attrs) {

                var timer = null;


                function resolve() {
                    // $log.debug("respDropd.resolve: handling timer=" + JSON.stringify(timer));
                    timer = null;


                    var myH = el.outerHeight();
                    var myW = el.outerWidth();
                    var offset = el.offset();
                    var myTop = offset.top;
                    var par = el.parent(); // If getting parent stops working due to future grunt version etc, workaround is get by ID which is passed as scope argument. Like this: angular.element('#parentId');
                    var parOffset = par.offset();
                    var parTop = parOffset.top;
                    var parLeft = parOffset.left;
                    var parBottom = parTop + par.height();

                    var isOutBottom = $window.innerHeight < (parBottom + myTop + myH);
                    var isOutRight = $window.innerWidth < (parLeft + myW);

                    $log.debug("respDropd.link (#" + attrs.id + ") : isOutBottom=" + isOutBottom + " isOutRight=" + isOutRight + "$window.innerHeight:" + $window.innerHeight + " $window.innerWidth:" + $window.innerWidth + " myH=" + myH + " myW=" + myW);

                    if (isOutBottom) {
                        par.addClass('dropup'); // Requires parent to have relative positioning
                    }

                    if (isOutRight) {
                        // Shifting done like this because coulndn't get bootstrap's dropdown-right working
                        var newRight = -(myW - par.innerWidth());
                        $log.debug('respDropd.resolve (' + attrs.id + ') : shifting right by:' + newRight);
                        el.css('right', '0%');
                        el.css('left', 'auto');
                    }
                }

                el.ready(function () {
                    // $log.debug('respDropd.ready (#' + attrs.id + ')');
                    resolve();
                });

                angular.element($window).bind('resize', function () {
                    // $log.debug('respDropd.resize (" +attrs.id +") : timer=' + JSON.stringify(timer));
                    if (!timer) {
                        timer = $timeout(resolve, 500);
                    }
                });
            }
        };
    }]);
