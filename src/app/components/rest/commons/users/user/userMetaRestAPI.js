(function () {
    'use strict';
    /**
     * REST Module dealing with the user connection
     *
     * @class qaobee.rest.public.userMetaRestAPI
     * @author Xavier MARIN
     * @copyright <b>QaoBee</b>.
     */
    angular.module('userMetaRestAPI', []).value('userMetaURL', '/api/1/commons/users/user')
        .factory('userMetaRestAPI', function ($http, userMetaURL) {
            return {
                /**
                 * @memberOf qaobee.rest.public.userMetaRestAPI
                 * @function getCurrentUser
                 * @description Fetch the current user
                 * @returns {Object} Person com.qaobee.swarn.business.model.tranversal.person.Person
                 */
                getCurrentUser: function () {
                    return $http({
                        url: userMetaURL + '/current',
                        method: 'GET'
                    });
                },
                /**
                 * @memberOf qaobee.rest.public.userMetaRestAPI
                 * @function getMetas
                 * @description Fetch meta informations
                 * @returns {Object} metas
                 */
                getMetas: function () {
                    return $http({
                        url: userMetaURL + '/meta',
                        method: 'GET'
                    });
                },
                /**
                 * @memberOf qaobee.rest.public.userMetaRestAPI
                 * @function getUserById
                 * @param {String} user id
                 * @description Fetch uer informations
                 * @returns {Object} Person com.qaobee.swarn.business.model.tranversal.person.Person
                 */
                getUserById: function (id) {
                    return $http({
                        url: userMetaURL + '/user?id=' + id,
                        method: 'GET'
                    });
                },
                /**
                 * @memberOf qaobee.rest.public.userMetaRestAPI
                 * @function getSeasonsInfo
                 * @param {String} activityId
                 * @param {String} structureId
                 * @description Fetch uer informations
                 * @returns {Object} Person com.qaobee.swarn.business.model.tranversal.person.Person
                 */
                getSeasonsInfo: function (activityId, structureId) {
                    return $http({
                        url: userMetaURL + '/season?activityId=' + activityId + '&structureId=' + structureId,
                        method: 'GET'
                    });
                }
            };

        })
//
    ;
}());
