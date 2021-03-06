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

        .factory('effectiveRestAPI', function ($http, effectiveAPIURL) {
            return {
                /**
                 * @memberOf qaobee.components.restAPI.sandbox.effective.EffectiveRestAPI
                 * @function getEffective()
                 * @description retrieve an effective by this Id
                 * @param {String} effectiveId : id of effective
                 * @returns {String} com.qaobee.hive.business.model.sandbox.effective.SB_Effective
                 */
                getEffective: function (effectiveId) {
                    return $http({
                        url: effectiveAPIURL + '/get?_id=' + effectiveId,
                        method: 'GET'
                    });
                },

                /**
                 * @memberOf qaobee.components.restAPI.sandbox.effective.EffectiveRestAPI
                 * @function getListEffective()
                 * @description retrieve list of effective for a sandbox Config and a category age
                 * @param {String} sandboxId : id of sandbox config
                 * @param {String} categoryAgeCode : the code of category age
                 * @returns {Array} com.qaobee.hive.business.model.sandbox.effective.SB_Effective
                 */
                getListEffective: function (sandBoxId, categoryAgeCode) {
                    return $http({
                        url: effectiveAPIURL + '/getList?sandboxId=' + sandBoxId + '&categoryAgeCode=' + categoryAgeCode,
                        method: 'GET'
                    });
                },

                /**
                 * @memberOf qaobee.components.restAPI.sandbox.effective.EffectiveRestAPI
                 * @function add()
                 * @description add effective
                 * @param {SB_Effective} effective : effective to add
                 * @returns {SB_Effective} com.qaobee.hive.business.model.sandbox.effective.SB_Effective
                 */
                add: function (effective) {
                    return $http({
                        url: effectiveAPIURL + '/add',
                        method: 'POST',
                        data: effective
                    });
                },

                /**
                 * @memberOf qaobee.components.restAPI.sandbox.effective.EffectiveRestAPI
                 * @function update()
                 * @description update a effective
                 * @param {SB_Effective} effective : effective to update
                 * @returns {SB_Effective} com.qaobee.hive.business.model.sandbox.effective.SB_Effective
                 */
                update: function (effective) {
                    return $http({
                        url: effectiveAPIURL + '/update',
                        method: 'PUT',
                        data: effective
                    });
                }
            };
        });

}());