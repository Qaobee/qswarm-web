(function () {
    'use strict';
    /**
     * REST Module dealing with the user connection
     *
     * @class qaobee.rest.public.userInfosAPI
     * @author Xavier MARIN
     * @copyright <b>QaoBee</b>.
     */
    angular.module('userInfosAPI', []).value('userInfosURL', '/api/1/commons/user')

        .factory('userInfosAPI', function ($http, userInfosURL, $rootScope) {
            return {
                /**
                 * @memberOf qaobee.rest.public.userInfosAPI
                 * @function logon
                 * @description user login
                 * @param {String} login login (user.account.login)
                 * @param {String} passwd password
                 * @returns {Object} Person com.qaobee.swarn.business.model.tranversal.person.Person
                 */
                logon: function (login, passwd) {
                    return $http({
                        url: userInfosURL + '/login',
                        method: 'POST',
                        data: {login: login, password: passwd}
                    });
                },
                /**
                 * @memberOf qaobee.rest.public.userInfosAPI
                 * @function logoff
                 * @description user logoff
                 * @returns {Object} {"status", "ok"} ou {"status", "ko"}
                 */
                logoff: function () {
                    return $http({
                        url: userInfosURL + '/logout',
                        method: 'GET'
                    });
                },

                /**
                 * @memberOf qaobee.rest.public.userInfosAPI
                 * @function registerUser
                 * @description register a new user
                 * @param u
                 *            {Object} Person com.qaobee.swarn.business.model.tranversal.person.Person
                 * @returns {Object} Person com.qaobee.swarn.business.model.tranversal.person.Person
                 */
                registerUser: function (u) {
                    return $http({
                        url: userInfosURL + '/register',
                        method: 'PUT',
                        data: u
                    });
                },
                /**
                 * @memberOf qaobee.rest.public.userInfosAPI
                 * @function usernameTest
                 * @description Login unicity test
                 * @param {String} login
                 * @returns {Object} {"status", true} ou {"status", false}
                 */
                usernameTest: function (login) {
                    return $http({
                        url: userInfosURL + '/logintest',
                        method: 'POST',
                        data: {
                            login: login
                        }
                    });
                },
                /**
                 * @memberOf qaobee.rest.public.userInfosAPI
                 * @function forgotPasswd
                 * @description New password request
                 * @param {String}        login
                 * @returns {Object} {"status", "ok"} ou {"status", "ko"}
                 */
                forgotPasswd: function (login) {
                    return $http({
                        url: userInfosURL + '/newpasswd',
                        method: 'POST',
                        data: {
                            login: login
                        }
                    });
                }
            };
        });
}());