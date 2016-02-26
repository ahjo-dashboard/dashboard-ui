/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc function
 * @name dashboard.controller:MeetingCtrl
 * @description
 * # MeetingCtrl
 * Controller of the dashboard
 */
angular.module('dashboard')
.controller('meetingCtrl',['$log','AhjoMeetingSrv','$stateParams','$rootScope','$scope','$state','MENU','BLOCKMODE','StorageSrv', 'APPSTATE','KEY','$translate','PUBLICITY', function ($log, AhjoMeetingSrv, $stateParams, $rootScope, $scope, $state, MENU, BLOCKMODE, StorageSrv, APPSTATE, KEY, $translate, PUBLICITY) {
    $log.debug("meetingCtrl: CONTROLLER");
    var self = this;
    self.mobile = $rootScope.isScreenXs();
    self.upperUrl = {};
    self.lowerUrl = {};
    self.error = null;
    self.topic = null;
    self.blockMode = BLOCKMODE.BOTH;
    self.proposalTitle = null;
    self.otherMaterialTitle = null;
    self.decisionTitle = null;
    $rootScope.menu = $stateParams.menu;

    $translate('STR_PROPOSALS').then(function (title) {
        self.proposalTitle = title;
    });

    $translate('STR_OTHER_MATERIAL').then(function (title) {
        self.otherMaterialTitle = title;
    });

    $translate('STR_DECISION_HISTORY').then(function (title) {
        self.decisionTitle = title;
    });

    self.upperClicked = function() {
        self.blockMode = (self.blockMode === BLOCKMODE.BOTH || self.blockMode === BLOCKMODE.LOWER) ? BLOCKMODE.UPPER : BLOCKMODE.BOTH;
    };

    self.lowerClicked = function() {
        self.blockMode = (self.blockMode === BLOCKMODE.BOTH || self.blockMode === BLOCKMODE.UPPER) ? BLOCKMODE.LOWER : BLOCKMODE.BOTH;
    };

    self.attachmentClicked = function(attachment) {
        self.lowerUrl = (attachment && attachment.link) ? attachment.link : {};
    };

    self.decisionClicked = function(decision) {
        self.lowerUrl = (decision && decision.link) ? decision.link : {};
    };

    self.additionalMaterial = function(material) {
        self.lowerUrl = (material && material.link) ? material.link : {};
    };

    self.isBothMode = function() {
        return self.blockMode === BLOCKMODE.BOTH;
    };

    self.isUpperMode = function() {
        return self.blockMode === BLOCKMODE.UPPER;
    };

    self.isLowerMode = function() {
        return self.blockMode === BLOCKMODE.LOWER;
    };

    self.isSecret = function(item) {
        return (item && item.publicity) ? (item.publicity === PUBLICITY.SECRET) : false;
    };

    self.isUrlString = function(url) {
        return (url && (typeof url === "string") && url.length) ? true : false;
    };

    $scope.$watch(
        // This function returns the value being watched. It is called for each turn of the $digest loop
        function() {
            return StorageSrv.get(KEY.TOPIC);
        },
        function(newTopic, oldTopic) {
            if (newTopic !== oldTopic) {
                self.topic = newTopic;
                if (self.topic && self.topic.esitykset[0]) {
                    var link = self.topic.esitykset[0].link;
                    self.upperUrl = link ? link : {};
                }
                else {
                    self.upperUrl = {};
                }
            }
        }
    );

    $scope.$on('$destroy', function() {
        $log.debug("meetingCtrl: DESTROY");
    });

}]);
