/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

describe('Service: SigningOpen', function () {

  // load the service's module
  beforeEach(module('dashboard'));

  // instantiate service
  var tmp;
  beforeEach(inject(function (_SigningOpenApi_) {
    tmp = _SigningOpenApi_;
  }));

  it('should do something', function () {
    expect(!!tmp).toBe(true);
  });

});
