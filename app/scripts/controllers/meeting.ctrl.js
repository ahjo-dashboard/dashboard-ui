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
    .controller('meetingCtrl', ['$log', 'AhjoMeetingSrv', '$stateParams', '$rootScope', '$scope', '$state', 'CONST', 'StorageSrv', 'AttachmentData', 'ListData', function ($log, AhjoMeetingSrv, $stateParams, $rootScope, $scope, $state, CONST, StorageSrv, AttachmentData, ListData) {
        $log.debug("meetingCtrl: CONTROLLER");
        var self = this;
        var isMobile = $rootScope.isMobile;
        self.upperUrl = {};
        self.lowerUrl = {};
        self.error = null;
        self.topic = StorageSrv.get(CONST.KEY.TOPIC);
        self.blockMode = CONST.BLOCKMODE.BOTH;
        self.lowerBlockMode = CONST.LOWERBLOCKMODE.PROPOSALS;
        self.header = '';
        $rootScope.menu = $stateParams.menu;

        self.topicData = null;
        self.attachmentData = null;
        self.decisionData = null;
        self.additionalMaterialData = null;

        function setData(topic) {
            if (topic instanceof Object) {
                self.header = topic.topicTitle;
                if (topic.esitykset instanceof Array) {
                    var item = topic.esitykset[0];
                    if (item instanceof Object) {
                        self.topicData = AttachmentData.create((item.documentTitle ? item.documentTitle : 'STR_TOPIC'), item.link);
                    }
                }

                self.lowerUrl = {};
                self.upperUrl = (self.topicData && self.topicData.link) ? self.topicData.link : {};

                self.attachmentData = ListData.createAttachmentList('STR_ATTACHMENTS', topic.attachment);
                self.decisionData = ListData.createDecisionList('STR_DECISION_HISTORY', topic.decision);
                self.additionalMaterialData = ListData.createAdditionalMaterialList('STR_ADDITIONAL_MATERIAL', topic.additionalMaterial);
            }
            else {
                self.lowerUrl = {};
                self.upperUrl = {};
            }
        }

        self.upperClicked = function () {
            self.blockMode = (self.blockMode === CONST.BLOCKMODE.BOTH || self.blockMode === CONST.BLOCKMODE.LOWER) ? CONST.BLOCKMODE.UPPER : CONST.BLOCKMODE.BOTH;
        };

        self.lowerClicked = function () {
            self.blockMode = (self.blockMode === CONST.BLOCKMODE.BOTH || self.blockMode === CONST.BLOCKMODE.UPPER) ? CONST.BLOCKMODE.LOWER : CONST.BLOCKMODE.BOTH;
        };

        self.topicClicked = function () {
            if (isMobile) {
                StorageSrv.set(CONST.KEY.LISTPDF_DATA, self.topicData);
                $state.go(CONST.APPSTATE.TOPIC);
            }
            else {

            }
        };

        self.attachmentClicked = function (attachment) {
            self.lowerBlockMode = CONST.LOWERBLOCKMODE.ATTACHMENTS;
            if (isMobile) {
                StorageSrv.set(CONST.KEY.SELECTION_DATA, self.attachmentData);
                $state.go(CONST.APPSTATE.LIST);
            }
            else if (attachment instanceof Object) {
                self.lowerUrl = attachment.link ? attachment.link : {};
            }
        };

        self.decisionClicked = function (decision) {
            self.lowerBlockMode = CONST.LOWERBLOCKMODE.MATERIALS;
            if (isMobile) {
                StorageSrv.set(CONST.KEY.SELECTION_DATA, self.decisionData);
                $state.go(CONST.APPSTATE.LIST);
            }
            else if (decision instanceof Object) {
                self.lowerUrl = decision.link ? decision.link : {};
            }
        };

        self.additionalMaterialClicked = function (material) {
            self.lowerBlockMode = CONST.LOWERBLOCKMODE.MATERIALS;
            if (isMobile) {
                StorageSrv.set(CONST.KEY.SELECTION_DATA, self.additionalMaterialData);
                $state.go(CONST.APPSTATE.LIST);
            }
            else if (material instanceof Object) {
                self.lowerUrl = material.link ? material.link : {};
            }
        };

        self.proposalsClicked = function () {
            self.lowerBlockMode = CONST.LOWERBLOCKMODE.PROPOSALS;
            if (isMobile) {
                $state.go(CONST.APPSTATE.LISTPROPOSALS);
            }
        };

        self.isBothMode = function () {
            return self.blockMode === CONST.BLOCKMODE.BOTH;
        };

        self.isUpperMode = function () {
            return self.blockMode === CONST.BLOCKMODE.UPPER;
        };

        self.isLowerMode = function () {
            return self.blockMode === CONST.BLOCKMODE.LOWER;
        };

        self.isSecret = function (item) {
            return (item && item.publicity) ? (item.publicity === CONST.PUBLICITY.SECRET) : false;
        };

        self.showEmbeddedFile = function (url) {
            return (self.isUrlString(url) && self.lowerBlockMode !== CONST.LOWERBLOCKMODE.PROPOSALS) ? true : false;
        };

        self.isProposalsActive = function () {
            return self.lowerBlockMode === CONST.LOWERBLOCKMODE.PROPOSALS;
        };

        self.isAttachmentsActive = function () {
            return self.lowerBlockMode === CONST.LOWERBLOCKMODE.ATTACHMENTS;
        };

        self.isMaterialsActive = function () {
            return self.lowerBlockMode === CONST.LOWERBLOCKMODE.MATERIALS;
        };

        self.isUrlString = function (url) {
            return (url && (typeof url === "string") && url.length) ? true : false;
        };

        $scope.$watch(
            // This function returns the value being watched. It is called for each turn of the $digest loop
            function () {
                return StorageSrv.get(CONST.KEY.TOPIC);
            },
            function (newTopic, oldTopic) {
                if (newTopic !== oldTopic) {
                    self.topic = newTopic;
                    setData(self.topic);
                }
            }
            );

        $scope.$on('$destroy', function () {
            $log.debug("meetingCtrl: DESTROY");
        });

        setData(self.topic);
    }]);
