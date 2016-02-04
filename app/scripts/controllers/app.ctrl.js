/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc function
 * @name dashboard.controller:AppCtrl
 * @description
 * # AppCtrl
 * Controller of the dashboard
 */
angular.module('dashboard')
.controller('appCtrl', function ($scope, $rootScope, $log, ENV) {
    var self  = this;
    self.navbarTitle = '';

    // PRIVATE
    function openMenu() {
        $scope.leftOpen = true;
    }

    function closeMenu() {
        $scope.leftOpen = false;
    }

    function setNavbarTitle(title) {
        self.navbarTitle = title;
    }

    // PUBLIC
    self.goBack = function() {
        window.history.back();
    };

    // ADD LISTENER
    var openListener = $rootScope.$on(ENV.Msg_Open_Menu, function (/*event, data*/) {
        $log.debug('appCtrl: Msg_Open_Menu:');
        openMenu();
    });

    var closeListener = $rootScope.$on(ENV.Msg_Close_Menu, function (/*event, data*/) {
        $log.debug('appCtrl: Msg_Close_Menu:');
        closeMenu();
    });

    var titleListener = $rootScope.$on(ENV.Msg_Navbar_Title, function(event, data) {
        $log.debug('appCtrl: Msg_Navbar_Title: ' +event.name);
        setNavbarTitle(data.title);
    });

    // REMOVE LISTENER
    $scope.$on('$destroy', openListener);
    $scope.$on('$destroy', closeListener);
    $scope.$on('$destroy', titleListener);
});
