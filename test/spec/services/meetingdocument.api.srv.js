/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

describe('Service: MtgMeetingDocumentApi', function () {

    // load the service's module
    beforeEach(module('dashboard'));

    // instantiate service
    var MtgMeetingDocumentApi;
    beforeEach(inject(function (_MtgMeetingDocumentApi_) {
        MtgMeetingDocumentApi = _MtgMeetingDocumentApi_;
    }));

    it('should do something', function () {
        expect(!!MtgMeetingDocumentApi).toBe(true);
    });

});
