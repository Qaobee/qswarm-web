(function () {
    'use strict';
    angular.module('qaobee.cms.directives.pageDetail', ['cmsRestAPI',
        'qaobee.cms.directives.featuredImage',
        'qaobee.cms.directives.postAuthor'
    ])
        .directive('pageDetail', function () {
            return {
                restrict: 'E',
                scope: {
                    pageId: '='
                },
                templateUrl: 'app/components/directives/cms/page-detail/page-detail.html',
                controller: function ($scope, $log, $window, cmsRestAPI) {
                    cmsRestAPI.getPageDetail($scope.pageId).then(function (data) {
                        $scope.page = data.data;
                    });


                    $scope.doTheBack = function () {
                        $window.history.back();
                    };

                    $scope.formatDate = function (d) {
                        var da = moment(d);
                        return da.format('[<span class="post-date-day">]DD[</span><span class="post-date-month">]MM[</span><span class="post-date-year">]YYYY[</span>]');
                    }
                }
            };
        });
}());