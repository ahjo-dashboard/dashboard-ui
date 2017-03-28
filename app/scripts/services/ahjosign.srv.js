/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';
angular.module('AhjoSigningService', [
    'ngResource',
])
    .factory('SigningOpenApi', function ($resource, ENV) {
        return $resource(ENV.SignApiUrl_GetDocs, {}, {
            get: {
                method: "GET",
                cache: false
            },
            query: {
                method: "GET",
                cache: false,
                isArray: true
            },
            save: {
                method: "POST"
            }
        });
    })
    .factory('SigningClosedApi', function ($resource, ENV) {
        return $resource(ENV.SignApiUrl_GetByYear, {}, {
            get: {
                method: "GET",
                cache: false
            },
            query: {
                method: "GET",
                cache: false,
                isArray: true
            }
        });
    })
    .factory('SigningPersonInfoApi', function ($resource, ENV) {
        return $resource(ENV.SIGNAPIURL_PERSONINFO, {}, {
            get: {
                method: "GET",
                cache: true
            }
        });
    })
    .factory('SigningDocSignaturesApi', function ($resource, ENV) {
        return $resource(ENV.SIGNAPIURL_DOCSIGNATURES, {}, {
            get: {
                method: "GET",
                cache: false
            }
        });
    })
    .factory('SigningAttApi', function ($resource, ENV, $log) {
        return $resource(
            ENV.SignApiUrl_GetAttachment,
            {},
            {
                getPdfBlob: {
                    method: 'GET',
                    headers: {
                        accept: 'application/pdf'
                    },
                    responseType: 'arraybuffer',
                    cache: true,
                    transformResponse: function (data) {
                        var pdf = null;
                        if (data) {
                            pdf = new Blob([data], { type: 'application/pdf' });
                        } else {
                            $log.error("SigningAttApi.getPdfBlob: transformResponse empty blob");
                        }
                        return {
                            pdfBlob: pdf
                        };
                    }
                }
            });
    })
    .service('SigningUtil', ['$log', function ($log) {
        $log.debug("SigningUtil");
        var self = this;

        // Takes an document from signing api and returns an array of attachment info objects parsed from string arrray
        self.parseAtts = function (item) {
            var res = [];
            for (var i = 0; angular.isArray(item.AttachmentInfos) && i < item.AttachmentInfos.length; i++) {
                res.push(JSON.parse(item.AttachmentInfos[i])); // API returns items as JSON strings so parse into object
                // Example attachment info item: {"Id":"123456789", "ParentTitle":"abc", "Title":"xyz.pdf"}
            }
            $log.debug("SigningUtil.parseAtts: " + res.length);
            return res;
        };
    }]);
