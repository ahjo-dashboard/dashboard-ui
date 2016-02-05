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
.controller('overviewCtrl', function ($scope, $log, AhjoMeetingService, ENV, SigningOpenApi, $state) {
	$log.log("overviewCtrl.controller");
	var self = this;
	self.loading = 0;
	self.meetingsHeader = 'Tulevat kokoukset';
	self.signReqsHeader = 'Avoimet allekirjoituspyynnöt';
	self.meetings = [];
	self.loadingmax = 2;
	self.signErr = null;
	self.mtgErr = null;

	AhjoMeetingService.getMeetings(ENV.MeetingsApi_OverviewLimit, ENV.MeetingsApi_DefaultOffset)
	.then(function(response) {
		$log.debug(response);
		self.meetings = response.objects;
		self.mtgErr = null;
	},
	function(error) {
		$log.error("overviewCtrl: getMeetings error: " +error);
		self.mtgErr = error.status;
	})
	.finally(function() {
		$log.debug("overviewCtrl: getMeetings finally"); //TODO: remove
		self.loading += 1;
	});

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
});
