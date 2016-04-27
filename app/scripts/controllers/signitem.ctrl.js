/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc function
 * @name dashboard.controller:signitemCtrl
 * @description
 * # signitemCtrl
 * Controller of the dashboard
 */
angular.module('dashboard')
    .controller('signitemCtrl', function ($log, $scope, $state, $stateParams, SigningAttApi, $sce, $timeout, $uibModal, ENV, SigningOpenApi, SigningPersonInfoApi, CONST, $rootScope, SigningDocSignaturesApi, ListData, StorageSrv) {
        $log.debug("signitemCtrl.config");

        var self = this;
        self.item = $stateParams.signItem;
        if (!self.item || !self.item.ProcessGuid || !self.item.ProcessGuid.length) {
            $log.error("signitemCtrl: item missing");
            $state.go(CONST.APPSTATE.HOME);
            return;
        } else {
            $log.debug("signItemCtrl: name: " + self.item.Name);
        }

        self.fileName = {};
        self.remoteUrl = null;
        self.ongoing = false;
        self.alerts = [];
        self.isMobile = $rootScope.isMobile;
        self.linkConfig = {
            title: 'STR_SIGNING_REQ',
            class: 'btn btn-info btn-lg btn-block wrap-button-text db-btn-prim' // Used only on mobile
        };

        var atts = [];
        for (var i = 0; angular.isArray(self.item.AttachmentInfos) && i < self.item.AttachmentInfos.length; i++) {
            atts.push(JSON.parse(self.item.AttachmentInfos[i])); // API returns items as JSON strings so parse into object
            // Example attachment info item: {"Id":"123456789", "ParentTitle":"abc", "Title":"xyz.pdf"}
        }
        self.attModel = ListData.createEsignAttachmentList('STR_ATTACHMENTS', atts, self.item);

        // MODEL OBJECTS FOR ACTIONS
        // disabled: true if button should be disabled
        // active: true if button should displayed active
        // hide: true if content specific to the button should be hidden
        self.btnModel = {
            doc: { id: 'doc', disabled: false, active: false, hide: true, url: null },
            acc: { id: 'acc', disabled: false, active: false, hide: true, cConf: { title: 'STR_CNFM_TEXT', text: 'STR_CNFM_SIGN_ACC', yes: 'STR_YES', no: 'STR_NO', isOpen: false } },
            rej: { id: 'rej', disabled: false, active: false, hide: true, cConf: { title: 'STR_CNFM_TEXT', text: 'STR_CNFM_SIGN_REJ', yes: 'STR_YES', no: 'STR_NO', isOpen: false } },
            sta: { id: 'sta', disabled: false, active: false, hide: true, signers: null },
            com: { id: 'com', disabled: false, active: false },
            att: {
                id: 'att', disabled: false, active: false, hide: true, url: undefined,
                isOpen: false,
                count: self.attModel ? self.attModel.objects.length : 0,
                toggle: function (arg) {
                    //$log.debug("signingItemCtrl: dropdown att toggled: " + arg + ", active: " + this.active);
                    self.btnModel.att.isOpen = arg;
                },
            }
        };

        self.displayStatus = true;
        self.requestorName = self.item.RequestorName ? self.item.RequestorName : null;
        self.requestorId = self.item.RequestorId ? self.item.RequestorId : null;
        self.fileName = self.item.Name;
        self.docSignings = null;

        // PRIVATE FUNCTIONS

        function setBtnActive(id) {
            if (!angular.isString(id) && id.length <= 0) {
                $log.error("signingItemCtrl.setBtnActive: bad args");
                return;
            }

            for (var i in self.btnModel) {
                if (id === i) {
                    self.btnModel[i].active = true;
                    self.btnModel[i].hide = false;
                } else {
                    self.btnModel[i].active = false;
                    self.btnModel[i].hide = true;
                }

                // $log.debug("btn: " + self.btnModel[i].id + " active: " + self.btnModel[i].active);
            }
        }

        function resolveDocUrl(item) {
            return ENV.SignApiUrl_GetAttachment.replace(":reqId", item.ProcessGuid);
        }

        function initBtns(btnModel, status) {
            self.btnModel.doc.url = resolveDocUrl(self.item);

            if (status !== CONST.ESIGNSTATUS.UNSIGNED.value) {
                btnModel.acc.disabled = true;
                btnModel.rej.disabled = true;
            }
            if (!self.isMobile) {
                setBtnActive(self.btnModel.doc.id); // On desktop document is displayed by default
            }
        }

        function clearAlerts() {
            self.alerts.length = 0;
        }

        function saveStatus(item, status) {
            if (!item || !(item instanceof Object) || !("Status" in item)) {
                $log.debug(item);
                throw new Error("signitemCtrl.saveStatus: bad arguments");
            }
            $log.log("signitemCtrl.saveStatus: " + item.Name + ", current status: " + item.Status);
            clearAlerts();

            self.ongoing = true;
            self.displayStatus = false;
            var oldStatus = item.Status;
            item.Status = status; // This must be reverted if status change op fails
            self.responseOpen = SigningOpenApi.save(item, function (value) {
                $log.debug("adOpenSignreqs.saveStatus: SigningOpenApi.save done. New object: ");
                $log.debug(value);
                self.item = value;
            }, function (error) {
                $log.error("adOpenSignreqs.saveStatus: SigningOpenApi.save error: " + JSON.stringify(error));
                self.alerts.push({ type: 'danger', locId: 'STR_FAIL_OP', resCode: error.status, resTxt: error.statusText });
                item.Status = oldStatus;
            });
            self.responseOpen.$promise.finally(function () {
                $log.debug("adOpenSignreqs.saveStatus: SigningOpenApi.save finally");
                self.ongoing = null;
                self.displayStatus = true;
                initBtns(self.btnModel, self.item.Status);
            });
        }

        function displayRequestor(person) {
            if (person && "email" in person) {
                self.requestorEmail = person.email;
                self.alerts.push({ type: 'info', locId: 'STR_SIGNING_COMMENT_INFO', linkMailto: person.email });
            } else {
                $log.error("signItemCtrl.displayRequestor: bad args");
                self.alerts.push({ type: 'warning', locId: 'STR_SIGNING_NO_EMAIL' });
            }
        }

        function personInfo() {
            $log.debug("signitemCtrl.personInfo");

            if (!self.personInfo) {
                self.ongoing = true;
                self.personInfo = SigningPersonInfoApi.get({ userId: self.requestorId }, function (/*data*/) {
                    $log.debug("signitemCtrl.personInfo: api query done");
                    displayRequestor(self.personInfo);
                }, function (error) {
                    $log.error("signitemCtrl.personInfo: api query error: " + JSON.stringify(error));
                    self.alerts.push({ type: 'danger', locId: 'STR_FAIL_OP', resCode: error.status, resTxt: error.statusText });
                });
                self.personInfo.$promise.finally(function () {
                    self.ongoing = false;
                });
            } else {
                displayRequestor(self.personInfo);
            }
        }

        function displaySignings(sgn) {
            if (!sgn || !("Signers" in sgn)) {
                $log.error("signItemCtrl.displaySignings: bad args");
                return;
            }
            $log.debug("signItemCtrl.displaySignings: " + sgn.Signers.length);
            self.btnModel.sta.signers = sgn.Signers;
            if ($rootScope.isMobile) {
                $state.go(CONST.APPSTATE.DOCSIGNERS, { 'signers': self.btnModel.sta.signers });
            }
        }

        function docSignings(item) {
            $log.debug("signitemCtrl.docSignings");
            self.btnModel.sta.hide = true;
            if (!item || !("Guid" in item) || !item.Guid || self.ongoing) {
                $log.error("signItemCtrl.docSignings: bad args");
                return;
            }

            self.ongoing = true;
            self.docSignings = SigningDocSignaturesApi.get({ reqId: item.ProcessGuid }, function (/*data*/) {
                $log.debug("signitemCtrl.docSignings: api query done");
                displaySignings(self.docSignings);
            }, function (error) {
                $log.error("signitemCtrl.docSignings: api query error: " + JSON.stringify(error));
                self.alerts.push({ type: 'danger', locId: 'STR_FAIL_OP', resCode: error.status, resTxt: error.statusText });
            });
            self.docSignings.$promise.finally(function () {
                self.ongoing = false;
            });
        }

        function isModalOpen() {
            return self.btnModel.acc.cConf.isOpen || self.btnModel.rej.cConf.isOpen;
        }

        // Workaround on IE to hide <object> pdf because IE displays it topmost covering modals and dropdowns.
        function hidePdfOnIe() {
            return $rootScope.isIe && (self.btnModel.att.isOpen || isModalOpen());
        }

        // PUBLIC FUNCTIONS

        self.actionDoc = function () {
            clearAlerts();
            $log.debug("signitemCtrl.actionDoc: " + self.btnModel.doc.url);
            setBtnActive(self.btnModel.doc.id);

            // Comment displayed via different element on mobile
            if (!self.isMobile && angular.isObject(self.item) && self.item.Comment && self.item.Comment.length) {
                self.alerts.push({ type: 'warning', resTxt: self.item.Comment });
            }
        };

        self.actionAttachment = function (att) {
            clearAlerts();
            if (!$rootScope.isMobile || !angular.isObject(att)) {
                self.btnModel.att.url = att.link;
                $log.debug("signitemCtrl.actionAttachment: " + self.btnModel.att.url);
                setBtnActive(self.btnModel.att.id);
            } else {
                $log.error("signitemCtrl.actionAttachment: bad state or args");
            }
        };

        self.actionAttList = function () {
            if ($rootScope.isMobile) {
                StorageSrv.setKey(CONST.KEY.SELECTION_DATA, self.attModel);
                $state.go(CONST.APPSTATE.SIGNLISTATT);
            } else {
                $log.error("signitemCtrl.actionAttList: bad state");
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
            setBtnActive(self.btnModel.com.id);
        };

        self.actionSignings = function () {
            clearAlerts();
            docSignings(self.item);
            setBtnActive(self.btnModel.sta.id);
        };

        self.closeAlert = function (index) {
            // $log.debug("signitemCtrl.closeAlert " + index);
            self.alerts.splice(index, 1);
        };

        self.isDisabled = function (id) {
            // $log.debug("signingItemCtrl.isDisabled: " + id);
            var res = false;
            if (self.ongoing) {
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

        // Checks if an element should be hidden dynamically or not.
        self.isHidden = function (id) {
            // $log.debug("signingItemCtrl.isHidden: " + id);
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
            //$log.debug("signingItemCtrl.isActive: " + id + "=" +self.btnModel[id].active);
            return !self.isMobile && self.btnModel[id].active;
        };

        /* Resolve css class for signing status */
        self.statusStyle = function (status) {
            var s = $rootScope.objWithVal(CONST.ESIGNSTATUS, 'value', status);
            return s ? s.badgeClass : 'label-default';
        };

        /* Resolve display text for item status */
        self.statusStrId = function (value) {
            var s = $rootScope.objWithVal(CONST.ESIGNSTATUS, 'value', value);
            return s ? s.stringId : '';
        };

        self.goHome = function () {
            self.ongoing = true; // Display progress bar in case transition change takes time
            $rootScope.goHome();
        };

        initBtns(self.btnModel, self.item.Status);

        // Comment displayed via different element on mobile
        if (!self.isMobile && angular.isObject(self.item) && self.item.Comment && self.item.Comment.length) {
            self.alerts.push({ type: 'warning', resTxt: self.item.Comment });
        }
    });
