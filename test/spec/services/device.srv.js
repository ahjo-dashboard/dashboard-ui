/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

describe('Service: Device', function () {

    // load the service's module
    beforeEach(module('dashboard'));

    // instantiate service
    var Device;
    beforeEach(inject(function (_Device_) {
        Device = _Device_;
    }));

    it('should do something', function () {
        expect(!!Device).toBe(true);
    });

});
