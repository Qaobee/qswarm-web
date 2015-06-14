/**
 * Services REST Effective API


 * 
 * @class qaobee.rest.prive.organization.effective.EffectiveRestAPI
 * @author Christophe Kervella
 * @copyright <b>QaoBee</b>.
 */
angular.module('effectiveRestAPI', []).value('effectiveAPIURL', '/rest/prive/organization/effective/effective')

.factory('effectiveRestAPI', function($http, effectiveAPIURL) {
    return {
        /**
         * @memberOf qaobee.rest.prive.organization.effective.EffectiveRestAPI
         * @function getListMemberEffective()
         * @description retrieve list of person for a structure and a category age
         * @param {String}
         *            seasonCode : the code season
         * @param {String}
         *            cat : structure id
         * @param {String}
         *            categoryAgeCode : the code of category age
         * @returns {Object} com.qaobee.swarn.business.model.organisation.effective.Effective
         */
        getListMemberEffective : function(seasonCode, structureId, categoryAgeCode) {
            return $http({
                url : effectiveAPIURL + '/list',
                method: "POST",
                data: {structureId: structureId, categoryAgeCode: categoryAgeCode, seasonCode:seasonCode}
            });
        },
        
        /**
         * @memberOf qaobee.rest.prive.organization.effective.EffectiveRestAPI
         * @function add()
         * @description add effective
         * @param {Effective}
         *            effective : effective to add
         * @returns {Effective} com.qaobee.swarn.business.model.organisation.effective.Effective
         */
        add : function(effective) {
            return $http({
                url : effectiveAPIURL + '/add',
                method : 'PUT',
                data : effective
            });
        },
        
        /**
         * @memberOf qaobee.rest.prive.organization.effective.EffectiveRestAPI
         * @function update()
         * @description update a effective
         * @param {Effective}
         *            effective : effective to update
         * @returns {person} com.qaobee.swarn.business.model.organisation.effective.Effective
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
