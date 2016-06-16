/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

describe('Controller: menuCtrl', function () {

  // load the controller's module
  beforeEach(module('dashboard'));

  var test,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    test = $controller('menuCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should do something', function () {
    expect(!!test).toBe(true);
  });
});
