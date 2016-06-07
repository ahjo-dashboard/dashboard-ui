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
    .controller('meetingDetailsCtrl', ['$log', 'AhjoMeetingSrv', '$rootScope', '$scope', '$state', 'CONST', 'StorageSrv', 'AttachmentData', 'ListData', 'PROPS', 'AhjoProposalsSrv', function ($log, AhjoMeetingSrv, $rootScope, $scope, $state, CONST, StorageSrv, AttachmentData, ListData, PROPS, AhjoProposalsSrv) {
        $log.debug("meetingDetailsCtrl: CONTROLLER");
        var self = this;
        var isMobile = $rootScope.isMobile;
        self.primaryUrl = null;
        self.secondaryUrl = null;
        self.error = null;
        self.topic = null;
        self.bms = CONST.BLOCKMODE;
        self.bm = CONST.BLOCKMODE.DEFAULT;
        self.lbms = CONST.LOWERBLOCKMODE;
        self.lbm = CONST.LOWERBLOCKMODE.PROPOSALS;
        self.header = '';
        $rootScope.menu = CONST.MENU.FULL;
        self.selData = null;

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
        self.hasUnsavedProposal = false;
        self.remarkIsUnsaved = false;

        function countProposals(proposals) {
            var published = 0;
            angular.forEach(proposals, function (prop) {
                if (angular.isObject(prop)) {
                    if (prop.isPublished === PROPS.PUBLISHED.YES) {
                        published++;
                    }
                }
            });
            self.propCount = published;
        }

        function getProposals(guid) {
            if (angular.isString(guid)) {
                var proposals = null;
                AhjoProposalsSrv.get({ 'guid': guid }).$promise.then(function (response) {
                    if (angular.isObject(response) && angular.isArray(response.objects)) {
                        proposals = response.objects;
                    }
                    else {
                        $log.error('meetingDetailsCtrl: getProposals invalid response');
                    }
                }, function (error) {
                    $log.error("meetingDetailsCtrl: get error: " + JSON.stringify(error));
                }).finally(function () {
                    countProposals(proposals);
                });
            }
            else {
                $log.error('meetingDetailsCtrl: getProposals parameter invalid');
            }
        }

        function setBlockMode(mode) {
            self.bm = mode;
        }

        function setLowerBlockMode(mode) {
            self.lbm = mode;
        }

        function setData(topic) {
            self.topic = null;
            self.aData = null;
            self.tData = null;
            self.dData = null;
            self.secondaryUrl = null;
            self.primaryUrl = null;
            self.selData = null;

            if (self.lbm !== CONST.LOWERBLOCKMODE.PROPOSALS && self.lbm !== CONST.LOWERBLOCKMODE.REMARK) {
                setLowerBlockMode(CONST.LOWERBLOCKMODE.PROPOSALS);
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
                    }
                }

                self.primaryUrl = (self.tData && self.tData.link) ? self.tData.link : {};

                self.aData = ListData.createAttachmentList({ 'header': 'STR_ATTACHMENTS', 'title': topic.topicTitle }, topic.attachment);
                self.dData = ListData.createDecisionList({ 'header': 'STR_DECISION_HISTORY', 'title': topic.topicTitle }, topic.decision);
                self.amData = ListData.createAdditionalMaterialList({ 'header': 'STR_ADDITIONAL_MATERIAL', 'title': topic.topicTitle }, topic.additionalMaterial);

                if (isMobile) {
                    getProposals(topic.topicGuid);
                }
            }
        }

        function checkMode() {
            if (!isMobile && self.isUpperMode()) {
                setBlockMode(CONST.BLOCKMODE.DEFAULT);
            }
        }

        self.primaryClicked = function () {
            setBlockMode((self.bm === CONST.BLOCKMODE.PRIMARY || self.bm === CONST.BLOCKMODE.SECONDARY) ? CONST.BLOCKMODE.DEFAULT : CONST.BLOCKMODE.PRIMARY);
        };

        self.secondaryClicked = function () {
            setBlockMode((self.bm === CONST.BLOCKMODE.PRIMARY || self.bm === CONST.BLOCKMODE.SECONDARY) ? CONST.BLOCKMODE.DEFAULT : CONST.BLOCKMODE.SECONDARY);
        };

        self.attClicked = function () {
            setLowerBlockMode(CONST.LOWERBLOCKMODE.ATTACHMENTS);
            var data = [self.aData];
            if (!angular.equals(self.selData, data)) {
                self.selData = data;
            }
        };

        self.matClicked = function () {
            setLowerBlockMode(CONST.LOWERBLOCKMODE.MATERIALS);
            var data = [self.amData, self.dData];
            if (!angular.equals(self.selData, data)) {
                self.selData = data;
            }
        };

        self.selClicked = function (data) {
            if (self.aData.objects.indexOf(data) > CONST.NOTFOUND) {
                self.attachmentClicked(data);
            }
            else if (self.amData.objects.indexOf(data) > CONST.NOTFOUND) {
                self.additionalMaterialClicked(data);
            }
            else if (self.dData.objects.indexOf(data) > CONST.NOTFOUND) {
                self.decisionClicked(data);
            }
            self.selData = null;
        };

        self.attachmentClicked = function (attachment) {
            setLowerBlockMode(CONST.LOWERBLOCKMODE.ATTACHMENTS);
            if (isMobile) {
                StorageSrv.setKey(CONST.KEY.SELECTION_DATA, self.aData);
                $state.go(CONST.APPSTATE.LIST);
            }
            else if (attachment instanceof Object) {
                self.secondaryUrl = attachment.link ? attachment.link : {};
                self.secondaryAtt = attachment;
            }
            self.hasUnsavedProposal = false;
            self.remarkIsUnsaved = false;
            checkMode();
        };

        self.decisionClicked = function (decision) {
            setLowerBlockMode(CONST.LOWERBLOCKMODE.MATERIALS);
            if (isMobile) {
                StorageSrv.setKey(CONST.KEY.SELECTION_DATA, self.dData);
                $state.go(CONST.APPSTATE.LIST);
            }
            else if (decision instanceof Object) {
                self.secondaryUrl = decision.link ? decision.link : {};
            }
            self.hasUnsavedProposal = false;
            self.remarkIsUnsaved = false;
            checkMode();
        };

        self.additionalMaterialClicked = function (material) {
            setLowerBlockMode(CONST.LOWERBLOCKMODE.MATERIALS);
            if (isMobile) {
                StorageSrv.setKey(CONST.KEY.SELECTION_DATA, self.amData);
                $state.go(CONST.APPSTATE.LIST);
            }
            else if (material instanceof Object) {
                self.secondaryUrl = material.link ? material.link : {};
            }
            self.hasUnsavedProposal = false;
            self.remarkIsUnsaved = false;
            checkMode();
        };

        self.proposalsClicked = function () {
            self.selData = null;
            setLowerBlockMode(CONST.LOWERBLOCKMODE.PROPOSALS);
            if (isMobile) {
                $state.go(CONST.APPSTATE.LISTPROPOSALS);
            }
            checkMode();
        };

        self.remarkClicked = function () {
            self.selData = null;
            setLowerBlockMode(CONST.LOWERBLOCKMODE.REMARK);
            if (isMobile) {
                $state.go(CONST.APPSTATE.REMARK);
            }
            checkMode();
        };

        self.isBothMode = function () {
            return self.bm === CONST.BLOCKMODE.DEFAULT;
        };

        self.isUpperMode = function () {
            return self.bm === CONST.BLOCKMODE.PRIMARY;
        };

        self.isLowerMode = function () {
            return self.bm === CONST.BLOCKMODE.SECONDARY;
        };

        self.isSecret = function (item) {
            return (item && item.publicity) ? (item.publicity === CONST.PUBLICITY.SECRET) : false;
        };

        self.isActive = function (mode) {
            return self.lbm === mode;
        };

        self.materialCount = function () {
            var decisionCount = ((self.dData instanceof Object) && (self.dData.objects instanceof Array)) ? self.dData.objects.length : 0;
            var additionalMaterialCount = ((self.amData instanceof Object) && (self.amData.objects instanceof Array)) ? self.amData.objects.length : 0;
            return decisionCount + additionalMaterialCount;
        };

        self.isDisabled = function (att) {
            var res = false;
            if (!(att instanceof AttachmentData)) {
                $log.error("meetingCtrl.isDisabled: unsupported arg type: " + JSON.stringify(att));
            } else {
                res = !angular.isString(att.link) || !att.link.length;
            }
            return res;
        };

        self.toggleParallelMode = function () {
            $rootScope.parallelMode = $rootScope.parallelMode ? false : true;
            setBlockMode(CONST.BLOCKMODE.DEFAULT);
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
            self.propCount = null;
            if (angular.isObject(data) && !angular.isUndefined(data.published)) {
                self.propCount = data.published;
            }
        });

        var unsavedProposalWatcher = $rootScope.$on(CONST.PROPOSALSHASUNSAVED, function (event, hasUnsaved) {
            self.hasUnsavedProposal = hasUnsaved ? true : false;
        });

        var unsavedRemarkWatcher = $rootScope.$on(CONST.REMARKISUNSAVED, function (event, isUnsaved) {
            self.remarkIsUnsaved = isUnsaved ? true : false;
        });

        $scope.$on('$destroy', unsavedRemarkWatcher);
        $scope.$on('$destroy', unsavedProposalWatcher);
        $scope.$on('$destroy', proposalCountWatcher);

        $scope.$on('$destroy', function () {
            $log.debug("meetingDetailsCtrl: DESTROY");
        });

        setBlockMode(CONST.BLOCKMODE.DEFAULT);
        setLowerBlockMode(CONST.LOWERBLOCKMODE.PROPOSALS);
        setData(StorageSrv.getKey(CONST.KEY.TOPIC));
    }]);
