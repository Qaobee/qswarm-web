/**
 * Module REST d'administration des habilitations
 * 
 * @class qaobee.rest.admin.adminIndicatorAPI
 * @author Xavier MARIN
 * @copyright <b>QaoBee</b>.
 */
angular.module('adminindicatorAPI', []).value('adminIndicatorURL', '/rest/admin/indicator')

.factory('adminIndicatorAPI', function($http, adminIndicatorURL, $rootScope) {
    return {
        /**
         * @memberOf qaobee.rest.admin.adminIndicatorAPI
         * @function get
         * @description Récupération de la liste des indicateurs
         * @returns {Array} com.qaobee.swarn.model.organisation.Indicator
         */
        get : function() {
            return $http({
                url : adminIndicatorURL,
                method : "GET"
            });
        },
        /**
         * @memberOf qaobee.rest.admin.adminIndicatorAPI
         * @function getByKey
         * @description Récupération du détail d'un indicateur par sa clef
         * @param {String}
         *            libelleKey
         * @returns {Object} com.qaobee.swarn.model.organisation.Indicator
         */
        getByKey : function(libelleKey) {
            return $http({
                url : adminIndicatorURL + '/getkey/?libelleKey=' + key,
                method : "GET"
            });
        },
        /**
         * @memberOf qaobee.rest.admin.adminIndicatorAPI
         * @function getDetail
         * @description Récupération du détail d'un indicateur
         * @param {String}
         *            id
         * @returns {Object} com.qaobee.swarn.model.organisation.Indicator
         */
        getDetail : function(id) {
            return $http({
                url : adminIndicatorURL + '/get/?id=' + id,
                method : "GET"
            });
        },
        /**
         * @memberOf qaobee.rest.admin.adminIndicatorAPI
         * @function del
         * @description Suppression d'un indicateur
         * @param {String}
         *            id
         * @returns {Object} {"status": "ok","number": number}
         */
        del : function(id) {
            return $http({
                url : adminIndicatorURL + '/del/?id=' + id,
                method : "DELETE"
            });
        },
        /**
         * @memberOf qaobee.rest.admin.adminIndicatorAPI
         * @function add
         * @description Ajout d'un indicateur
         * @param {Object}
         *            indicator com.qaobee.swarn.model.organisation.Indicator
         * @returns {Object} com.qaobee.swarn.model.organisation.Indicator
         */
        add : function(indicator) {
            return $http({
                url : adminIndicatorURL + "/add",
                method : "PUT",
                data : indicator
            });
        }
    };
});