(function () {
    'use strict';
    angular.module('qaobee.cms.directives.postDetail', ['cmsRestAPI',
        '720kb.socialshare',
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
                controller: function ($scope, $log, $location, cmsRestAPI, Socialshare) {
                    var characterEntities = {
                        '&amp;': '&',
                        '&gt;': '>',
                        '&lt;': '<',
                        '&quot;': '"',
                        '&#39;': "'",
                        '&rsquo;': "'"
                    };
                    cmsRestAPI.getPostDetail($scope.postId).then(function (data) {
                        $scope.post = data.data;
                    });

                    $scope.htmlDecode = function (value) {
                        Object.keys(characterEntities).forEach(function (k) {
                            value = value.replaceAll(k, characterEntities[k]);
                        });
                        return value;
                    };

                    $scope.facebook = function (post) {
                        Socialshare.share({
                            provider: 'facebook',
                            attrs: {
                                socialshareUrl: 'https://www.qaobee.com/#/blog/' + post.id,
                                socialshareText: $scope.htmlDecode(post.title.rendered),
                                socialshareMobileiframe: true,
                                socialshareType:"share",
                                socialshareVia:"283871748782976",
                                socialshareDisplay: "popup",
                                socialshareQuote: $scope.htmlDecode(post.title.rendered)
                            }
                        });
                    };

                    $scope.doTheBack = function () {
                        $location.path('/blog');
                    };

                    $scope.formatDate = function (d) {
                        var da = moment(d);
                        return da.format('[<span class="post-date-day">]DD[</span><span class="post-date-month">]MM[</span><span class="post-date-year">]YYYY[</span>]');
                    }
                }
            };
        });
}());