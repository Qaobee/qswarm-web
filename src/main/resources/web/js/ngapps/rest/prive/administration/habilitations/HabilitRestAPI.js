/**
 * Module REST d'administration des habilitations
 * 
 * @class qaobee.rest.admin.adminHabilitAPI
 * @author Xavier MARIN
 * @copyright <b>QaoBee</b>.
 */
angular.module('adminHabilitAPI', []).value('adminHabilitURL', '/rest/admin/habilitations')

.factory('adminHabilitAPI', function($http, adminHabilitURL, $rootScope) {
    return {
        /**
         * @memberOf qaobee.rest.admin.adminHabilitAPI
         * @function get
         * @description Récupération de la liste des habilitations
         * @returns {Array} com.qaobee.swarn.model.habilitations.Habilitation
         */
        get : function() {
            return $http({
                url : adminHabilitURL,
                method : "GET"
            });
        },
        /**
         * @memberOf qaobee.rest.admin.adminHabilitAPI
         * @function getByKey
         * @description Récupération du détail d'une habilitation par sa clef
         * @param {String}
         *            key
         * @returns {Object} com.qaobee.swarn.model.habilitations.Habilitation
         */
        getByKey : function(key) {
            return $http({
                url : adminHabilitURL + '/getkey/?key=' + key,
                method : "GET"
            });
        },
        /**
         * @memberOf qaobee.rest.admin.adminHabilitAPI
         * @function getDetail
         * @description Récupération du détail d'une habilitation
         * @param {String}
         *            id
         * @returns {Object} com.qaobee.swarn.model.habilitations.Habilitation
         */
        getDetail : function(id) {
            return $http({
                url : adminHabilitURL + '/get/?id=' + id,
                method : "GET"
            });
        },
        /**
         * @memberOf qaobee.rest.admin.adminHabilitAPI
         * @function del
         * @description Suppression d'une habilitation
         * @param {String}
         *            id
         * @returns {Object} {"status": "ok","number": number}
         */
        del : function(id) {
            return $http({
                url : adminHabilitURL + '/del/?id=' + id,
                method : "DELETE"
            });
        },
        /**
         * @memberOf qaobee.rest.admin.adminHabilitAPI
         * @function add
         * @description Ajout d'une habilitation
         * @param {Object}
         *            habilit com.qaobee.swarn.model.habilitations.Habilitation
         * @returns {Object} com.qaobee.swarn.model.habilitations.Habilitation
         */
        add : function(habilit) {
            return $http({
                url : adminHabilitURL + "/add",
                method : "PUT",
                data : habilit
            });
        }
    };
});