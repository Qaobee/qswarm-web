(function () {
    'use strict';
    angular.module('qaobee.cms.directives.postsList', [
        'cmsRestAPI',
        'qaobee.cms.directives.featuredImage',
        'qaobee.cms.directives.postAuthor'
    ])

        .directive('postsList', function () {
            return {
                restrict: 'E',
                templateUrl: 'app/components/directives/cms/post-list/post-list.html',
                controller: function ($scope, $log, cmsRestAPI) {
                    $scope.posts = [];
                    $log.debug('[qaobee.cms postsList] controller');
                    cmsRestAPI.getPosts().then(function (data) {
                        $log.debug('[qaobee.cms postsList]', data);
                        data.data.forEach(function(p) {
                            p.date = Date.parse(p.date);
                            this.push(p);
                        }, $scope.posts);
                    });

                    $scope.formatDate = function (d) {
                        var da = moment(d);
                        $log.debug('[qaobee.cms postsList] formatDate', d, da);
                        return da.format('[<span class="post-date-day">]DD[</span><span class="post-date-month">]MM[</span><span class="post-date-year">]YYYY[</span>]');
                    }
                }
            };
        });
}());