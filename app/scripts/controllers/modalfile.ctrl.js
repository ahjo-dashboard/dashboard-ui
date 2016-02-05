/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc function
 * @name dashboard.controller:modalFileCtrl
 * @description
 * # modalFileCtrl
 * Controller of the dashboard
 */
angular.module('dashboard')
.controller('modalFileCtrl', function ($log, $sce, $scope, $uibModalInstance, aUrl, aBlob, aHeading) {
    $log.debug('modalFileCtrl');
    var self = this;
    self.heading = aHeading;

    // Both blob and remote url implementations kept, but only one used.
    // Remove later when sure other one won't be needed.
    if (aBlob) {
        self.fileBlob = aBlob;
        self.fileUrl = URL.createObjectURL(self.fileBlob);
        $log.debug('modalFileCtrl: blob ' +self.fileUrl);
    } else {
        self.fileUrl = aUrl;
        $log.debug('modalFileCtrl: url ' +self.fileUrl);
    }

    self.closeModal = function() {
        $uibModalInstance.dismiss('cancel');
        if (self.fileBlob) {
            $log.debug("modalFileCtrl: revokeObjectURL");
            URL.revokeObjectURL(self.fileUrl);
        }
        self.fileBlob = null;
        self.fileUrl = null;
        self.heading = null;
    };

    $scope.$on('$destroy', function () {
        //$log.debug("modalFileCtrl: $destroy");
        if (self.fileBlob) {
            $log.debug("modalFileCtrl: revokeObjectURL");
            URL.revokeObjectURL(self.fileUrl);
        }
    });


});
