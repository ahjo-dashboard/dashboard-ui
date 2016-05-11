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
    .controller('meetingCtrl', ['$log', 'AhjoMeetingSrv', '$rootScope', '$scope', '$state', 'CONST', 'StorageSrv', 'AttachmentData', 'ListData', 'PROPS', function ($log, AhjoMeetingSrv, $rootScope, $scope, $state, CONST, StorageSrv, AttachmentData, ListData, PROPS) {
        $log.debug("meetingCtrl: CONTROLLER");
        var self = this;
        var isMobile = $rootScope.isMobile;
        self.upperUrl = null;
        self.lowerUrl = null;
        self.error = null;
        self.topic = null;
        self.blockMode = CONST.BLOCKMODE.BOTH;
        self.lbms = CONST.LOWERBLOCKMODE;
        self.lbm = CONST.LOWERBLOCKMODE.PROPOSALS;
        self.header = '';
        $rootScope.menu = CONST.MENU.FULL;
        self.hide = false;

        self.tData = null;
        self.aData = null;
        self.dData = null;
        self.amData = null;

        self.propCount = null;
        self.linkConfig = {
            title: 'STR_TOPIC_DOWNLOAD',
            class: 'btn btn-info btn-lg btn-block wrap-button-text db-btn-prim'
        };
        self.unsavedConfig = { title: 'STR_CONFIRM', text: 'STR_WARNING_UNSAVED', yes: 'STR_CONTINUE' };
        self.isEditing = false;

        var attachmentDropdownOpen = false;
        var materialsDropdownOpen = false;
        var isIe = $rootScope.isIe;

        function setLowerBlockMode(mode) {
            self.lbm = mode;
        }

        function setData(topic) {
            self.topic = null;
            self.aData = null;
            self.tData = null;
            self.dData = null;
            self.lowerUrl = null;
            self.upperUrl = null;

            if (angular.isObject(topic)) {
                self.topic = topic;
                self.header = topic.topicTitle;
                if (angular.isArray(topic.esitykset)) {
                    var item = topic.esitykset[0];
                    if (angular.isObject(item)) {
                        $log.debug("meetingCtrl.setData: esitys publicity=" + item.publicity);
                        self.tData = AttachmentData.create(
                            ((angular.isString(item.documentTitle) && item.documentTitle.length) ? item.documentTitle : 'STR_TOPIC'), item.link, item.publicity);
                    }
                }

                self.upperUrl = (self.tData && self.tData.link) ? self.tData.link : {};

                self.aData = ListData.createAttachmentList('STR_ATTACHMENTS', topic.attachment);
                self.dData = ListData.createDecisionList('STR_DECISION_HISTORY', topic.decision);
                self.amData = ListData.createAdditionalMaterialList('STR_ADDITIONAL_MATERIAL', topic.additionalMaterial);
            }
        }

        function checkMode() {
            if (!isMobile && self.isUpperMode()) {
                self.blockMode = CONST.BLOCKMODE.BOTH;
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
                StorageSrv.setKey(CONST.KEY.LISTPDF_DATA, self.tData);
                $state.go(CONST.APPSTATE.TOPIC);
            }
        };

        self.attachmentClicked = function (attachment) {
            setLowerBlockMode(CONST.LOWERBLOCKMODE.ATTACHMENTS);
            if (isMobile) {
                StorageSrv.setKey(CONST.KEY.SELECTION_DATA, self.aData);
                $state.go(CONST.APPSTATE.LIST);
            }
            else if (attachment instanceof Object) {
                self.lowerUrl = attachment.link ? attachment.link : {};
            }
            checkMode();
        };

        self.decisionClicked = function (decision) {
            setLowerBlockMode(CONST.LOWERBLOCKMODE.MATERIALS);
            if (isMobile) {
                StorageSrv.setKey(CONST.KEY.SELECTION_DATA, self.dData);
                $state.go(CONST.APPSTATE.LIST);
            }
            else if (decision instanceof Object) {
                self.lowerUrl = decision.link ? decision.link : {};
            }
            checkMode();
        };

        self.additionalMaterialClicked = function (material) {
            setLowerBlockMode(CONST.LOWERBLOCKMODE.MATERIALS);
            if (isMobile) {
                StorageSrv.setKey(CONST.KEY.SELECTION_DATA, self.amData);
                $state.go(CONST.APPSTATE.LIST);
            }
            else if (material instanceof Object) {
                self.lowerUrl = material.link ? material.link : {};
            }
            checkMode();
        };

        self.proposalsClicked = function () {
            setLowerBlockMode(CONST.LOWERBLOCKMODE.PROPOSALS);
            if (isMobile) {
                $state.go(CONST.APPSTATE.LISTPROPOSALS);
            }
            checkMode();
        };

        self.remarkClicked = function () {
            $log.debug("meetingCtrl: remarkClicked");
            setLowerBlockMode(CONST.LOWERBLOCKMODE.REMARK);
            checkMode();
        };

        self.aToggled = function (open) {
            attachmentDropdownOpen = open;
            self.hide = (attachmentDropdownOpen || materialsDropdownOpen) && isIe;
        };

        self.mToggled = function (open) {
            materialsDropdownOpen = open;
            self.hide = (attachmentDropdownOpen || materialsDropdownOpen) && isIe;
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
            return self.isUrlString(url) && !self.isActive(CONST.LOWERBLOCKMODE.PROPOSALS);
        };

        self.isActive = function (mode) {
            return self.lbm === mode;
        };

        self.isUrlString = function (url) {
            return angular.isString(url) && url.length;
        };

        self.materialCount = function () {
            var decisionCount = ((self.dData instanceof Object) && (self.dData.objects instanceof Array)) ? self.dData.objects.length : 0;
            var additionalMaterialCount = ((self.amData instanceof Object) && (self.amData.objects instanceof Array)) ? self.amData.objects.length : 0;
            return decisionCount + additionalMaterialCount;
        };

        $scope.$watch(function () {
            return StorageSrv.getKey(CONST.KEY.TOPIC);
        }, function (topic, oldTopic) {
            if (!angular.equals(topic, oldTopic)) {
                setData(topic);
            }
        });

        var proposalCountWatcher = $rootScope.$on(PROPS.COUNT, function (event, data) {
            self.propCount = (data instanceof Object) ? data.published : null;
        });

        var isEditingWatcher = $rootScope.$on(CONST.PROPOSALISEDITING, function (event, isEditing) {
            self.isEditing = isEditing;
        });

        $scope.$on('$destroy', isEditingWatcher);
        $scope.$on('$destroy', proposalCountWatcher);

        $scope.$on('$destroy', function () {
            $log.debug("meetingCtrl: DESTROY");
        });

        setData(StorageSrv.getKey(CONST.KEY.TOPIC));
    }]);
