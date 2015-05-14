/**
 * Module REST gérant le paiement
 * 
 * @class qaobee.rest.public.paymentAPI
 * @author Xavier MARIN
 * @copyright <b>QaoBee</b>.
 */
angular.module('paymentAPI', []).value('paymentURL', '/rest/payment')

.factory('paymentAPI', function($http, paymentURL) {
    return {
        /**
         * @memberOf qaobee.rest.public.paymentAPI
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
        getPaymentURL : function(planId, personId) {
            return $http({
                url : paymentURL + '/url',
                method : "POST",
                data : {
                    "planId" : planId,
                    "personId" : personId
                }
            });
        },
        /**
         * @memberOf qaobee.rest.public.paymentAPI
         * @function getDetail
         * @description Récupération du détail d'un user
         * @param {String}
         *            id
         * @param {String}
         *            pid
         * @returns {Object}
         *          com.qaobee.swarn.business.model.administration.users.User
         */
        getDetail : function(id, pid) {
            return $http({
                url : paymentURL + '/get/?id=' + id + "&pid=" + pid,
                method : "GET"
            });
        }
    };
});