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
    .controller('meetingDetailsCtrl', ['$log', '$rootScope', '$scope', '$state', 'CONST', 'StorageSrv', 'AttachmentData', 'ListData', 'PROPS', 'Utils', '$timeout', 'ENV', function ($log, $rootScope, $scope, $state, CONST, StorageSrv, AttachmentData, ListData, PROPS, Utils, $timeout, ENV) {
        $log.debug("meetingDetailsCtrl: CONTROLLER");
        var self = this;
        self.isMobile = $rootScope.isMobile;
        var isTablet = $rootScope.isTablet;
        var mtgItemSelected = StorageSrv.getKey(CONST.KEY.MEETING_ITEM);
        self.primaryUrl = null;
        self.secondaryUrl = null;
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

        self.unsavedConfig = { title: 'STR_CONFIRM', text: 'STR_WARNING_UNSAVED', yes: 'STR_CONTINUE' };
        self.hasUnsavedProposal = false;
        self.remarkIsUnsaved = false;
        self.isChairman = false;
        self.motionCount = null;
        self.isCityCouncil = false;

        function setBlockMode(mode) {
            self.bm = self.isMobile ? CONST.BLOCKMODE.SECONDARY : mode;
            $rootScope.$emit(CONST.MTGUICHANGED, { blockMode: self.bm });
        }

        function setPrimaryMode() {
            var secret = self.isSecret(self.tData);
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
            $rootScope.$emit(CONST.MTGUICHANGED, { primaryBlockMode: self.pm });
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
            self.secondaryUrl = null;
            self.primaryUrl = null;
            self.selData = null;
            self.header = null;
            self.isCityCouncil = false;

            if (self.sm !== CONST.SECONDARYMODE.PROPOSALS && self.sm !== CONST.SECONDARYMODE.REMARK) {
                setDefaultSecondaryMode();
            }

            if (angular.isObject(topic)) {
                self.isCityCouncil = topic.isCityCouncil;
                self.topic = topic;
                self.header = topic[$rootScope.locProp('topicTitle')];
                if (angular.isArray(topic.esitykset)) {
                    var item = topic.esitykset[0];
                    if (angular.isObject(item)) {
                        $log.debug("meetingDetailsCtrl.setData: esitys publicity=" + item.publicity + " link=" + item.link + " pageCount=" + item.pageCount);
                        self.tData = AttachmentData.create(
                            ((angular.isString(item.documentTitle) && item.documentTitle.length) ? item.documentTitle : 'STR_TOPIC'), item.link, item.publicity, null, null, item.pageCount);
                    }
                }

                self.primaryUrl = (self.tData && self.tData.link) ? self.tData.link : {};

                self.aData = ListData.createAttachmentList({ 'header': 'STR_ATTACHMENTS', 'title': self.header }, topic.attachment);
                self.dData = ListData.createDecisionList({ 'header': 'STR_DECISION_HISTORY', 'title': self.header }, topic.decision);
                self.amData = ListData.createAdditionalMaterialList({ 'header': 'STR_ADDITIONAL_MATERIAL', 'title': self.header }, topic.additionalMaterial);

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
            self.selData = null;
            setSecondaryMode(CONST.SECONDARYMODE.DECISIONS);
            resetUnsaved();
            checkMode();
        };

        self.motionsClicked = function () {
            self.selData = null;
            setSecondaryMode(CONST.SECONDARYMODE.MOTIONS);
            resetUnsaved();
            checkMode();
            var data = angular.copy(StorageSrv.getKey(CONST.KEY.MOTION_DATA));
            var isObject = angular.isObject(data);
            if (!isObject || (isObject && data.failure === true && data.loading === false)) {
                $rootScope.$emit(CONST.GETMOTIONS, {});
            }
        };

        self.motionsAppClicked = function motionsAppClicked() {
            Utils.openNewWin(ENV.AhjoApi_MotionApp);
        };

        self.isSecret = function (item) {
            return (item && item.publicity) ? (item.publicity === CONST.PUBLICITY.SECRET) : false;
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

        var motionsWatcher = $rootScope.$on(CONST.MOTIONSUPDATED, function (aEvent, aData) {
            $log.debug("meetingDetailsCtrl.motionsWatcher: ", arguments);
            if (angular.isObject(aData)) {
                self.motionCount = aData.count;
            }
            else {
                self.motionCount = null;
            }
        });

        $scope.$on('$destroy', function () {
            $log.debug("meetingDetailsCtrl: DESTROY");
            if (angular.isFunction(unsavedRemarkWatcher)) {
                unsavedRemarkWatcher();
            }
            if (angular.isFunction(unsavedProposalWatcher)) {
                unsavedProposalWatcher();
            }
            if (angular.isFunction(proposalCountWatcher)) {
                proposalCountWatcher();
            }
            if (angular.isFunction(motionsWatcher)) {
                motionsWatcher();
            }
        });

        // CONSTRUCT

        if (angular.isObject(mtgItemSelected) && angular.isObject(mtgItemSelected.dbUserRole) && mtgItemSelected.dbUserRole.RoleID === CONST.MTGROLE.CHAIRMAN.value) {
            self.isChairman = true;
        }
        setBlockMode(CONST.BLOCKMODE.DEFAULT);
        setPrimaryMode();
        setDefaultSecondaryMode();

        setData(StorageSrv.getKey(CONST.KEY.TOPIC));
    }]);
