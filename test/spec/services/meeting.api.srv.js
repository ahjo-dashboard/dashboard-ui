/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

describe('Service: MtgMeetingApi', function () {

    // load the service's module
    beforeEach(module('dashboard'));

    // instantiate service
    var MtgMeetingApi;
    beforeEach(inject(function (_MtgMeetingApi_) {
        MtgMeetingApi = _MtgMeetingApi_;
    }));

    it('should do something', function () {
        expect(!!MtgMeetingApi).toBe(true);
    });

});
