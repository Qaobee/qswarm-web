(function () {
    'use strict';
    /**
     * Groupe Rest API <br /> *
     *
     * @author Christophe Kervella
     * @class qaobee.components.restAPI.sandbox.effective.groupRestAPI
     * @copyright <b>QaoBee</b>.
     */
    angular.module('groupRestAPI', []).value('groupURL', '/api/1/sandbox/effective/group')

        .factory('groupRestAPI', function ($http, groupURL) {
            return {

                /**
                 * @memberOf qaobee.components.restAPI.sandbox.effective.groupRestAPI
                 * @function getActiveGroupsCategory()
                 * @description retrieve all groups for one category, structureId and for current season
                 * @param {structureId} structureId : structureId
                 * @param {categoryAgeCode} categoryAgeCode : categoryAgeCode
                 * @returns {person} com.qaobee.hive.business.model.sandbox.effective.SB_Group
                 */
                getActiveGroupsCategory: function (structureId, categoryAgeCode) {
                    return $http({
                        url: groupURL + '/groupsCategory',
                        method: 'POST',
                        data: {structureId: structureId, categoryAgeCode: categoryAgeCode, history:false}
                    });
                },

                /**
                 * @memberOf qaobee.components.restAPI.sandbox.effective.groupRestAPI
                 * @function getHistoryGroupCategory()
                 * @description retrieve all history group for one category, structureId and for current season
                 * @param {structureId} structureId : structureId
                 * @param {categoryAgeCode} categoryAgeCode : categoryAgeCode
                 * @returns {person} com.qaobee.hive.business.model.sandbox.effective.SB_Group
                 */
                getHistoryGroupCategory: function (structureId, categoryAgeCode) {
                    return $http({
                        url: groupURL + '/groupsCategory',
                        method: 'POST',
                        data: {structureId: structureId, categoryAgeCode: categoryAgeCode, history:true}
                    });
                },

                /**
                 * @memberOf qaobee.components.restAPI.sandbox.effective.groupRestAPI
                 * @function getGroup()
                 * @description retrieve one group by this Id
                 * @param {id}
                 *            id : group id
                 * @returns {person} com.qaobee.hive.business.model.sandbox.effective.SB_Group
                 */
                getGroup : function(id) {
                    return $http({
                        url : groupURL + '/get',
                        method : 'POST',
                        data: {groupId: id}
                    });
                },

                /**
                 * @memberOf qaobee.components.restAPI.sandbox.effective.groupRestAPI
                 * @function addGroup()
                 * @description add group
                 * @param {Group}
                 *            group : group to add
                 * @returns {group} com.qaobee.hive.business.model.sandbox.effective.SB_Group
                 */
                addGroup : function(group) {
                    return $http({
                        url : groupURL + '/add',
                        method : 'PUT',
                        data : group
                    });
                }
            };
        }
    )
        //
    ;
    
}());