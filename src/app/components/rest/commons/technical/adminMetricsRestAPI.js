 (function () {
    'use strict';
    /**
     * Module REST d'affichage des métriques
     * 
     * @class qaobee.rest.commons.technical.adminMetricsRestAPI
     * @author Xavier MARIN
     * @copyright <b>QaoBee</b>.
     * @see {@link http://metrics.codahale.com|http://metrics.codahale.com}
     */
    angular.module('adminMetricsRestAPI', []).value('adminMetricsURL', '/api/1/admin/metrics')

    .factory('adminMetricsAPI', function($http, adminMetricsURL, $rootScope) {
        return {
            /**
             * @memberOf qaobee.rest.commons.technical.adminMetricsRestAPI
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
             * @memberOf qaobee.rest.commons.technical.adminMetricsRestAPI
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

}());