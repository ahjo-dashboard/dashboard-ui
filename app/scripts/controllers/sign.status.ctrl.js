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
app.controller('signStatusCtrl', function ($log, $scope, $state, SigningAttApi, $sce, $timeout, $uibModal, ENV, SigningOpenApi, SigningPersonInfoApi, CONST, $rootScope, SigningDocSignaturesApi, ListData, $stateParams, StorageSrv, Utils) {

    var self = this;
    self.isMobile = $rootScope.isMobile;
    self.item = null;
    self.ongoing = true;
    self.personInfo = null;

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

    self.item.Comment = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."; //TODO: REMOVE THIS TEST CODE

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
        rej: { id: 'rej', disabled: false, active: false, hideBtn: false, hide: false, cConf: { title: 'STR_CNFM_TEXT', text: 'STR_CNFM_SIGN_REJ', yes: 'STR_YES', no: 'STR_NO', isOpen: false } },
        sta: { id: 'sta', busy: false, disabled: false, active: false, hideBtn: false, hide: false, signers: null },
        com: { id: 'com', disabled: false, active: false },
        att: {
            id: 'att', disabled: false, active: false, hideBtn: false, hide: false, url: undefined,
            isOpen: false,
            count: self.attModel ? self.attModel.objects.length : 0,
            toggle: function (arg) {
                //$log.debug("signStatusCtrl: dropdown att toggled: " + arg + ", active: " + this.active);
                self.btnModel.att.isOpen = arg;
            },
        }
    };

    // PRIVATE FUNCTIONS

    function clearAlerts() {
        // self.alerts.length = 0;
    }

    function isModalOpen() {
        return self.btnModel.acc.cConf.isOpen || self.btnModel.rej.cConf.isOpen;
    }

    function initBtns(btnModel, status) {
        self.btnModel.doc.url = self.item ? ENV.SignApiUrl_GetAttachment.replace(":reqId", self.item.ProcessGuid) : null;
        $log.debug("signStatusCtrl.initBtns: doc=" + self.btnModel.doc.url);

        if (!angular.equals(status, CONST.ESIGNSTATUS.UNSIGNED.value)) {
            btnModel.acc.hideBtn = true;
            btnModel.rej.hideBtn = true;
            btnModel.att.disabled = true;
            btnModel.att.hide = true;
        }

        if (angular.isString(self.item.TranslationGuid) && self.item.TranslationGuid.length) {
            self.btnModel.doctr.url = ENV.SIGNAPIURL_DOC_TRANSLATED.replace(':reqId', self.item.ProcessGuid).replace(':transId', true).replace(':attId', '');
            $log.debug("signStatusCtrl.initBtns: transition doc=" + self.btnModel.doctr.url);
            btnModel.doctr.hideBtn = false;
        }

        if (!self.isMobile) {
            // setBtnActive(self.btnModel.doc.id); // On desktop document is displayed by default
        }
    }

    function saveStatus(item, status) {
        if (!item || !(item instanceof Object) || !("Status" in item)) {
            $log.debug(item);
            throw new Error("signStatusCtrl.saveStatus: bad arguments");
        }

        $log.log("signStatusCtrl.saveStatus: " + item.Name + ", current status: " + item.Status);

        clearAlerts();

        self.ongoing = true;

        self.displayStatus = false;
        var oldStatus = item.Status;
        item.Status = status; // This must be reverted if status change op fails
        self.responseOpen = SigningOpenApi.save(item, function (value) {
            $log.debug("signStatusCtrl.saveStatus: done. New object: ");
            $log.debug(value);
            self.item = value;
        }, function (error) {
            $log.error("signStatusCtrl.saveStatus: \n" + JSON.stringify(error));
            self.alerts.push({ type: 'danger', locId: 'STR_FAIL_OP', resCode: error.status, resTxt: error.statusText });
            item.Status = oldStatus;
        });
        self.responseOpen.$promise.finally(function () {
            $log.debug("signStatusCtrl.saveStatus: finally");
            self.ongoing = null;
            self.displayStatus = true;
            initBtns(self.btnModel, self.item.Status);
        });
    }

    function displayRequestor(person) {
        if (person && angular.isString(person.email) && person.email.length) {
            self.requestorEmail = person.email;
            // self.alerts.push({ type: 'info', locId: 'STR_SIGNING_COMMENT_INFO', linkMailto: person.email });
            //TODO: display modal
        } else {
            $log.error("signStatusCtrl.displayRequestor: bad args");
            self.alerts.push({ type: 'warning', locId: 'STR_SIGNING_NO_EMAIL' });//TODO: display modal
        }
    }

    function personInfo(busyCont) {
        $log.debug("signStatusCtrl.personInfo");

        if (!self.personInfo) {
            busyCont.busy = true;
            self.personInfo = SigningPersonInfoApi.get({ userId: self.requestorId }, function (/*data*/) {
                $log.debug("signStatusCtrl.personInfo: api query done");
                displayRequestor(self.personInfo);
            }, function (error) {
                $log.error("signStatusCtrl.personInfo: api query error: " + JSON.stringify(error));
                self.alerts.push({ type: 'danger', locId: 'STR_FAIL_OP', resCode: error.status, resTxt: error.statusText });//TODO: display modal
            });
            self.personInfo.$promise.finally(function () {
                busyCont.busy = false;
            });
        } else {
            displayRequestor(self.personInfo);
        }
    }

    // Workaround on IE to hide <object> pdf because IE displays it topmost covering modals and dropdowns.
    function hidePdfOnIe() {
        return $rootScope.isIe && (self.btnModel.att.isOpen || isModalOpen());
    }

    function displaySignings(sgn) {
        if (!sgn || !("Signers" in sgn)) {
            $log.error("signStatusCtrl.displaySignings: bad args");
            return;
        }
        $log.debug("signStatusCtrl.displaySignings: " + sgn.Signers.length);
        self.btnModel.sta.signers = sgn;
        // if ($rootScope.isMobile) {
        //     $state.go(CONST.APPSTATE.DOCSIGNERS, { 'signers': self.btnModel.sta.signers });
        // }
        //TODO: display modal
    }

    function docSignings(item, busyCont) {
        $log.debug("signStatusCtrl.docSignings");
        // self.btnModel.sta.hide = true;
        if (!item || !("Guid" in item) || !item.Guid || self.ongoing) {
            $log.error("signStatusCtrl.docSignings: bad args");
            return;
        }

        busyCont.busy = true;
        self.docSignings = SigningDocSignaturesApi.get({ reqId: item.ProcessGuid }, function (/*data*/) {
            $log.debug("signStatusCtrl.docSignings: api query done");
            displaySignings(self.docSignings);
        }, function (error) {
            $log.error("signStatusCtrl.docSignings: api query error: " + JSON.stringify(error));
            self.alerts.push({ type: 'danger', locId: 'STR_FAIL_OP', resCode: error.status, resTxt: error.statusText });
        });
        self.docSignings.$promise.finally(function () {
            busyCont.busy = false;
        });
    }

    // PUBLIC FUNCTIONS

    self.actionAttList = function () {
        if (self.isMobile) {
            StorageSrv.setKey(CONST.KEY.SELECTION_DATA, self.attModel);
            $state.go(CONST.APPSTATE.SIGNLISTATT);
        } else {
            $log.error("signStatusCtrl.actionAttList: bad state");
        }
    };

    self.actionSign = function () {
        clearAlerts();
        saveStatus(self.item, CONST.ESIGNSTATUS.SIGNED.value);
    };

    self.actionReject = function () {
        clearAlerts();
        saveStatus(self.item, CONST.ESIGNSTATUS.REJECTED.value);
    };

    self.actionComment = function () {
        clearAlerts();
        personInfo();
        // setBtnActive(self.btnModel.com.id);
    };

    self.actionSignings = function () {
        clearAlerts();
        docSignings(self.item, self.btnModel.sta);
        // setBtnActive(self.btnModel.sta.id);
    };

    self.isDisabled = function () {
        // $log.debug("signStatusCtrl.isDisabled: " + id);
        var res = false;
        // if (self.ongoing) {
        //     res = true;
        // }
        // else {
        //     switch (id) {
        //         case self.btnModel.att.id:
        //             res = self.btnModel.att.disabled || !self.btnModel.att.count;
        //             break;
        //         default:
        //             res = self.btnModel[id].disabled;
        //             break;
        //     }
        // }
        return res;
    };

    // Checks if an element should be hidden dynamically or not.
    self.isHidden = function (id) {
        // $log.debug("signStatusCtrl.isHidden: " + id);
        var res = false;
        if (self.ongoing) {
            res = true;
        }
        else {
            switch (id) {
                case self.btnModel.doc.id:
                    res = self.btnModel.doc.hide || hidePdfOnIe();
                    break;
                case self.btnModel.att.id:
                    res = self.btnModel.att.hide || hidePdfOnIe();
                    break;
                default:
                    res = self.btnModel[id].hide;
                    break;
            }
        }
        return res;
    };

    self.isActive = function (id) {
        //$log.debug("signStatusCtrl.isActive: " + id + "=" +self.btnModel[id].active);
        return !self.isMobile && self.btnModel[id].active;
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
    initBtns(self.btnModel, self.item.Status);


});
