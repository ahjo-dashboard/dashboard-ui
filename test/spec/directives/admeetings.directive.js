/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

describe('Directive: adMeetingsDirective', function () {

  // load the directive's module
  beforeEach(module('dashboard'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<ad-meetings-directive></ad-meetings-directive>');
    element = $compile(element)(scope);
    expect(!!element).toBe(true);
  }));
});
