/**
 * Module REST d'administration des blogs
 * 
 * @class qaobee.rest.admin.adminBlogAPI
 * @author Xavier MARIN
 * @copyright <b>QaoBee</b>.
 */
angular.module('adminBlogAPI', []).value('adminBlogURL', '/rest/admin/blogposts')

.factory('adminBlogAPI', function($http, adminBlogURL, $rootScope) {
    return {
        /**
         * @memberOf qaobee.rest.admin.adminBlogAPI
         * @function get
         * @description Récupération de la liste des blogs
         * @returns {Array} com.qaobee.swarn.model.communication.BlogPost
         */
        get : function() {
            return $http({
                url : adminBlogURL,
                method : "GET"
            });
        },
        /**
         * @memberOf qaobee.rest.admin.adminBlogAPI
         * @function getDetail
         * @description Récupération du détail d'un blog
         * @param {String}
         *            id
         * @returns {Object} com.qaobee.swarn.model.communication.BlogPost
         */
        getDetail : function(id) {
            return $http({
                url : adminBlogURL + '/get/?id=' + id,
                method : "GET"
            });
        },
        /**
         * @memberOf qaobee.rest.admin.adminBlogAPI
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
         * @memberOf qaobee.rest.admin.adminBlogAPI
         * @function add
         * @description Ajout d'un blog
         * @param {Object}
         *            blog com.qaobee.swarn.model.communication.BlogPost
         * @returns {Object} com.qaobee.swarn.model.communication.BlogPost
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