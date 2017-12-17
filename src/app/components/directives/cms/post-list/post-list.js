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
                    $scope.hidden = false;
                    
                    cmsRestAPI.getPosts().then(function (data) {
                        
                        data.data.forEach(function(p) {
                            $log.debug('[qaobee.cms postsList]', p);
                            p.date = Date.parse(p.date);
                            this.push(p);
                        }, $scope.posts);
                    });

                    $scope.formatDate = function (d) {
                        var da = moment(d);
                        
                        return da.format('[<span class="post-date-day">]DD[</span><span class="post-date-month">]MMMM[</span><span class="post-date-year">]YYYY[</span>]');
                    }
                }
            };
        });
}());