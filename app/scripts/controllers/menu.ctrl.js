/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc function
 * @name dashboard.controller:MenuCtrl
 * @description
 * # MenuCtrl
 * Controller of the dashboard
 */
angular.module('dashboard')
.controller('menuCtrl', function ($state, $log, $stateParams, AhjoMeetingService, MessageService, ENV, $rootScope, $scope, $timeout, Device) {
  	$log.debug("menuCtrl: CONFIG");
    var self = this;
    self.state = $state.current.name;
    self.item = {};
    self.items = {
        // overview is the first key and signing is the last key
        overview : { name: 'Uusimmat', state : 'app.overview', pseudoState : '', meeting: {}, submenu : [] },
        signing : { name: 'Allekirjoitukset', state : 'app.signing', pseudoState : 'app.signitem', meeting: {}, submenu : [] },
        meetings : { name: 'Kokoukset', state : 'app.meetingList', pseudoState : 'app.meeting', meeting: {}, submenu : [] }
    };

    // PRIVATE FUNCTIONS
    function setMenuData(menu, items, meeting) {
        $log.log("menuCtrl: setMenuData");
        var item = self.items[menu];
        item.submenu = [];
        item.meeting = meeting ? meeting : {};
        // delays are for smooth and non-parallel animations
        $timeout(function() {
            item.submenu = items ? items : [];
            $timeout(function() {
                MessageService.send(ENV.Msg_Open_Menu, {});
            }, 200);
        }, 200);
    }

    function checkMenuState() {
        if (Device.current() === ENV.Device_Extra_Small) {
            $timeout(function() {
                MessageService.send(ENV.Msg_Close_Menu, {});
            }, 400);
        }
    }

    // PUBLIC FUNCTIONS
    self.menuItemSelected = function(item) {
        $log.log("menuCtrl: menuItemSelected");
        self.item = {};
        $state.go(item.state);
        checkMenuState();
    };

    self.submenuItemSelected = function(item) {
        $log.log("menuCtrl: submenuItemSelected");
        self.item = item;
        $state.go('app.meeting', {'agendaItem': item});
        checkMenuState();
    };

    // ADD LISTENER
    var msgListener = $rootScope.$on(ENV.Msg_Meeting_Selection, function(event, data) {
        $log.debug("menuCtrl: " +event.name);
        setMenuData('meetings', data.agendaItems, data.meetingItem);
    });

    var stateListener = $rootScope.$on('$stateChangeSuccess', function (event, next/*, toParams, fromParams*/) {
		$log.debug('menuCtrl: stateChangeSuccess: ' +next.name);
        self.state = next.name;
	});

    // REMOVE LISTENER
    $scope.$on('$destroy', msgListener);
    $scope.$on('$destroy', stateListener);

});
