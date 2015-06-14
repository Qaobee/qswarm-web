/**
 * Services REST Activity
 * 
 * @class qaobee.rest.prive.administration.settings.ActivityRestAPI
 * @author Xavier MARIN
 * @copyright <b>QaoBee</b>.
 */
angular.module('activityAPI', []).value('activityApiURL', '/rest/prive/administration/settings/activity')

.factory('activityAPI', function($http, activityApiURL, $rootScope) {
    return {
        /**
         * @memberOf qaobee.rest.prive.administration.settings.ActivityRestAPI
         * @function getList
         * @description Récupération de la liste complete des activités
         * @returns {Array} com.qaobee.swarn.business.model.administration.settings.Activity
         */
        getList : function() {
            return $http({
                url : activityApiURL + '/list',
                method : "GET"
            });
        },
        
        /**
         * @memberOf qaobee.rest.prive.administration.settings.ActivityRestAPI
         * @function getListActive
         * @description Récupération de la liste des activités commercialisées
         * @returns {Array} com.qaobee.swarn.business.model.administration.settings.Activity
         */
        getListActive : function() {
            return $http({
                url : activityApiURL + '/listActive',
                method : "GET"
            });
        },
        
        /**
         * @memberOf qaobee.rest.prive.administration.settings.ActivityRestAPI
         * @function getDetail
         * @description Récupération du détail d'une activité
         * @param {String}
         *            id
         * @returns {Object} com.qaobee.swarn.business.model.administration.settings.Activity
         */
        getDetail : function(id) {
            return $http({
                url : activityApiURL + '/get/?id=' + id,
                method : "GET"
            });
        },
        
        /**
         * @memberOf qaobee.rest.prive.administration.settings.ActivityRestAPI
         * @function del
         * @description Suppression d'une activité
         * @param {String}
         *            id
         * @returns {Object} {"status": "ok","number": number}
         */
        del : function(id) {
            return $http({
                url : activityApiURL + '/del/?id=' + id,
                method : "DELETE"
            });
        },
        
        /**
         * @memberOf qaobee.rest.prive.administration.settings.ActivityRestAPI
         * @function add
         * @description Ajout d'une activité
         * @param {Object}
         *            activity com.qaobee.swarn.business.model.administration.settings.Activity
         * @returns {Object} com.qaobee.swarn.business.model.administration.settings.Activity
         */
        add : function(activity) {
            return $http({
                url : activityApiURL + "/add",
                method : "PUT",
                data : activity
            });
        }
    };
});