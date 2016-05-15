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
    .factory('AttachmentData', ['$log', 'CONST', function ($log, CONST) {

        function AttachmentData(title, link, publicity, buttonType, orderNum, pageCount) {
            this.title = title;
            this.link = link;
            this.publicity = publicity ? publicity : 'true';
            this.buttonType = buttonType ? buttonType : CONST.BTNTYPE.INFO;
            this.orderNum = orderNum;
            this.pageCount = pageCount;
        }

        AttachmentData.create = function (title, link, publicity, buttonType, orderNum, pageCount) {
            var tmp = new AttachmentData(title, link, publicity, buttonType, orderNum, pageCount);
            $log.debug("AttachmentData.create: " + JSON.stringify(tmp));
            return tmp;
        };

        return AttachmentData;

    }]);
