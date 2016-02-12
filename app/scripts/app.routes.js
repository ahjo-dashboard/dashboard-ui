/**
* (c) 2016 Tieto Finland Oy
* Licensed under the MIT license.
*/
'use strict';
angular.module('dashboard')
.config(['$urlRouterProvider','$stateProvider','ENV','MENU', 'HOMEMODE', function($urlRouterProvider, $stateProvider, ENV, MENU, HOMEMODE) {
    var device = angular.element('#device');

    if (device && device.css('min-width') === '320px') {
        /* MOBILE States and routings */
        $stateProvider
        .state('app', {
            url: '',
            abstract: true,
            views: {
                'appView' :{
                    templateUrl: 'views/home.html',
                    controller: 'homeCtrl',
                    controllerAs: 'ctrl'
                }
            },
            params: {
                menu: MENU.FULL
            }
        })
        .state('app.home', {
            url: '/home',
            views: {
                'homeContent': {
                    templateUrl: 'views/menu.html',
                    controller: 'menuCtrl',
                    controllerAs: 'mc'
                }
            }
        })
        .state('app.overview', {
            url: '/overview',
            views: {
                'homeContent': {
                    templateUrl: 'views/overview.html',
                    controller: 'overviewCtrl',
                    controllerAs: 'oc'
                }
            },
            params: {
                state: HOMEMODE.ALL
            }
        })
        .state('app.meeting', {
            url: '/meeting',
            views: {
                'homeLeftContent': {
                    templateUrl: 'views/meeting.status.html',
                    controller: 'meetingStatusCtrl',
                    controllerAs: 'msc'
                },
                'homeRightContent': {
                    // templateUrl: 'views/meeting.html', TODO: implement resp mobile meeting view
                    // controller: 'meetingCtrl',
                    // controllerAs: 'mc'
                }
            },
            params: {
                menu: MENU.FULL,
                meetingItem: null
            }
        })
        .state('app.signitem', {
            url: '/signitem',
            views: {
                'homeContent': {
                    templateUrl: 'views/signitem.html',
                    controller: 'signitemCtrl',
                    controllerAs: 'sc'
                }
            }
        });
    }
    else {
        /* DESKTOP States and routings */
        $stateProvider
        .state('app', {
            url: '',
            abstract: true,
            views: {
                'appView' :{
                    templateUrl: 'views/home.html',
                    controller: 'homeCtrl',
                    controllerAs: 'ctrl'
                }
            },
            params: {
                menu: MENU.CLOSED
            }
        })
        .state('app.home', {
            url: '/home',
            views: {
                'homeLeftContent': {
                    templateUrl: '',
                    controller: '',
                    controllerAs: ''
                },
                'homeRightContent': {
                    templateUrl: 'views/overview.html',
                    controller: 'overviewCtrl',
                    controllerAs: 'oc'
                }
            }
        })
        .state('app.meeting', {
            url: '/meeting',
            views: {
                'homeLeftContent': {
                    templateUrl: 'views/meeting.status.html',
                    controller: 'meetingStatusCtrl',
                    controllerAs: 'msc'
                },
                'homeRightContent': {
                    templateUrl: 'views/meeting.html',
                    controller: 'meetingCtrl',
                    controllerAs: 'mc'
                }
            },
            params: {
                menu: MENU.FULL,
                meetingItem: null
            }
        })
        .state('app.signing', {
            url: '/signing',
            views: {
                'homeLeftContent': {
                    templateUrl: 'views/menu.html',
                    controller: 'menuCtrl',
                    controllerAs: 'mc'
                },
                'homeRightContent': {
                    templateUrl: 'views/signing.html',
                    controller: 'signingCtrl',
                    controllerAs: 'sc'
                }
            }
        });
    }

    /* COMMON states and routings to MOBILE and DESKTOP */

    if (ENV.app_env !== 'prod') {
       $stateProvider
        .state('app.login', {
            url: '/login',
            views: {
                'homeContent' :{
                    templateUrl: 'views/login.html',
                    controller: 'loginCtrl',
                    controllerAs: 'lc'
                }
            }
        });
    }

    $stateProvider
    .state('app.info', {
        url: '/info',
        views: {
            'homeContent': {
                templateUrl: 'views/info.html'
            }
        }
    });

   if (ENV.app_env === 'prod') {
        $urlRouterProvider.otherwise('/home');
    } else {
        $urlRouterProvider.otherwise('/login');
    }
}]);
