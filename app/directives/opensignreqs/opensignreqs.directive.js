/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc directive
 * @name dashboard.directive:openSignreqs
 * @description
 * # openSignreqs
 */
angular.module('dashboard')
    .directive('adOpenSignreqs', [function () {

        var controller = ['$log', 'SigningOpenApi', 'SigningClosedApi', '$scope', '$state', '$rootScope', 'CONST', function ($log, SigningOpenApi, SigningClosedApi, $scope, $state, $rootScope, CONST) {
            $log.log("adOpenSignreqs.CONTROLLER");
            var self = this;

            self.VIEW_OPEN = 1;
            self.VIEW_CLOSED = 2;
            self.viewState = null;
            self.model = [];
            self.errClosed = null;
            self.errOpen = null;
            self.error = null;
            self.docStatuses = [];
            self.docTypes = [];
            self.FStatus = null;
            self.FType = null;
            self.docTypeTitle = null;
            self.docStatusTitle = null;
            self.isMobile = $rootScope.isMobile;

            /* PRIVATE FUNCTIONS */

            function setTitle() {
                if (!self.FType) {
                    self.docTypeTitle = 'STR_SIGNING_TYPE';
                }
                else {
                    self.docTypeTitle = self.FType.strId;
                }

                if (!self.FStatus) {
                    self.docStatusTitle = 'STR_SIGNING_REQ_STATUS';
                }
                else {
                    self.docStatusTitle = self.FStatus.strId;
                }
            }

            function DocStatus(status, strId) {
                this.val = status;
                this.strId = strId;
            }

            function DocType(type, strId) {
                this.val = type;
                this.strId = strId;
            }

            // returns true if 'arr' contains an object with property 'prop' with value 'val'
            function hasObjWithPropVal(arr, prop, val) {
                //$log.debug("adOpenSignreqs.arrayHasObjWith: " +prop +" val:" +val);
                var res;

                if (!arr || !prop || undefined === val) {
                    $log.error("adOpenSignreqs.hasObjWithPropVal: bad arguments: arr:" + arr + " prop:" + prop + " val:" + val);
                    res = false;
                }

                for (var ind = 0; ind < arr.length && res === undefined; ind++) {
                    //$log.debug("adOpenSignreqs.hasObjWithPropVal: arr[" +ind +"][" +prop +"]=" +arr[ind][prop] +" match to prop: " +prop +" val: " +val);
                    if (arr[ind] && prop in arr[ind] && arr[ind][prop] === val) {
                        res = true;
                        //$log.debug("adOpenSignreqs.hasObjWithPropVal: found");
                    }
                }
                return res;
            }

            function cmpStr(a, b) {
                var m = a.strId.toLowerCase(); // TODO: sorting by localized string would be nice...would need to fetch it async
                var n = b.strId.toLowerCase();
                if (m < n) { //sort ascending
                    return -1;
                }
                if (m > n) {
                    return 1;
                }
                return 0;
            }

            function parseDocTypes() {
                //$log.debug("adOpenSignreqs.parseDocTypes");
                self.docTypes = [];
                for (var i = 0; i < self.model.length; i++) {
                    var item = self.model[i];
                    if (item && "DocumentType" in item && !hasObjWithPropVal(self.docTypes, 'val', item.DocumentType)) {
                        self.docTypes.push(new DocType(item.DocumentType, self.docTypeStrId(item.DocumentType)));
                    }
                }
                self.docTypes.sort(cmpStr);
            }

            function parseDocStatuses() {
                //$log.debug("adOpenSignreqs.parseDocStatuses >>>");
                self.docStatuses = [];
                for (var i = 0; i < self.model.length; i++) {
                    var item = self.model[i];
                    if (item && "Status" in item && !hasObjWithPropVal(self.docStatuses, 'val', item.Status)) {
                        self.docStatuses.push(new DocStatus(item.Status, self.statusStrId(item.Status)));
                    }
                }
                self.docStatuses.sort(cmpStr);
                //$log.debug("adOpenSignreqs.parseDocStatuses <<<");
            }

            // Update view model after view state changes or finished queries
            function refreshModel() {
                switch (self.viewState) {
                    case self.VIEW_OPEN:
                        self.error = self.errOpen;
                        self.model = self.responseOpen;
                        break;
                    case self.VIEW_CLOSED:
                        self.error = self.errClosed;
                        self.model = self.responseClosed;
                        break;
                    default:
                        $log.error("adOpenSignreqs.refreshModel: Should not reach default here!");
                        break;
                }

                parseDocTypes();
                parseDocStatuses();
            }

            function getOpen() {
                $log.debug("adOpenSignreqs: SigningOpenApi.query open");
                self.loadingOpen = true;
                self.responseOpen = SigningOpenApi.query(function () {
                    $log.debug("adOpenSignreqs: SigningOpenApi.query open done: " + self.responseOpen.length);
                    self.loadingOpen = false;
                    self.errOpen = null;
                },
                    function (error) {
                        $log.error("adOpenSignreqs: SigningOpenApi.query open error: " + JSON.stringify(error));
                        self.loadingOpen = false;
                        self.errOpen = error;
                    });
                self.responseOpen.$promise.finally(function () {
                    $log.debug("adOpenSignreqs: SigningOpenApi.query open finally");
                    refreshModel();
                });
            }

            function getClosed() {
                $log.debug("adOpenSignreqs: SigningOpenApi.query closed");
                self.loadingClosed = true;
                self.responseClosed = SigningClosedApi.query({ byYear: 2015 }, function (/*data*/) { // TODO: fix byYear
                    $log.debug("adOpenSignreqs: SigningOpenApi.query closed done: " + self.responseClosed.length);
                    self.loadingClosed = false;
                    self.errClosed = null;
                },
                    function (error) {
                        $log.error("adOpenSignreqs: SigningOpenApi.query closed error: " + JSON.stringify(error));
                        self.loadingClosed = false;
                        self.errClosed = error;
                    });
                self.responseClosed.$promise.finally(function () {
                    $log.debug("adOpenSignreqs: SigningOpenApi.query closed finally");
                    refreshModel();
                });
            }

            function setVwState(state) {
                $log.log("adOpenSignreqs.setVwState: " + state);
                self.model = [];
                self.viewState = state;
                self.setModelFilter(null);
                self.model = [];
                switch (state) {
                    case self.VIEW_OPEN:
                        if (!self.responseOpen) {
                            getOpen();
                        } else {
                            refreshModel();
                        }
                        break;
                    case self.VIEW_CLOSED:
                        if (!self.responseClosed) {
                            getClosed();
                        } else {
                            refreshModel();
                        }
                        break;
                    default:
                        $log.error("adOpenSignreqs.setVwState: Should not reach default here! " + state);
                        break;
                }
            }

            /* PUBLIC FUNCTIONS */

            self.itemSelected = function (item) {
                $log.debug("adOpenSignreqs.adOpenSignreqs: " + JSON.stringify(item));
                $state.go(CONST.APPSTATE.SIGNITEM, { 'signItem': item });
            };

            /* Resolve display text for item status */
            self.statusStrId = function (value) {
                var s = $rootScope.objWithVal(CONST.ESIGNSTATUS, 'value', value);
                return s ? s.stringId : '';
            };

            // Resolves l18n string id for document type display text
            self.docTypeStrId = function (value) {
                var s = $rootScope.objWithVal(CONST.ESIGNTYPE, 'value', value);
                return s ? s.stringId : '';
            };

            /* Is current state loading data */
            self.loading = function () {
                var res = false;
                if ((self.viewState === self.VIEW_OPEN && self.loadingOpen) || (self.viewState === self.VIEW_CLOSED && self.loadingClosed)) {
                    res = true;
                }
                return res;
            };

            /* Resolve css class for signing status */
            self.statusStyle = function (status) {
                var s = $rootScope.objWithVal(CONST.ESIGNSTATUS, 'value', status);
                return s ? s.badgeClass : 'label-default';
            };

            self.setModelFilter = function (filter) {
                if (filter instanceof DocType) {
                    $log.debug("adOpenSignreqs.setModelFilter: DocType " + filter.val + " string:" + filter.strId);
                    self.FType = filter;
                } else if (filter instanceof DocStatus) {
                    $log.debug("adOpenSignreqs.setModelFilter: DocStatus " + filter.val + " string:" + filter.strId);
                    self.FStatus = filter;
                } else {
                    $log.debug("adOpenSignreqs.setModelFilter: clear");
                    self.FType = null;
                    self.FStatus = null;
                }
                setTitle();
            };

            self.docFilter = function (item) {
                var res = true;
                if (self.FType) {
                    res = item.DocumentType === self.FType.val;
                    //$log.log("adOpenSignreqs.docFilter: FType=" +self.FType.val +" item: " +item.DocumentType);
                }
                if (res && self.FStatus) {
                    res = item.Status === self.FStatus.val;
                    //$log.log("adOpenSignreqs.docFilter: FStatus=" +self.FStatus.val +" item: " +item.Status);
                }
                //$log.log("adOpenSignreqs.docFilter: " +res);
                return res;
            };

            self.selected = function (item) {
                $log.log("adOpenSignreqs.selected");
                $state.go(CONST.APPSTATE.SIGNITEM, { 'signItem': item });
            };

            $scope.$watch('closeditems', function (newValue/*, oldValue*/) {
                //$log.debug("adOpenSignreqs.watch closeditems: " +newValue +" old:" +oldValue);
                if (newValue) {
                    setVwState(self.VIEW_CLOSED);
                } else {
                    setVwState(self.VIEW_OPEN);
                }
            });

            setTitle();
        }];

        return {
            controller: controller,
            controllerAs: 'ctrl',
            templateUrl: 'directives/opensignreqs/opensignreqs.directive.html',
            restrict: 'E',
            replace: 'true',
            scope: {
                closeditems: '='
            }
        };
    }]);
