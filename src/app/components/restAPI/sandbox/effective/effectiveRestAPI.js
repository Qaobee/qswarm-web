(function () {
    'use strict';
    /**
     * Services REST Effective API
     * 
     * @class qaobee.components.restAPI.sandbox.effective.EffectiveRestAPI
     * @author Christophe Kervella
     * @copyright <b>QaoBee</b>.
     */
    angular.module('effectiveRestAPI', []).value('effectiveAPIURL', '/api/1/sandbox/effective/effective')

    .factory('effectiveRestAPI', function($http, effectiveAPIURL) {
        return {
            /**
             * @memberOf qaobee.components.restAPI.sandbox.effective.EffectiveRestAPI
             * @function getListMemberEffective()
             * @description retrieve list of member for a sandbox Config and a category age
             * @param {String}
             *            sandboxCfgId : id of sandbox config
             * @param {String}
             *            categoryAgeCode : the code of category age
             * @returns {Array} com.qaobee.hive.business.model.sandbox.effective.SB_Effective
             */
            getListMemberEffective : function(sandBoxCfgId, categoryAgeCode) {
                return $http({
                    url: effectiveAPIURL + '/getList?sandBoxCfgId=' + sandBoxCfgId + '&categoryAgeCode=' +categoryAgeCode,
                    method: 'GET'
                });
            },

            /**
             * @memberOf qaobee.components.restAPI.sandbox.effective.EffectiveRestAPI
             * @function add()
             * @description add effective
             * @param {SB_Effective}
             *            effective : effective to add
             * @returns {SB_Effective} com.qaobee.hive.business.model.sandbox.effective.SB_Effective
             */
            add : function(effective) {
                return $http({
                    url : effectiveAPIURL + '/add',
                    method : 'PUT',
                    data : effective
                });
            },

            /**
             * @memberOf qaobee.components.restAPI.sandbox.effective.EffectiveRestAPI
             * @function update()
             * @description update a effective
             * @param {SB_Effective}
             *            effective : effective to update
             * @returns {SB_Effective} com.qaobee.hive.business.model.sandbox.effective.SB_Effective
             */
            update : function(effective) {
                return $http({
                    url : effectiveAPIURL + '/update',
                    method : 'PUT',
                    data : effective
                });
            }
        };
    });
    
}());