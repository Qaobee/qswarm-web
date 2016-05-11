(function () {
    'use strict';
    /**
     * Module REST gérant le paiement
     *
     * @class qaobee.components.restAPI..commons.users.paymentAPI
     * @author Xavier MARIN
     * @copyright <b>QaoBee</b>.
     */
    angular.module('paymentRestAPI', []).value('paymentURL', '/api/1/commons/users/shipping')

        .factory('paymentAPI', function ($http, paymentURL) {
            return {
                /**
                 * @memberOf qaobee.components.restAPI..commons.users.paymentAPI
                 * @function getPaymentURL
                 * @description Récupération de l'url pour le paiement en ligne
                 * @param {String} planId
                 * @returns {Object} status
                 */
                getPaymentURL: function (planId) {
                    return $http({
                        url: paymentURL + '/pay',
                        method: 'POST',
                        data: {
                            plan_id: planId
                        }
                    });
                }
            };
        });
}());