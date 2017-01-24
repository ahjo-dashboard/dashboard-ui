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
        self.topicFIN = false; // Needed for multilanguage topics
        self.topicSV = false; // Needed for multilanguage topics
        self.bms = CONST.BLOCKMODE;
        self.bm = CONST.BLOCKMODE.DEFAULT; // State of view, which block(s) displayed
        self.pms = CONST.PRIMARYMODE;
        self.pm = CONST.PRIMARYMODE.DEFAULT; // State of primary view block
        self.sms = CONST.SECONDARYMODE;
        self.sm = CONST.SECONDARYMODE.PROPOSALS; // State of secondary view block
        self.header = null;
        $rootScope.menu = CONST.MENU.FULL;
        self.selData = null;
        self.topicTimeout = null; // timeout object reference for cleanup
        self.topicDelay = false; // Win7IE11 workaround for white view when certain view content changes

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

        function createPresentation(aTopic, aLang) {
            var res = null;
            if (!angular.isString(aLang) || !angular.isObject(aTopic) || !angular.isArray(aTopic.esitykset) || !aTopic.esitykset.length) {
                $log.debug("meetingDetailsCtrl.createPresentation: bad args: ", arguments);
            } else {
                $log.debug("meetingDetailsCtrl.createPresentation: lang=" + aLang);
                var presArr = aTopic.esitykset;
                var presItem = null;
                for (var i = 0; !res && i < presArr.length; i++) {
                    presItem = presArr[i];
                    if (angular.isObject(presItem) && angular.equals(presItem.language, aLang)) {
                        $log.log("meetingDetailsCtrl.createPresentation: found presentation matching to lang=" + aLang, presArr);
                        res = AttachmentData.create(((angular.isString(presItem.documentTitle) && presItem.documentTitle.length) ? presItem.documentTitle : 'STR_PRESENTATION'), presItem.link, presItem.publicity, null, null, presItem.pageCount);
                        res.dBLang = aLang;
                    }
                }
                if (!res) {
                    $log.log("meetingDetailsCtrl.createPresentation: no presentation matching to lang=" + aLang, presArr);
                }
            }

            return res;
        }

        function setData(topic) {
            $log.debug("meetingDetailsCtrl.setData", arguments);
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
                // Lautakunnat
                if (topic.mixedLanguage){
                    var mixedLangTrans;
                    // Asian kieli ruotsi
                    if (topic.language === 'sv') {
                        mixedLangTrans = 'fi';
                        self.topicSV = false;
                        self.topicFIN = true;
                        // Jos käyttöliittymä ruotsi
                        if ($rootScope.dbLang === "sv") {
                            self.topicSV = true;
                            self.topicFIN = false;
                        }
                        
                    }
                    //Asian kieli suomi
                    else {
                        //self.presPrimLang = createPresentation(self.topic, $rootScope.dbLang);
                        self.topicFIN = true;
                        self.topicSV = false;
                    }
                    //Käyttöliittymä suomen kielinen
                    if ($rootScope.dbLang === "sv") {
                        self.presPrimLang = createPresentation(self.topic, mixedLangTrans);
                        self.presTransLang = createPresentation(self.topic, topic.language);
                    }
                    else {
                        self.presPrimLang = createPresentation(self.topic, $rootScope.dbLang);
                        self.presTransLang = createPresentation(self.topic, $rootScope.getDbLangTrans());
                    }

                }
                // Valtuusto
                else {
                    self.presPrimLang = createPresentation(self.topic, $rootScope.dbLang);
                    self.presTransLang = createPresentation(self.topic, $rootScope.getDbLangTrans());
                    self.header = topic[$rootScope.locProp('topicTitle')];
                    if ($rootScope.dbLang === 'fi') {
                        self.topicSV = true;
                        self.topicFIN = false;
                    }
                    else {
                        self.topicFIN = false;
                        self.topicSV = true;
                    }
                }

                self.header = topic[$rootScope.locProp('topicTitle')];                
                self.tData = self.presPrimLang ? self.presPrimLang : self.presTransLang;
                if (self.presPrimLang === null) {
                    self.presPrimLang = self.presTransLang;
                    self.presTransLang = null;
                }
                self.primaryUrl = (self.tData && self.tData.link) ? self.tData.link : {};

                self.aData = ListData.createAttachmentList({ 'header': 'STR_ATTACHMENTS', 'title': self.header }, topic.attachment);
                self.dData = ListData.createDecisionList({ 'header': 'STR_DECISION_HISTORY', 'title': self.header }, topic.decision);
                self.amData = ListData.createAdditionalMaterialList({ 'header': 'STR_ADDITIONAL_MATERIAL', 'title': self.header }, topic.additionalMaterial);

                checkMode();
            }
        }

        function changeTopic(topic) {
            $log.debug("meetingDetailsCtrl.changeTopic", arguments);

            if ($rootScope.isIe) {
                // Win7IE11 workaround: View stuck in white screen or flicker
                // caused by toggling public<==>confidential topics (dbPdf and imgViewer)
                self.topicDelay = true;

                $timeout.cancel(self.topicTimeout);
                self.topicTimeout = $timeout(function () {
                    setData(topic);

                    self.topicTimeout = null;
                    $timeout(function () { // WinIE11 white screen if change db-pdf and imgViewer simultaneously
                        self.topicDelay = false;
                        $log.debug("meetingDetailsCtrl.changeTopic: topicDelay done");
                    }, 0);
                }, 100);

            } else {
                setData(topic);
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
                self.secondaryAtt = material;
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
                self.secondaryAtt = decision;
            }
            resetUnsaved();
            checkMode();
        }

        function setUrlData(aPres) {
            self.tData = aPres;
            self.primaryUrl = (self.tData && self.tData.link) ? self.tData.link : {};
        }

        self.primaryClicked = function () {
            setBlockMode((self.bm === CONST.BLOCKMODE.PRIMARY || self.bm === CONST.BLOCKMODE.SECONDARY) ? CONST.BLOCKMODE.DEFAULT : CONST.BLOCKMODE.PRIMARY);
        };

        self.secondaryClicked = function () {
            setBlockMode((self.bm === CONST.BLOCKMODE.PRIMARY || self.bm === CONST.BLOCKMODE.SECONDARY) ? CONST.BLOCKMODE.DEFAULT : CONST.BLOCKMODE.SECONDARY);
        };

        self.presClickedDesk = function presClickedDesk(aPres) {
            $log.debug("meetingDetailsCtrl.presClickedDesk", arguments);
            if ($rootScope.isIe) {
                // Win7IE11 workaround: View stuck in white screen or flicker
                // caused by toggling public<==>confidential topics (dbPdf and imgViewer)
                self.topicDelay = true;

                $timeout.cancel(self.topicTimeout);
                self.topicTimeout = $timeout(function () {
                    setUrlData(aPres);
                    $timeout(function () { // WinIE11 white screen if change db-pdf and imgViewer simultaneously
                        self.topicDelay = false;
                        $log.debug("meetingDetailsCtrl.presClickedDesk: topicDelay done");
                    }, 0);
                }, 100);

            } else {
                setUrlData(aPres);
            }
        };

        self.presClickedMobile = function (aPres) {
            self.tData = aPres;
            if (self.isSecret(aPres)) {
                self.selData = null;
                setSecondaryMode(CONST.SECONDARYMODE.SECRET);
            }
            else {
                Utils.openNewWin(aPres.link);
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
            if (!angular.isObject(data) || data.loading === false) {
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
        }, function (topic) {
            changeTopic(topic);
        });

        $scope.$watch(function () {
            return $rootScope.parallelMode;
        }, function (parallel) {
            if (parallel) {
                setBlockMode(CONST.BLOCKMODE.DEFAULT);
            }
        });


        $scope.$watch(function () {
            var obj = StorageSrv.getKey(CONST.KEY.MOTION_DATA);
            var res = angular.isObject(obj) && angular.isObject(obj.objects) ? obj.objects.length : null;
            return res;
        }, function (aNew/*, aOld*/) {
            $log.debug("meetingDetailsCtrl: watch triggered: " + CONST.KEY.MOTION_DATA, arguments);
            self.motionCount = aNew;
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

        $scope.$on('$destroy', function () {
            $log.debug("meetingDetailsCtrl: DESTROY");

            $timeout.cancel(self.topicTimeout);

            if (angular.isFunction(unsavedRemarkWatcher)) {
                unsavedRemarkWatcher();
            }
            if (angular.isFunction(unsavedProposalWatcher)) {
                unsavedProposalWatcher();
            }
            if (angular.isFunction(proposalCountWatcher)) {
                proposalCountWatcher();
            }
        });

        // CONSTRUCT

        if (angular.isObject(mtgItemSelected) && angular.isObject(mtgItemSelected.dbUserRole) && mtgItemSelected.dbUserRole.RoleID === CONST.MTGROLE.CHAIRMAN.value) {
            self.isChairman = true;
        }
        setBlockMode(CONST.BLOCKMODE.DEFAULT);
        setPrimaryMode();
        setDefaultSecondaryMode();
    }]);
