(function () {
    'use strict';
    angular.module('qaobee.cms.directives.postDetail', ['cmsRestAPI', 'qaobee.cms.directives.featuredImage', 'qaobee.cms.directives.postAuthor'])
        .directive('postDetail', function () {
            return {
                restrict: 'E',
                scope: {
                    postId: '='
                },
                templateUrl: 'app/components/directives/cms/post-detail/post-detail.html',
                controller: function ($scope, cmsRestAPI) {
                    cmsRestAPI.getPostDetail($scope.postId).then(function (data) {
                        $scope.post = data.data;
                    });
                }
            };
        });
}());