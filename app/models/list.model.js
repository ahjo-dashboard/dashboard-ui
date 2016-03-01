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
    .factory('ListData', ['AttachmentData', function (AttachmentData) {

        function ListData(title, objects) {
            this.title = title;
            this.objects = objects;
        }

        ListData.createAttachmentList = function (title, attachment) {
            if (typeof title === 'string') {
                var array = [];
                for (var index = 0; (attachment instanceof Array) && (index < attachment.length); index++) {
                    var element = attachment[index];
                    var item = AttachmentData.create(element.attachmentTitle, element.link, element.publicity, element.buttonType);
                    if (item) {
                        array.push(item);
                    }
                }
                return new ListData(title, array);
            }
            return null;
        };

        ListData.createDecisionList = function (title, decision) {
            if (typeof title === 'string') {
                var array = [];
                for (var index = 0; (decision instanceof Array) && (index < decision.length); index++) {
                    var element = decision[index];
                    var item = AttachmentData.create(element.decisionTitle, element.link, element.publicity, element.buttonType);
                    if (item) {
                        array.push(item);
                    }
                }
                return new ListData(title, array);
            }
            return null;
        };

        ListData.createAdditionalMaterialList = function (title, material) {
            if (typeof title === 'string') {
                var array = [];
                for (var index = 0; (material instanceof Array) && (index < material.length); index++) {
                    var element = material[index];
                    var item = AttachmentData.create(element.additionalMaterialTitle, element.link, element.publicity, element.buttonType);
                    if (item) {
                        array.push(item);
                    }
                }
                return new ListData(title, array);
            }
            return null;
        };

        return ListData;

    }]);