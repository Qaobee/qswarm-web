(function () {
    'use strict';
    /**
     * Stats Rest API
     * 
     * @class qaobee.components.restAPI.sandbox.stats.statAPI
     * @author Xavier MARIN
     * @copyright <b>QaoBee</b>.
     */
    angular.module('statAPI', []).value('statAPIURL', '/api/1/sandbox/stats/statistics')

    .factory('statAPI', function($http, statAPIURL) {
        return {

            /**
             * @memberOf qaobee.components.restAPI.sandbox.stats.statAPI
             * @function getListDetailValue
             * @description Fetch individual list of values for a stat
             * @returns {Array} [Stats]
             */
            getListDetailValue : function(search) {
                return $http({
                    url : statAPIURL + '/getListDetailValue',
                    method : 'POST',
                    data : search
                });
            },
            
            /**
             * @memberOf qaobee.components.restAPI.sandbox.stats.statAPI
             * @function getStatGroupBy
             * @description Fetch average rate for one or many indicator for one or many person, group by listFieldsGroupBy.
             * @returns {Array} [Stats]
             */
            getStatGroupBy : function(search) {
                return $http({
                    url : statAPIURL + '/getStatGroupBy',
                    method : 'POST',
                    data : search
                });
            },
              
            /**
             * @memberOf qaobee.components.restAPI.sandbox.stats.statAPI
             * @function addStat
             * @description Add a stat
             * @param stat {Object} com.qaobee.swarn.business.model.stats.Stats
             * @returns {Object} com.qaobee.hive.business.model.sandbox.stats.Stats
             */
            addStat : function(stat) {
                return $http({
                    url : statAPIURL + '/add',
                    method : 'PUT',
                    data : stat
                });
            }
        };

    })
    //
    ;
    
}());
