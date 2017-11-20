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
                }

            };
        });
}());