(function () {
    'use strict';
    angular.module('qaobee.cms.directives.featuredImage', ['cmsRestAPI'])
        .directive('featuredImage', function () {
            return {
                restrict: 'E',
                scope: {
                    mediaId: '=',
                    size: '@',
                    image : '='
                },
                templateUrl: 'app/components/directives/cms/featured-image/featured-image.html',
                controller: function ($scope, cmsRestAPI) {
                    cmsRestAPI.getMedia($scope.mediaId).then(function (data) {
                        $scope.image = data.data.media_details.sizes[$scope.size || 'full'].source_url;
                        $scope.desc = data.data.alt_text;
                    });
                }
            };
        });
}());