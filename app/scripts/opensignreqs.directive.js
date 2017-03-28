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

        var controller = ['$log', 'SigningOpenApi', 'SigningClosedApi', '$scope', '$state', '$rootScope', 'CONST', 'StorageSrv', 'Utils', function ($log, SigningOpenApi, SigningClosedApi, $scope, $state, $rootScope, CONST, StorageSrv, Utils) {
            $log.log("adOpenSignreqs.CONTROLLER");
            var self = this;

            self.VIEW_OPEN = 1;
            self.VIEW_CLOSED = 2;
            self.CLOSED_MAXTASKS = 2;
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
            self.modelOpen = null;
            self.modelClosed = []; // View data model for closed singing reqs
            self.ongoingClosed = []; // Ongoing tasks for fetching closed signing reqs
            /* PRIVATE FUNCTIONS */

            function setTitle() {
                if (!self.FType) {
                    self.docTypeTitle = 'STR_SIGNING_TYPE';
                }
                else {
                    self.docTypeTitle = self.FType.strId;
                }

                if (!self.FStatus) {
                    self.docStatusTitle = 'STR_STATUS';
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
                        self.model = self.modelOpen;
                        break;
                    case self.VIEW_CLOSED:
                        self.error = self.errClosed;
                        self.model = self.modelClosed;
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
                self.modelOpen = SigningOpenApi.query(function () {
                    $log.debug("adOpenSignreqs: SigningOpenApi.query open done: " + self.modelOpen.length);
                    self.loadingOpen = false;
                    self.errOpen = null;
                }, function (error) {
                    $log.error("adOpenSignreqs: SigningOpenApi.query open error: " + JSON.stringify(error));
                    self.loadingOpen = false;
                    self.errOpen = error;
                });
                self.modelOpen.$promise.finally(function () {
                    $log.debug("adOpenSignreqs: SigningOpenApi.query open finally");
                    refreshModel();
                });
            }

            /*
            * @name dashboard.adOpenSignreqs.filterOutClosedOfficials
            * @description Filters out Viranhaltijapäätös which are rejected/returned
            * @param Array item to compare
            * @returns {boolean} True if item qualified, false if filtered out.
            */
            function filterOutClosedOfficials(aItem) {
                return angular.isObject(aItem) && !(angular.equals(aItem.DocumentType, CONST.ESIGNTYPE.OFFICIAL.value) && (angular.equals(aItem.Status, CONST.ESIGNSTATUS.RETURNED.value) || angular.equals(aItem.Status, CONST.ESIGNSTATUS.REJECTED.value)) );
            }

            function filterOfficials(aItem) {
                return angular.isObject(aItem) && (aItem.DocumentType === CONST.ESIGNTYPE.OFFICIAL.value);
            }

            function filterPolicymakers(aItem) {
                return angular.isObject(aItem) && (aItem.DocumentType === CONST.ESIGNTYPE.POLICYMAKER.value);
            }

            function cmpDate(a, b) {
                var res = 0;
                if (angular.isObject(a) && angular.isObject(b) && angular.isString(a.RequestDate) && angular.isString(b.RequestDate)) {
                    var m = a.RequestDate.toLowerCase();
                    var n = b.RequestDate.toLowerCase();
                    if (m < n) { //sort newest first
                        res = 1;
                    } else if (m > n) {
                        res = -1;
                    }
                } else {
                    $log.error("adOpenSignreqs.cmpDate: bad args ", arguments);
                }
                return res;
            }

            /*
            * @name dashboard.adOpenSignreqs.sortDocs
            * @description Sorts signing docs array: grouped by type, official group first, group-internal sorting by date
            * @param Esign document array to sort
            * @returns {array}
            */
            function sortDocs(aArr) {
                var res = [];
                if (angular.isArray(aArr)) {
                    var off = aArr.filter(filterOfficials);
                    off.sort(cmpDate);
                    var poli = aArr.filter(filterPolicymakers);
                    off.sort(cmpDate);
                    Array.prototype.push.apply(res, poli);
                    Array.prototype.push.apply(res, off);
                } else {
                    $log.error("adOpenSignreqs.sortDocs: bad args ", arguments);
                }
                return res;
            }

            /* Fetch signing documents by year */
            function getClosed(newY, arr) {
                $log.debug("adOpenSignreqs.getClosed: SigningOpenApi.query closed: " + newY);

                if (!newY || !arr || !(arr instanceof Object) || arr.length >= self.CLOSED_MAXTASKS) {
                    $log.error("adOpenSignreqs.getClosed: bad args!");
                    return;
                }

                var tmp = { year: newY, prom: null };
                arr.push(tmp);

                tmp.prom = SigningClosedApi.query({ byYear: newY }, function (/*data*/) {
                    if (angular.isArray(tmp.prom)) {
                        var data = tmp.prom.filter(filterOutClosedOfficials);
                        $log.debug("adOpenSignreqs.getClosed: SigningOpenApi.query closed (" + tmp.year + ") done, filtered count: " + data.length +", unfiltered count: " +tmp.prom.length);
                        data = sortDocs(data);
                        Array.prototype.push.apply(self.modelClosed, data);
                    } else {
                        $log.error("adOpenSignreqs.getClosed: bad response, ignored", arguments);
                    }
                    self.errClosed = null;
                }, function (error) {
                    $log.error("adOpenSignreqs.getClosed: SigningOpenApi.query (" + tmp.year + ") error: ", arguments);
                    self.errClosed = error;
                });
                tmp.prom.$promise.finally(function () {
                    $log.debug("adOpenSignreqs.getClosed: SigningOpenApi.query finally (" + tmp.year + ")");
                    var ind = arr.indexOf(tmp); // Supported starting IE 9
                    if (ind !== -1) {
                        $log.debug("adOpenSignreqs.getClosed: removing task for year " + tmp.year);
                        arr.splice(ind, 1);
                    }
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
                        if (!self.modelOpen) {
                            getOpen();
                        } else {
                            refreshModel();
                        }
                        break;
                    case self.VIEW_CLOSED:
                        if (!self.modelClosed.length) {
                            var year = new Date().getFullYear();
                            getClosed(year, self.ongoingClosed);
                            getClosed(year - 1, self.ongoingClosed);
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

            /* Resolve display text for item status */
            self.statusStrId = function (value) {
                var s = Utils.objWithVal(CONST.ESIGNSTATUS, 'value', value);
                return s ? s.stringId : '';
            };

            // Resolves l18n string id for document type display text
            self.docTypeStrId = function (value) {
                var s = Utils.objWithVal(CONST.ESIGNTYPE, 'value', value);
                return s ? s.stringId : '';
            };

            /* Resolves if current state is loading data */
            self.loading = function () {
                var res = false;
                if ((self.viewState === self.VIEW_OPEN && self.loadingOpen) || (self.viewState === self.VIEW_CLOSED && self.ongoingClosed.length)) {
                    res = true;
                }
                return res;
            };

            /* Resolve css class for signing status */
            self.statusStyle = function (status) {
                var s = Utils.objWithVal(CONST.ESIGNSTATUS, 'value', status);
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

            self.isFilter = function isFilter() {
                return self.FType || self.FStatus;
            };

            /*
            * @name dashboard.utils.docFilter
            * @description View ngRepeat filter function for selecting model items based on filter rule
            * @param {} Item to examine
            * @returns {boolean} True if item should be displayed.
            */
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
                StorageSrv.setKey(CONST.KEY.SIGN_ITEM, item);
                $state.go(CONST.APPSTATE.SIGN, { 'signItem': item });
            };

            $scope.$watch('closeditems', function (newValue/*, oldValue*/) {
                //$log.debug("adOpenSignreqs.watch closeditems: " +newValue +" old:" +oldValue);
                if (newValue) {
                    setVwState(self.VIEW_CLOSED);
                } else {
                    setVwState(self.VIEW_OPEN);
                }
            });

            self.isDisabled = function (/* id */) {
                return self.viewState === self.VIEW_OPEN ? self.loadingOpen : self.loadingClosed;
            };

            setTitle();
        }];

        return {
            controller: controller,
            controllerAs: 'c',
            templateUrl: 'views/opensignreqs.directive.html',
            restrict: 'E',
            replace: 'true',
            scope: {
                closeditems: '='
            }
        };
    }]);
