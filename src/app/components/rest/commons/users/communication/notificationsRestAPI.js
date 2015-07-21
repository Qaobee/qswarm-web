(function () {
    'use strict';
    /**
     * Module REST gérant les notifications utilisateur
     * 
     * @class qaobee.rest.commons.users.communication.notificationsRestAPI
     * @author Xavier MARIN
     * @copyright <b>QaoBee</b>.
     */
    angular.module('notificationsRestAPI', []).value('notificationsURL', '/rest/prive/notifications')

    .factory('notificationsRestAPI', function($http, notificationsURL, $rootScope) {
        return {
            /**
             * @memberOf qaobee.rest.commons.users.communication.notificationsRestAPI
             * @function getUserNotifications
             * @description Récupération des notifications de l'utilisateur de
             *              l'utilisateur
             * @returns {Array} Notification[]
             *          com.qaobee.swarn.model.communication.Notification
             */
            getUserNotifications : function(limit) {
                return $http({
                    url : notificationsURL + '?limit='+limit,
                    method : "GET"
                });
            },
            /**
             * @memberOf qaobee.rest.commons.users.communication.notificationsRestAPI
             * @function del
             * @description Suppression d'une notification
             * @param {String}
             *            id
             * @returns {Object} {"status": "ok","number": number}
             */
            del : function(id) {
                return $http({
                    url : notificationsURL + '/del/?id=' + id,
                    method : "DELETE"
                });
            },
            /**
             * @memberOf qaobee.rest.commons.users.communication.notificationsRestAPI
             * @function markAsRead
             * @description Marquer une notification comme lue
             * @param {String}
             *            id
             * @returns {Object} {"status": "ok","number": number}
             */
            markAsRead : function(id) {
                return $http({
                    url : notificationsURL + "/read?id=" + id,
                    method : "POST"
                });
            }
        };
    });
    
}());