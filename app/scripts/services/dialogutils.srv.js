/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
* @ngdoc service
* @name dashboard.dialogutils
* @description
* #  DialogUtils
* Service in the dashboard.
*/
angular.module('dashboard')
    .factory('DialogUtils', function ($log, $q, $uibModal, $timeout) {
        var self = this;
        self.progrInst = null; // Progress dialog singleton instance

        function resetProgress() {
            $log.debug("DialogUtils.resetProgress");
            self.progrInst = null;
            self.promiseArr = null;
        }

        /*
         * @name dashboard.dialogutils.openProgress
         * @description Displays a modal progress dialog. Dismissed explicitly or via a promise array.
         * @param {Array} a1 Array of promises which to follow
         * @param {string} a2 String id for title
         * @returns {boolean} True if request was accepted, false if busy.
         */
        self.openProgress = function (aPromiseArr, aTitleStrId) {
            $log.debug("DialogUtils.openProgress");
            if (!angular.equals(self.progrInst, null)) {
                $log.error("DialogUtils.openProgress: busy");
                return false;
            }

            self.promiseArr = angular.isArray(aPromiseArr) && aPromiseArr.length ? aPromiseArr : null;
            if (self.promiseArr) {
                $log.debug("DialogUtils.openProgress: will close via promises, count=" + self.promiseArr.length);
                var promAll = $q.all(self.promiseArr);
                promAll.finally(function () {
                    $log.debug("DialogUtils.openProgress: all promises completed, dismiss component");
                    self.closeProgress();
                });
            }


            self.progrInst = $uibModal.open({
                animation: false,// $scope.animationsEnabled,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                backdrop: 'static',
                templateUrl: 'views/progress.html',
                controller: 'progressCtrl',
                controllerAs: 'c',
                // bindToController: true, // Couldn't get this working
                // size: 'sm', // "Optional suffix of modal window class. The value used is appended to the modal- class, i.e. a value of sm gives modal-sm."
                resolve: {
                    titleStrId: function () {
                        return aTitleStrId;
                    }
                }
            });
            self.progrInst.result.then(function (/*selection*/) {
                // $log.debug("DialogUtils.openProgress: progress then");
            }, function () {
                // $log.debug("DialogUtils.openProgress: progress dismissed");
            });
            self.progrInst.result.finally(function (/*selection*/) {
                $log.debug("DialogUtils.openProgress: progress dialog finally closing");
                resetProgress();
            });

            return true;
        };

        self.closeProgress = function () {
            $log.debug("DialogUtils.closeProgress");
            // Instance null check just in case to avoid unnecessary timers in case there are multiple calls to close
            if (!angular.equals(self.progrInst, null)) {
                $timeout(function () {
                    $log.debug("DialogUtils.closeProgress timeout");
                    if (!angular.equals(self.progrInst, null)) {
                        self.progrInst.close();
                    } else {
                        $log.error("DialogUtils.resetProgress: no component to close");
                    }
                }, 400); // Arbitrary timeout to avoid flickering and sync problems with async displaying and closing of the dialog. A fast call to close after open may leave the dialog open.
            }
        };


        return self;
    });
