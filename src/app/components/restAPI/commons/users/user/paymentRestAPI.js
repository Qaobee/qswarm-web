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
                 *
                 * @param data
                 * @returns {*}
                 */
                pay: function (data) {
                    return $http({
                        url: paymentURL + '/pay',
                        method: 'POST',
                        data: data
                    });
                },
                /**
                 *
                 * @param planId
                 * @returns {*}
                 */
                unsubscribe: function (planId) {
                    return $http({
                        url: paymentURL + '/unsubscribe/' + planId,
                        method: 'GET'
                    });
                },
                /**
                 *
                 * @param planId
                 * @returns {*}
                 */
                getInvoices: function (planId) {
                    return $http({
                        url: paymentURL + '/invoices/' + planId,
                        method: 'GET'
                    });
                },
                /**
                 *
                 * @param planId
                 * @param invoiceId
                 */
                getInvoice: function (planId, invoiceId) {
                    return $http({
                        url: paymentURL + '/invoice/' + planId + '/' + invoiceId,
                        method: 'GET'
                    });
                }

            };
        });
}());