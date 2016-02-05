/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
* @ngdoc service
* @name dashboard.AhjoMeetingService
* @description
* # AhjoMeetingService
* Service in the dashboard.
*/
angular.module('dashboard')
.service('AhjoMeetingService', function (
    MtgMeetingApi,
    MtgIssueApi,
    MtgAttachmentApi,
    MthAgendaItemApi,
    MthAgendaItemForMeetingApi,
    MtgMeetingDocumentApi,
    ENV, $q) {

        var ms = this;

        function setLimit(limit) {
            return (limit && limit >= 0) ? limit : ENV.MeetingsApi_DefaultLimit;
        }

        function setOffset(offset) {
            return (offset && offset >= 0) ? offset : ENV.MeetingsApi_DefaultOffset;
        }

        ms.getMeetings = function(limit, offset) {
            return MtgMeetingApi.get({
                arg1 : setLimit(limit),
                arg2 : setOffset(offset)
            }).$promise;
        };

        ms.getIssues = function(limit, offset) {
            return MtgIssueApi.get({
                arg1 : setLimit(limit),
                arg2 : setOffset(offset)
            }).$promise;
        };

        ms.getAttachments = function(limit, offset) {
            return MtgAttachmentApi.get({
                arg1 : setLimit(limit),
                arg2 : setOffset(offset)
            }).$promise;
        };

        ms.getAgendaItems = function(limit, offset) {
            return MthAgendaItemApi.get({
                arg1 : setLimit(limit),
                arg2 : setOffset(offset)
            }).$promise;
        };

        ms.getAgendaItemsForMeeting = function(id, limit, offset) {
            if (!id || id < 0 ) {
                return $q.reject('invalid id');
            }

            return MthAgendaItemForMeetingApi.get({
                arg1 : setLimit(limit),
                arg2 : setOffset(offset),
                arg3 : id
            }).$promise;
        };

        ms.getMeetingDocuments = function(limit, offset) {
            return MtgMeetingDocumentApi.get({
                arg1 : setLimit(limit),
                arg2 : setOffset(offset)
            }).$promise;
        };

        ms.getProposals = function() {
            var deferred = $q.defer();

            setTimeout(function() {

                // types :
                //     Pöydällepanoehdotus,
                //     Palautusehdotus,
                //     Vastaehdotus,
                //     Hylkäysehdotus,
                //     Ponsi,
                //     Eriävä mielipide
                var mockData = {
                    "meta": {
                        "previous": "",
                        "total_count": "",
                        "offset": "",
                        "limit": "",
                        "next": ""
                    },
                    "objects": {
                        "proposals": [
                            { "id": 1, "creator": "Matti", "type": "Pöydällepanoehdotus", "status": "private", "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed porta sagittis leo id ultrices." },
                            { "id": 2, "creator": "Maija", "type": "Vastaehdotus", "status": "public", "text": "Suspendisse potenti. Cras ut nibh non lacus cursus rutrum. Quisque posuere consectetur velit, eu posuere lacus dapibus eget." },
                            { "id": 3, "creator": "Pekka", "type": "Hylkäysehdotus", "status": "public", "text": "Nullam sit amet tincidunt magna. Vivamus a suscipit lectus. Sed egestas faucibus lacinia." },
                            { "id": 4, "creator": "Maija", "type": "Eriävä mielipide", "status": "public", "text": "Mauris velit diam, bibendum eu nisl eu, tempus semper nunc. Vestibulum congue neque arcu, at tempus tellus porttitor ut." },
                            { "id": 5, "creator": "Matti", "type": "Pöydällepanoehdotus", "status": "public", "text": "Ut suscipit, sapien eget auctor dapibus, enim felis condimentum tortor, vel lacinia erat ipsum a elit." },
                            { "id": 6, "creator": "Liisa", "type": "Eriävä mielipide", "status": "public", "text": "Morbi consectetur a tellus ac ornare. Vivamus elementum neque et libero ultrices iaculis." },
                            { "id": 7, "creator": "Matti", "type": "Pöydällepanoehdotus", "status": "private", "text": "Donec dignissim interdum felis vel consequat." },
                            { "id": 8, "creator": "Maija", "type": "Vastaehdotus", "status": "public", "text": "Proin maximus orci eget aliquet lacinia." },
                            { "id": 9, "creator": "Pekka", "type": "Hylkäysehdotus", "status": "public", "text": "Sed viverra felis nisl, eu pellentesque enim sollicitudin id." },
                            { "id": 10, "creator": "Maija", "type": "Eriävä mielipide", "status": "public", "text": "Nulla nec tortor dolor." },
                            { "id": 11, "creator": "Matti", "type": "Pöydällepanoehdotus", "status": "public", "text": "Sed ut lacinia urna. Morbi nec placerat tellus." },
                            { "id": 12, "creator": "Liisa", "type": "Eriävä mielipide", "status": "public", "text": "Suspendisse molestie erat magna, sit amet rhoncus ipsum convallis consectetur. In condimentum enim lacus, in pulvinar urna posuere ut. Donec et egestas ante. Integer id feugiat neque. Maecenas gravida diam in tellus pharetra, eu posuere est vehicula. Etiam augue massa, fringilla vel efficitur dignissim, dapibus vel lectus." }
                        ]
                    }
                };

                deferred.resolve(mockData);
            }, 100);

            return deferred.promise;
        };
    }
);
