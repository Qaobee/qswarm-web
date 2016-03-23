(function () {
  'use strict';
  /**
   * Module REST gérant les notifications utilisateur
   *
   * @class qaobee.components.restAPI.commons.users.communication.notificationsRestAPI
   * @author Xavier MARIN
   * @copyright <b>QaoBee</b>.
   */
  angular.module('notificationsRestAPI', []).value('notificationsURL', '/api/1/commons/communication/notifications')

    .factory('notificationsRestAPI', function ($http, notificationsURL) {
      return {
        /**
         * @memberOf qaobee.components.restAPI.commons.users.communication.notificationsRestAPI
         * @function getUserNotifications
         * @description Récupération des notifications de l'utilisateur de
         *              l'utilisateur
         * @returns {Array} Notification[]
         *          com.qaobee..hive.business.model.commons.communication.Notification
         */
        getUserNotifications: function (start, limit) {
          var q = '';
          if (!!start) {
            q += 'start=' + start;
          }
          if (!!limit) {
            q += 'limit=' + limit;
          }
          return $http({
            url: notificationsURL + '?' + q,
            method: 'GET'
          });
        },
        /**
         * @memberOf qaobee.components.restAPI.commons.users.communication.notificationsRestAPI
         * @function del
         * @description Suppression d'une notification
         * @param {String} id
         * @returns {Object} {'status': 'ok','number': number}
         */
        del: function (id) {
          return $http({
            url: notificationsURL + '/del/?id=' + id,
            method: 'DELETE'
          });
        },
        /**
         * @memberOf qaobee.components.restAPI.commons.users.communication.notificationsRestAPI
         * @function markAsRead
         * @description Marquer une notification comme lue
         * @param {String} id
         * @returns {Object} {'status': 'ok','number': number}
         */
        markAsRead: function (id) {
          return $http({
            url: notificationsURL + '/read?id=' + id,
            method: 'POST'
          });
        }
      };
    });

}());