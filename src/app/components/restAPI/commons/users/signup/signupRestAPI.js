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
                
            };
        });
}());