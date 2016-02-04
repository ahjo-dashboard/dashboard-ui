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
        cache: true
        },
        query: {
        method: "GET",
        cache: true,
        isArray: true
        }
    });
})
.factory('SigningClosedApi', function ($resource, ENV) {
    return $resource(ENV.SignApiUrl_GetByYear, {}, {
        get: {
        method: "GET",
        cache: true
        },
        query: {
        method: "GET",
        cache: true,
        isArray: true
        }
    });
})
.factory('SigningAttApi', function($resource, ENV, $log) {
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
                        pdf = new Blob([data], { type: 'application/pdf'});
                    } else {
                        $log.error("SigningAttApi.getPdfBlob: transformResponse empty blob");
                    }
                    return {
                        pdfBlob: pdf
                    };
                }
            }
        });
});
