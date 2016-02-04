/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

describe('Service: MtgAttachmentApi', function () {

    // load the service's module
    beforeEach(module('dashboard'));

    // instantiate service
    var MtgAttachmentApi;
    beforeEach(inject(function (_MtgAttachmentApi_) {
        MtgAttachmentApi = _MtgAttachmentApi_;
    }));

    it('should do something', function () {
        expect(!!MtgAttachmentApi).toBe(true);
    });

});
