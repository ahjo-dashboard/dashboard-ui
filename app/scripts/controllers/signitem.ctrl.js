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
    .controller('signitemCtrl', function ($log, $scope, $state, $stateParams, SigningAttApi, $sce, $timeout, $uibModal, MessageService, ENV, APPSTATE, SigningOpenApi, SigningPersonInfoApi, ESIGNSTATUS, $rootScope) {
        $log.debug("signitemCtrl.config");

        var self = this;
        self.item = $stateParams.signItem;
        if (!self.item || !self.item.ProcessGuid || !self.item.ProcessGuid.length) {
            $log.error("signitemCtrl: item missing");
            $state.go(APPSTATE.HOME);
            return;
        } else {
            $log.debug("signItemCtrl: name: " + self.item.Name);
        }

        self.blob = null;
        self.displayUrl = {};
        self.fileUrl = {};
        self.fileName = {};
        self.remoteUrl = null;
        self.docUrl = {};
        self.hideEmbObj = false; // Workaround for IE which displays embedded object always topmost.
        self.ongoing = false;
        self.alerts = [];
        self.isMobile = $rootScope.isMobile;
        self.btnModel = {
            doc: { disabled: false, active: false },
            acc: { disabled: false, active: false },
            rej: { disabled: false, active: false },
            sta: { disabled: false, active: false },
            com: { disabled: false, active: false },
            att: { disabled: false, active: false, count: self.item.AttachmentInfos ? self.item.AttachmentInfos.length : 0 }
        };
        self.displayStatus = true;

        self.requestorName = self.item.RequestorName ? self.item.RequestorName : null;
        self.requestorId = self.item.RequestorId ? self.item.RequestorId : null;
        self.fileName = self.item.Name;

        // PRIVATE FUNCTIONS

        function initBtns(btnModel, status) {
            if (status !== ESIGNSTATUS.UNSIGNED.value) {
                btnModel.acc.disabled = true;
                btnModel.rej.disabled = true;
            }
            if (!self.isMobile) {
                self.btnModel.doc.active = true; // On desktop document is displayed by default
            }
        }

        function clearAlerts() {
            self.alerts.length = 0;
        }

        function setDisplayUrl(url) {
            $log.debug("signitemCtrl.setDisplayUrl: " + url);
            self.displayUrl = url;
        }

        function drawBlob(blob, delayExpired) {
            if (blob && !self.blob) {
                self.blob = blob;
            }

            if (delayExpired) {
                self.fileDrawDelayExpired = delayExpired;
            }

            if (self.blob && self.fileDrawDelayExpired) {
                setDisplayUrl(URL.createObjectURL(self.blob));
                //self.fileContent = $sce.trustAsResourceUrl(self.displayUrl);
                $log.debug("signitemCtrl.drawBlob: set fileUrl: " + self.displayUrl);
            }
        }

        function fetchBlob(item) {
            $log.debug("signitemCtrl.fetchBlob: SigningAttApi.getPdfBlob guid=" + item.ProcessGuid);

            SigningAttApi.getPdfBlob({ reqId: item.ProcessGuid }).$promise
                .then(
                    function (response) {
                        var blob = new Blob([(response.pdfBlob)], { type: 'application/pdf' });
                        drawBlob(blob, false);
                    },
                    function (err) {
                        $log.error("signitemCtrl.fetchBlob: SigningAttApi.getPdfBlob " + JSON.stringify(err));
                        self.errCode = err.status;
                    })
                .finally(function () {
                });
        }

        function fetchUrl(item) {
            self.docUrl = ENV.SignApiUrl_GetAttachment.replace(":reqId", item.ProcessGuid);
            $log.debug("signitemCtrl.fetchUrl: " + self.docUrl);
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
                self.alerts.push({ type: 'success', locId: 'STR_OP_SUCCESS' });
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
            });
        }

        function displayRequestor(person) {
            if (person && "email" in person) {
                self.alerts.push({ type: 'info', locId: 'STR_SIGNING_COMMENT_INFO', resTxt: person.email });
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

        // PUBLIC FUNCTIONS

        self.actionDoc = function () {
            if (self.isMobile) {
                self.openFileModal(self.displayUrl);
            } else {
                setDisplayUrl(self.docUrl);
            }
        };

        self.actionAttListCb = function () {
            $log.debug("signitemCtrl.actionAttListCb");
        };

        self.actionSign = function () {
            saveStatus(self.item, ESIGNSTATUS.SIGNED.value);
        };

        self.actionReject = function () {
            saveStatus(self.item, ESIGNSTATUS.REJECTED.value);
        };

        self.actionComment = function () {
            clearAlerts();
            personInfo();
        };

        self.actionStatustCb = function () {
            $log.debug("signitemCtrl.actionStatustCb");
        };

        self.closeAlert = function (index) {
            $log.debug("signitemCtrl.closeAlert " + index);
            self.alerts.splice(index, 1);
        };

        self.openFileModal = function (fileUrl, fileBlob, fileHeading) {
            $log.debug("signitemCtrl.openFileModal: f: " + fileUrl + " b: " + fileBlob + " h: " + fileHeading);
            self.ongoing = true;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'views/modalfile.html',
                controller: 'modalFileCtrl',
                controllerAs: 'mfc',
                windowTopClass: 'db-large-modal',
                resolve: {
                    aUrl: function () {
                        return fileUrl;
                    },
                    aBlob: function () {
                        return fileBlob;
                    },
                    aHeading: function () {
                        return fileHeading;
                    }
                }
            });
            self.hideEmbObj = true;
            modalInstance.result.then(function (/* arg here passed from controller */) {
            }, function (arg) {
                $log.debug("signitemCtrl: Modal dismissed: " + arg);
                self.hideEmbObj = false;
                self.ongoing = false;
            });
        };

        self.isDisabled = function (id) {
            //$log.debug("signingItemCtrl.isDisabled: " + id);
            if (self.ongoing) {
                return true;
            }

            var res = false;
            switch (id) {
                case 'btnDoc':
                    res = self.btnModel.doc.disabled;
                    break;
                case 'btnAtt':
                    res = self.btnModel.att.disabled || !self.btnModel.att.count;
                    break;
                case 'btnSta':
                    res = self.btnModel.sta.disabled;
                    break;
                case 'btnCom':
                    res = self.btnModel.com.disabled;
                    break;
                case 'btnAcc':
                    res = self.btnModel.acc.disabled;
                    break;
                case 'btnRej':
                    res = self.btnModel.rej.disabled;
                    break;
                default:
                    break;
            }
            return res;
        };
        /* Resolve css class for signing status */
        self.statusStyle = function (status) {
            var s = $rootScope.objWithVal(ESIGNSTATUS, 'value', status);
            return s ? s.badgeClass : 'label-default';
        };

        /* Resolve display text for item status */
        self.statusStrId = function (value) {
            var s = $rootScope.objWithVal(ESIGNSTATUS, 'value', value);
            return s ? s.stringId : '';
        };

        initBtns(self.btnModel, self.item.Status);

        // Both blob and remote url implementations kept, but only one used.
        // Remove later when sure other one won't be needed.
        if (!ENV.app_useBlob) {
            fetchUrl(self.item);
            setDisplayUrl(self.docUrl);
        } else {
            fetchBlob(self.item);
            drawBlob();
        }
    });
