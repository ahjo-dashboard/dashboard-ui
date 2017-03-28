/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
* @ngdoc service
* @name dashboard.ListData
* @description
* # ListData
* Model in the dashboard.
*/
angular.module('dashboard')
    .factory('ListData', ['AttachmentData', '$log', 'ENV', 'Utils', function (AttachmentData, $log, ENV, Utils) {

        function ListData(title, objects) {
            this.title = title;
            this.objects = objects;
        }

        ListData.createAttachmentList = function (title, attachmentArray) {
            var array = [];
            angular.forEach(attachmentArray, function (element) {
                var item = AttachmentData.create(element.attachmentTitle, element.link, element.publicity, element.buttonType, element.number, element.pageCount);
                if (angular.isObject(item)) {
                    this.push(item);
                }
            }, array);

            return new ListData(title, array);

        };

        ListData.createDecisionList = function (title, decisionArray) {
            var array = [];
            angular.forEach(decisionArray, function (element) {
                var item = AttachmentData.create(element.decisionTitle, element.link, element.publicity, element.buttonType, element.number, element.pageCount);
                if (angular.isObject(item)) {
                    this.push(item);
                }
            }, array);

            return new ListData(title, array);
        };

        ListData.createAdditionalMaterialList = function (title, materialArray) {
            var array = [];
            angular.forEach(materialArray, function (element) {
                var item = AttachmentData.create(element.additionalMaterialTitle, element.link, element.publicity, element.buttonType, element.number, element.pageCount);
                if (angular.isObject(item)) {
                    this.push(item);
                }
            }, array);

            return new ListData(title, array);
        };

        function resolveAttUrl(item, att) {
            return angular.isObject(item) && angular.isObject(att) ? ENV.SIGNAPIURL_ATT.replace(":reqGuid", item.ProcessGuid).replace(":attGuid", att.Id) : undefined;
        }

        // Returns an array of ListData objects, one ListData per attachment's ParentTitle, objects contains AttachmentData items for the ParentTitle
        ListData.createEsignAttachmentList = function (title, argArr, signItem) {
            var attsByTopic = [];
            if (angular.isObject(title) && angular.isArray(argArr)) {
                for (var i = 0; (i < argArr.length); i++) {
                    var e = argArr[i];
                    var listItem = AttachmentData.create(e.Title, resolveAttUrl(signItem, e));
                    if (listItem) {
                        var parentDetails = { 'header': e.ParentTitle, 'title': e.ParentTitle };
                        var topic = Utils.objWithVal(attsByTopic, 'title', parentDetails);
                        if (topic) {
                            topic.objects.push(listItem);
                        } else {
                            attsByTopic.push(new ListData(parentDetails, [listItem]));
                        }
                    }
                }
            } else {
                $log.error('ListData.createEsignAttachmentList: bad args');
            }
            return attsByTopic;
        };

        return ListData;

    }]);
