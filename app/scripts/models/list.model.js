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
    .factory('ListData', ['AttachmentData', '$log', 'ENV', function(AttachmentData, $log, ENV) {

        function ListData(title, objects) {
            this.title = title;
            this.objects = objects;
        }

        ListData.createAttachmentList = function(title, attachmentArray) {
            if (typeof title === 'string') {
                var array = [];
                for (var index = 0; (attachmentArray instanceof Array) && (index < attachmentArray.length); index++) {
                    var element = attachmentArray[index];
                    var item = AttachmentData.create(element.attachmentTitle, element.link, element.publicity, element.buttonType, element.number);
                    if (item) {
                        array.push(item);
                    }
                }
                return new ListData(title, array);
            }
            $log.error('ListData.createAttachmentList: missing title');

            return null;
        };

        ListData.createDecisionList = function(title, decisionArray) {
            if (typeof title === 'string') {
                var array = [];
                for (var index = 0; (decisionArray instanceof Array) && (index < decisionArray.length); index++) {
                    var element = decisionArray[index];
                    var item = AttachmentData.create(element.decisionTitle, element.link, element.publicity, element.buttonType, element.number);
                    if (item) {
                        array.push(item);
                    }
                }
                return new ListData(title, array);
            }
            $log.error('ListData.createDecisionList: missing title');

            return null;
        };

        ListData.createAdditionalMaterialList = function(title, materialArray) {
            if (typeof title === 'string') {
                var array = [];
                for (var index = 0; (materialArray instanceof Array) && (index < materialArray.length); index++) {
                    var element = materialArray[index];
                    var item = AttachmentData.create(element.additionalMaterialTitle, element.link, element.publicity, element.buttonType, element.number);
                    if (item) {
                        array.push(item);
                    }
                }
                return new ListData(title, array);
            }
            $log.error('ListData.createAdditionalMaterialList: missing title');

            return null;
        };

        function resolveAttUrl(item, att) {
            return angular.isObject(item) && angular.isObject(att) ? ENV.SIGNAPIURL_ATT.replace(":reqGuid", item.ProcessGuid).replace(":attGuid", att.Id) : undefined;
        }

        ListData.createEsignAttachmentList = function(title, argArr, signItem) {
            var array = [];
            if (angular.isString(title) && angular.isArray(argArr)) {
                for (var i = 0; (i < argArr.length); i++) {
                    var e = argArr[i];
                    var listItem = AttachmentData.create(e.Title, resolveAttUrl(signItem, e), null, null);
                    if (listItem) {
                        array.push(listItem);
                    }
                }
            } else {
                $log.error('ListData.createEsignAttachmentList: bad args');
            }
            return new ListData(title, array);
        };

        return ListData;

    }]);
