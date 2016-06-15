'use strict';

/**
 * @ngdoc function
 * @name dashboard.controller:listCtrl
 * @description
 * # listCtrl
 * Controller of the dashboard
 */
angular.module('dashboard')
    .controller('listCtrl', ['$log', '$scope', '$state', 'StorageSrv', 'CONST', 'Utils', 'AttachmentData', function ($log, $scope, $state, StorageSrv, CONST, Utils, AttachmentData) {
        $log.debug("listCtrl: CONTROLLER");
        var self = this;

        self.data = StorageSrv.getKey(CONST.KEY.SELECTION_DATA); // Expects an array if ListData items
        self.isAttConf = Utils.isAttConf;

        // att: AttachmentData
        self.goToFile = function (att) {
            if (!angular.isObject) {
                $log.error("listCtrl.goToFile: bad arg: " + JSON.stringify(att));
                return;
            }

            StorageSrv.setKey(CONST.KEY.LIST_ATT, att);
            $state.go(CONST.APPSTATE.MTG_LIST_ATTACHMENT);
        };

        self.selAtt = function (aArg) {
            if (!(aArg instanceof AttachmentData)){
                $log.error("listCtrl.selAtt: ignored due to bad args " + AttachmentData);
                return;
            }

            if (!Utils.isAttConf(aArg)) {
                Utils.openNewWin(aArg.link);
            } else {
                StorageSrv.setKey(CONST.KEY.LIST_ATT, aArg);
                $state.go(CONST.APPSTATE.MTG_LIST_ATTACHMENT);
            }
        };

        $scope.$on('$destroy', function () {
            $log.debug("listCtrl: DESTROY");
        });
    }]);
