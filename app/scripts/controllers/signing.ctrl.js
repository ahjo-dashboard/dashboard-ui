/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc function
 * @name dashboard.controller:SigningCtrl
 * @description
 * # SigningCtrl
 * Controller of the dashboard
 */
angular.module('dashboard')
.controller('SigningCtrl', function ($scope, $state, $log, SigningOpenApi, SigningClosedApi) {
  $log.log("SigningCtrl.config");
  var self = this;
  var tabOpen = { header: "Avoimet", active: true, items: null, error: null };
  var tabClosed = { header: "Suljetut", active: false, items: null};
  self.tabs =  [ tabOpen, tabClosed ];

  tabOpen.items = SigningOpenApi.query(function() {
    tabOpen.error = null;
  },
  function(err) {
    $log.error("SigningCtrl: SigningOpenApi.query " +JSON.stringify(err));
    tabOpen.error = err.status;
  });

  tabClosed.items = SigningClosedApi.query({byYear : 2015}, function(/*data*/) { // TODO: fix byYear
    tabClosed.error = null;
  },
  function(err) {
    $log.error("SigningCtrl: SigningClosedApi.query " +JSON.stringify(err));
    tabClosed.error = err.status;
  });

  self.itemSelected = function(signingItem) {
    $log.debug("SigningCtrl.itemSelected");
    $state.go('app.signitem', {signItem : signingItem});
  };

});
