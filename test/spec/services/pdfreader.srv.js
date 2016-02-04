/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

describe('Service: PdfReader', function () {

     // load the service's module
     beforeEach(module('dashboard'));

     // instantiate service
     var PdfReader;
     beforeEach(inject(function (_PdfReader_) {
         PdfReader = _PdfReader_;
     }));

     it('should do something', function () {
         expect(!!PdfReader).toBe(true);
     });

});
