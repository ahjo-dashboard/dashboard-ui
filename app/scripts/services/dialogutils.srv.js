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
    .factory('DialogUtils', function ($log, $q, $uibModal, $timeout, $rootScope, ngDialog) {

        // VARIABLES

        var self = this;
        self.progrDlg = null; // Progress dialog singleton instance
        $rootScope.x_progrDlgConfig = { titleStrId: null }; // Config object for progress dialog

        // FUNCTIONS

        function clearProgrCancel() {
            if (self.cancelTimer) {
                $timeout.cancel(self.cancelTimer);
                self.cancelTimer = null;
            }
        }

        function closeProgressNow() {
            $log.debug("DialogUtils.closeProgressNow: dialog=" + self.progrDlg + " timer=" + self.cancelTimer);
            if (!angular.equals(self.progrDlg, null)) {
                clearProgrCancel();
                self.progrDlg.close();
                self.progrDlg = null;
                $rootScope.x_progrDlgConfig = { titleStrId: null }; // Frees any old param references received in openProgress
            }
        }

        function showModal(aIsError, aTitleStrId, aBodyStrId, aCloseByNavi) {
            $log.debug("DialogUtils.showModal: isError=" +aIsError +" " + JSON.stringify(aTitleStrId) + ", " + JSON.stringify(aBodyStrId));
            var closeNavi = angular.isDefined(aCloseByNavi) ? aCloseByNavi : false;
            return ngDialog.open({
                template: 'views/infodialog.tmpl.html',
                controller: 'infoDialogCtrl',
                controllerAs: 'c',
                closeByNavigation: closeNavi,
                resolve: {
                    titleStrId: function () { return aTitleStrId; },
                    bodyStrId: function () { return aBodyStrId; },
                    isError: function () { return aIsError; }
                }
            });
        }

        /*
         * @name dashboard.dialogutils.openProgress
         * @description Displays a modal progress dialog. Parallel calls clear pending cancel requests and update the existing dialog.
         * @param {string} a1 String id for title.
         * @returns {boolean} True if request was accepted, false if not.
         */
        self.openProgress = function openProgressFn(aTitleStrId) {
            $log.debug("DialogUtils.openProgress: " + aTitleStrId);

            // Clear pending cancel timers because those were for the previous request, issuing a new one next
            clearProgrCancel();

            $rootScope.x_progrDlgConfig.titleStrId = aTitleStrId;
            if (self.progrDlg) {
                $log.debug("DialogUtils.openProgress: already exists, updating");
                return;
            }

            self.progrDlg = $uibModal.open({
                animation: false,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                backdrop: 'static',
                templateUrl: 'views/progress.html',
                controller: 'progressCtrl',
                controllerAs: 'c',
                bindToController: true
                // Title etc. parameters passed via scope object (bindToController)
            });
            self.progrDlg.result.then(function (/*selection*/) {
                // $log.debug("DialogUtils.openProgress: progress then");
            }, function () {
                // $log.debug("DialogUtils.openProgress: progress dismissed");
            });
            self.progrDlg.result.finally(function (/*selection*/) {
                $log.debug("DialogUtils.openProgress: progress dialog finally closing");
            });
        };

        /*
         * @name dashboard.dialogutils.closeProgress
         * @description Closes the singleton progress dialog after a delay
         */
        self.closeProgress = function closeProgressFn() {
            $log.debug("DialogUtils.closeProgress");
            if (!angular.equals(self.progrDlg, null)) {
                if (!self.cancelTimer) {
                    self.cancelTimer = $timeout(function () {
                        $log.debug("DialogUtils.closeProgress timeout");
                        closeProgressNow();
                    }, 400); // Arbitrary timeout to avoid flickering and sync problems with async displaying and closing of the dialog. A fast call to close after could leave the dialog open.
                } else {
                    $log.debug("DialogUtils.closeProgress: cancel timer already exists");
                }
            } else {
                $log.debug("DialogUtils.closeProgress: no dialog to close");
            }
        };

        /*
         * @name dashboard.dialogutils.showInfo
         * @description Displays an info dialog
         * @param {string} Title string id
         * @param {string} Body text string id
         * @param {boolean} True if url navigation should close the dialog
         * @returns {} ngDialog promise
         */
        self.showInfo = function showInfoFn(aTitleStrId, aBodyStrId, aCloseByNavi) {
            // $log.debug("DialogUtils.showError: " + JSON.stringify(aTitleStrId) + ", " + JSON.stringify(aBodyStrId));
            var closeNavi = angular.isDefined(aCloseByNavi) ? aCloseByNavi : false;
            return showModal(false, aTitleStrId, aBodyStrId, closeNavi);
        };

        /*
         * @name dashboard.dialogutils.showError
         * @description Displays an error modal
         * @param {string} Title string id
         * @param {string} Body text string id
         * @param {boolean} True if url navigation should close the dialog
         * @returns {} ngDialog promise
         */
        self.showError = function showErrorFn(aTitleStrId, aBodyStrId, aCloseByNavi) {
            // $log.debug("DialogUtils.showError: " + JSON.stringify(aTitleStrId) + ", " + JSON.stringify(aBodyStrId));
            var closeNavi = angular.isDefined(aCloseByNavi) ? aCloseByNavi : false;
            return showModal(true, aTitleStrId, aBodyStrId, closeNavi);
        };

        /*
         * @name dashboard.dialogutils.clearAll
         * @description Clears all notifications owned by this factory
         */
        self.clearAll = function clearAllFn() {
            $log.debug("DialogUtils.clearAll");
            closeProgressNow();
            ngDialog.closeAll();
        };

        /*
         * @name dashboard.dialogutils.setModalActiveFlag
         * @description sets rootlevel modal dialog open flag for IE
         */
        self.setModalActiveFlag = function (active) {
            if ($rootScope.isIe) {
                $rootScope.modalActive = active;
            }
        };

        return self;
    });
