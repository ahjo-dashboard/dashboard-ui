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
    self.blob = null;
    self.fileUrl = {};
    self.fileName = {};
    self.remoteUrl = null;
    self.tmpUrl = null;
    self.hideEmbObj = false; // TODO: not needed if IE problem worked around by different layout or pdf.js
    self.item = $stateParams.signItem;
    self.ongoing = null;
    self.alerts = [];
    self.mobile = $rootScope.isScreenXs();

    if (!self.item || !self.item.ProcessGuid || !self.item.ProcessGuid.length) {
        $log.error("signitemCtrl: item missing");
        $state.go(APPSTATE.HOME);
        return;
    } else {
        $log.debug("signItemCtrl: name: " +self.item.Name);
    }

    self.requestorName = self.item.RequestorName ? self.item.RequestorName : null;
    self.requestorId = self.item.RequestorId ? self.item.RequestorId : null;

    // PRIVATE FUNCTIONS

    function clearAlerts() {
        self.alerts.length = 0;
    }

    function drawBlob(blob, delayExpired) {
        if (blob && !self.blob) {
            self.blob = blob;
        }

        if (delayExpired) {
            self.fileDrawDelayExpired = delayExpired;
        }

        if (self.blob && self.fileDrawDelayExpired) {
            self.fileUrl = URL.createObjectURL(self.blob);
            //self.fileContent = $sce.trustAsResourceUrl(self.fileUrl);
            $log.debug("signitemCtrl.drawBlob: set fileUrl: " +self.fileUrl);
        }
    }

    function fetchBlob(item) {
        $log.debug("signitemCtrl.fetchBlob: SigningAttApi.getPdfBlob guid=" +item.ProcessGuid);

        SigningAttApi.getPdfBlob({ reqId : item.ProcessGuid }).$promise
        .then(
            function(response) {
                var blob = new Blob([(response.pdfBlob)], {type: 'application/pdf'});
                drawBlob(blob, false);
            },
            function(err) {
                $log.error("signitemCtrl.fetchBlob: SigningAttApi.getPdfBlob " +JSON.stringify(err));
                self.errCode = err.status;
            })
        .finally(function() {
        });
    }

    function drawFileurl() {
        $log.debug("signitemCtrl.drawFileurl: " +self.tmpUrl +" fileName: " +self.fileName);
        self.fileUrl = self.tmpUrl;
    }

    function fetchUrl(item) {
        self.tmpUrl = ENV.SignApiUrl_GetAttachment.replace(":reqId", item.ProcessGuid);
        $log.debug("signitemCtrl.fetchUrl: " +self.tmpUrl);
    }

    function saveStatus(item, status) {
        if (!item || !(item instanceof Object) || !("Status" in item)) {
            $log.debug(item);
            throw new Error("signitemCtrl.saveStatus: bad arguments");
        }
        $log.log("signitemCtrl.saveStatus: " +item.Name +", current status: " +item.Status);
        clearAlerts();

        self.ongoing = true;
        item.Status = status;
        self.responseOpen = SigningOpenApi.save(item, function(value) {
            $log.debug("adOpenSignreqs.saveStatus: SigningOpenApi.save done. New object: ");
            $log.debug(value);
            self.alerts.push({ type: 'success', locId: 'STR_OP_SUCCESS' });
        }, function(error) {
            $log.error("adOpenSignreqs.saveStatus: SigningOpenApi.save error: " +JSON.stringify(error));
            self.alerts.push({ type: 'danger', locId: 'STR_FAIL_OP', resCode: error.status, resTxt: error.statusText });
        });
        self.responseOpen.$promise.finally(function() {
            $log.debug("adOpenSignreqs.saveStatus: SigningOpenApi.save finally");
            self.ongoing = null;
        });
    }

    function displayRequestor(person) {
        if (person && "email" in person) {
            self.alerts.push({ type: 'info', locId: 'STR_SIGNING_COMMENT_INFO', resTxt: person.email });
        }
    }

    function personInfo() {
        $log.debug("signitemCtrl.personInfo");

        if (!self.personInfo) {
            self.ongoing = true;
            self.personInfo = SigningPersonInfoApi.get({userId: self.requestorId}, function(/*data*/) {
                $log.debug("signitemCtrl.personInfo: api query done");
                displayRequestor(self.personInfo);
            }, function(error) {
                $log.error("signitemCtrl.personInfo: api query error: " +JSON.stringify(error));
                self.alerts.push({ type: 'danger', locId: 'STR_FAIL_OP', resCode: error.status, resTxt: error.statusText });
            });
            self.personInfo.$promise.finally(function() {
                self.ongoing = false;
            });
        } else {
            displayRequestor(self.personInfo);
        }
    }

    // PUBLIC FUNCTIONS

    self.actiontDocCb = function() {
      $log.debug("signitemCtrl.actiontDocCb");
      if (!self.fileUrl) {
        fetchUrl(self.item);
        }
    };

    self.actionAttListCb = function() {
      $log.debug("signitemCtrl.actionAttListCb");
    };

    self.actionSign = function() {
        saveStatus(self.item, ESIGNSTATUS.SIGNED.value);
    };

    self.actionReject = function() {
        saveStatus(self.item, ESIGNSTATUS.REJECTED.value);
    };

    self.actionComment = function() {
        clearAlerts();
        personInfo();
    };

    self.actionStatustCb = function() {
      $log.debug("signitemCtrl.actionStatustCb");
    };

    self.closeAlert = function(index) {
        $log.debug("signitemCtrl.closeAlert " +index);
        self.alerts.splice(index, 1);
    };

    function BtnConf(label, cb, model, style, active) {
        var res = this;
        res.label = label;
        res.cb = cb;
        res.model = model;
        res.style = style;
        res.active = active;
    }


    self.btnConfig = [
        new BtnConf('STR_SIGNING_REQ', self.actiontDocCb, null, 'btn btn-primary ad-button'),
        new BtnConf('STR_ATTACHMENTS', self.actionAttListCb, null, 'btn btn-info ad-button'),
        new BtnConf('STR_SIGNING_ACCEPT', self.actionSign, null, 'btn btn-success ad-button'),
        new BtnConf('STR_REJECT', self.actionReject, null, 'btn btn-warning ad-button'),
        new BtnConf('STR_CREATE_COMMENT', self.actionComment, null, 'btn btn-default ad-button'),
        new BtnConf('STR_SIGNING_REQ_STATUS', self.actionStatustCb, null, 'btn btn-info ad-button')
    ];

    self.openFileModal = function(fileUrl, fileBlob, fileHeading) {
        $log.debug("signitemCtrl.openFileModal: f: " +fileUrl +" b: " +fileBlob +" h: " +fileHeading);
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'views/modalfile.html',
            controller: 'modalFileCtrl',
            controllerAs: 'mfc',
            windowTopClass: 'ad-large-modal',
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
        modalInstance.result.then(function (/* arg here passed from controller */) {
        }, function(arg) {
            $log.debug("signitemCtrl: Modal dismissed: " +arg);
            self.hideEmbObj = false;
        });
    };

    self.fileName = self.item.Name;
    var cb = null;
    // Both blob and remote url implementations kept, but only one used.
    // Remove later when sure other one won't be needed.
    if (!ENV.app_useBlob) {
        fetchUrl(self.item);
        cb = drawFileurl;
    } else {
        fetchBlob(self.item);
        cb = drawBlob;
    }

    cb();
});
