 (function () {
    'use strict';
    /**
     * Module REST d'administration des blogs
     * 
     * @class qaobee.rest.commons.users.communication.adminBlogRestAPI
     * @author Xavier MARIN
     * @copyright <b>QaoBee</b>.
     */
    angular.module('adminBlogRestAPI', []).value('adminBlogURL', '/rest/admin/blogposts')

    .factory('adminBlogRestAPI', function($http, adminBlogURL, $rootScope) {
        return {
            /**
             * @memberOf qaobee.rest.commons.users.communication.adminBlogRestAPI
             * @function get
             * @description Récupération de la liste des blogs
             * @returns {Array} com.qaobee.swarn.model.commons.users.communication.BlogPost
             */
            get : function() {
                return $http({
                    url : adminBlogURL,
                    method : "GET"
                });
            },
            /**
             * @memberOf qaobee.rest.commons.users.communication.adminBlogRestAPI
             * @function getDetail
             * @description Récupération du détail d'un blog
             * @param {String}
             *            id
             * @returns {Object} com.qaobee.swarn.model.commons.users.communication.BlogPost
             */
            getDetail : function(id) {
                return $http({
                    url : adminBlogURL + '/get/?id=' + id,
                    method : "GET"
                });
            },
            /**
             * @memberOf qaobee.rest.commons.users.communication.adminBlogRestAPI
             * @function del
             * @description Suppression d'un blog
             * @param {String}
             *            id
             * @returns {Object} {"status": "ok","number": number}
             */
            del : function(id) {
                return $http({
                    url : adminBlogURL + '/del/?id=' + id,
                    method : "DELETE"
                });
            },
            /**
             * @memberOf qaobee.rest.commons.users.communication.adminBlogRestAPI
             * @function add
             * @description Ajout d'un blog
             * @param {Object}
             *            blog com.qaobee.swarn.model.commons.users.communication.BlogPost
             * @returns {Object} com.qaobee.swarn.model.commons.users.communication.BlogPost
             */
            add : function(blog) {
                return $http({
                    url : adminBlogURL + "/add",
                    method : "PUT",
                    data : blog
                });
            }
        };
    });

}());