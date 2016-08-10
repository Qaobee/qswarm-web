(function () {
    'use strict';
    /**
     * Module REST pour la gestion autour des sandbox utilisateurs
     *
     * @class qaobee.components.restAPI.sandbox.config.sbShareRestAPI
     * @author Christophe Kervella
     * @copyright <b>QaoBee</b>.
     */
    angular.module('sandboxRestAPI', []).value('sandboxAPIURL', '/api/1/sandbox/config')
    .value('sbShareAPIURL', '/api/1/sandbox/share')


        .factory('sandboxRestAPI', function ($http, sandboxAPIURL, sbShareAPIURL) {
            return {
                
                /**
                 * @description Retrieve all sandbox sharing for one user
                 * @function getSandboxSharingList
                 * @memberOf qaobee.components.restAPI.sandbox.config.sbShareRestAPI
                 * @param activityId
                 * @returns {Array}    list of sandbox
                 */
                getSandbox: function (sandboxId) {
                    return $http({
                        url: sandboxAPIURL + '/sandbox?_id='+sandboxId,
                        method: 'GET'
                    });
                },
                
                /**
                 * @description Retrieve all sandbox sharing for one user
                 * @function getSandboxSharingList
                 * @memberOf qaobee.components.restAPI.sandbox.config.sbShareRestAPI
                 * @param activityId
                 * @returns {Array}    list of sandbox
                 */
                getSandboxSharingList: function (activityId) {
                    return $http({
                        url: sbShareAPIURL + '/list?activityId='+activityId,
                        method: 'GET'
                    });
                },
                
                /**
                 * @description Retrieve all invitations for one sandbox
                 * @function getInvitationToSandboxList
                 * @memberOf qaobee.components.restAPI.sandbox.config.sbShareRestAPI
                 * @param sandboxId
                 * @param status (ALL, waiting, accepted, refused)
                 * @returns {Array}    list of invitation for sandbox
                 */
                getInvitationToSandboxList: function (sandboxId, status) {
                    return $http({
                        url: sbShareAPIURL + '/listInvitation?sandboxId='+sandboxId+'&status='+status,
                        method: 'GET'
                    });
                },

                /**
                 * @description create an invitation to user for to joint the sandbox
                 * @memberOf qaobee.components.restAPI.sandbox.config.sbShareRestAPI
                 * @function inviteMemberToSandbox
                 * @request {JsonObject} request : contains user Email, sandbox Id and role
                 * @returns {Object} com.qaobee.hive.business.model.sandbox
                 */
                inviteMemberToSandbox: function (request) {
                    return $http({
                        url: sbShareAPIURL + '/inviteMember',
                        method: 'POST',
                        data: request
                    });
                },
                
                /**
                 * @description desactivate an user to one sandbox
                 * @memberOf qaobee.components.restAPI.sandbox.config.sbShareRestAPI
                 * @function inviteMemberToSandbox
                 * @request {JsonObject} request : contains user Id et sandbox Id
                 * @returns {Object} com.qaobee.hive.business.model.sandbox
                 */
                desactivateMemberToSandbox: function (request) {
                    return $http({
                        url: sbShareAPIURL + '/desactivateMember',
                        method: 'POST',
                        data: request
                    });
                }
            };
        });

}());