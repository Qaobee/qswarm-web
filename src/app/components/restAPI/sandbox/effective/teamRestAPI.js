(function () {
    'use strict';
    /**
     * Team Rest API
     *
     * @class qaobee.components.restAPI.sandbox.effective.TeamRestAPI
     * @author Christophe Kervella
     * @copyright <b>QaoBee</b>.
     */

    angular.module('teamRestAPI', []).value('teamAPIURL', '/api/1/sandbox/effective/team')

        .factory('teamRestAPI', function ($http, teamAPIURL) {
            return {
                /**
                 * @memberOf qaobee.components.restAPI.sandbox.effective.TeamRestAPI
                 * @function getListMemberEffective()
                 * @description retrieve list of team
                 * @param {String} sandboxId : sandbox Id
                 * @param {String} effectiveId : effective Id
                 * @param {String} enable : true or false
                 * @param {String} adversary : true or false
                 * @returns {Array} com.qaobee.hive.business.model.sandbox.effective.SB_Team
                 */
                getListTeamHome: function (sandboxId, effectiveId, enable) {
                    return $http({
                        url: teamAPIURL + '/list/?sandboxId=' + sandboxId + '&effectiveId=' + effectiveId + '&enable=' + enable + '&adversary=false',
                        method: 'GET'
                    });
                },

                /**
                 * @memberOf qaobee.components.restAPI.sandbox.effective.TeamRestAPI
                 * @function getListMemberEffective()
                 * @description retrieve list of team
                 * @param {String} sandboxId : sandbox Id
                 * @param {String} effectiveId : effective Id
                 * @param {String} enable : true or false
                 * @param {String} linkTeamId : id team home
                 * @returns {Array} com.qaobee.hive.business.model.sandbox.effective.SB_Team
                 */
                getListTeamAdversary: function (sandboxId, effectiveId, enable, linkTeamId) {
                    var url;
                    if (linkTeamId === null) {
                        url = teamAPIURL + '/list/?sandboxId=' + sandboxId + '&effectiveId=' + effectiveId + '&enable=' + enable + '&adversary=true';
                    } else {
                        url = teamAPIURL + '/list/?sandboxId=' + sandboxId + '&effectiveId=' + effectiveId + '&enable=' + enable + '&adversary=true&linkTeamId=' + linkTeamId;
                    }
                    return $http({
                        url: url,
                        method: 'GET'
                    });
                },


                /**
                 * @memberOf qaobee.components.restAPI.sandbox.effective.TeamRestAPI
                 * @function addTeam()
                 * @description add team for a structure
                 * @param {Team} team : team to add
                 * @returns {team} com.qaobee.hive.business.model.sandbox.effective.SB_Team
                 */
                addTeam: function (team) {
                    return $http({
                        url: teamAPIURL + '/add',
                        method: 'POST',
                        data: team
                    });
                },

                /**
                 * @memberOf qaobee.components.restAPI.sandbox.effective.TeamRestAPI
                 * @function getTeam()
                 * @description retrieve one team by this Id
                 * @param {id} id : team id
                 * @returns {team} com.qaobee.hive.business.model.sandbox.effective.SB_Team
                 */
                getTeam: function (id) {
                    return $http({
                        url: teamAPIURL + '/get/?_id=' + id,
                        method: 'GET'
                    });
                },

                /**
                 * @memberOf qaobee.components.restAPI.sandbox.effective.TeamRestAPI
                 * @function updateTeam()
                 * @description update a team
                 * @param {Team} team : team to update
                 * @returns {team} com.qaobee.hive.business.model.sandbox.effective.SB_Team
                 */
                updateTeam: function (team) {
                    return $http({
                        url: teamAPIURL + '/update',
                        method: 'PUT',
                        data: team
                    });
                }
            };
        });

}());