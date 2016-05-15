/**
 * (c) 2016 Tieto Finland Oy
 * Licensed under the MIT license.
 */
'use strict';

/**
 * @ngdoc directive
 * @name dashboard.imgViewer:imgViewer
 * @description
 * # imgViewer
 */
var app = angular.module('dashboard');
app.directive('dbImgviewer', function () {

    var controller = ['$log', '$q', '$http', '$scope', function ($log, $q, $http, $scope) {
        $log.debug("dbImgviewer.controller");

        var self = this;
        self.bigger = false;
        self.pages = [];
        self.loadingImg = false;
        self.currPage = 0;
        self.pageData = {};

        self.imgEvent = function (data) {
            $log.debug("dbImgviewer.imgEvent: result=" + data.status);
            self.imgLoading = data.status;
        };

        function ImgPage(aBaseUrl, aPageNum) {
            var self = this;
            self.pageUrl = aBaseUrl.replace("page=1", "page=" + aPageNum);
            self.pageNum = aPageNum;
            self.obj = null;// Backend response key 'objects'
        }

        function validateScopeFile(aSf) {
            var res = angular.isObject(aSf) && angular.isString(aSf.title) && angular.isString(aSf.link) && angular.isNumber(aSf.publicity) && angular.isNumber(aSf.pageCount) && (0 < aSf.pageCount);
            if (!res) {
                $log.error("dbImgviewer.validateScopeFile: bad fileConf: " +JSON.stringify(aSf));
            } else {
                $log.debug("dbImgviewer.validateScopeFile: ok for: " +JSON.stringify(aSf));
            }
            return res;
        }

        function updateModel() {
            // $log.debug("dbImgviewer.updateModel");
            self.pages = [];
            self.pageData = {};

            if (validateScopeFile(self.fileConf)) {
                self.currPage = self.fileConf.pageCount ? 1 : 0;
                for (var i = 1; i <= self.fileConf.pageCount; i++) {
                    self.pages.push(new ImgPage(self.fileConf.link, i));
                }
            }
            $log.debug("dbImgviewer.updateModel: pages " +self.pages.length);
            self.pageChanged(1);
        }

        function getFile(aUrl) {
            $log.debug("dbImgviewer.getFile: " + aUrl);
            var d = $q.defer();

            if (!angular.isString(aUrl) || !aUrl.length) {
                d.reject('dbImgviewer.getFile: bad url');
            } else {
                $http({
                    method: 'GET',
                    cache: true,
                    url: aUrl
                }).then(function (response) {
                    $log.debug("dbImgviewer.getFile: done");
                    d.resolve(response.data);
                }, function (error) {
                    $log.error("mgViewer.getFile: error " + error);
                    d.reject(error);
                });
            }

            return d.promise;
        }

        function validatePageResponse(aPage, aResp) {
            /* Expected response structure
            {
              "meta": {},
              "objects": {
                "fileContents": "iVBORw0KGgoAAAANSUhEUgAAAxkAAARjCAIAAACMn36BAAAJNm…”
                "contentType": "image/png",
                "fileDownloadName": ""
              ]
            }
            */

            $log.debug("dbImgviewer.validatePageResponse");
            aPage.obj = null;
            if (angular.isObject(aResp.objects) && angular.isString(aResp.objects.fileContents) && aResp.objects.fileContents.length && angular.isString(aResp.objects.contentType) && aResp.objects.contentType.length) {
                aPage.obj = aResp.objects;
            } else {
                $log.error("dbImgviewer.validatePageResponse: response rejected, invalid structure");
            }
        }

        self.pageChanged = function (page) {
            $log.debug("dbImgviewer.pageChanged: " + page);

            if (!angular.isNumber(page) || ((page - 1) < 0 || ((page - 1) > self.pages.length))) {
                $log.error("dbImgviewer.pageChanged: bad argument, ignored");
                return;
            }

            self.pageData = self.pages[page - 1];
            var p = self.pageData;

            if (angular.isObject(p) && (!angular.isObject(p.obj) || !angular.isString(p.obj.fileContents) || !p.obj.fileContents.length)) {
                self.loadingImg = true;
                getFile(p.pageUrl).then(function (response) {
                    validatePageResponse(p, response);
                }, function (error) {
                    $log.error("dbImgviewer.pageChanged: error=" + JSON.stringify(error));
                }).finally(function () {
                    self.loadingImg = false;
                });
            }
        };

        $scope.$watch(function () {
            return self.fileConf;
        }, function (newVal, oldVal) {
            // $log.debug('dbImgviewer: urlBase=' + newVal);
            if (!angular.equals(newVal, oldVal)) {
                $log.debug("dbImgviewer.watch: arg changed: ");
                $log.debug(newVal);
                updateModel();
            }
        });

        updateModel();
    }];

    return {
        scope: true,
        bindToController: {
            // Expected fileConf:
            // {
            //     title
            //     link
            //     publicity
            //     pageCount
            // }
            fileConf: '='
        },
        controller: controller,
        controllerAs: "c",
        templateUrl: 'directives/imgviewer/imgviewer.directive.html',
        restrict: 'E',
        replace: 'true'
    };
});
