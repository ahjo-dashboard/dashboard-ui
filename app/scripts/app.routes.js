/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';
angular.module('dashboard')
.config(function($urlRouterProvider, $stateProvider, ENV) {

    /* States and routings */
    $stateProvider
    .state('app', {
        url: '',
        abstract: true,
        views: {
            'leftSidebar@app': {
                templateUrl: 'views/menu.html',
                controller: 'menuCtrl',
                controllerAs: 'mc'
            },
            'appView' :{
                templateUrl: 'views/app.html',
                controller: 'appCtrl',
                controllerAs: 'ac'
            },
            'rightSidebar@app': {
                templateUrl: 'views/filehistory.html',
                controller: 'filehistoryCtrl',
                controllerAs: 'hc'
            }
        }
    })
    .state('app.signing', {
        url: '/signing',
        views: {
            'mainContent': {
                templateUrl: 'views/signing.html',
                controller: 'SigningCtrl',
                controllerAs: 'sc'
            }
        }
    })
    .state('app.signitem', {
        url: '/signitem',
        views: {
            'mainContent': {
                templateUrl: 'views/signitem.html',
                controller: 'SignitemCtrl',
                controllerAs: 'sic'
            }
        },
        params: {
            signItem: null
        }
    })
    .state('app.overview', {
        url: '/overview',
        views: {
            'mainContent': {
                templateUrl: 'views/overview.html',
                controller: 'overviewCtrl',
                controllerAs: 'oc'
            }
        }
    })
    .state('app.meetingList', {
        url: '/meetinglist',
        views: {
            'mainContent': {
                templateUrl: 'views/meetinglist.html',
                controller: 'meetingListCtrl',
                controllerAs: 'mlc'
            }
        }
    })
    .state('app.meeting', {
        url: '/meeting',
        params: { meetingItem: null, agendaItem: null },
        views: {
            'mainContent': {
                templateUrl: 'views/meeting.html',
                controller: 'meetingCtrl',
                controllerAs: 'mc'
            }
        }
    });

    if (ENV.app_env === 'prod') {
        // In some cases this causes unwanted switch to overview
        // $urlRouterProvider.otherwise( function($injector) {
        //     var $state = $injector.get('$state');
        //       $state.go('app.overview');
        // });
        $urlRouterProvider.otherwise('/overview');
    }
    else {
        $stateProvider
        .state('app.login', {
            url: '/login',
            views: {
                'mainContent' :{
                    templateUrl: 'views/login.html',
                    controller: 'loginCtrl',
                    controllerAs: 'lc'
                }
            }
        });

        $urlRouterProvider.otherwise('/login');
    }
});
