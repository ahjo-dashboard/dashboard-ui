/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc function
 * @name dashboard.controller:SignitemCtrl
 * @description
 * # SignitemCtrl
 * Controller of the dashboard
 */
angular.module('dashboard')
.controller('signitemCtrl', function ($log, $scope, $stateParams, SigningAttApi, $sce, $timeout, $uibModal, MessageService, ENV) {
    $log.debug("SignitemCtrl.config");

    var item = $stateParams.signItem;
    var self = this;
    self.blob = null;
    self.fileUrl = null;
    self.fileName = null;
    self.remoteUrl = null;
    self.tmpUrl = null;
    self.hideEmbObj = false; // TODO: not needed if IE problem worked around by different layout or pdf.js

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
            $log.debug("SignitemCtrl.drawBlob: set fileUrl: " +self.fileUrl);
        }
    }

    function fetchBlob(item) {
        $log.debug("SignitemCtrl.fetchBlob: SigningAttApi.getPdfBlob guid=" +item.ProcessGuid);

        SigningAttApi.getPdfBlob({ reqId : item.ProcessGuid }).$promise
        .then(
            function(response) {
                var blob = new Blob([(response.pdfBlob)], {type: 'application/pdf'});
                drawBlob(blob, false);
            },
            function(err) {
                $log.error("SignitemCtrl.fetchBlob: SigningAttApi.getPdfBlob " +JSON.stringify(err));
                self.errCode = err.status;
                //self.errMsg = err.statusText; Decided not to display to user for now
            })
        .finally(function() {
        });
    }

    function drawFileurl() {
        $log.debug("SignitemCtrl.drawFileurl: " +self.tmpUrl);
        self.fileUrl = self.tmpUrl;
    }

    function fetchUrl(item) {
        self.tmpUrl = ENV.SignApiUrl_GetAttachment.replace(":reqId", item.ProcessGuid);
        $log.debug("SignitemCtrl.fetchUrl: " +self.tmpUrl);
    }

    // PUBLIC FUNCTIONS
    self.openFileModal = function(fileUrl, fileBlob, fileHeading) {
        $log.debug("SignitemCtrl.openFileModal: f: " +fileUrl +" b: " +fileBlob +" h: " +fileHeading);
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
            $log.debug("SignitemCtrl: Modal dismissed: " +arg);
            self.hideEmbObj = false;
        });
    };

    if(item) {
        self.fileName = item.Name;
        var cb = null;
        // Both blob and remote url implementations kept, but only one used.
        // Remove later when sure other one won't be needed.
        if (!ENV.app_useBlob) {
            fetchUrl(item);
            cb = drawFileurl;
        } else {
            fetchBlob(item);
            cb = drawBlob;
        }

        // Delay file drawing after view transition to avoid a glitch and potential redraw issues.
        //TODO: test & remove delay if not needed, e.g. due to animation changes
        $log.debug("SignitemCtrl: start draw delay" +self.fileName);
        self.timer = $timeout(cb, 400, true, null, true);
        $scope.$on("$destroy",
            function(/*event*/) {
                $timeout.cancel(self.timer);
            });
    }
});
