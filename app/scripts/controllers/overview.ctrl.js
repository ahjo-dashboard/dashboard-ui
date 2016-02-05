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
.controller('overviewCtrl', function ($scope, $log, AhjoMeetingService, ENV, SigningOpenApi, $state, $rootScope, OPENMODE) {
	$log.log("overviewCtrl.controller");
	var self = this;
	self.loading = 0;
	self.meetingsHeader = 'Tulevat kokoukset';
	self.signReqsHeader = 'Avoimet allekirjoituspyynnöt';
	self.meetings = [];
	self.loadingmax = 2;
	self.signErr = null;
	self.mtgErr = null;

	self.mtgOpen = 1;
	self.sgnOpen = 1;

	self.state = OPENMODE.BOTH;

	self.tst = "http://www.orimi.com/pdf-test.pdf";

	// AhjoMeetingService.getMeetings(ENV.MeetingsApi_OverviewLimit, ENV.MeetingsApi_DefaultOffset)
	// .then(function(response) {
	// 	$log.debug(response);
	// 	self.meetings = response.objects;
	// 	self.mtgErr = null;
	// },
	// function(error) {
	// 	$log.error("overviewCtrl: getMeetings error: " +error);
	// 	self.mtgErr = error.status;
	// })
	// .finally(function() {
	// 	$log.debug("overviewCtrl: getMeetings finally"); //TODO: remove
	// 	self.loading += 1;
	// });

	// Open signing requests
	self.signItems = SigningOpenApi.query(function() {
		self.signErr = null;
	},
	function(error) {
		$log.error("overviewCtrl: SigningOpenApi.query error " +JSON.stringify(error));
		self.signErr = error.status;
		//self.errMsg = error.data.Message;
	});
	self.signItems.$promise.finally(function() {
		$log.debug("overviewCtrl: SigningOpenApi.query finally"); //TODO: remove
		self.loading += 1;
	});

	self.meetingSelected = function(meeting) {
		$log.debug("overviewCtrl.meetingSelected: "+ meeting);
		$state.go('app.meeting', {meetingItem : meeting});
	};

	self.signItemSelected = function(signingItem) {
		$log.debug("overviewCtrl.signItemSelected");
		$state.go('app.signitem', {signItem : signingItem});
	};

	self.showInfo = function() {
		$log.debug("overviewCtrl: showInfo");
	};

	self.toggleMenu = function() {
        $log.debug("overviewCtrl: toggleMenu");
		$rootScope.menu = !$rootScope.menu;
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
