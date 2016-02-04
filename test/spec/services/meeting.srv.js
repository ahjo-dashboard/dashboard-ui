/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

describe('Service: AhjoMeetingService', function () {

  // load the service's module
  beforeEach(module('dashboard'));

  // instantiate service
  var AhjoMeetingService;
  beforeEach(inject(function (_AhjoMeetingService_) {
    AhjoMeetingService = _AhjoMeetingService_;
  }));

  it('should do something', function () {
    expect(!!AhjoMeetingService).toBe(true);
  });

});
