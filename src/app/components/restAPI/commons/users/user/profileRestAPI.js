(function () {
    'use strict';
    /**
     * Module REST gérant la gestion du profil utilisateur
     * 
     * @class qaobee.components.restAPI.commons.usersprofileRestAPI
     * @author Xavier MARIN
     * @copyright <b>QaoBee</b>.
     */
    angular.module('profileRestAPI', []).value('profileURL', '/rest/prive/profile')

    .factory('profileRestAPI', function($http, profileURL, $rootScope) {
        return {
            /**
             * @memberOf qaobee.components.restAPI.commons.usersprofileRestAPI
             * @function update
             * @description Mise à jour du profil utilisateur
             * @param {Object}
             *            u com.qaobee.swarn.model.transverse.User
             * @returns {Object} Person com.qaobee.hive.business.model.commons.users.User
             */
            update : function(u) {
                return $http({
                    url : profileURL,
                    method : "POST",
                    data : u
                });
            },
            /**
             * @memberOf qaobee.components.restAPI.commons.usersprofileRestAPI
             * @function uploadAvatar
             * @description Mise à jour de l'avatar de l'utilisateur
             * @param {String}
             *            uid Identifiant Mongo de l'utilisateur
             * @returns {Object} Person com.qaobee.hive.business.model.commons.users.User
             */
            uploadAvatar : function(uid) {
                return $http({
                    url : '/file/avatar/' + uid,
                    method : "POST",
                    headers : {
                        'token' : $rootScope.token
                    }
                });
            },
            /**
             * @memberOf qaobee.components.restAPI.commons.usersprofileRestAPI
             * @function getPrefDetails
             * @description Get user preferences
             * @param {String}
             *            key preference key
             * @param {String} user id
             * @returns {Object} Preferences data
             */
            getPrefDetails : function(key, id) {
                return $http({
                    url : profileURL + '/preference/getPrefDetails?idPerson='+id+ "&preferenceCode=" + key,
                    method : 'GET'
                });
            },
            /**
             * @memberOf qaobee.components.restAPI.commons.usersprofileRestAPI
             * @function setPreference
             * @description Store user preferences
             * @param {String}
             *            key preference key
             * @param {Object} preferences to store
             * @param {String} user id
             * @returns {Object} Preferences data
             */
            setPreference : function(key, data, id) {
                return $http({
                    url : profileURL + '/preference/setPreference',
                    method : 'POST',
                    data : {
                        idPerson : id,
                        preferenceCode : key,
                        preferenceData : data
                    }
                });
            }


        };
    });

}());