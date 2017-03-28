/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
* @ngdoc service
* @name dashboard.utils
* @description
* # utils
* Service in the dashboard.
*/
angular.module('dashboard')
    .factory('Utils', function ($log, $window, CONST, AttachmentData, DialogUtils) {
        var Utils = {};

        Utils.isResoXs = function (argUa) {
            var ua = ua ? argUa : $window.navigator.userAgent;
            var device = document.getElementById("device");
            var res = (device && window.getComputedStyle(device, null).getPropertyValue("min-width") === '320px');
            $log.debug("Utils.isResoXs: " + res);
            return res;
        };

        Utils.isUaIe = function (argUa) {
            var ua = ua ? argUa : $window.navigator.userAgent;
            var res = ua.match(/Trident/i) || ua.match(/MSIE/i);
            return null !== res;
        };

        Utils.isUAEdge = function (argUa) {
            var ua = ua ? argUa : $window.navigator.userAgent;
            var res = ua.match(/Edge/i);
            return null !== res;
        };

        Utils.isUaMobile = function (argUa) {
            var ua = ua ? argUa : $window.navigator.userAgent;
            var dev = {
                Android: function () {
                    return ua.match(/Android/i);
                },
                BlackBerry: function () {
                    return ua.match(/BlackBerry/i);
                },
                iOS: function () {
                    return ua.match(/iPhone|iPad|iPod/i);
                },
                Opera: function () {
                    return ua.match(/Opera Mini/i);
                },
                Windows: function () {
                    return ua.match(/IEMobile/i);
                },
                isMobile: function () {
                    return (dev.Android() || dev.BlackBerry() || dev.iOS() || dev.Opera() || dev.Windows()) !== null;
                }
            };
            var res = dev.isMobile();
            $log.debug("Utils.isUaMobile: " + res);
            return res;
        };

        Utils.isClientMobile = function () {
            var ua = $window.navigator.userAgent;
            //console.log("Utils.isClientMobile: UA=" + ua);
            // var res = Utils.isUaMobile(ua) || Utils.isResoXs(ua);
            var res = Utils.isResoXs(ua);
            // $$log.debug("Utils.isClientMobile: " + res);
            return res;
        };

        Utils.isAttConf = function (att) {
            return (att instanceof AttachmentData) && att.publicity === CONST.PUBLICITY.SECRET;
        };

        // Utility function for looping an object to find the first immediate child object with matching value
        // Returns the matching object on success, null on bad arguments or if no match.
        // Example: find an object from 'arr' whose property 'prop' has value 'val'
        Utils.objWithVal = function (arr, prop, val) {
            var res = null;
            if (!arr || !angular.isObject(arr) || !prop) {
                $log.error("Utils.objWithVal: bad arguments:", arguments);
                return res;
            }

            var tmp;
            for (var p in arr) {
                tmp = arr[p];
                if (tmp && prop in tmp && angular.equals(tmp[prop], val)) {
                    res = tmp;
                    break;
                }
            }
            return res;
        };

        Utils.openNewWin = function (aUrl) {
            if (angular.isString(aUrl) && aUrl.length) {
                $log.debug("Utils.openNewWin: " + aUrl);
                $window.open(aUrl, '_blank');
            }
            else {
                $log.error("Utils.openNewWin: ignored due to bad url " + aUrl);
            }
        };
        /*
         * @name dashboard.utils.stringIdForError
         * @description Resolves a localized string id for an operation result code.
         * @param {number} Result code to parse.
         * @returns {string} String id.
         */
        Utils.stringIdForError = function stringIdForErrorFn(aNum) {
            var res = "STR_ERR_OP_FAIL";
            if (!angular.isNumber(aNum)) {
                $log.error("Utils.stringIdForError: bad arg, not a number ", arguments);
            }

            switch (aNum) {
                // Ahjo Meeting error codes
                case CONST.MTGAPICODES.K1001.value:
                    res = CONST.MTGAPICODES.K1001.strId;
                    break;
                case CONST.MTGAPICODES.K1002.value:
                    res = CONST.MTGAPICODES.K1002.strId;
                    break;
                case CONST.MTGAPICODES.K1003.value:
                    res = CONST.MTGAPICODES.K1003.strId;
                    break;
                case CONST.MTGAPICODES.K1004.value:
                    res = CONST.MTGAPICODES.K1004.strId;
                    break;
                case CONST.MTGAPICODES.K1005.value:
                    res = CONST.MTGAPICODES.K1005.strId;
                    break;
                case CONST.MTGAPICODES.K1007.value:
                    res = CONST.MTGAPICODES.K1007.strId;
                    break;
                case CONST.MTGAPICODES.K1008.value:
                    res = CONST.MTGAPICODES.K1008.strId;
                    break;
                case CONST.MTGAPICODES.K1009.value:
                    res = CONST.MTGAPICODES.K1009.strId;
                    break;
                case CONST.MTGAPICODES.K1010.value:
                    res = CONST.MTGAPICODES.K1010.strId;
                    break;

                default:
                    $log.log("Utils.stringIdForError: didn't find a string id for '" + aNum + "', defaulting to " + res);
            }
            return res;
        };

        Utils.showErrorForErrorCode = function showErrorForErrorCode(aNum) {
            var str = Utils.stringIdForError(aNum);
            DialogUtils.showError(str);
        };

        Utils.showErrorForError = function (error) {
            if (angular.isObject(error)) {
                Utils.showErrorForErrorCode(error.errorCode);
            }
            else {
                $log.error("Utils.showErrorForError", error);
                Utils.showErrorForErrorCode(0);
            }
        };

        /*
         * @name dashboard.utils.parseResponse
         * @description Parses an Ahjo Meeting API response for any and returns error object or data object
         * @param {Object} aResponse REST response to process.
         * @returns {Object} included parsed error { 'errorCode': value } or data { 'data': value }
         */
        Utils.parseResponse = function (aResponse) {
            var result = CONST.GENERALERROR;
            if (angular.isObject(aResponse) && angular.isObject(aResponse.data)) {
                if (angular.isObject(aResponse.data.error) && aResponse.data.error.errorcode > 0) {
                    result.errorCode = aResponse.data.error.errorcode;
                }
                else if (angular.isObject(aResponse.data.objects)) {
                    result = { 'data': aResponse.data.objects };
                }
            }
            return result;
        };

        /*
         * @name dashboard.utils.parseResource
         * @description Parses an Ahjo Meeting API response for any and returns error object or data object
         * @param {Object} aResource REST resource to process.
         * @returns {Object} included parsed error { 'errorCode': value } or data { 'data': value }
         */
        Utils.parseResource = function (aResource) {
            var result = CONST.GENERALERROR;
            if (angular.isObject(aResource)) {
                if (angular.isObject(aResource.error) && aResource.error.errorcode > 0) {
                    result.errorCode = aResource.error.errorcode;
                }
                else if (angular.isObject(aResource.objects)) {
                    result = { 'data': aResource.objects };
                }
            }
            return result;
        };

        /*
         * @name dashboard.utils.parseHtmlError
         * @description Parses an Ahjo Meeting API response error and returns error object
         * @param {Object} response REST error to process.
         * @returns {Object} included parsed error { 'errorCode': value }
         */
        Utils.parseHtmlError = function (error) {
            var result = CONST.GENERALERROR;
            var ec = Utils.processAhjoError(error, false);
            result.errorCode = ec;
            return result;
        };

        /*
         * @name dashboard.utils.processAhjoError
         * @description Parses an Ahjo Meeting API response for any errors and displays a result dialog if necessary.
         * @param {string} a1 REST response to process. Expects a HTTP response in a `status` property and an Ahjo Meeting API response in `data.error`.
         * @param {boolean} Optional. True if UI dialogs should be displayed (default if not defined), false if not.
         * @returns {integer} Parsed error code, 0 if no error, -1 if bad response object.
         */
        Utils.processAhjoError = function processAhjoErrorFn(aResp, aUi) {
            // $log.debug("Utils.processAhjoError: \n" +JSON.stringify(aResp));
            var res = 0;
            if (!angular.isObject(aResp)) { // Bad function arg handling
                $log.error("Utils.processAhjoError: bad argument");
                res = CONST.NOTFOUND;
            } else if (!angular.equals(aResp.status, CONST.HTTPSTATUS.K200.value)) { // HTTP result other than 200
                $log.error("Utils.processAhjoError: status object \n" + JSON.stringify(aResp));
                res = aResp.status;
            } else if (angular.isObject(aResp.data) && angular.isObject(aResp.data.error)) { // HTTP OK but REST error
                $log.error("Utils.processAhjoError: error object \n" + JSON.stringify(aResp));
                res = aResp.data.error.errorcode ? aResp.data.error.errorcode : CONST.NOTFOUND;
            } else {
                // No errors
            }

            if ((!angular.isDefined(aUi) || aUi) && res) {
                var str = Utils.stringIdForError(res);
                DialogUtils.showError(str);
            }
            return res;
        };

        return Utils;
    });
