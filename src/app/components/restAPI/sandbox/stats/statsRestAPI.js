(function () {
    'use strict';
    /**
     * Stats Rest API
     * 
     * @class qaobee.components.restAPI.sandbox.stats.statsRestAPI
     * @author Xavier MARIN
     * @copyright <b>QaoBee</b>.
     */
    angular.module('statsRestAPI', []).value('statAPIURL', '/api/1/sandbox/stats/statistics')

    .factory('statsRestAPI', function($http, statAPIURL) {
        return {

            /**
             * @memberOf qaobee.components.restAPI.sandbox.stats.statsRestAPI
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
             * @memberOf qaobee.components.restAPI.sandbox.stats.statsRestAPI
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
             * @memberOf qaobee.components.restAPI.sandbox.stats.statsRestAPI
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
