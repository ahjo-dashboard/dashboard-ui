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
    .controller('signitemCtrl', function($log, $scope, $state, $stateParams, SigningAttApi, $sce, $timeout, $uibModal, ENV, SigningOpenApi, SigningPersonInfoApi, CONST, $rootScope, SigningDocSignaturesApi) {
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

        self.blob = null;
        self.displayUrl = {};
        self.fileUrl = {};
        self.fileName = {};
        self.remoteUrl = null;
        self.docUrl = {};
        self.ongoing = false;
        self.alerts = [];
        self.isMobile = $rootScope.isMobile;
        // self.attModel = ListData.signingAttachmentList('STR_ATTACHMENTS', self.item.AttachmentInfos);
        self.btnModel = {
            doc: { id: 'doc', disabled: false, active: false, hide: false },
            acc: { id: 'acc', disabled: false, active: false },
            rej: { id: 'rej', disabled: false, active: false },
            sta: { id: 'sta', disabled: false, active: false },
            com: { id: 'com', disabled: false, active: false },
            att: { id: 'att', disabled: true, active: false,
                count: self.item.AttachmentInfos ? self.item.AttachmentInfos.length : 0,
                toggle: function(arg) { self.btnModel.att.isOpen = arg; },
                isOpen: false }
        };

        self.displayStatus = true;
        self.requestorName = self.item.RequestorName ? self.item.RequestorName : null;
        self.requestorId = self.item.RequestorId ? self.item.RequestorId : null;
        self.fileName = self.item.Name;
        self.docSignings = null;

        // PRIVATE FUNCTIONS

        function setBtnActive(id) {
            if (typeof id !== 'string' && id.length <= 0) {
                $log.error("signingItemCtrl.setBtnActive: bad args");
                return;
            }

            for (var i in self.btnModel) {
                self.btnModel[i].active = id === i ? true : false;
                // $log.debug("btn: " + self.btnModel[i].id + " active: " + self.btnModel[i].active);
            }
        }


        function initBtns(btnModel, status) {
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

        function setDisplayUrl(url) {
            $log.debug("signitemCtrl.setDisplayUrl: " + url);
            self.displayUrl = url;
            setBtnActive(self.btnModel.doc.id);
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
                function(response) {
                    var blob = new Blob([(response.pdfBlob)], { type: 'application/pdf' });
                    drawBlob(blob, false);
                },
                function(err) {
                    $log.error("signitemCtrl.fetchBlob: SigningAttApi.getPdfBlob " + JSON.stringify(err));
                    self.errCode = err.status;
                })
                .finally(function() {
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
            self.responseOpen = SigningOpenApi.save(item, function(value) {
                $log.debug("adOpenSignreqs.saveStatus: SigningOpenApi.save done. New object: ");
                $log.debug(value);
                self.item = value;
            }, function(error) {
                $log.error("adOpenSignreqs.saveStatus: SigningOpenApi.save error: " + JSON.stringify(error));
                self.alerts.push({ type: 'danger', locId: 'STR_FAIL_OP', resCode: error.status, resTxt: error.statusText });
                item.Status = oldStatus;
            });
            self.responseOpen.$promise.finally(function() {
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
                self.personInfo = SigningPersonInfoApi.get({ userId: self.requestorId }, function(/*data*/) {
                    $log.debug("signitemCtrl.personInfo: api query done");
                    displayRequestor(self.personInfo);
                }, function(error) {
                    $log.error("signitemCtrl.personInfo: api query error: " + JSON.stringify(error));
                    self.alerts.push({ type: 'danger', locId: 'STR_FAIL_OP', resCode: error.status, resTxt: error.statusText });
                });
                self.personInfo.$promise.finally(function() {
                    self.ongoing = false;
                });
            } else {
                displayRequestor(self.personInfo);
            }
        }
        // rooli nimi tila aika dd.mm.yyy hh:mm, vanassa status myös värikoodilla
        function displaySignings(sgn) {
            if (!sgn || !("Signers" in sgn)) {
                $log.error("signItemCtrl.displaySignings: bad args");
                return;
            }
            $log.debug("signItemCtrl.displaySignings: " + sgn.Signers.length);
            if (!$rootScope.isMobile) {
                self.btnModel.doc.hide = true;
                setBtnActive(self.btnModel.sta.id);
                self.listMdl = sgn.Signers;
            }
            else {
                $state.go(CONST.APPSTATE.DOCSIGNERS, { 'signers': sgn.Signers });
            }
        }

        function docSignings(item) {
            $log.debug("signitemCtrl.docSignings");
            self.listMdl = null;
            if (!item || !("Guid" in item) || !item.Guid || self.ongoing) {
                $log.error("signItemCtrl.docSignings: bad args");
                return;
            }

            self.ongoing = true;
            self.docSignings = SigningDocSignaturesApi.get({ reqId: item.ProcessGuid }, function(/*data*/) {
                $log.debug("signitemCtrl.docSignings: api query done");
                displaySignings(self.docSignings);
            }, function(error) {
                $log.error("signitemCtrl.docSignings: api query error: " + JSON.stringify(error));
                self.alerts.push({ type: 'danger', locId: 'STR_FAIL_OP', resCode: error.status, resTxt: error.statusText });
            });
            self.docSignings.$promise.finally(function() {
                self.ongoing = false;
            });
        }
        // PUBLIC FUNCTIONS

        self.actionDoc = function() {
            if (self.isMobile) {
                self.openFileModal(self.displayUrl, null, self.fileName);
            } else {
                setDisplayUrl(self.docUrl);
            }
            self.btnModel.doc.hide = false;
            self.listMdl = null;
        };

        self.actionAttListCb = function() {
            $log.debug("signitemCtrl.actionAttListCb");
        };

        self.actionSign = function() {
            saveStatus(self.item, CONST.ESIGNSTATUS.SIGNED.value);
        };

        self.actionReject = function() {
            saveStatus(self.item, CONST.ESIGNSTATUS.REJECTED.value);
        };

        self.actionComment = function() {
            clearAlerts();
            personInfo();
        };

        self.actionSignings = function() {
            docSignings(self.item);
        };

        self.closeAlert = function(index) {
            $log.debug("signitemCtrl.closeAlert " + index);
            self.alerts.splice(index, 1);
        };

        self.openFileModal = function(fileUrl, fileBlob, fileHeading) {
            $log.debug("signitemCtrl.openFileModal: f: " + fileUrl + " b: " + fileBlob + " h: " + fileHeading);
            self.ongoing = true;
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'views/modalfile.html',
                controller: 'modalFileCtrl',
                controllerAs: 'mfc',
                windowTopClass: 'db-large-modal',
                resolve: {
                    aUrl: function() {
                        return fileUrl;
                    },
                    aBlob: function() {
                        return fileBlob;
                    },
                    aHeading: function() {
                        return fileHeading;
                    }
                }
            });
            self.hideEmbObj = true;
            modalInstance.result.then(function(/* arg here passed from controller */) {
            }, function(arg) {
                $log.debug("signitemCtrl: Modal dismissed: " + arg);
                self.hideEmbObj = false;
                self.ongoing = false;
            });
        };

        self.isDisabled = function(id) {
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
        self.isHidden = function() {
            // For now needed only for hiding emb pdf when att dropdown is open,
            // Extend with id argument in future if necessary.

            // Workaround on IE to hide <object> pdf because IE displays it topmost covering modals and dropdowns.
            return $rootScope.isIe && self.btnModel.att.isOpen;
        };


        self.isActive = function(id) {
            //$log.debug("signingItemCtrl.isActive: " + id + "=" +self.btnModel[id].active);
            return !self.isMobile && self.btnModel[id].active;
        };

        /* Resolve css class for signing status */
        self.statusStyle = function(status) {
            var s = $rootScope.objWithVal(CONST.ESIGNSTATUS, 'value', status);
            return s ? s.badgeClass : 'label-default';
        };

        /* Resolve display text for item status */
        self.statusStrId = function(value) {
            var s = $rootScope.objWithVal(CONST.ESIGNSTATUS, 'value', value);
            return s ? s.stringId : '';
        };

        self.goHome = function() {
            self.ongoing = true;
            $rootScope.goHome();
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
