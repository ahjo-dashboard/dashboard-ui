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
    .factory('DialogUtils', function ($log, $q, $uibModal, $timeout, $rootScope, ngDialog, CONST) {

        // VARIABLES

        var self = this;
        self.isModalActive = false;

        // FUNCTIONS

        function showModal(aIsError, aTitleStrId, aBodyStrId, aCloseByNavi) {
            var closeNavi = angular.isDefined(aCloseByNavi) ? aCloseByNavi : false;
            var dlg = ngDialog.open({
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
            $log.debug("DialogUtils.showModal: " + dlg.id + " isError=" + aIsError + " " + JSON.stringify(aTitleStrId) + ", " + JSON.stringify(aBodyStrId));
            return dlg;
        }

        self.close = function (dlg) {
            if (angular.isObject(dlg) && angular.isFunction(dlg.close)) {
                $log.debug("DialogUtils.close: " + dlg.id);
                dlg.close();
            } else {
                $log.error("DialogUtils.close: bad arg");
            }
        };

        /*
         * @name dashboard.dialogutils.showProgress
         * @description Displays a progress modal
         * @param {string} Title string id
         * @param {number} Optional minimum duration for the dialog, otherwise a default is used.
         * @returns {} ngDialog promise
         */
        self.showProgress = function (aTitleStrId, aMinDur) {
            var minDur = angular.isNumber(aMinDur) ? aMinDur : CONST.PROGRESSDLGMINDURATIONMS;
            var timer = null;
            if (minDur) {
                timer = $timeout(function () {
                    timer = null;
                    // $log.debug("DialogUtils.showProgress: timeout, " + JSON.stringify(aTitleStrId));
                }, minDur);
            }
            var dlg = ngDialog.open({
                template: 'views/progressdialog.tmpl.html',
                controller: 'progressDialogCtrl',
                controllerAs: 'c',
                closeByNavigation: true,
                resolve: {
                    titleStrId: function () { return aTitleStrId; }
                },
                preCloseCallback: function () {
                    var res = timer ? timer : true;
                    $log.debug("DialogUtils.showProgress: preCloseCallback " + dlg.id + " returning '" + res);
                    return res;
                }
            });
            $log.debug("DialogUtils.showProgress: " + dlg.id + " , " + JSON.stringify(aTitleStrId));
            return dlg;
        };

        /*
         * @name dashboard.dialogutils.showInfo
         * @description Displays an info modal
         * @param {string} Title string id
         * @param {string} Body text string id
         * @param {boolean} True if url navigation should close the dialog
         * @returns {} ngDialog promise
         */
        self.showInfo = function showInfoFn(aTitleStrId, aBodyStrId, aCloseByNavi) {
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
            var closeNavi = angular.isDefined(aCloseByNavi) ? aCloseByNavi : false;
            return showModal(true, aTitleStrId, aBodyStrId, closeNavi);
        };

        /*
         * @name dashboard.dialogutils.clearAll
         * @description Clears all notifications owned by this factory
         */
        self.clearAll = function clearAllFn() {
            $log.debug("DialogUtils.clearAll");
            ngDialog.closeAll();
        };

        /*
         * @name dashboard.dialogutils.setModalActiveFlag
         * @description sets modal dialog open flag for IE
         */
        self.setModalActiveFlag = function (active) {
            self.modalActive = active;
        };

        /*
         * @name dashboard.dialogutils.isModalActive
         * @description For IE checks if app's modal dialogs are open
         * @returns {boolean} True if a modal dialog is open on IE, false if not IE or no modals open.
         */
        self.isModalActive = function () {
            return $rootScope.isIe && (self.modalActive || ngDialog.getOpenDialogs().length);
        };

        return self;
    });
