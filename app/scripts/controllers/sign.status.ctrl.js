/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc function
 * @name dashboard.controller:signStatusCtrl
 * @description
 * # signStatusCtrl
 * Controller of the dashboard
 */
var app = angular.module('dashboard');
app.controller('signStatusCtrl', function ($log, $scope, $state, SigningAttApi, $sce, $timeout, $uibModal, ENV, SigningOpenApi, SigningPersonInfoApi, CONST, $rootScope, SigningDocSignaturesApi, ListData, $stateParams, StorageSrv, Utils, SigningUtil) {

    var self = this;
    self.isMobile = $rootScope.isMobile;
        self.isTablet = $rootScope.isTablet;

    self.item = null;
    self.ongoing = true;
    self.requestorInfo = { busy: false, email: null };

    $rootScope.menu = $stateParams.menu;

    var tmp = StorageSrv.getKey(CONST.KEY.SIGN_ITEM);
    if (!tmp || !tmp.ProcessGuid || !tmp.ProcessGuid.length) {
        $log.error("signStatusCtrl: item missing \n" + JSON.stringify(tmp)
        );
        $state.go(CONST.APPSTATE.HOME);
        return;
    }

    self.item = tmp;
    $log.debug("signStatusCtrl: name: " + self.item.Name);

    // self.item.Comment = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."; //TODO: Enable to test comment field in view, user this only for layout development

    self.displayStatus = true;
    self.btnModel = {
        doc: {
            id: 'doc', disabled: false, active: false, hideBtn: false, hide: false, url: null,
            linkConfig: {
                title: 'STR_SIGNING_REQ',
                class: 'btn btn-info btn-lg btn-block wrap-button-text db-btn-prim' // Used only on mobile
            }
        },
        doctr: {
            id: 'doctr', disabled: false, active: false, hideBtn: true, hide: true, url: null,
            linkConfig: {
                title: 'STR_TRANSLATION',
                class: 'btn btn-info btn-lg btn-block wrap-button-text db-btn-prim' // Used only on mobile
            }
        },
        acc: { id: 'acc', disabled: false, active: false, hideBtn: false, hide: false, cConf: { title: 'STR_CNFM_TEXT', text: 'STR_CNFM_SIGN_ACC', yes: 'STR_YES', no: 'STR_NO', isOpen: false } },
        rej: { id: 'rej', disabled: false, active: false, hideBtn: false, hide: false, strId: '', cConf: { title: 'STR_CNFM_TEXT', text: 'STR_CNFM_SIGN_REJ', yes: 'STR_YES', no: 'STR_NO', isOpen: false } },
        // com: { id: 'com', disabled: false, active: false },
        att: {
            id: 'att', disabled: false, active: false, hideBtn: false, hide: false, url: undefined,
            isOpen: false,
            count: 0,
            toggle: function (arg) {
                //$log.debug("signStatusCtrl: dropdown att toggled: " + arg + ", active: " + this.active);
                self.btnModel.att.isOpen = arg;
            },
        },
        sta: { id: 'sta', busy: false, disabled: false, active: false, hideBtn: false, hideCont: false, signers: null }

    };

    // PRIVATE OBJECTS

    function SignOperation(aItem, aNewStatus) {
        var self = this;
        if (!aItem) {
            throw new Error("SignOperation: bad item \n " + JSON.stringify(aItem));
        }
        self.item = angular.copy(aItem);
        self.newStatus = aNewStatus;
        self.oldStatus = self.item.Status;
        self.item.Status = aNewStatus;
        self.busy = false;
        self.errorMsg = null; // ErrorMsg type object
        return self;
    }

    // PRIVATE FUNCTIONS

    function clearAlerts() {
        // self.alerts.length = 0;
    }

    function UpdateSignersList(aSigners) {
        $log.debug("signStatusCtrl.UpdateSignersList: ", arguments);
        if (angular.isObject(aSigners)) {
            var found = false;
            for (var i = 0; !found && i < aSigners.length; i++) {
                if (angular.equals(self.item.guid, aSigners[i].Guid)) {
                    aSigners[i].status = self.item.Status;
                    found = true;
                }
            }
        }
        $log.debug("signStatusCtrl.UpdateSignersList end: ");
    }

    function initCtrl(btnModel, status, aItem) {
        self.btnModel.doc.url = angular.isObject(aItem) ? ENV.SignApiUrl_GetAttachment.replace(":reqId", aItem.ProcessGuid) : null;
        $log.debug("signStatusCtrl.initCtrl: doc=" + self.btnModel.doc.url);

        if (!angular.equals(status, CONST.ESIGNSTATUS.UNSIGNED.value)) {
            btnModel.acc.disabled = true;
            btnModel.rej.disabled = true;
            btnModel.att.disabled = true;
            btnModel.acc.hideBtn = true;
            btnModel.rej.hideBtn = true;
            btnModel.att.hideBtn = true;
        }

        btnModel.rej.strId = ("DocumentType" in aItem) && (aItem.DocumentType === CONST.ESIGNTYPE.OFFICIAL.value) ? 'STR_RETURN' : 'STR_REJECT';
        btnModel.rej.cConf.text = ("DocumentType" in aItem) && (aItem.DocumentType === CONST.ESIGNTYPE.OFFICIAL.value) ? 'STR_CNFM_SIGN_RET' : 'STR_CNFM_SIGN_REJ';

        if (angular.isString(aItem.TranslationGuid) && aItem.TranslationGuid.length) {
            self.btnModel.doctr.url = ENV.SIGNAPIURL_DOC_TRANSLATED.replace(':reqId', aItem.ProcessGuid).replace(':transId', true).replace(':attId', '');
            $log.debug("signStatusCtrl.initCtrl: transition doc=" + self.btnModel.doctr.url);
            btnModel.doctr.hideBtn = false;
        }

        var atts = SigningUtil.parseAtts(aItem);
        btnModel.att.count = atts.length;
        self.selData = ListData.createEsignAttachmentList({ 'header': 'STR_ATTACHMENTS', 'title': aItem.Name }, atts, aItem);
    }

    function saveStatusCb() {
        initCtrl(self.btnModel, self.item.Status, self.item);
    }

    function saveStatus(op, cb) {
        $log.log("signStatusCtrl.saveStatus: " , arguments);

        if (!(op instanceof SignOperation)) {
            $log.error("signStatusCtrl.saveStatus: bad arguments");
            return;
        }

        clearAlerts();

        op.busy = true;

        var resp = SigningOpenApi.save(op.item, function (/*value*/) {
            $log.debug("signStatusCtrl.saveStatus: done: ", arguments);
            self.item.Status = op.item.Status;
            // Update also the list of signers in right side of screen
            UpdateSignersList(self.item.Signers);
            op.item = null; // Free up reference to allow cleanup
            if (angular.isFunction(cb)) {
                cb();
            }
        }, function (error) {
            $log.error("signStatusCtrl.saveStatus: error: ", arguments);
            if (angular.isObject(error)) {
                Utils.showErrorForErrorCode(error.status);
            }
        });
        resp.$promise.finally(function () {
            $log.debug("signStatusCtrl.saveStatus: finally");
            op.busy = false;
        });
    }

    function getRequestorInfo(reqInfo, item) {
        $log.debug("signStatusCtrl.getRequestorInfo", arguments);

        if (reqInfo && angular.isString(item.RequestorId) && item.RequestorId.length) {
            reqInfo.busy = true;
            var response = SigningPersonInfoApi.get({ userId: item.RequestorId }, function (/*data*/) {
                $log.debug("signStatusCtrl.getRequestorInfo: success ");
                reqInfo.email = response.email;
            }, function (/*error*/) {
                $log.error("signStatusCtrl.getRequestorInfo: error: ", arguments);
            });
            response.$promise.finally(function () {
                reqInfo.busy = false;
            });
        } else {
            $log.error("signStatusCtrl.getRequestorInfo: bad args: ", arguments);
        }
    }

    // PUBLIC FUNCTIONS

    self.actionAttList = function () {
        if (self.isMobile) {
            StorageSrv.setKey(CONST.KEY.SELECTION_DATA, self.selData);
            $state.go(CONST.APPSTATE.SIGNLISTATT);
        } else {
            $log.error("signStatusCtrl.actionAttList: bad state");
        }
    };

    self.actionSign = function () {
        clearAlerts();
        self.op = new SignOperation(self.item, CONST.ESIGNSTATUS.SIGNED.value);
        saveStatus(self.op, saveStatusCb);
    };

    self.actionReject = function () {
        clearAlerts();
        self.op = new SignOperation(self.item, CONST.ESIGNSTATUS.REJECTED.value);
        saveStatus(self.op, saveStatusCb);
    };

    self.actionSignings = function () {
        if (self.isMobile) {
            $state.go(CONST.APPSTATE.DOCSIGNERS);
        }
    };

    self.isDisabled = function (id) {
        var res = false;
        if (self.op && self.op.busy) {
            res = true;
        }
        else {
            switch (id) {
                case self.btnModel.att.id:
                    res = self.btnModel.att.disabled || !self.btnModel.att.count;
                    break;
                default:
                    res = self.btnModel[id].disabled;
                    break;
            }
        }
        return res;
    };

    /* Resolve css class for signing status */
    self.statusStyle = function (status) {
        var s = Utils.objWithVal(CONST.ESIGNSTATUS, 'value', status);
        return s ? s.badgeClass : 'label-default';
    };

    /* Resolve display text for item status */
    self.statusStrId = function (value) {
        var s = Utils.objWithVal(CONST.ESIGNSTATUS, 'value', value);
        return s ? s.stringId : '';
    };

    self.goHome = function () {
        self.ongoing = true; // Display progress bar in case transition change takes time
        $rootScope.goHome();
    };

    self.toggleParallelMode = function () {
        $rootScope.parallelMode = $rootScope.parallelMode ? false : true;
    };

    self.ongoing = false;

    initCtrl(self.btnModel, self.item.Status, self.item);

    getRequestorInfo(self.requestorInfo, self.item);

});
