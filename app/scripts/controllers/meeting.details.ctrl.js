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

        self.upperId = 'mtg-upper-block';
        self.lowerId = 'mtg-lower-block';
        self.upperClasses = null;
        self.lowerClasses = null;

        self.upperSize = undefined;
        self.lowerSize = undefined;

        self.propCount = null;
        self.linkConfig = {
            title: 'STR_TOPIC_DOWNLOAD',
            class: 'btn btn-info btn-lg btn-block wrap-button-text db-btn-prim'
        };
        self.unsavedConfig = { title: 'STR_CONFIRM', text: 'STR_WARNING_UNSAVED', yes: 'STR_CONTINUE' };
        self.hasUnsavedProposal = false;
        self.remarkIsUnsaved = false;

        var attachmentDropdownOpen = false;
        var materialsDropdownOpen = false;
        var isIe = $rootScope.isIe;
        var isEdge = $rootScope.isEdge;

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
            self.blockMode = mode;

            switch (self.blockMode) {
                case CONST.BLOCKMODE.UPPER:
                    self.upperClasses = 'ad-flex-show-full';
                    self.lowerClasses = 'ad-flex-hide';
                    break;

                case CONST.BLOCKMODE.BOTH:
                    self.upperClasses = 'ad-flex-show';
                    self.lowerClasses = 'ad-flex-show';
                    break;

                case CONST.BLOCKMODE.LOWER:
                    self.upperClasses = 'ad-flex-hide';
                    self.lowerClasses = 'ad-flex-show-full';
                    break;

                default:
                    $log.error('meetingDetailsCtrl: setBlockMode unsupported mode');
                    break;
            }
        }

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

                self.upperUrl = (self.tData && self.tData.link) ? self.tData.link : {};

                self.aData = ListData.createAttachmentList('STR_ATTACHMENTS', topic.attachment);
                self.dData = ListData.createDecisionList('STR_DECISION_HISTORY', topic.decision);
                self.amData = ListData.createAdditionalMaterialList('STR_ADDITIONAL_MATERIAL', topic.additionalMaterial);

                if (isMobile) {
                    getProposals(topic.topicGuid);
                }
            }
        }

        function checkMode() {
            if (!isMobile && self.isUpperMode()) {
                setBlockMode(CONST.BLOCKMODE.BOTH);
            }
        }

        self.upperClicked = function () {
            setBlockMode((self.blockMode === CONST.BLOCKMODE.BOTH || self.blockMode === CONST.BLOCKMODE.LOWER) ? CONST.BLOCKMODE.UPPER : CONST.BLOCKMODE.BOTH);
        };

        self.lowerClicked = function () {
            setBlockMode((self.blockMode === CONST.BLOCKMODE.BOTH || self.blockMode === CONST.BLOCKMODE.UPPER) ? CONST.BLOCKMODE.LOWER : CONST.BLOCKMODE.BOTH);
        };

        self.attachmentClicked = function (attachment) {
            setLowerBlockMode(CONST.LOWERBLOCKMODE.ATTACHMENTS);
            if (isMobile) {
                StorageSrv.setKey(CONST.KEY.SELECTION_DATA, self.aData);
                $state.go(CONST.APPSTATE.LIST);
            }
            else if (attachment instanceof Object) {
                self.lowerUrl = attachment.link ? attachment.link : {};
                self.lowerAtt = attachment;
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
                self.lowerUrl = decision.link ? decision.link : {};
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
                self.lowerUrl = material.link ? material.link : {};
            }
            self.hasUnsavedProposal = false;
            self.remarkIsUnsaved = false;
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
            $log.debug("meetingDetailsCtrl: remarkClicked");
            setLowerBlockMode(CONST.LOWERBLOCKMODE.REMARK);
            if (isMobile) {
                $state.go(CONST.APPSTATE.REMARK);
            }
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

        $scope.$watch(function () {
            return StorageSrv.getKey(CONST.KEY.TOPIC);
        }, function (topic, oldTopic) {
            if (!angular.equals(topic, oldTopic)) {
                setData(topic);
            }
        });

        function setSize(data) {
            if (angular.isObject(data) && angular.isObject(data.element)) {
                if (data.element.attr(CONST.ID) === self.upperId && angular.isObject(data.size)) {
                    self.upperSize = data.size;
                }
                else if (data.element.attr(CONST.ID) === self.lowerId && angular.isObject(data.size)) {
                    self.lowerSize = data.size;
                }
            }
        }

        if (isIe || isEdge) {
            $scope.sizeWhenReady = function (data) {
                setSize(data);
            };

            $scope.sizeChangedByClass = function (data) {
                setSize(data);
            };
        }

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

        setBlockMode(CONST.BLOCKMODE.BOTH);
        setData(StorageSrv.getKey(CONST.KEY.TOPIC));
    }]);
