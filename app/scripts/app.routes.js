/**
* (c) 2016 Tieto Finland Oy
* Licensed under the MIT license.
*/
'use strict';
angular.module('dashboard')
.config(['$urlRouterProvider', '$stateProvider', 'ENV', function($urlRouterProvider, $stateProvider, ENV) {
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
                menu: true
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
        .state('app.meetings', {
            url: '/meetings',
            views: {
                'homeContent': {
                    templateUrl: 'views/meetinglist.html',
                    controller: 'meetingListCtrl',
                    controllerAs: 'mlc'
                }
            }
        })
        .state('app.signing', {
            url: '/signing',
            views: {
                'homeContent': {
                    templateUrl: 'views/signing.html',
                    controller: 'signingCtrl',
                    controllerAs: 'sc'
                }
            }
        })
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
        }
        else {
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

            $urlRouterProvider.otherwise('/login');
        }
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
                menu: false
            }
        })
        .state('app.home', {
            url: '/home',
            views: {
                'homeLeftContent': {
                    templateUrl: 'views/menu.html',
                    controller: 'menuCtrl',
                    controllerAs: 'mc'
                },
                'homeRightContent': {
                    templateUrl: 'views/overview.html',
                    controller: 'overviewCtrl',
                    controllerAs: 'oc'
                }
            }
        })
        .state('app.meetings', {
            url: '/meetings',
            views: {
                'homeLeftContent': {
                    templateUrl: 'views/menu.html',
                    controller: 'menuCtrl',
                    controllerAs: 'mc'
                },
                'homeRightContent': {
                    templateUrl: 'views/meetinglist.html',
                    controller: 'meetingListCtrl',
                    controllerAs: 'mlc'
                }
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

        if (ENV.app_env === 'prod') {
            $urlRouterProvider.otherwise('/home');
        }
        else {
            $stateProvider
            .state('app.login', {
                url: '/login',
                views: {
                    'homeRightContent' :{
                        templateUrl: 'views/login.html',
                        controller: 'loginCtrl',
                        controllerAs: 'lc'
                    }
                }
            });

            $urlRouterProvider.otherwise('/login');
        }
    }

}]);
