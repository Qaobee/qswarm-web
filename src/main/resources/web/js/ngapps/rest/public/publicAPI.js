/**
 * Module REST gérant la partie publique du site.
 * 
 * @class qaobee.rest.public.publicRestAPI
 * @author Xavier MARIN
 * @copyright <b>QaoBee</b>.
 */
angular.module('publicRestAPI', []).value('publicURL', '/rest')

.factory('publicRestAPI', function($http, publicURL) {
    return {
        /**
         * @memberOf qaobee.rest.public.publicRestAPI
         * @function getBlogs
         * @param {int}
         *            limit limite de blogs à retourner
         * @description Récupération de la liste des blogs
         * @returns {Array} com.qaobee.swarn.model.communication.BlogPost
         */
        getBlogs : function(limit) {
            return $http({
                url : publicURL + '/blogs?limit=' + limit,
                method : "GET"
            });
        },
        /**
         * @memberOf qaobee.rest.public.publicRestAPI
         * @function accountCheck
         * @description Vérification du code d'activation de l'utilisateur
         * @param {String}
         *            code Code d'activation
         * @param {String}
         *            id Identifiant Mongo de l'utilisateur
         * @returns {Object} {"status", true} ou {"status", false}
         */
        accountCheck : function(code, id) {
            return $http({
                url : publicURL + '/accountcheck/?code=' + code + '&id=' + id,
                method : "GET"
            });
        },
        /**
         * @memberOf qaobee.rest.public.publicRestAPI
         * @function passwdCheck
         * @description Vérification du code d'activation mot de passe de
         *              l'utilisateur
         * @param {String}
         *            code Code d'activation
         * @param {String}
         *            id Identifiant Mongo de l'utilisateur
         * @returns {Object} {"status", true} ou {"status", false}
         */
        passwdCheck : function(code, id) {
            return $http({
                url : publicURL + '/passwdcheck/?code=' + code + '&id=' + id,
                method : "GET"
            });
        },

        resetPasswd : function() {
            return $http({
                url : publicURL + '/resetPasswd/',
                method : "POST"
            });
        },
        /**
         * @memberOf qaobee.rest.public.publicRestAPI
         * @function sendMail
         * @description Renvoi du mail d'activation de l'utilisateur
         * @param {Object}
         *            data
         * @todo à implémenter
         * @returns {Object} {"status", true} ou {"status", false}
         */
        sendMail : function(data) {
            return $http({
                url : publicURL + '/sendmail',
                method : "POST",
                data : data
            });
        },
        
        searchStructure : function(label, codeActivity) {
            return $http({
                url : publicURL + '/searchStructure',
                method : "POST",
                data : {label :label, codeActivity : codeActivity}
            });
        },
        
        getActivities : function() {
            return $http({
                url : publicURL + '/getActivities',
                method : "GET"
            });
        }
        
        
    };
});