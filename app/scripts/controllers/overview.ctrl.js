/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc function
 * @name dashboard.controller:OverviewCtrl
 * @description
 * # OverviewCtrl
 * Controller of the dashboard
 */
angular.module('dashboard')
.constant(
    'OPENMODE', {
        BOTH : 0,
        MTG : 1,
		SGN : 2
    }
)
.controller('overviewCtrl', function ($scope, $log, ENV, SigningOpenApi, $state, $rootScope, OPENMODE) {
	$log.log("overviewCtrl: CONTROLLER");
	var self = this;

	self.state = OPENMODE.BOTH;
    self.future = true;
    self.closedSignReqs = true;

	self.showInfo = function() {
		$log.debug("overviewCtrl: showInfo");
	};

    self.meetingsClicked = function() {
		$log.debug("overviewCtrl: meetingsClicked");
		if (self.state === OPENMODE.BOTH || self.state === OPENMODE.SGN) {
			self.state = OPENMODE.MTG;
		}
		else {
			self.state = OPENMODE.BOTH;
		}
	};

	self.signingsClicked = function() {
		$log.debug("overviewCtrl: signingsClicked");
		if (self.state === OPENMODE.BOTH || self.state === OPENMODE.MTG) {
			self.state = OPENMODE.SGN;
		}
		else {
			self.state = OPENMODE.BOTH;
		}
	};
});
