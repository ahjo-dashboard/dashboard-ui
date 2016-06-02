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
app.controller('signDetailsCtrl', function ($log, $state, $rootScope, ENV, CONST, StorageSrv, ListData) {
    $rootScope.menu = CONST.MENU.FULL;

    var self = this;
    self.isMobile = $rootScope.isMobile;
    self.bms = CONST.BLOCKMODE;
    self.bm = CONST.BLOCKMODE.DEFAULT;
    self.lbms = CONST.LOWERBLOCKMODE;
    self.lbm = CONST.LOWERBLOCKMODE.PROPOSALS;

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
            id: 'doc', disabled: false, active: false, hideBtn: false, hide: false, url: null,
            linkConfig: {
                title: 'STR_SIGNING_REQ',
                class: 'btn btn-info btn-lg btn-block wrap-button-text db-btn-prim' // Used only on mobile
            }
        },
        doctr: {
            id: 'doctr', active: false, hideBtn: true, hide: true,
            url: self.item.ProcessGuid ? ENV.SIGNAPIURL_DOC_TRANSLATED.replace(':reqId', self.item.ProcessGuid).replace(':transId', true).replace(':attId', '') : null,
            disabled: null,
            linkConfig: {
                title: 'STR_TRANSLATION',
                class: 'btn btn-info btn-lg btn-block wrap-button-text db-btn-prim' // Used only on mobile
            }
        },
        att: {
            id: 'att', disabled: false, active: false, hideBtn: false, hide: false, url: undefined, isOpen: false, selData: null
        }
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

    function initBtns(btnModel, item, status) {
        self.selData = null;
        self.secondaryUrl = null;

        btnModel.doc.url = item.ProcessGuid ? ENV.SignApiUrl_GetAttachment.replace(":reqId", self.item.ProcessGuid) : null;
        btnModel.doctr.url = angular.isString(item.TranslationGuid) && item.TranslationGuid.length ? ENV.SIGNAPIURL_DOC_TRANSLATED.replace(':reqId', item.ProcessGuid).replace(':transId', true).replace(':attId', '') : null;
        if (!btnModel.doctr.url) {
            btnModel.doctr.disabled = true;
        }

        $log.debug("signingItemCtrl.initBtns: doc=" + btnModel.doc.url);

        btnModel.att.selData = ListData.createEsignAttachmentList({ 'header': 'STR_ATTACHMENTS', 'title': self.item.Name }, parseAtts(item), item);
        btnModel.att.disabled = (0 < btnModel.att.selData.length);
        self.selData = btnModel.att.selData;

        if (!angular.equals(status, CONST.ESIGNSTATUS.UNSIGNED.value)) {
            // btnModel.acc.hideBtn = true;
            // btnModel.rej.hideBtn = true;
            btnModel.att.disabled = true;
            btnModel.att.hide = true;
        }
    }

    function setBtnActive(btnItem) {
        for (var i in self.btnModel) {
            if (btnItem.id === i) {
                self.btnModel[i].active = true;
            } else {
                if (!self.btnModel[i].disabled) {
                    self.btnModel[i].active = false;
                }
            }
        }
    }

    function setBlockMode(mode) {
        self.bm = mode;
    }

    function setLowerBlockMode(mode) {
        self.lbm = mode;
    }

    self.isActive = function (id) {
        //$log.debug("signingItemCtrl.isActive: " + id + "=" +self.btnModel[id].active);
        return !self.isMobile && self.btnModel[id].active;
    };

    self.actionDoc = function () {
        self.docUrl = self.btnModel.doc.url;
        setBtnActive(self.btnModel.doc);
    };

    self.actionDocTr = function () {
        self.docUrl = self.btnModel.doctr.url;
        setBtnActive(self.btnModel.doctr);
    };

    self.actionAtt = function () {
        var data = [self.btnModel.att.selData];
        self.selData = angular.equals(self.selData, data) ? null : data;
    };

    self.selAtt = function (data) {
        self.selData = null;
        self.secondaryUrl = data.link;
    };

    self.getCount = function (arg) {
        var res = arg.length;
        return res;
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

    initBtns(self.btnModel, self.item, self.item.Status);
    setBlockMode(CONST.BLOCKMODE.DEFAULT);
    setLowerBlockMode(CONST.LOWERBLOCKMODE.ATTACHMENTS);
    self.actionDoc();
    self.actionAtt();
});
