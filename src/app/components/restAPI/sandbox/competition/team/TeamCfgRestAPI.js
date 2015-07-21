/**
 * Services REST TeamCfg
 * 
 * @class qaobee.rest.prive.organization.team.TeamCfgRestAPI
 * @author Nada Vujanic-Maquin
 * @version V1.0
 * @copyright <b>QaoBee</b>.
 */

angular.module('teamCfgRestAPI', []).value('teamCfgApiURL', '/rest/prive/organization/structure/teamCfg')

.factory('teamCfgRestAPI', function($http, teamCfgApiURL, $rootScope) {
    return {
      
        /**
         * @memberOf qaobee.rest.prive.organization.team.teamCfgRestAPI
         * @function addTeamCfg()
         * @description add configuration for the team
         * @param {TeamCfg}
         *            teamCfg : team configuration to add
         * @returns {TeamCfg}  com.qaobee.swarn.model.organization.team.TeamCfg
         */
        addTeamCfg : function(teamCfg) {

            return $http({
                url : teamCfgApiURL + '/teamCfg_add',
                method : 'PUT',
                data : teamCfg
            });
        },
        
        /**
         * @memberOf qaobee.rest.prive.organization.team.teamCfgRestAPI
         * @function getTeamCfg()
         * @description get a team by ID
         * @param {String}
         *          teamId : ID of a team
         * @returns {TeamCfg}  com.qaobee.swarn.model.organization.team.TeamCfg
         */
        getTeamCfg : function(teamId) {
            return $http({
                url : teamCfgApiURL + '/teamCfg_get?teamId=' + teamId,
                method : "GET"
            });
        },
        
        /**
         * @memberOf qaobee.rest.prive.organization.team.teamCfgRestAPI
         * @function getTeamCfgList()
         * @description retrieve list of teams configurations
         * @param {String}
                     season : the given season
         * @returns {Array}  com.qaobee.swarn.model.organization.team.TeamCfg
         */
        getTeamCfgList : function(teamId, season) {
            return $http({
                url : teamCfgApiURL + '/teamCfg_list?teamId='+teamId+'&season='+ season,
                method : "GET"
            });
        },
        
        /**
         * @memberOf qaobee.rest.prive.organization.team.teamCfgRestAPI
         * @function updateTeamCfg()
         * @description update a team configuration
         * @param {TeamCfg}
         *            teamCfg : team configuration to update
         * @returns {TeamCfg}  com.qaobee.swarn.model.organization.team.TeamCfg
         */
        updateTeamCfg : function(teamCfg) {
            return $http({
                url : teamCfgApiURL + '/teamCfg_update',
                method : 'PUT',
                data : teamCfg
            });
        }        
    };    
});