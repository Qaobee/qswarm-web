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
                /**
                 * @memberOf qaobee.components.restAPI.commons.users.user.signupRestAPI
                 * @function accountCheck
                 * @description Vérification du code d'activation de l'utilisateur
                 * @param {String}
                 *            code Code d'activation
                 * @param {String}
                 *            id Identifiant Mongo de l'utilisateur
                 * @returns {Object} {"status", true} ou {"status", false}
                 */
                accountCheck: function (code, id) {
                    return $http({
                        url: signupURL + '/accountcheck/?code=' + code + '&id=' + id,
                        method: 'GET'
                    });
                }
            };
        });
}());