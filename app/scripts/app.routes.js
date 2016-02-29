/**
* (c) 2016 Tieto Finland Oy
* Licensed under the MIT license.
*/
'use strict';
angular.module('dashboard')
.config(['$urlRouterProvider','$stateProvider','ENV','MENU', 'HOMEMODE', 'APPSTATE', function($urlRouterProvider, $stateProvider, ENV, MENU, HOMEMODE, APPSTATE) {
    var device = angular.element('#device');

    if (device && device.css('min-width') === '320px') {
        /* MOBILE States and routings */
        $stateProvider
        .state(APPSTATE.APP, {
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
        .state(APPSTATE.HOME, {
            url: '/home',
            views: {
                'homeContent': {
                    templateUrl: 'views/menu.html',
                    controller: 'menuCtrl',
                    controllerAs: 'mc'
                }
            }
        })
        .state(APPSTATE.OVERVIEW, {
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
        .state(APPSTATE.MEETING, {
            url: '/meeting',
            views: {
                'homeContent': {
                    templateUrl: 'views/meeting.status.html',
                    controller: 'meetingStatusCtrl',
                    controllerAs: 'msc'
                }
            },
            params: {
                menu: MENU.CLOSED,
                meetingItem: null
            }
        })
        .state(APPSTATE.MEETINGDETAILS, {
            url: '/details',
            views: {
                'detailsContent': {
                    templateUrl: 'views/meeting.html',
                    controller: 'meetingCtrl',
                    controllerAs: 'ctrl'
                }
            }
        })
        .state(APPSTATE.TOPIC, {
            url: '/topic',
            views: {
                'childContent': {
                    templateUrl: 'views/pdf.html',
                    controller: 'pdfCtrl',
                    controllerAs: 'ctrl'
                }
            }
        })
        .state(APPSTATE.LIST, {
            url: '/list',
            views: {
                'childContent': {
                    templateUrl: 'views/list.html',
                    controller: 'listCtrl',
                    controllerAs: 'ctrl'
                }
            }
        })
        .state(APPSTATE.LISTPDF, {
            url: '/pdf',
            views: {
                'listContent': {
                    templateUrl: 'views/pdf.html',
                    controller: 'pdfCtrl',
                    controllerAs: 'ctrl'
                }
            }
        })
        .state(APPSTATE.SIGNITEM, {
            url: '/signitem',
            views: {
                'homeContent': {
                    templateUrl: 'views/signitem.html',
                    controller: 'signitemCtrl',
                    controllerAs: 'sc'
                }
            },
            params: {
                signItem: null
            }
        });
    }
    else {
        /* DESKTOP States and routings */
        $stateProvider
        .state(APPSTATE.APP, {
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
        .state(APPSTATE.HOME, {
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
        .state(APPSTATE.MEETING, {
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
                    controllerAs: 'ctrl'
                }
            },
            params: {
                menu: MENU.FULL,
                meetingItem: null
            }
        })
        .state(APPSTATE.SIGNITEM, {
            url: '/signitem',
            views: {
                'homeContent': {
                    templateUrl: 'views/signitem.html',
                    controller: 'signitemCtrl',
                    controllerAs: 'sc'
                }
            },
            params: {
                signItem: null
            }
        });
    }

    /* COMMON states and routings to MOBILE and DESKTOP */

    if (ENV.app_env !== 'prod') {
       $stateProvider
        .state(APPSTATE.LOGIN, {
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
    .state(APPSTATE.INFO, {
        url: '/info',
        views: {
            'homeContent': {
                templateUrl: 'views/info.html'
            }
        }
    })
    .state(APPSTATE.ERROR, {
        url: '/error',
        views: {
            'appView': {
                templateUrl: 'views/error.html'
            }
        }
    });

   if (ENV.app_env === 'prod') {
        $urlRouterProvider.otherwise('/home');
    } else {
        $urlRouterProvider.otherwise('/login');
    }
}]);
