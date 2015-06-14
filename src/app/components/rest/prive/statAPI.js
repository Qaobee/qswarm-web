/**
 * Created by xavier on 05/11/14.
 */
/**
 * REST Module dealing with the user connection
 * 
 * @class qaobee.rest.prive.statAPI
 * @author Xavier MARIN
 * @copyright <b>QaoBee</b>.
 */
angular.module('statAPI', []).value('statAPIURL', '/rest/prive/stats/')

.factory('statAPI', function($http, statAPIURL) {
    return {

        /**
         * @memberOf qaobee.rest.prive.statAPI
         * @function getListDetailValue
         * @description Fetch individual list of values for a stat
         * @returns {Array} [Stats]
         */
        getListDetailValue : function(search) {
            return $http({
                url : statAPIURL + 'statistics/getListDetailValue',
                method : "POST",
                data : search
            });
        },
        /**
         * @memberOf qaobee.rest.prive.statAPI
         * @function getStatGroupBy
         * @description Fetch average rate for one or many indicator for one or many person, group by listFieldsGroupBy.
         * @returns {Array} [Stats]
         */
        getStatGroupBy : function(search) {
            return $http({
                url : statAPIURL + 'statistics/getStatGroupBy',
                method : "POST",
                data : search
            });
        },
        /**
         * @memberOf qaobee.rest.prive.statAPI
         * @function getListIndicators
         * @description Fetch list of indicators
         * @returns {Array} [Stats]
         */
        getSimpleList : function(search) {
            return $http({
                url : statAPIURL + 'configuration/getListIndicators',
                method : "POST",
                data : search
            });
        },
        /**
         * @memberOf qaobee.rest.prive.statAPI
         * @function getIndicatorCfg
         * @description return an indicatorCfg
         * @returns {Array} [com.qaobee.swarn.business.model.stats.IndicatorCfg]
         */
        getIndicatorCfg : function(search) {
            return $http({
                url : statAPIURL + 'configuration/getByCode',
                method : "POST",
                data : search
            });
        },
        /**
         * @memberOf qaobee.rest.prive.statAPI
         * @function addStat
         * @description Add a stat
         * @param stat {Object} com.qaobee.swarn.business.model.stats.Stats
         * @returns {Object} com.qaobee.swarn.business.model.stats.Stats
         */
        addStat : function(stat) {
            return $http({
                url : statAPIURL + 'statistics/add',
                method : "PUT",
                data : stat
            });
        }
    };

})
//
;

