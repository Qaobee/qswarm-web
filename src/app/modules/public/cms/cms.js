(function () {
    'use strict';
    /**
     *
     * @class qaobee.public.public.cms
     * @author Xavier MARIN
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.cms', ['ngRoute', 'qaobee.cms.directives.postsList', 'qaobee.cms.directives.postDetail'])

        .config(function ($routeProvider) {
            $routeProvider.when('/blog', {
                controller: 'PostListCtrl',
                templateUrl: 'app/modules/public/cms/postList.html'
            }).when('/blog/:id', {
                controller: 'PostDetailCtrl',
                templateUrl: 'app/modules/public/cms/postDetail.html'
            });
        })

        /**
         * @class qaobee.public.public.cms.PostListCtrl
         * @description Main Blog controller
         */
        .controller('PostListCtrl', function ($translatePartialLoader) {
            $translatePartialLoader.addPart('public');
        })

        .controller('PostDetailCtrl', function ($translatePartialLoader, $scope, $routeParams) {
            $translatePartialLoader.addPart('public');
            $scope.postId = $routeParams.id;
        });
}());