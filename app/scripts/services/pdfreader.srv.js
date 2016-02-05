/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc service
 * @name dashboard.pdfReader
 * @description
 * # pdfReader
 * Service in the dashboard.
 */
angular.module('dashboard')
.factory('PdfReader', function ($resource) {
    return {
        query: function(uri) {
            return $resource( uri, {}, {
                query: {
                    method: 'GET',
                    headers: {
                        accept: 'application/pdf'
                    },
                    responseType: 'arraybuffer',
                    cache: true,
                    transformResponse: function (data) {
                        var pdf;
                        if (data) {
                            pdf = new Blob([data], { type: 'application/pdf'});
                        }
                        return {
                            pdfBlob: pdf
                        };
                    }
                }
            }).query();
        }
    };
});
