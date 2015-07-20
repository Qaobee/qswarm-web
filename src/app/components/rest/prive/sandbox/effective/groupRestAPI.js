angular.module('groupAPI', []).value('groupURL', '/rest/prive/groups')

    .factory('groupAPI', function ($http, groupURL) {
        return {

            /**
             * @memberOf qaobee.rest.prive.organization.effective.groupRestAPI
             * @function getActiveGroupsCategory()
             * @description retrieve all groups for one category, structureId and for current season
             * @param {structureId} structureId : structureId
             * @param {categoryAgeCode} categoryAgeCode : categoryAgeCode
             * @returns {person} com.qaobee.swarn.business.model.organization.effective.group.Group
             */
            getActiveGroupsCategory: function (structureId, categoryAgeCode) {
                return $http({
                    url: groupURL + "/groupsCategory",
                    method: "POST",
                    data: {structureId: structureId, categoryAgeCode: categoryAgeCode, history:false}
                });
            },
            
            /**
             * @memberOf qaobee.rest.prive.organization.effective.groupRestAPI
             * @function getHistoryGroupCategory()
             * @description retrieve all history group for one category, structureId and for current season
             * @param {structureId} structureId : structureId
             * @param {categoryAgeCode} categoryAgeCode : categoryAgeCode
             * @returns {person} com.qaobee.swarn.business.model.organization.effective.group.Group
             */
            getHistoryGroupCategory: function (structureId, categoryAgeCode) {
                return $http({
                    url: groupURL + "/groupsCategory",
                    method: "POST",
                    data: {structureId: structureId, categoryAgeCode: categoryAgeCode, history:true}
                });
            },
            
            /**
             * @memberOf qaobee.rest.prive.organization.effective.groupRestAPI
             * @function getGroup()
             * @description retrieve one group by this Id
             * @param {id}
             *            id : group id
             * @returns {person} com.qaobee.swarn.business.model.organization.effective.group.Group
             */
            getGroup : function(id) {
                return $http({
                    url : groupURL + "/get",
                    method : 'POST',
                    data: {groupId: id}
                });
            },
            
            /**
             * @memberOf qaobee.rest.prive.organization.effective.groupRestAPI
             * @function addGroup()
             * @description add group
             * @param {Group}
             *            group : group to add
             * @returns {group} com.qaobee.swarn.business.model.organization.effective.group.Group
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