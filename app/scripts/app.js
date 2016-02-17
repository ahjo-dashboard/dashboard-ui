/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';
/**
* @ngdoc overview
* @name dashboard
* @description
* # dashboard
*
* Main module of the application.
*/
angular.module('dashboard', [
    'ngAnimate',
    'ngTouch',
    'ui.router',
    'AhjoSigningService',
    'ui.bootstrap',
    'ngSanitize',
    'wysiwyg.module',
    'ngDialog',
    'pascalprecht.translate'
])
.constant(
    'DEVICE', {
        MOBILE: 1,
        DESKTOP: 2
    }
)
.constant(
    'MENU', {
        CLOSED: 0,
        HALF: 1,
        FULL: 2
    }
)
.constant(
    'BLOCKMODE', {
        BOTH : 0,
        UPPER : 1,
        LOWER : 2
    }
)
.constant(
    'HOMEMODE', {
        ALL : 0,
        MEETINGS : 1,
        ESIGN : 2
    }
)
.constant(
    'APPSTATE', {
        APP: "app",
        LOGIN: "app.login",
        INFO: "app.info",
        HOME: "app.home",
        OVERVIEW: "app.overview",
        MEETING: "app.meeting",
        SIGNITEM: "app.signitem"
    }
)
.config(function($urlRouterProvider, $stateProvider, ENV, G_APP, $logProvider, $provide, $compileProvider, $translateProvider) {
    // Startup logged always regardless of ENV config, so using console instead of $log
    console.log('dashboard.config: ver: ' +G_APP.app_version  +' env: ' +ENV.app_env +' logging: ' +ENV.app_debuglogs);

    /* Set application level logging. Affects $log, not console */
    var doDbg = false;
    if (ENV && ENV.app_debuglogs) {
        doDbg = ENV.app_debuglogs;
        $translateProvider.useMissingTranslationHandlerLog();
    }
    $logProvider.debugEnabled(doDbg);

    /* Override $log functions to respect app-level setting for logging */
    $provide.decorator('$log', function ($delegate) {
        var infoFn = $delegate.info;
        var logFn = $delegate.log;

        $delegate.info = function () {
            if ($logProvider.debugEnabled()) {
                infoFn.apply(null, arguments);
            }
        };

        $delegate.log = function () {
            if ($logProvider.debugEnabled()) {
                logFn.apply(null, arguments);
            }
        };
        return $delegate;
    });

    $translateProvider
    .useStaticFilesLoader({
        prefix: 'loc/lang-',
        suffix: '.json'
    })
    .preferredLanguage('fi')
    .fallbackLanguage('fi')
    .useSanitizeValueStrategy('escapeParameters')
    .use('fi');

    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|blob):/);
})
.run(function($rootScope, $log, DEVICE, $window, MENU) {
    $rootScope.$on('$stateChangeStart', function (event, next/*, toParams, fromParams*/) {
        $log.debug('app.stateChangeStart: ' +next.name);// +' toParams: ' +JSON.stringify(toParams) +' fromParams: ' +JSON.stringify(fromParams));
    });
    $rootScope.$on('$stateChangeError', console.error.bind(console)); // $log.error.bind didn't work for .spec tests

    $rootScope.goBack = function() {
        $window.history.back();
    };

    $rootScope.openMenu = function() {
        if ($rootScope.menu < MENU.FULL) {
            $rootScope.menu = $rootScope.menu + 1;
        }
    };

    $rootScope.closeMenu = function() {
        if ($rootScope.menu > MENU.CLOSED) {
            $rootScope.menu = $rootScope.menu - 1;
        }
    };

    $rootScope.menuClosed = function() {
        return $rootScope.menu === MENU.CLOSED;
    };

    $rootScope.menuHalf = function() {
        return $rootScope.menu === MENU.HALF;
    };

    $rootScope.menuFull = function() {
        return $rootScope.menu === MENU.FULL;
    };

    // GLOBAL VARIABLES
    // $rootScope.device    MOBILE = 1, DESKTOP = 2
    // $rootScope.menu      FULL = 2, HALF = 1,  CLOSED = 0

    var device = document.getElementById("device");

    if (device && window.getComputedStyle(device,null).getPropertyValue("min-width") === '320px') {
        $rootScope.device = DEVICE.MOBILE;
    }
    else {
        $rootScope.device = DEVICE.DESKTOP;
    }
});
