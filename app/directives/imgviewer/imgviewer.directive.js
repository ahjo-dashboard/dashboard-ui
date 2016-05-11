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
app.directive('imgViewer', function () {

    var controller = ['$log', function ($log) {
        $log.debug("imgViewer.controller");

        var self = this;
        self.bigger = false;
        self.pages = [];
        self.imgLoading = true;
        self.currPage = 0;


        self.imgEvent = function (data) {
            $log.debug("imgViewer.imgEvent: result=" + data.status);
            self.imgLoading = data.status;
        };

        function addPage(url, urlPageArg, pageInd) {
            var delay = 'http://deelay.me/2000/'; //TODO: remove delay proxy, use only for development
            self.pages.push({
                //TODO: replace test images with real ones
                url_test: delay + (pageInd % 2 ? 'https://upload.wikimedia.org/wikipedia/commons/c/c4/PM5544_with_non-PAL_signals.png' : 'http://colorvisiontesting.com/images/plate%20with%205.jpg'),
                url: url + '?' + urlPageArg + '=' + pageInd
            });
        }

        function updateModel() {
            $log.debug("imgViewer.updateModel");
            self.pages = [];

            if ((!angular.isNumber(self.pageCount) && self.pageCount < 0) || (!angular.isString(self.urlBase) && !self.urlBase.length) || (!angular.isString(self.urlPageArg) && !self.urlPageArg.length)) {
                $log.error("imgViewer.watch config: bad args");
                return;
            }

            self.currPage = self.pageCount ? 1 : 0;
            for (var i = 0; i < self.pageCount; i++) {
                addPage(self.urlBase, self.urlPageArg, i+1);
            }

        }

        self.pageChanged = function () {
            $log.debug("imgViewer.pageChanged: " + self.currPage);
        };

        updateModel();
    }];

    return {
        scope: true,
        bindToController: {
            pageCount: '=',
            urlBase: '=',
            urlPageArg: '='
        },
        controller: controller,
        controllerAs: "c",
        templateUrl: 'directives/imgviewer/imgviewer.directive.html',
        restrict: 'E',
        replace: 'true'
    };
});
