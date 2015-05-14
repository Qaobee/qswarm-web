/**
 * Module REST d'affichage des métriques
 * 
 * @class qaobee.rest.admin.adminMetricsAPI
 * @author Xavier MARIN
 * @copyright <b>QaoBee</b>.
 * @see {@link http://metrics.codahale.com|http://metrics.codahale.com}
 */
angular.module('adminMetricsAPI', []).value('adminMetricsURL', '/rest/admin/metrics')

.factory('adminMetricsAPI', function($http, adminMetricsURL, $rootScope) {
    return {
        /**
         * @memberOf qaobee.rest.admin.adminMetricsAPI
         * @function getMeters
         * @description Récupération des métriques de type meters
         * @returns {Array}
         */
        getMeters : function() {
            return $http({
                url : adminMetricsURL + '/meters',
                method : "GET"
            });
        },
        /**
         * @memberOf qaobee.rest.admin.adminMetricsAPI
         * @function getTimers
         * @description Récupération des métriques de type timers
         * @returns {Array}
         */
        getTimers : function(key) {
            return $http({
                url : adminMetricsURL + '/timers',
                method : "GET"
            });
        }
    };
});