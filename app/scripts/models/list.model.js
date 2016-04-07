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
    .factory('ListData', ['AttachmentData', '$log', function (AttachmentData, $log) {

        function ListData(title, objects) {
            this.title = title;
            this.objects = objects;
        }

        ListData.createAttachmentList = function (title, attachmentArray) {
            if (typeof title === 'string') {
                var array = [];
                for (var index = 0; (attachmentArray instanceof Array) && (index < attachmentArray.length); index++) {
                    var element = attachmentArray[index];
                    var item = AttachmentData.create(element.attachmentTitle, element.link, element.publicity, element.buttonType);
                    if (item) {
                        array.push(item);
                    }
                }
                return new ListData(title, array);
            }
            $log.error('ListData.createAttachmentList: missing title');

            return null;
        };

        ListData.createDecisionList = function (title, decisionArray) {
            if (typeof title === 'string') {
                var array = [];
                for (var index = 0; (decisionArray instanceof Array) && (index < decisionArray.length); index++) {
                    var element = decisionArray[index];
                    var item = AttachmentData.create(element.decisionTitle, element.link, element.publicity, element.buttonType);
                    if (item) {
                        array.push(item);
                    }
                }
                return new ListData(title, array);
            }
            $log.error('ListData.createDecisionList: missing title');

            return null;
        };

        ListData.createAdditionalMaterialList = function (title, materialArray) {
            if (typeof title === 'string') {
                var array = [];
                for (var index = 0; (materialArray instanceof Array) && (index < materialArray.length); index++) {
                    var element = materialArray[index];
                    var item = AttachmentData.create(element.additionalMaterialTitle, element.link, element.publicity, element.buttonType);
                    if (item) {
                        array.push(item);
                    }
                }
                return new ListData(title, array);
            }
            $log.error('ListData.createAdditionalMaterialList: missing title');

            return null;
        };

        return ListData;

    }]);
