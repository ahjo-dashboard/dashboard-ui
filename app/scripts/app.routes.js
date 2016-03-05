/**
* (c) 2016 Tieto Finland Oy
* Licensed under the MIT license.
*/
'use strict';
angular.module('dashboard')
    .config(['$urlRouterProvider', '$stateProvider', 'ENV', 'CONST', function ($urlRouterProvider, $stateProvider, ENV, CONST) {
        var device = angular.element('#device');

        if (device && device.css('min-width') === '320px') {
            /* MOBILE States and routings */
            $stateProvider
                .state(CONST.APPSTATE.APP, {
                    url: '',
                    abstract: true,
                    views: {
                        'appView': {
                            templateUrl: 'views/home.html',
                            controller: 'homeCtrl',
                            controllerAs: 'ctrl'
                        }
                    },
                    params: {
                        menu: CONST.MENU.CLOSED
                    }
                })
                .state(CONST.APPSTATE.HOME, {
                    url: '/home',
                    views: {
                        'homeContent': {
                            templateUrl: 'views/menu.html',
                            controller: 'menuCtrl',
                            controllerAs: 'mc'
                        }
                    }
                })
                .state(CONST.APPSTATE.OVERVIEW, {
                    url: '/overview',
                    views: {
                        'homeContent': {
                            templateUrl: 'views/overview.html',
                            controller: 'overviewCtrl',
                            controllerAs: 'oc'
                        }
                    },
                    params: {
                        state: CONST.HOMEMODE.ALL
                    }
                })
                .state(CONST.APPSTATE.MEETING, {
                    url: '/meeting',
                    views: {
                        'homeContent': {
                            templateUrl: 'views/meeting.status.html',
                            controller: 'meetingStatusCtrl',
                            controllerAs: 'msc'
                        }
                    },
                    params: {
                        menu: CONST.MENU.CLOSED,
                        meetingItem: null
                    }
                })
                .state(CONST.APPSTATE.MEETINGDETAILS, {
                    url: '/details',
                    views: {
                        'detailsContent': {
                            templateUrl: 'views/meeting.html',
                            controller: 'meetingCtrl',
                            controllerAs: 'ctrl'
                        }
                    }
                })
                .state(CONST.APPSTATE.TOPIC, {
                    url: '/topic',
                    views: {
                        'childContent': {
                            templateUrl: 'views/attachment.html',
                            controller: 'attachmentCtrl',
                            controllerAs: 'ctrl'
                        }
                    }
                })
                .state(CONST.APPSTATE.LIST, {
                    url: '/list',
                    views: {
                        'childContent': {
                            templateUrl: 'views/list.html',
                            controller: 'listCtrl',
                            controllerAs: 'ctrl'
                        }
                    }
                })
                .state(CONST.APPSTATE.LISTATTACHMENT, {
                    url: '/attachment',
                    views: {
                        'listContent': {
                            templateUrl: 'views/attachment.html',
                            controller: 'attachmentCtrl',
                            controllerAs: 'ctrl'
                        }
                    }
                })
                .state(CONST.APPSTATE.LISTPROPOSALS, {
                    url: '/proposals',
                    views: {
                        'listContent': {
                            templateUrl: 'views/proposals.html',
                            controller: 'proposalsCtrl',
                            controllerAs: 'ctrl'
                        }
                    }
                })
                .state(CONST.APPSTATE.SIGNITEM, {
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
                .state(CONST.APPSTATE.APP, {
                    url: '',
                    abstract: true,
                    views: {
                        'appView': {
                            templateUrl: 'views/home.html',
                            controller: 'homeCtrl',
                            controllerAs: 'ctrl'
                        }
                    },
                    params: {
                        menu: CONST.MENU.CLOSED
                    }
                })
                .state(CONST.APPSTATE.HOME, {
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
                .state(CONST.APPSTATE.MEETING, {
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
                        menu: CONST.MENU.FULL,
                        meetingItem: null
                    }
                })
                .state(CONST.APPSTATE.SIGNITEM, {
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
                .state(CONST.APPSTATE.LOGIN, {
                    url: '/login',
                    views: {
                        'homeContent': {
                            templateUrl: 'views/login.html',
                            controller: 'loginCtrl',
                            controllerAs: 'lc'
                        }
                    }
                });
        }

        $stateProvider
            .state(CONST.APPSTATE.INFO, {
                url: '/info',
                views: {
                    'homeContent': {
                        templateUrl: 'views/info.html'
                    }
                }
            })
            .state(CONST.APPSTATE.ERROR, {
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
