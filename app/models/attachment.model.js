/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
* @ngdoc service
* @name dashboard.AttachmentData
* @description
* # AttachmentData
* Model in the dashboard.
*/
angular.module('dashboard')
    .factory('AttachmentData', ['BTNTYPE', function (BTNTYPE) {

        function AttachmentData(title, link, publicity, buttonType) {
            this.title = title;
            this.link = (typeof link === 'string') ? link : {};
            this.publicity = publicity ? publicity : 'true';
            this.buttonType = buttonType ? buttonType : BTNTYPE.PRIMARY;
        }

        AttachmentData.create = function (title, link, publicity, buttonType) {
            if (typeof title === 'string') {
                return new AttachmentData(title, link, publicity, buttonType);
            }
            return null;
        };

        return AttachmentData;

    }]);