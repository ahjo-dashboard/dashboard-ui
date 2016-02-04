/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

describe('Controller: meetingListCtrl', function () {

    // load the controller's module
    beforeEach(module('dashboard'));

    var meetingListCtrl,
    scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        meetingListCtrl = $controller('meetingListCtrl', {
            $scope: scope
            // place here mocked dependencies
        });
    }));

    it('should attach a list of awesomeThings to the scope', function () {
        expect(!!meetingListCtrl).toBe(true);
    });
});
