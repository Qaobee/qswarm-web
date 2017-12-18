(function () {
    'use strict';
    angular.module('cmsRestAPI', []).value('cmsApiURL', 'https://support.qaobee.com/wp-json/wp/v2')

        .factory('cmsRestAPI', function ($http, cmsApiURL) {
            return {
                /**
                 *
                 * @returns {*}
                 */
                getPosts: function () {
                    return $http({
                        url: cmsApiURL + '/posts/',
                        method: 'GET'
                    });
                },
                /**
                 *
                 * @param id
                 * @returns {*}
                 */
                getPostDetail: function (id) {
                    return $http({
                        url: cmsApiURL + '/posts/' + id,
                        method: 'GET'
                    });
                },
                /**
                 *
                 * @param id
                 * @returns {*}
                 */
                getPageDetail: function (id) {
                    return $http({
                        url: cmsApiURL + '/pages/' + id,
                        method: 'GET'
                    });
                },
                /**
                 *
                 * @param id
                 * @returns {*}
                 */
                getMedia: function (id) {
                    return $http({
                        url: cmsApiURL + '/media/' + id,
                        method: 'GET'
                    });
                },
                /**
                 *
                 * @param id
                 * @returns {*}
                 */
                getAuthor: function (id) {
                    return $http({
                        url: cmsApiURL + '/users/' + id,
                        method: 'GET'
                    });
                }
            };
        });

}());