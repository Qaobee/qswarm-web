(function () {
    'use strict';

    /**
     * Module REST gérant la partie publique du site.
     *
     * @class qaobee.components.restAPI.public.publicRestAPI
     * @author Xavier MARIN
     * @copyright <b>QaoBee</b>.
     */
    angular.module('publicRestAPI', []).value('publicURL', '/api/1/commons/settings/public')

        .factory('publicRestAPI', function ($http, publicURL) {
            return {
                /**
                 * @memberOf qaobee.components.restAPI.public.publicRestAPI
                 * @function getBlogs
                 * @param {int}
                 *            limit limite de blogs à retourner
                 * @description Récupération de la liste des blogs
                 * @returns {Array} com.qaobee.hive.business.model.commons.public.BlogPost
                 */
                getBlogs: function (limit) {
                    return $http({
                        url: publicURL + '/blogs?limit=' + limit,
                        method: 'GET'
                    });
                },
                
                /**
                 * @memberOf qaobee.components.restAPI.public.publicRestAPI
                 * @function sendMail
                 * @description Renvoi du mail d'activation de l'utilisateur
                 * @param {Object}
                 *            data
                 * @todo à implémenter
                 * @returns {Object} {"status", true} ou {"status", false}
                 */
                sendMail: function (data) {
                    return $http({
                        url: publicURL + '/sendmail',
                        method: 'POST',
                        data: data
                    });
                },
            };
        });
}());