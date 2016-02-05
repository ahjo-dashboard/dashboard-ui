/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
* @ngdoc function
* @name dashboard.controller:proposalsCtrl
* @description
* # proposalsCtrl
* Controller of the dashboard
*/
angular.module('dashboard')
.controller('proposalsCtrl', ['$log', '$uibModalInstance', 'data', 'ngDialog', function ($log, $uibModalInstance, data, ngDialog) {

    $log.debug("proposalsCtrl.config " +data);
    var self = this;
    self.data = data;
    self.draftData = JSON.parse(JSON.stringify(data));
    self.user = "Matti";
    self.animate = false;

    self.smallEditor = {
        'menu':  [
            ['bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript']
        ]
    };

    self.editor = {
        'menu':  [
            ['bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript'],
            ['format-block'],
            ['font'],
            ['font-size'],
            ['font-color', 'hilite-color'],
            ['remove-format'],
            ['ordered-list', 'unordered-list', 'outdent', 'indent'],
            ['left-justify', 'center-justify', 'right-justify']
        ]
    };

    function addDraftData() {
        self.draftData.proposals = [];
        for (var i = 0; i < self.data.proposals.length; i++) {

            if (self.data.proposals[i].status === 'private') {
                self.draftData.proposals.push(self.data.proposals[i]);
            }
        }
    }

    function formatDraftData() {
        for (var i = 0; i < self.draftData.proposals.length; i++) {
            self.draftData.proposals[i].draftText = self.draftData.proposals[i].text;
        }
    }

    addDraftData();
    formatDraftData();

    // PUBLIC
    self.close = function() {
        $uibModalInstance.dismiss('cancel');
    };

    self.addProposal = function() {
        console.log('proposalsCtrl: addProposal');
        self.animate = true;

        self.draftData.proposals.push({
            "id": 0, "creator": "Matti", "type": "Vastaehdotus", "status": "private", "text": "enter text", "draftText": "enter text"
        });
    };

    self.removeProposal = function(prop, $scope) {
        console.log('proposalsCtrl: removeProposal ' +prop);
        self.animate = true;

        ngDialog.openConfirm({
            template: 'views/popup.html',
            scope: $scope,
            controller: ('Ctrl', ['header', '$scope', function (header, $scope) {
                $scope.header = header;
            }]),
            resolve: {
                header: function() {
                    return 'Poista ehdotus';
                }
            }
        })
        .then(function() {
            if (prop.status === 'private') {
                var privateIndex = self.draftData.proposals.indexOf(prop);
                if (privateIndex >= 0) {
                    self.draftData.proposals.splice(privateIndex, 1);
                }
            }
            else if (prop.status === 'public') {
                var publicIndex = self.data.proposals.indexOf(prop);
                if (publicIndex >= 0) {
                    self.data.proposals.splice(publicIndex, 1);
                }
            }
            else {
                $log.debug("unknown status");
            }
        });
    };

    self.shareProposal = function(prop, $scope) {
        console.log('proposalsCtrl: shareProposal ' +prop);

        ngDialog.openConfirm({
            template: 'views/popup.html',
            scope: $scope,
            controller: ('Ctrl', ['header', '$scope', function (header, $scope) {
                $scope.header = header;
            }]),
            resolve: {
                header: function() {
                    return 'Julkaise ehdotus';
                }
            }
        })
        .then(function() {
            prop.status = 'public';
        });
    };
}]);
