(function () {
    'use strict';
    angular.module('qaobee.cms.directives.postDetail', ['cmsRestAPI',
        'qaobee.cms.directives.featuredImage',
        'qaobee.cms.directives.postAuthor'
    ])
        .directive('postDetail', function () {
            return {
                restrict: 'E',
                scope: {
                    postId: '='
                },
                templateUrl: 'app/components/directives/cms/post-detail/post-detail.html',
                controller: function ($scope, $log, $location, cmsRestAPI) {
                    cmsRestAPI.getPostDetail($scope.postId).then(function (data) {
                        $scope.post = data.data;
                    });


                    $scope.doTheBack = function () {
                        $location.path('/blog');
                    };

                    $scope.formatDate = function (d) {
                        var da = moment(d);
                        $log.debug('[qaobee.cms postDetail] formatDate', d, da);
                        return da.format('[<span class="post-date-day">]DD[</span><span class="post-date-month">]MM[</span><span class="post-date-year">]YYYY[</span>]');
                    }
                }
            };
        });
}());