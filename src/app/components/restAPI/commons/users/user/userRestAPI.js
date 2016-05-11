(function () {
    'use strict';
    /**
     * REST Module dealing with the user connection
     *
     * @class qaobee.components.restAPI.commons.users.user.userRestAPI
     * @author Xavier MARIN
     * @copyright <b>QaoBee</b>.
     */
    angular.module('userRestAPI', []).value('userURL', '/api/1/commons/users/user')

        .factory('userRestAPI', function ($http, userURL) {
            return {
                /**
                 * @memberOf qaobee.components.restAPI.commons.users.user.userRestAPI
                 * @function logon
                 * @description user login
                 * @param {String} login login (user.account.login)
                 * @param {String} passwd password
                 * @returns {Object} Person com.qaobee.hive.business.model.commons.users.User
                 */
                logon: function (login, passwd) {
                    return $http({
                        url: userURL + '/login',
                        method: 'POST',
                        data: {login: login, password: passwd}
                    });
                },
                /**
                 * @memberOf qaobee.components.restAPI.commons.users.user.userRestAPI
                 * @function logoff
                 * @description user logoff
                 * @returns {Object} {"status", "ok"} ou {"status", "ko"}
                 */
                logoff: function () {
                    return $http({
                        url: userURL + '/logout',
                        method: 'GET'
                    });
                },
                /**
                 * @memberOf qaobee.components.restAPI.commons.users.user.userRestAPI
                 * @function forgotPasswd
                 * @description New password request
                 * @param {String}        login
                 * @returns {Object} {"status", "ok"} ou {"status", "ko"}
                 */
                forgotPasswd: function (login) {
                    return $http({
                        url: userURL + '/newpasswd',
                        method: 'POST',
                        data: {
                            login: login
                        }
                    });
                },
                /**
                 * @memberOf qaobee.components.restAPI.commons.users.user.userRestAPI
                 * @function passwdCheck
                 * @description Vérification du code d'activation mot de passe de
                 *              l'utilisateur
                 * @param {String} code Code d'activation
                 * @param {String} id Identifiant Mongo de l'utilisateur
                 * @returns {Object} {"status", true} ou {"status", false}
                 */
                passwdCheck: function (code, id) {
                    return $http({
                        url: userURL + '/passwdcheck/?code=' + code + '&id=' + id,
                        method: 'GET'
                    });
                },
                /**
                 * @memberOf qaobee.components.restAPI.commons.users.user.userRestAPI
                 * @function resetPasswd
                 * @description Suppression du mot de passe
                 * @returns {Object} {"status", true} ou {"status", false}
                 */
                resetPasswd: function (data) {
                    return $http({
                        url: userURL + '/resetPasswd/',
                        method: 'POST',
                        data: data
                    });
                },
                /**
                 * @memberOf qaobee.components.restAPI.commons.users.userRestAPI
                 * @function getCurrentUser
                 * @description Fetch the current user
                 * @returns {Object} Person com.qaobee.hive.business.model.commons.users.User
                 */
                getCurrentUser: function () {
                    return $http({
                        url: userURL + '/current',
                        method: 'GET'
                    });
                },
                /**
                 * @memberOf qaobee.components.restAPI.commons.users.userRestAPI
                 * @function getMetas
                 * @description Fetch meta informations
                 * @returns {Object} metas
                 */
                getMetas: function () {
                    return $http({
                        url: userURL + '/meta',
                        method: 'GET'
                    });
                },
                /**
                 * @memberOf qaobee.components.restAPI.commons.users.userRestAPI
                 * @function getUserById
                 * @param {String} user id
                 * @description Fetch uer informations
                 * @returns {Object} Person com.qaobee.hive.business.model.commons.users.User
                 */
                getUserById: function (id) {
                    return $http({
                        url: userURL + '/user?id=' + id,
                        method: 'GET'
                    });
                },
                /**
                 * @memberOf qaobee.components.restAPI.commons.users.userRestAPI
                 * @function getUserByLogin
                 * @param {String} user login
                 * @description Fetch uer informations
                 * @returns {Object} Person com.qaobee.hive.business.model.commons.users.User
                 */
                getUserByLogin: function (login) {
                    return $http({
                        url: userURL + '/userByLogin?login=' + login,
                        method: 'GET'
                    });
                }
            };
        });
}());