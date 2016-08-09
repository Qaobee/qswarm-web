(function () {
    'use strict';
    /**
     * Signup Rest API
     *
     * @class qaobee.components.restAPI.commons.users.user.signupRestAPI
     * @author Xavier MARIN
     * @copyright <b>QaoBee</b>.
     */
    angular.module('signupRestAPI', []).value('signupURL', '/api/1/commons/users/signup')

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
                        url: signupURL + '/logintest',
                        method: 'POST',
                        data: {
                            login: login
                        }
                    });
                },

                firstConnectionCheck: function (id, code) {
                    return $http({
                        url: signupURL + '/firstconnectioncheck?id=' + id + '&code=' + code,
                        method: 'GET'
                    });
                },

                finalizeSignup: function (user, captcha, structure, activity, categoryAge) {
                    return $http({
                        url: signupURL + '/finalize',
                        method: 'POST',
                        data: {
                            user: user,
                            code: captcha,
                            structure: structure,
                            activity: activity,
                            categoryAge: categoryAge
                        }
                    });
                }
            };
        });
}());