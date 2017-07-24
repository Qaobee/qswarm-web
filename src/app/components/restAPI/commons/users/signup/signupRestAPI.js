(function () {
    'use strict';
    /**
     * Signup Rest API
     *
     * @class qaobee.components.restAPI.commons.users.user.signupRestAPI
     * @author Xavier MARIN
     * @copyright <b>QaoBee</b>.
     */
    angular.module('signupRestAPI', []).value('signupURL', '/api/2/commons/users/signup')

        .factory('signupRestAPI', function ($http, signupURL) {
            return {
                /**
                 * @memberOf qaobee.components.restAPI.commons.users.user.signupRestAPI
                 * @function registerUser
                 * @description register a new user
                 * @param u
                 *            {Object} Person com.qaobee.hive.business.model.commons.users.user.User
                 * @returns {Object} Person com.qaobee.hive.business.model.commons.users.user.User
                 */
                registerUser: function (u) {
                    u.origin = 'web';
                    return $http({
                        url: signupURL + '/register',
                        method: 'PUT',
                        data: u
                    });
                },

                /**
                 * @memberOf qaobee.components.restAPI.commons.users.user.signupRestAPI
                 * @function usernameTest
                 * @description Login unicity test
                 * @param {String} login
                 * @returns {Object} {"status", true} ou {"status", false}
                 */
                usernameTest: function (login) {
                    return $http({
                        url: signupURL + '/test/'+login,
                        method: 'GET'
                    });
                },
                /**
                 *
                 * @param id
                 * @param code
                 * @returns {*}
                 */
                firstConnectionCheck: function (id, code) {
                    return $http({
                        url: signupURL + '/firstconnectioncheck/' + id + '/' + code,
                        method: 'GET'
                    });
                },
                /**
                 * @memberOf qaobee.components.restAPI.commons.users.user.signupRestAPI
                 * @function mailResend
                 * @param login user login
                 * @description re-emit a register mail
                 * @returns {Object} status
                 */
                mailResend: function(login) {
                    return $http({
                        url: signupURL + '/mailResend',
                        method: 'POST',
                        data: {login : login}
                    });
                }
            };
        });
}());