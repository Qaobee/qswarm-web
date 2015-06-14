/**
 * Module REST d'administration des users
 * 
 * @class qaobee.rest.admin.adminUsersAPI
 * @author Xavier MARIN
 * @copyright <b>QaoBee</b>.
 */
angular.module('adminUsersAPI', []).value('adminUsersURL', '/rest/admin/users')

.factory('adminUsersAPI', function($http, adminUsersURL, $rootScope) {
    return {
        /**
         * @memberOf qaobee.rest.admin.adminUsersAPI
         * @function get
         * @description Récupération de la liste des users
         * @returns {Array} com.qaobee.swarn.model.transverse.User
         */
        get : function() {
            return $http({
                url : adminUsersURL,
                method : "GET"
            });
        },
        /**
         * @memberOf qaobee.rest.admin.adminUsersAPI
         * @function getDetail
         * @description Récupération du détail d'un user
         * @param {String}
         *            id
         * @returns {Object} com.qaobee.swarn.model.transverse.User
         */
        getDetail : function(id) {
            return $http({
                url : adminUsersURL + '/get/?id=' + id,
                method : "GET"
            });
        },
        /**
         * @memberOf qaobee.rest.admin.adminUsersAPI
         * @function del
         * @description Suppression d'un user
         * @param {String}
         *            id
         * @returns {Object} {"status": "ok","number": number}
         */
        del : function(id) {
            return $http({
                url : adminUsersURL + '/del/?id=' + id,
                method : "DELETE"
            });
        },
        /**
         * @memberOf qaobee.rest.admin.adminUsersAPI
         * @function add
         * @description Ajout d'un user
         * @param {Object}
         *            user com.qaobee.swarn.model.transverse.User
         * @returns {Object} com.qaobee.swarn.model.transverse.User
         */
        add : function(user) {
            return $http({
                url : adminUsersURL + "/add",
                method : "PUT",
                data : user
            });
        }
    };
});