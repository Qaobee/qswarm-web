/**
 * Created by xavier on 12/07/14.
 *
 * Directive widget news<br />
 *
 * Usage :
 *
 * <pre>
 * &lt;widget-news limit=&quot;5&quot;  /&gt;
 * @author Xavier MARIN
 * @requires {@link qaobee.rest.public.publicRestAPI|qaobee.rest.public.publicRestAPI}
 * @class qaobee.directives.widgets.news
 * @copyright &lt;b&gt;QaoBee&lt;/b&gt;.
 *
 */
angular.module('widget.news', ['publicRestAPI'])

    .directive('widgetNews', function () {
        'use strict';
        return {
            restrict: 'AE',
            scope: {
                limit: '='
            },
            controller: function ($scope, publicRestAPI) {
                $scope.blogs = Array.create();
                // fetch blog list
                publicRestAPI.getBlogs($scope.limit).success(function (data) {
                    $scope.blogs = data;
                });
            },
            templateUrl: 'app/components/widgets/news/news.html'
        };
    });
