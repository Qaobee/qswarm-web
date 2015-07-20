/**
 * Services REST Team
 * 
 * @class qaobee.rest.prive.organization.team.TeamRestAPI
 * @author Nada Vujanic-Maquin
 * @version V1.0
 * @copyright <b>QaoBee</b>.
 */

angular.module('teamRestAPI', []).value('teamApiURL', '/rest/prive/organization/structure/team')

.factory('teamRestAPI', function($http, teamApiURL) {
    return {
      
        /**
         * @memberOf qaobee.rest.prive.organization.team.teamRestAPI
         * @function addTeam()
         * @description add a team
         * @param {Team}
         *            team : team to add
         * @returns {Team}  com.qaobee.swarn.model.organization.team.Team
         */
        addTeam : function(team) {

            return $http({
                url : teamApiURL + '/team_add',
                method : 'PUT',
                data : team
            });
        },
        
        /**
         * @memberOf qaobee.rest.prive.organization.team.teamRestAPI
         * @function getTeam()
         * @description get a team by ID
         * @param {String}
         *          teamId : ID of a team
         * @returns {Team}  com.qaobee.swarn.model.organization.team.Team
         */
        getTeam : function(teamId) {
            return $http({
                url : teamApiURL + '/team_get?_id=' + teamId,
                method : "GET"
            });
        },
        
        /**
         * @memberOf qaobee.rest.prive.organization.team.teamRestAPI
         * @function getTeamList()
         * @description retrieve list of teams
         * @param {String}
                     structureId : the structure ID
         * @param {String}
         *            categoryAge : the code of age category
         * @returns {Array}  com.qaobee.swarn.model.organization.team.Team
         */
        getTeamList : function(structureId, categoryAge) {
            return $http({
                url : teamApiURL + '/team_list?structureId='+ structureId +'&categoryAge=' + categoryAge,
                method : "GET"
            });
        },
        
        /**
         * @memberOf qaobee.rest.prive.organization.team.teamRestAPI
         * @function updateTeam()
         * @description update a team
         * @param {Team}
         *            team : team to update
         * @returns {Team}  com.qaobee.swarn.model.organization.team.Team
         */
        updateTeam : function(team) {
            return $http({
                url : teamApiURL + '/team_update',
                method : 'PUT',
                data : team
            });
        }
        
    };    
});