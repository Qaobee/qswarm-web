(function () {
    'use strict';
    angular.module('qaobee.cms.directives.postAuthor', ['cmsRestAPI'])
        .directive('postAuthor', function () {
            return {
                restrict: 'E',
                scope: {
                    authorId: '='
                },
                templateUrl: 'app/components/directives/cms/post-author/post-author.html',
                controller: function ($scope, $log, cmsRestAPI) {
                    $log.debug('[qaobee.cms.directives.postAuthor] controller', $scope.authorId);
                    cmsRestAPI.getAuthor($scope.authorId).then(function (data) {
                        $log.debug('[qaobee.cms.directives.postAuthor] getAuthor', data);
                        $scope.author = data.data;
                    });

                    $scope.getAvatar = function(author) {
                        return author? author.avatar_urls['96'] : '';
                    }
                }
            };
        });
}());