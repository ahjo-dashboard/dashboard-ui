/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc function
 * @name dashboard.controller:signDetailsCtrl
 * @description
 * # signDetailsCtrl
 * Controller of the dashboard
 */
var app = angular.module('dashboard');
app.controller('signDetailsCtrl', function ($log, $state, $rootScope, ENV, CONST, StorageSrv, ListData, SigningDocSignaturesApi, SigningPersonInfoApi) {
    $rootScope.menu = CONST.MENU.FULL;

    var self = this;
    self.isMobile = $rootScope.isMobile;
    self.bms = CONST.BLOCKMODE;
    self.bm = CONST.BLOCKMODE.DEFAULT;

    var tmp = StorageSrv.getKey(CONST.KEY.SIGN_ITEM);
    if (!tmp || !tmp.ProcessGuid || !tmp.ProcessGuid.length) {
        $log.error("signDetailsCtrl: item missing \n" + JSON.stringify(tmp)
        );
        $state.go(CONST.APPSTATE.HOME);
        return;
    }
    self.item = tmp;
    $log.debug("signDetailsCtrl: name: " + self.item.Name);

    self.btnModel = {
        doc: {
            id: 'doc', block: 1, busy: false, disabled: false, active: false, hideBtn: false, hideCont: false, url: null,
            linkConfig: {
                title: 'STR_SIGNING_REQ',
                class: 'btn btn-info btn-lg btn-block wrap-button-text db-btn-prim' // Used only on mobile
            }
        },
        doctr: {
            id: 'doctr', block: 1, busy: false, active: false, hideBtn: true, hideCont: true,
            url: self.item.ProcessGuid ? ENV.SIGNAPIURL_DOC_TRANSLATED.replace(':reqId', self.item.ProcessGuid).replace(':transId', true).replace(':attId', '') : null,
            disabled: null,
            linkConfig: {
                title: 'STR_TRANSLATION',
                class: 'btn btn-info btn-lg btn-block wrap-button-text db-btn-prim' // Used only on mobile
            }
        },
        att: {
            id: 'att', block: 2, busy: false, disabled: false, active: false, hideBtn: false, hideCont: false, url: undefined, selData: null
        },
        sta: { id: 'sta', block: 2, busy: false, disabled: false, active: false, hideBtn: false, hideCont: false, signers: null },
        com: { id: 'com', block: 2, busy: false, disabled: false, active: false, hideCont: false, result: null }
    };

    function parseAtts(item) {
        var res = [];
        for (var i = 0; angular.isArray(item.AttachmentInfos) && i < item.AttachmentInfos.length; i++) {
            res.push(JSON.parse(item.AttachmentInfos[i])); // API returns items as JSON strings so parse into object
            // Example attachment info item: {"Id":"123456789", "ParentTitle":"abc", "Title":"xyz.pdf"}
        }
        $log.debug("signDetailsCtrl.parseAtts: " + res.length);
        return res;

    }


    function initCtrl(btnModel, item, status) {
        self.secondaryUrl = null;
        self.lbm = self.btnModel.att.id;

        btnModel.com.requestorId = item.RequestorId ? item.RequestorId : null;

        btnModel.doc.url = item.ProcessGuid ? ENV.SignApiUrl_GetAttachment.replace(":reqId", self.item.ProcessGuid) : null;
        btnModel.doctr.url = angular.isString(item.TranslationGuid) && item.TranslationGuid.length ? ENV.SIGNAPIURL_DOC_TRANSLATED.replace(':reqId', item.ProcessGuid).replace(':transId', true).replace(':attId', '') : null;
        if (!btnModel.doctr.url) {
            btnModel.doctr.disabled = true;
        }

        $log.debug("signDetailsCtrl.initCtrl: doc=" + btnModel.doc.url);

        var atts = parseAtts(item);
        btnModel.att.selData = ListData.createEsignAttachmentList({ 'header': 'STR_ATTACHMENTS', 'title': self.item.Name }, atts, item);

        btnModel.att.count = atts.length;
        btnModel.att.disabled = (1 > btnModel.att.count);
        self.selData = btnModel.att.selData;

        if (!angular.equals(status, CONST.ESIGNSTATUS.UNSIGNED.value)) {
            // btnModel.acc.hideBtn = true;
            // btnModel.rej.hideBtn = true;
            btnModel.att.disabled = true;
            btnModel.att.hideCont = true;
        }
    }

    function setBlockMode(mode) {
        self.bm = mode;
    }

    function setBtnActive(aBtnItem, blockNum) {
        angular.forEach(self.btnModel, function (btnItem) {
            var i = btnItem;
            if (i.block === blockNum) {

                if (aBtnItem.id === i.id) {
                    $log.debug("signDetailsCtrl.setBtnActive: " + i.id);
                    i.active = true;
                    i.hideCont = false;
                } else {
                    if (!i.disabled) {
                        i.active = false;
                        i.hideCont = true;
                    }
                }

            }
        });
    }

    function setBlockContent(btnItem) {
        if (2 === btnItem.block) {
            self.lbm = btnItem.id;
        }
        setBtnActive(btnItem, btnItem.block);
    }

    function displaySignings(sgn) {
        if (!sgn || !("Signers" in sgn)) {
            $log.error("signItemCtrl.displaySignings: bad args");
            return;
        }

        if (self.isMobile) {
            $state.go(CONST.APPSTATE.DOCSIGNERS, { 'signers': sgn });
        }
        // else: nothing to do on desktop, view displays results when operation is done
    }

    function getReqStatuses(item) {
        $log.debug("signDetailsCtrl.getReqStatuses");

        if (!item || !("Guid" in item) || !item.Guid) {
            $log.error("signDetailsCtrl.getReqStatuses: bad args");
            return;
        }

        if (self.btnModel.sta.signers && self.btnModel.sta.busy) {
            $log.debug("signDetailsCtrl.getReqStatuses: already busy, ignoring");
        } else if (self.btnModel.sta.signers && !self.btnModel.sta.busy) {
            displaySignings(self.btnModel.sta.signers);
        } else {
            self.btnModel.sta.busy = true;
            self.btnModel.sta.signers = SigningDocSignaturesApi.get({ reqId: item.ProcessGuid }, function (/*data*/) {
                $log.debug("signDetailsCtrl.getReqStatuses: api query done ");
                displaySignings(self.btnModel.sta.signers);
            }, function (error) {
                $log.error("signDetailsCtrl.getReqStatuses: api query error: " + JSON.stringify(error));
                //TODO: display error
            });
            self.btnModel.sta.signers.$promise.finally(function () {
                self.btnModel.sta.busy = false;
            });
        }
    }
    function isModalOpen() {//TODO:
        return self.btnModel.acc.cConf.isOpen || self.btnModel.rej.cConf.isOpen;
    }

    // Workaround on IE to hide <object> pdf because IE displays it topmost covering modals and dropdowns.
    function hidePdfOnIe() {//TODO fix
        return $rootScope.isIe && (self.btnModel.att.isOpen || isModalOpen());
    }

    function getPersonInfo(aBtnItem) {
        $log.debug("signStatusCtrl.personInfo");

        if (!aBtnItem.content && aBtnItem.requestorId) {
            aBtnItem.busy = true;
            aBtnItem.content = SigningPersonInfoApi.get({ userId: aBtnItem.requestorId }, function (/*data*/) {
                $log.debug("signStatusCtrl.personInfo: api query done");
            }, function (error) {
                $log.error("signStatusCtrl.personInfo: api query error: " + JSON.stringify(error));
                //TODO: display error
            });
            aBtnItem.content.$promise.finally(function () {
                aBtnItem.busy = false;
            });
        }
    }

    self.isActive = function (id) {
        //$log.debug("signDetailsCtrl.isActive: " + id + "=" +self.btnModel[id].active);
        return !self.isMobile && self.btnModel[id].active;
    };

    self.actionDoc = function () {
        self.docUrl = self.btnModel.doc.url;
        setBlockContent(self.btnModel.doc);
    };

    self.actionDocTr = function () {
        self.docUrl = self.btnModel.doctr.url;
        setBlockContent(self.btnModel.doctr);
    };

    self.actionAtt = function () {
        var data = [self.btnModel.att.selData];
        if (!angular.equals(self.selData, data)) {
            self.selData = data;
        }
        setBlockContent(self.btnModel.att);
    };

    self.actionReqStatuses = function () {
        setBlockContent(self.btnModel.sta);
        getReqStatuses(self.item);
    };

    self.actionComment = function () {
        setBlockContent(self.btnModel.com);
        getPersonInfo(self.btnModel.com);
    };

    self.selAtt = function (data) {
        self.selData = null;
        self.secondaryUrl = data.link;
    };

    self.toggleParallelMode = function () {
        $rootScope.parallelMode = $rootScope.parallelMode ? false : true;
        setBlockMode(CONST.BLOCKMODE.DEFAULT);
    };

    self.primaryClicked = function () {
        setBlockMode((self.bm === CONST.BLOCKMODE.PRIMARY || self.bm === CONST.BLOCKMODE.SECONDARY) ? CONST.BLOCKMODE.DEFAULT : CONST.BLOCKMODE.PRIMARY);
    };

    self.secondaryClicked = function () {
        setBlockMode((self.bm === CONST.BLOCKMODE.PRIMARY || self.bm === CONST.BLOCKMODE.SECONDARY) ? CONST.BLOCKMODE.DEFAULT : CONST.BLOCKMODE.SECONDARY);
    };

    self.isDisplayed = function (id, block) {
        var res = true;
        if (block === true && (id !== self.lbm)) {
            res = false;
        }
        else {
            switch (id) {
                case self.btnModel.doc.id:
                    res = !self.btnModel.doc.hideCont && !hidePdfOnIe();
                    break;
                case self.btnModel.att.id:
                    res = !self.btnModel.att.hideCont && !hidePdfOnIe();
                    break;
                default:
                    res = !self.btnModel[id].hideCont && !self.btnModel[id].disabled;
                    break;
            }
        }
        // $log.debug("signDetailsCtrl.isDisplayed: " + id + " = " + res);
        return res;
    };

    self.isLoadingSec = function () {
        var res = false;
        // for (var i = 0; !res && (i < self.btnModel.length); i++) {
        //     res = self.btnModel[i].busy;
        // }
        angular.forEach(self.btnModel, function (item) {
            if (!res && (item.id === self.lbm) && item.busy) {
                res = item.busy;
            }
        });
        // $log.debug("signDetailsCtrl.isLoadingSec: " + res);
        return res;
    };

    initCtrl(self.btnModel, self.item, self.item.Status);
    setBlockMode(CONST.BLOCKMODE.DEFAULT);
    setBlockContent(self.btnModel.att);
    self.actionDoc();
});
