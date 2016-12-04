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
                 * @function getSandbox
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
                 * @description Retrieve all sandbox sharing for one user for admin request
                 * @function getSandboxSharingList
                 * @memberOf qaobee.components.restAPI.sandbox.config.sbShareRestAPI
                 * @param userId
                 * @returns {Array}    list of sandbox
                 */
                getSandboxSharingListAdmin: function (userId) {
                    return $http({
                        url: sbShareAPIURL + '/listAdmin?userId='+userId,
                        method: 'GET'
                    });
                },
                
                /**
                 * @description Retrieve all sandbox for one user for admin request
                 * @function getListByOwner
                 * @memberOf qaobee.components.restAPI.sandbox.config.sandboxRestAPI
                 * @param userId
                 * @returns {Array}    list of sandbox
                 */
                getListByOwner: function (ownerId) {
                    return $http({
                        url: sandboxAPIURL + '/sandbox/getListByOwner?owner='+ownerId,
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
                        url: sbShareAPIURL + '/listInvitation?sandboxId='+sandboxId+'&invitationStatus='+status,
                        method: 'GET'
                    });
                },
                
                /**
                 * @description Abandon an invitation
                 * @function removeInvitationToSandbox
                 * @memberOf qaobee.components.restAPI.sandbox.config.sbShareRestAPI
                 * @param invitationId
                 * @returns {Invitation}    an invitation object
                 */
                removeInvitationToSandbox: function (invitationId) {
                    return $http({
                        url: sbShareAPIURL + '/removeInvitation?invitationId='+invitationId,
                        method: 'GET'
                    });
                },
                
                /**
                 * @description get an invitation
                 * @function getInvitationToSandbox
                 * @memberOf qaobee.components.restAPI.sandbox.config.sbShareRestAPI
                 * @param invitationId
                 * @returns {Invitation}    an invitation object
                 */
                getInvitationToSandbox: function (invitationId) {
                    return $http({
                        url: sbShareAPIURL + '/getInvitation?invitationId='+invitationId,
                        method: 'GET'
                    });
                },
                
                /**
                 * @description revive an invitation
                 * @function reviveInvitation
                 * @memberOf qaobee.components.restAPI.sandbox.config.sbShareRestAPI
                 * @param invitationId
                 * @returns {Invitation}    an invitation object
                 */
                reviveInvitation: function (invitationId) {
                    return $http({
                        url: sbShareAPIURL + '/reviveInvitation?invitationId='+invitationId,
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
                 * @function desactivateMemberToSandbox
                 * @request {JsonObject} request : contains user Id et sandbox Id
                 * @returns {Object} com.qaobee.hive.business.model.sandbox
                 */
                desactivateMemberToSandbox: function (request) {
                    return $http({
                        url: sbShareAPIURL + '/desactivateMember',
                        method: 'POST',
                        data: request
                    });
                },
                
                /**
                 * @description activate an user to one sandbox
                 * @memberOf qaobee.components.restAPI.sandbox.config.sbShareRestAPI
                 * @function activateMemberToSandbox
                 * @request {JsonObject} request : contains user Id et sandbox Id
                 * @returns {Object} com.qaobee.hive.business.model.sandbox
                 */
                activateMemberToSandbox: function (request) {
                    return $http({
                        url: sbShareAPIURL + '/activateMember',
                        method: 'POST',
                        data: request
                    });
                },
                
                /**
                 * @description accept or refuse invitation to join sandbox
                 * @memberOf qaobee.components.restAPI.sandbox.config.sbShareRestAPI
                 * @function confirmInvitationToSandbox
                 * @request {JsonObject} request : contains user Id and invitation Id and answer
                 * @returns {Object} com.qaobee.hive.business.model.sandbox
                 */
                confirmInvitationToSandbox: function (request) {
                    return $http({
                        url: sbShareAPIURL + '/confirm',
                        method: 'POST',
                        data: request
                    });
                }
            };
        });

}());