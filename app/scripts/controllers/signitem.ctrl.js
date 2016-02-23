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
.controller('signitemCtrl', function ($log, $scope, $state, $stateParams, SigningAttApi, $sce, $timeout, $uibModal, MessageService, ENV, APPSTATE, SigningOpenApi) {
    $log.debug("signitemCtrl.config");

    var self = this;
    self.blob = null;
    self.fileUrl = {};
    self.fileName = {};
    self.remoteUrl = null;
    self.tmpUrl = null;
    self.hideEmbObj = false; // TODO: not needed if IE problem worked around by different layout or pdf.js
    self.item = $stateParams.signItem;
    self.error = null;
    self.ongoing = null;

    if (!self.item || !self.item.ProcessGuid || !self.item.ProcessGuid.length) {
        $log.error("signitemCtrl: item missing");
        $state.go(APPSTATE.HOME);
        return;
    } else {
        $log.debug("signItemCtrl: name: " +self.item.Name);
    }


    // PRIVATE FUNCTIONS

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

    function saveStatus(item, status) {
        if (!item || !(item instanceof Object) || !("Status" in item)) {
            $log.debug(item);
            throw new Error("signitemCtrl.saveStatus: bad arguments");
        }
        $log.log("signitemCtrl.saveStatus: " +item.Name +", current status: " +item.Status);

        self.error = null;
        self.ongoing = true;
        item.Status = status;
        self.responseOpen = SigningOpenApi.save(item, function(value) {
            $log.debug("adOpenSignreqs.saveStatus: SigningOpenApi.save done. New object: ");
            $log.debug(value);
        }, function(error) {
            $log.error("adOpenSignreqs.saveStatus: SigningOpenApi.save error: " +JSON.stringify(error));
            self.error = error;
        });
        self.responseOpen.$promise.finally(function() {
            $log.debug("adOpenSignreqs.saveStatus: SigningOpenApi.save finally");
            self.ongoing = null;
        });
    }

    self.actionSign = function() {
        saveStatus(self.item, ENV.SignApi_DocStatuses.signed.value);
    };

    self.actionReject = function() {
        saveStatus(self.item, ENV.SignApi_DocStatuses.rejected.value);
    };

    self.actionCommentCb = function() {
      $log.debug("signitemCtrl.actionCommentCb");
    };

    self.actionStatustCb = function() {
      $log.debug("signitemCtrl.actionStatustCb");
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
        new BtnConf('STR_CREATE_COMMENT', self.actionCommentCb, null, 'btn btn-default ad-button'),
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
