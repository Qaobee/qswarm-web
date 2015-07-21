(function () {
    'use strict';

    /**
     * Module REST gérant la partie publique du site.
     *
     * @class qaobee.rest.public.publicRestAPI
     * @author Xavier MARIN
     * @copyright <b>QaoBee</b>.
     */
    angular.module('publicRestAPI', []).value('publicURL', '/rest/api/v1')

        .factory('publicRestAPI', function ($http, publicURL) {
            return {
                /**
                 * @memberOf qaobee.rest.public.publicRestAPI
                 * @function getBlogs
                 * @param {int}
                 *            limit limite de blogs à retourner
                 * @description Récupération de la liste des blogs
                 * @returns {Array} com.qaobee.swarn.model.communication.BlogPost
                 */
                getBlogs: function (limit) {
                    return $http({
                        url: publicURL + '/blogs?limit=' + limit,
                        method: 'GET'
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