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
                 * @function sendMail
                 * @description Renvoi du mail d'activation de l'utilisateur
                 * @param {Object} data
                 * @returns {Object} {"status", true} ou {"status", false}
                 */
                sendMail: function (data) {
                    return $http({
                        url: publicURL + '/sendmail',
                        method: 'POST',
                        data: data
                    });
                }
            };
        });
}());