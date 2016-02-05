/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

describe('Directive: openSignreqs', function () {

  // load the directive's module
  beforeEach(module('dashboard'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<ad-open-signreqs></ad-open-signreqs>');
    element = $compile(element)(scope);
    //expect(element.text()).toBe('this is the openSignreqs directive');
    expect(!!element).toBe(true);

  }));

});
