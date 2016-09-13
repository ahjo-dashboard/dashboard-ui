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
    .controller('meetingDetailsCtrl', ['$log', '$rootScope', '$scope', '$state', 'CONST', 'StorageSrv', 'AttachmentData', 'ListData', 'PROPS', 'Utils', '$timeout', function ($log, $rootScope, $scope, $state, CONST, StorageSrv, AttachmentData, ListData, PROPS, Utils, $timeout) {
        $log.debug("meetingDetailsCtrl: CONTROLLER");
        var self = this;
        self.isMobile = $rootScope.isMobile;
        var isTablet = $rootScope.isTablet;
        var mtgRole = StorageSrv.getKey(CONST.KEY.MEETING_ROLE);
        self.primaryUrl = null;
        self.secondaryUrl = null;
        self.error = null;
        self.topic = null;
        self.bms = CONST.BLOCKMODE;
        self.bm = CONST.BLOCKMODE.DEFAULT; // State of view, which block(s) displayed
        self.pms = CONST.PRIMARYMODE;
        self.pm = CONST.PRIMARYMODE.DEFAULT; // State of primary view block
        self.sms = CONST.SECONDARYMODE;
        self.sm = CONST.SECONDARYMODE.PROPOSALS; // State of secondary view block
        self.header = null;
        $rootScope.menu = CONST.MENU.FULL;
        self.selData = null;

        self.tData = null;
        self.aData = null;
        self.dData = null;
        self.amData = null;
        self.activeData = null;

        self.unsavedConfig = { title: 'STR_CONFIRM', text: 'STR_WARNING_UNSAVED', yes: 'STR_CONTINUE' };
        self.hasUnsavedProposal = false;
        self.remarkIsUnsaved = false;
        self.isChairman = false;

        self.storedDocuments = null;

        function storedDataIndex(data) {
            var index = CONST.NOTFOUND;
            if (angular.isObject(data)) {
                for (var i = 0; angular.isArray(self.storedDocuments) && i < self.storedDocuments.length && index === CONST.NOTFOUND; i++) {
                    var doc = self.storedDocuments[i];
                    if (angular.isObject(doc) && angular.equals(data.link, doc.link)) {
                        index = i;
                    }
                }
            }
            else {
                $log.error("meetingDetailsCtrl: storedDataIndex invalid parameter");
            }
            return index;
        }

        function storeDocument(data) {
            if (!angular.isObject(data)) {
                $log.error("meetingDetailsCtrl: storeDocument invalid parameter");
                return;
            }
            if (!angular.isArray(self.storedDocuments)) {
                self.storedDocuments = [];
            }
            var index = storedDataIndex(data);
            if (index > CONST.NOTFOUND) {
                self.storedDocuments.splice(index, 1);
            }
            else {
                self.storedDocuments.splice(0, 0, data);
            }
        }

        function setBlockMode(mode) {
            self.bm = self.isMobile ? CONST.BLOCKMODE.SECONDARY : mode;
        }

        function setPrimaryMode() {
            var secret = self.isSecret(self.activeData);
            if (self.isMobile) {
                self.pm = CONST.PRIMARYMODE.HIDDEN;
            }
            else if (isTablet) {
                if (secret) {
                    self.pm = CONST.PRIMARYMODE.SECRET;
                }
                else {
                    self.pm = CONST.PRIMARYMODE.HIDDEN;
                }
            }
            else if (secret) {
                self.pm = CONST.PRIMARYMODE.SECRET;
            }
            else {
                self.pm = CONST.PRIMARYMODE.DEFAULT;
            }
            $rootScope.$emit(CONST.MEETINGPARALLELMODE, self.pm !== CONST.PRIMARYMODE.HIDDEN);
        }

        function setSecondaryMode(mode) {
            $timeout(function () {
                self.sm = mode;
            }, 0);
        }

        function setDefaultSecondaryMode() {
            if (self.isChairman) {
                setSecondaryMode(CONST.SECONDARYMODE.DECISIONS);
            }
            else {
                setSecondaryMode(CONST.SECONDARYMODE.PROPOSALS);
            }
        }

        function checkMode() {
            if (self.bm === CONST.BLOCKMODE.PRIMARY) {
                setBlockMode(CONST.BLOCKMODE.DEFAULT);
            }
            setPrimaryMode();
        }

        function setData(topic) {
            $log.debug("meetingDetailsCtrl: setData", arguments);
            self.topic = null;
            self.aData = null;
            self.tData = null;
            self.dData = null;
            self.activeData = null;
            self.secondaryUrl = null;
            self.primaryUrl = null;
            self.selData = null;
            self.header = null;

            if (self.sm !== CONST.SECONDARYMODE.PROPOSALS && self.sm !== CONST.SECONDARYMODE.REMARK) {
                setDefaultSecondaryMode();
            }

            if (angular.isObject(topic)) {
                self.topic = topic;
                self.header = topic.topicTitle;
                if (angular.isArray(topic.esitykset)) {
                    var item = topic.esitykset[0];
                    if (angular.isObject(item)) {
                        $log.debug("meetingDetailsCtrl.setData: esitys publicity=" + item.publicity + " link=" + item.link + " pageCount=" + item.pageCount);
                        self.tData = AttachmentData.create(
                            ((angular.isString(item.documentTitle) && item.documentTitle.length) ? item.documentTitle : 'STR_TOPIC'), item.link, item.publicity, null, null, item.pageCount);
                        if (angular.isObject(self.tData)) {
                            self.tData.topicTitle = topic.topicTitle;
                        }
                        self.activeData = self.tData;
                    }
                }

                self.primaryUrl = (self.tData && self.tData.link) ? self.tData.link : {};

                self.aData = ListData.createAttachmentList({ 'header': 'STR_ATTACHMENTS', 'title': topic.topicTitle }, topic.attachment);
                self.dData = ListData.createDecisionList({ 'header': 'STR_DECISION_HISTORY', 'title': topic.topicTitle }, topic.decision);
                self.amData = ListData.createAdditionalMaterialList({ 'header': 'STR_ADDITIONAL_MATERIAL', 'title': topic.topicTitle }, topic.additionalMaterial);

                checkMode();
            }
        }

        function resetUnsaved() {
            self.hasUnsavedProposal = false;
            self.remarkIsUnsaved = false;
            $rootScope.$emit(CONST.UNSAVEMEETINGDDATA, false);
        }

        function attachmentSelected(attachment) {
            if (angular.isObject(attachment)) {
                if (!Utils.isAttConf(attachment) && (self.isMobile || isTablet)) {
                    Utils.openNewWin(attachment.link);
                }
                else {
                    setSecondaryMode(CONST.SECONDARYMODE.ATTACHMENTS);
                    self.selData = null;
                    self.secondaryUrl = attachment.link;
                }
                self.secondaryAtt = attachment;
            }
            resetUnsaved();
            checkMode();
        }

        function additionalMaterialSelected(material) {
            if (angular.isObject(material)) {
                if (!Utils.isAttConf(material) && (self.isMobile || isTablet)) {
                    Utils.openNewWin(material.link);
                }
                else {
                    setSecondaryMode(CONST.SECONDARYMODE.MATERIALS);
                    self.selData = null;
                    self.secondaryUrl = material.link;
                }
            }
            resetUnsaved();
            checkMode();
        }

        function decisionSelected(decision) {
            if (angular.isObject(decision)) {

                if (!Utils.isAttConf(decision) && (self.isMobile || isTablet)) {
                    Utils.openNewWin(decision.link);
                }
                else {
                    setSecondaryMode(CONST.SECONDARYMODE.MATERIALS);
                    self.selData = null;
                    self.secondaryUrl = decision.link;
                }
            }
            resetUnsaved();
            checkMode();
        }

        self.primaryClicked = function () {
            setBlockMode((self.bm === CONST.BLOCKMODE.PRIMARY || self.bm === CONST.BLOCKMODE.SECONDARY) ? CONST.BLOCKMODE.DEFAULT : CONST.BLOCKMODE.PRIMARY);
        };

        self.secondaryClicked = function () {
            setBlockMode((self.bm === CONST.BLOCKMODE.PRIMARY || self.bm === CONST.BLOCKMODE.SECONDARY) ? CONST.BLOCKMODE.DEFAULT : CONST.BLOCKMODE.SECONDARY);
        };

        self.presentationClicked = function (data) {
            if (self.isSecret(data)) {
                self.selData = null;
                setSecondaryMode(CONST.SECONDARYMODE.SECRET);
            }
            else {
                Utils.openNewWin(data.link);
            }
        };

        self.attachmentClicked = function () {
            setSecondaryMode(CONST.SECONDARYMODE.ATTACHMENTS);

            var data = [self.aData, self.amData, self.dData];
            if (!angular.equals(self.selData, data)) {
                self.selData = data;
            }
            resetUnsaved();
            checkMode();
        };

        self.selectionClicked = function (data) {
            if (self.aData.objects.indexOf(data) > CONST.NOTFOUND) {
                attachmentSelected(data);
            }
            else if (self.amData.objects.indexOf(data) > CONST.NOTFOUND) {
                additionalMaterialSelected(data);
            }
            else if (self.dData.objects.indexOf(data) > CONST.NOTFOUND) {
                decisionSelected(data);
            }
        };

        self.proposalsClicked = function () {
            self.selData = null;
            setSecondaryMode(CONST.SECONDARYMODE.PROPOSALS);
            resetUnsaved();
            checkMode();
        };

        self.remarkClicked = function () {
            self.selData = null;
            setSecondaryMode(CONST.SECONDARYMODE.REMARK);
            resetUnsaved();
            checkMode();
        };

        self.decisionsClicked = function () {
            setSecondaryMode(CONST.SECONDARYMODE.DECISIONS);
        };

        self.isSecret = function (item) {
            return (item && item.publicity) ? (item.publicity === CONST.PUBLICITY.SECRET) : false;
        };

        self.isActive = function (data) {
            return angular.isObject(data) && angular.isObject(self.activeData) && angular.equals(data.link, self.activeData.link);
        };

        self.isDataStored = function (data) {
            var index = storedDataIndex(data);
            return (index > CONST.NOTFOUND);
        };

        self.materialCount = function () {
            var attachmentCount = ((self.aData instanceof Object) && (self.aData.objects instanceof Array)) ? self.aData.objects.length : 0;
            var decisionCount = ((self.dData instanceof Object) && (self.dData.objects instanceof Array)) ? self.dData.objects.length : 0;
            var additionalMaterialCount = ((self.amData instanceof Object) && (self.amData.objects instanceof Array)) ? self.amData.objects.length : 0;
            return attachmentCount + decisionCount + additionalMaterialCount;
        };

        self.toggleParallelMode = function () {
            $rootScope.parallelMode = $rootScope.parallelMode ? false : true;
            setBlockMode(CONST.BLOCKMODE.DEFAULT);
        };

        self.newTab = function (link) {
            Utils.openNewWin(link);
        };

        self.addBookmark = function (data) {
            if (angular.isObject(data)) {
                storeDocument(data);
            }
            else {
                $log.error("meetingDetailsCtrl: addBookmark invalid parameter");
            }
        };

        self.showPresentation = function (data) {
            self.activeData = angular.isObject(data) ? data : null;
            setPrimaryMode();
        };

        $scope.$watch(function () {
            return StorageSrv.getKey(CONST.KEY.TOPIC);
        }, function (topic, oldTopic) {
            if (!angular.equals(topic, oldTopic)) {
                setData(topic);
            }
        });

        $scope.$watch(function () {
            return $rootScope.parallelMode;
        }, function (parallel) {
            if (parallel) {
                setBlockMode(CONST.BLOCKMODE.DEFAULT);
            }
        });

        var proposalCountWatcher = $rootScope.$on(PROPS.COUNT, function (event, data) {
            if (angular.isObject(data) && !angular.isUndefined(data.published)) {
                if (angular.isObject(self.topic)) {
                    self.topic.db_publishedProposalCount = data.published;
                }
            }
        });

        var unsavedProposalWatcher = $rootScope.$on(CONST.PROPOSALSHASUNSAVED, function (event, hasUnsaved) {
            self.hasUnsavedProposal = hasUnsaved ? true : false;
            $rootScope.$emit(CONST.UNSAVEMEETINGDDATA, (self.hasUnsavedProposal || self.remarkIsUnsaved));
        });

        var unsavedRemarkWatcher = $rootScope.$on(CONST.REMARKISUNSAVED, function (event, isUnsaved) {
            self.remarkIsUnsaved = isUnsaved ? true : false;
            $rootScope.$emit(CONST.UNSAVEMEETINGDDATA, (self.hasUnsavedProposal || self.remarkIsUnsaved));
        });

        $scope.$on('$destroy', unsavedRemarkWatcher);
        $scope.$on('$destroy', unsavedProposalWatcher);
        $scope.$on('$destroy', proposalCountWatcher);

        $scope.$on('$destroy', function () {
            $log.debug("meetingDetailsCtrl: DESTROY");
        });

        // CONSTRUCT

        if (angular.isObject(mtgRole) && mtgRole.RoleID === CONST.MTGROLE.CHAIRMAN) {
            self.isChairman = true;
        }
        setBlockMode(CONST.BLOCKMODE.DEFAULT);
        setPrimaryMode();
        setDefaultSecondaryMode();

        setData(StorageSrv.getKey(CONST.KEY.TOPIC));
    }]);
