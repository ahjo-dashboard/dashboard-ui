/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
* @ngdoc function
* @name dashboard.controller:meetingStatusCtrl
* @description
* # meetingStatusCtrl
* Controller of the dashboard
*/
angular.module('dashboard')
.controller('meetingStatusCtrl',['$log','$scope','$rootScope','$stateParams','DEVICE','$state','MENU','StorageSrv','ENV', 'APPSTATE','TOPICSTATUS','MTGROLE','KEY','MEETINGSTATUS', function ($log, $scope, $rootScope, $stateParams, DEVICE, $state, MENU, StorageSrv, ENV, APPSTATE, TOPICSTATUS, MTGROLE, KEY, MEETINGSTATUS) {
    $log.debug("meetingStatusCtrl: CONTROLLER");
    var self = this;
    $rootScope.menu = $stateParams.menu;
    self.mobile = $rootScope.device === DEVICE.MOBILE;
    self.title = 'MOBILE TITLE';
    self.meeting = {};
    self.chairman = false;

    for (var i = 0; i < ENV.SupportedRoles.length; i++) {
        if (ENV.SupportedRoles[i].RoleID === MTGROLE.CHAIRMAN) {
            self.chairman = true;
        }
    }

    $scope.$watch(
        // This function returns the value being watched. It is called for each turn of the $digest loop
        function() {
            return StorageSrv.get(KEY.MEETING);
        },
        function(newObject, oldObject) {
            if (newObject !== oldObject) {
                self.meeting = newObject;
            }
        }
    );

    self.goHome = function() {
        $state.go(APPSTATE.HOME, {menu: MENU.CLOSED});
    };

    self.topicSelected = function(topic) {
        StorageSrv.set(KEY.TOPIC, topic);
    };

    self.isSelected = function(topic) {
        var selected = StorageSrv.get(KEY.TOPIC);
        if (topic instanceof Object && selected instanceof Object) {
            return (topic.topicGuid && topic.topicGuid === selected.topicGuid);
        }
        return false;
    };

    self.isPending = function(topic) {
        return (topic && topic.topicStatus === TOPICSTATUS.PENDING);
    };

    self.isActive = function(topic) {
        return (topic && topic.topicStatus === TOPICSTATUS.ACTIVE);
    };

    self.isAborted = function(topic) {
        return (topic && topic.topicStatus === TOPICSTATUS.ABORTED);
    };

    self.isReady = function(topic) {
        return (topic && topic.topicStatus === TOPICSTATUS.READY);
    };

    self.stringID = function(meeting) {
        for (var item in MEETINGSTATUS) {
            if( MEETINGSTATUS.hasOwnProperty(item) ) {
                if (meeting && meeting.meetingStatus && meeting.meetingStatus === MEETINGSTATUS[item].value) {
                    return MEETINGSTATUS[item].stringID;
                }
            }
        }
    };

    $scope.$on('$destroy', function() {
        $log.debug("meetingStatusCtrl: DESTROY");
    });

}]);
