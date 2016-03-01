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
.controller('meetingCtrl',['$log','AhjoMeetingSrv','$stateParams','$rootScope','$scope','$state','MENU','BLOCKMODE','StorageSrv', 'APPSTATE','KEY','$translate','PUBLICITY','BTNTYPE', function ($log, AhjoMeetingSrv, $stateParams, $rootScope, $scope, $state, MENU, BLOCKMODE, StorageSrv, APPSTATE, KEY, $translate, PUBLICITY, BTNTYPE) {
    $log.debug("meetingCtrl: CONTROLLER");
    var self = this;
    var isMobile = $rootScope.mobile;
    self.upperUrl = {};
    self.lowerUrl = {};
    self.error = null;
    self.topic = StorageSrv.get(KEY.TOPIC);
    self.blockMode = BLOCKMODE.BOTH;
    self.header = '';
    $rootScope.menu = $stateParams.menu;

    self.topicData = null;
    self.attachmentData = null;
    self.decisionData = null;
    self.additionalMaterialData = null;

    function setData(topic) {
        if (topic instanceof Object) {
            self.header = topic.topicTitle;
            var topicObject = {};
            if (topic.esitykset instanceof Array) {
                var item = topic.esitykset[0];
                if (item instanceof Object) {
                    topicObject = {
                        title: item.documentTitle ? item.documentTitle : 'STR_TOPIC',
                        link: item.link ? item.link : {},
                        type: item.type
                    };
                }
            }

            self.topicData = topicObject;
            self.upperUrl = (self.topicData && self.topicData.link) ? self.topicData.link : {};

            var attachmentArray = [];
            for (var i = 0; (topic.attachment && i < topic.attachment.length); i++) {
                attachmentArray.push({
                    title: topic.attachment[i].attachmentTitle,
                    link: topic.attachment[i].link,
                    publicity: topic.attachment[i].publicity,
                    buttonType: BTNTYPE.PRIMARY
                });
            }
            self.attachmentData = {title: 'STR_ATTACHMENTS', objects: attachmentArray};

            var decisionArray = [];
            for (var j = 0; (topic.decision && j < topic.decision.length); j++) {
                decisionArray.push({
                    title: topic.decision[j].decisionTitle,
                    link: topic.decision[j].link,
                    publicity: topic.decision[j].publicity,
                    buttonType: BTNTYPE.PRIMARY
                });
            }
            self.decisionData = {title: 'STR_DECISION_HISTORY', objects: decisionArray};

            var additionalMaterialArray = [];
            for (var k = 0; (topic.additionalMaterial && k < topic.additionalMaterial.length); k++) {
                additionalMaterialArray.push({
                    title: topic.additionalMaterial[k].additionalMaterialTitle,
                    link: topic.additionalMaterial[k].link,
                    publicity: topic.additionalMaterial[k].publicity,
                    buttonType: BTNTYPE.PRIMARY
                });
            }
            self.additionalMaterialData = {title: 'STR_ADDITIONAL_MATERIAL', objects: additionalMaterialArray};
        }
        else {
            self.upperUrl = {};
        }
    }

    self.upperClicked = function() {
        self.blockMode = (self.blockMode === BLOCKMODE.BOTH || self.blockMode === BLOCKMODE.LOWER) ? BLOCKMODE.UPPER : BLOCKMODE.BOTH;
    };

    self.lowerClicked = function() {
        self.blockMode = (self.blockMode === BLOCKMODE.BOTH || self.blockMode === BLOCKMODE.UPPER) ? BLOCKMODE.LOWER : BLOCKMODE.BOTH;
    };

    self.topicClicked = function() {
        if (isMobile) {
            StorageSrv.set(KEY.LISTPDF_DATA, self.topicData);
            $state.go(APPSTATE.TOPIC);
        }
        else {

        }
    };

    self.attachmentClicked = function(attachment) {
        if (isMobile) {
            StorageSrv.set(KEY.SELECTION_DATA, self.attachmentData);
            $state.go(APPSTATE.LIST);
        }
        else if (attachment instanceof Object) {
            self.lowerUrl = attachment.link ? attachment.link : {};
        }
    };

    self.decisionClicked = function(decision) {
        if (isMobile) {
            StorageSrv.set(KEY.SELECTION_DATA, self.decisionData);
            $state.go(APPSTATE.LIST);
        }
        else if (decision instanceof Object) {
            self.lowerUrl = decision.link ? decision.link : {};
        }
    };

    self.additionalMaterialClicked = function(material) {
        if (isMobile) {
            StorageSrv.set(KEY.SELECTION_DATA, self.additionalMaterialData);
            $state.go(APPSTATE.LIST);
        }
        else if (material instanceof Object) {
            self.lowerUrl = material.link ? material.link : {};
        }
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
                setData(self.topic);
            }
        }
    );

    $scope.$on('$destroy', function() {
        $log.debug("meetingCtrl: DESTROY");
    });

    setData(self.topic);
}]);
