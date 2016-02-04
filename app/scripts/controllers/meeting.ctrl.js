/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc function
 * @name dashboard.controller:MeetingCtrl
 * @description
 * # MeetingCtrl
 * Controller of the dashboard
 */
angular.module('dashboard')
.controller('meetingCtrl', function (
    $log, AhjoMeetingService, $stateParams, PdfReader, $sce, $scope, $rootScope, ENV, Device, MessageService, $uibModal, FileHistory, $timeout) {
    $log.log("meetingCtrl.config");
    var self = this;
    self.content = [];
    self.contentPlaceholder = 'Ole hyvä ja valitse esityslistalta asia';
    self.embeddedContentPlaceholder = 'Voit valita liitetiedoston katseltavaksi';
    self.contentHeader = 'Esitys'; //TODO: const all strings into a file...
    self.attachments = [];
    self.parallelMode = false;
    self.blob = null;
    self.fileUrl = null;
    self.fileName = null;
    // Workaround to hide embedded pdf object on IE to allow displaying content (modal etc.) covering the object.
    self.hideEmbObj = false; // TODO: not needed if IE problem worked around by different layout or by pdf.js

    // PRIVATE FUNCTIONS
    function agendaItemsForMeeting(meeting) {
        AhjoMeetingService.getAgendaItemsForMeeting(meeting.id)
        .then(function(response) {
            $log.debug("meetingCtrl: getAgendaItemsForMeeting then"); //TODO: remove
            MessageService.send(ENV.Msg_Meeting_Selection, { agendaItems: response.objects, meetingItem: meeting });
        },
        function(error) {
            $log.error("meetingCtrl: getAgendaItemsForMeeting error: " +error);
        })
        .finally(function() {
            $log.debug("meetingCtrl: getAgendaItemsForMeeting finally"); //TODO: re
        });
    }

    function agendaItemSelected(agendaItem) {
        $log.debug("meetingCtrl.agendaItemSelected: "+ agendaItem.id); //TODO: remove
        self.content = agendaItem.content;
        self.attachments = agendaItem.attachments;
        if (!self.attachments.length) {
            self.embeddedContentPlaceholder = 'Ei liitetiedostoja';
        }
    }

    function showProposals(data) {
        $log.debug("meetingCtrl: showProposals"); //TODO: remove
        self.hideEmbObj = true;
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'views/proposals.html',
            controller: 'proposalsCtrl',
            controllerAs: 'pc',
            windowClass: 'medium-modal ad-no-scrollbars',
            backdrop: true,
            resolve: {
                data: function () {
                    return data;
                }
            }
        });

        modalInstance.result.then(function (/* arg here passed from controller */) {
        }, function(arg) {
            $log.info('Modal dismissed: ' +arg);
            self.hideEmbObj = false;
        });
    }

    // PUBLIC FUNCTIONS
    self.attachmentSelected = function(attachment) {

        self.tmpUrl = null;

        // Both blob and remote url implementations kept, blob would seem to give better loading & reusing perf but IE <object> doesn't like blob uris.
        // Remove one if sure other one won't be needed.
        if (!ENV.app_useBlob) {
            self.fileName = attachment.name;
            self.tmpUrl = attachment.file_uri;
            FileHistory.add(new FileHistory.FileItem(attachment.file_uri, self.fileName, null, null));
            // TODO: remove timeout if not needed, was there to tackle embeddd pdf not being displayed
            self.timer = $timeout(function(){
                self.fileUrl = self.tmpUrl;
                $log.debug("meetingCtrl: attachmentSelected delay expired, fileUrl= " +self.fileUrl);
                }, 0, true, null, true);
            $scope.$on("$destroy",
                function(/*event*/) {
                    $timeout.cancel(self.timer);
                });
        } else {
            self.blob = null;
            self.fileUrl = null;
            PdfReader.query(attachment.file_uri).$promise
            .then(
                function(response) {
                    self.blob = new Blob([(response.pdfBlob)], {type: 'application/pdf'});
                    self.fileUrl = URL.createObjectURL(self.blob);
                    self.fileName = attachment.name;
                    FileHistory.add(new FileHistory.FileItem(attachment.file_uri, self.fileName, null, self.blob));
                },
                function(err) {
                    $log.error("meetingCtrl.attachmentSelected/blob: PdfReader.query error " +JSON.stringify(err));
                })
            .catch(function() {
                $log.error("meetingCtrl.attachmentSelected/blob: catch");
            })
            .finally( function() {
                $log.debug("meetingCtrl.attachmentSelected/blob: finally");
            });
        }

    };

    self.openFileModal = function(fileUrl, fileBlob, fileHeading) {
        $log.debug('MeetingCtrl.openFileModal: f: ' +fileUrl +" b: " +fileBlob +" h: " +fileHeading);
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
        self.hideEmbObj = true;

        modalInstance.result.then(function (/* arg here passed from controller */) {
        }, function (arg) {
            $log.debug('meetingCtrl: Modal dismissed: ' +arg);
            self.hideEmbObj = false;
        });
    };

    self.openAttachmentModal = function(attachment) {
        var fileUrl = attachment.file_uri;

        if (!ENV.app_useBlob) {
            self.openFileModal(fileUrl, null, attachment.name);
        } else {
            PdfReader.query(attachment.file_uri).$promise
            .then(
                function(response) {
                    var blob = new Blob([(response.pdfBlob)], {type: 'application/pdf'});
                    FileHistory.add(new FileHistory.FileItem(fileUrl, attachment.name, null, blob));
                    self.openFileModal(null, blob, attachment.name);
                },
                function(err) {
                    $log.error("meetingCtrl.openAttachmentModal: PdfReader.query error " +JSON.stringify(err));
                });
        }
    };

    self.openProposals = function() {
        $log.debug("meetingCtrl.openProposals:"); //TODO: remove

        AhjoMeetingService.getProposals(ENV.MeetingsApi_DefaultLimit, ENV.MeetingsApi_DefaultOffset)
        .then(function(response) {
            $log.debug("meetingCtrl: getProposals then"); //TODO: remove
            showProposals(response.objects);
        },
        function(error) {
            $log.error("meetingCtrl: getProposals error: " +error);
        });
    };

    self.toggleMode = function() {
        self.parallelMode = !self.parallelMode;
    };

    // On small screens do not use embedded viewer, instead open to modal fullscreen
    if (Device.current() === ENV.Device_Extra_Small) {
        $log.debug("meetingCtrl.config: modeXsMtg");
        self.attachmentSelected = self.openAttachmentModal;
        self.modeXsMtg = true;
    }

    // selection from meetingList controller
    var meetingItem = $stateParams.meetingItem;
    // selection from menu controller
    var agendaItem = $stateParams.agendaItem;

    if (agendaItem) {
        // selection from menu,
        agendaItemSelected(agendaItem);
    }
    else if (meetingItem) {
        // selection from meetingList or overview, menu needs to be updated
        agendaItemsForMeeting(meetingItem);
    }

    // ADD LISTENER
    var listener = $rootScope.$on(ENV.Msg_AgendaItem_Selection, function(event, data) {
        $log.debug("meetingCtrl: " +event.name);
        agendaItemSelected(data);
    });

    // REMOVE LISTENER
    $scope.$on('$destroy', listener);

});
