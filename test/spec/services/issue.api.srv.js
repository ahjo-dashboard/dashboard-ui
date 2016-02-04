/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

describe('Service: MtgIssueApi', function () {

    // load the service's module
    beforeEach(module('dashboard'));

    // instantiate service
    var MtgIssueApi;
    beforeEach(inject(function (_MtgIssueApi_) {
        MtgIssueApi = _MtgIssueApi_;
    }));

    it('should do something', function () {
        expect(!!MtgIssueApi).toBe(true);
    });

});
