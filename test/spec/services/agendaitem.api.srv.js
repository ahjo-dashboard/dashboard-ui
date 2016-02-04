/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

describe('Service: MthAgendaItemApi', function () {

    // load the service's module
    beforeEach(module('dashboard'));

    // instantiate service
    var MthAgendaItemApi;
    beforeEach(inject(function (_MthAgendaItemApi_) {
        MthAgendaItemApi = _MthAgendaItemApi_;
    }));

    it('should do something', function () {
        expect(!!MthAgendaItemApi).toBe(true);
    });

    // instantiate service
    var MthAgendaItemForMeetingApi;
    beforeEach(inject(function (_MthAgendaItemForMeetingApi_) {
        MthAgendaItemForMeetingApi = _MthAgendaItemForMeetingApi_;
    }));

    it('should do something', function () {
        expect(!!MthAgendaItemForMeetingApi).toBe(true);
    });

});
