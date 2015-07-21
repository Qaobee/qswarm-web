(function () {
    'use strict';
    /**
     * Module REST gérant le paiement
     *
     * @class qaobee.components.restAPI..commons.users.paymentAPI
     * @author Xavier MARIN
     * @copyright <b>QaoBee</b>.
     */
    angular.module('paymentRestAPI', []).value('paymentURL', '/rest/api/v1/payment')

        .factory('paymentAPI', function ($http, paymentURL) {
            return {
                /**
                 * @memberOf qaobee.components.restAPI..commons.users.paymentAPI
                 * @function getPaymentURL
                 * @description Récupération de l'url pour le paiement en ligne
                 * @param {String}
                 *            amount montant
                 * @param {String}
                 *            planId
                 * @param {String}
                 *            personId
                 * @returns {Object} status
                 */
                getPaymentURL: function (planId, personId) {
                    return $http({
                        url: paymentURL + '/url',
                        method: 'POST',
                        data: {
                            planId: planId,
                            personId: personId
                        }
                    });
                },
                /**
                 * @memberOf qaobee.components.restAPI..commons.users.paymentAPI
                 * @function getDetail
                 * @description Récupération du détail d'un user
                 * @param {String}
                 *            id
                 * @param {String}
                 *            pid
                 * @returns {Object}
                 *          com.qaobee.hive.business.model.commons.users.User
                 */
                getDetail: function (id, pid) {
                    return $http({
                        url: paymentURL + '/get/?id=' + id + '&pid=' + pid,
                        method: 'GET'
                    });
                }
            };
        });
}());