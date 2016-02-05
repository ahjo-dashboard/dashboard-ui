/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc function
 * @name dashboard.controller:filehistoryCtrl
 * @description
 * # filehistoryCtrl
 * Controller of the dashboard
 */
angular.module('dashboard')
.controller('filehistoryCtrl', function ($log, FileHistory, $uibModal) {
    $log.debug("filehistoryCtrl: CONFIG");

    var self = this;
    self.view_header = "Tiedostohistoria";
    self.list = FileHistory.list;

    // PRIVATE FUNCTIONS

    // PUBLIC FUNCTIONS

    self.clearList = function() {
        FileHistory.clearList();
    };

    self.openFileModal = function(fileUrl, fileBlob, fileHeading) {
        $log.debug('filehistoryCtrl.openFileModal: f: ' +fileUrl +" b: " +fileBlob +" h: " +fileHeading);
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'views/modalfile.html',
            controller: 'modalFileCtrl',
            controllerAs: 'mfc',
            windowTopClass: 'ad-large-modal',
            backdrop: true,
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

        modalInstance.result.then(function (/* arg here passed from controller */) {
        }, function (arg) {
            $log.debug('filehistoryCtrl: Modal dismissed: ' +arg);
        });
    };
});
