(function () {
    'use strict';
    /**
     * Module EventBus
     *
     * @class qaobee.components.services.qeventbus
     * @author Xavier MARIN
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.eventbus', [])

        .factory('qeventbus', function ($rootScope) {
            var sharedService = {message: '', data: {}};

            /**
             * @memberOf qaobee.components.services.qeventbus
             * @function prepForBroadcast
             * @description Poste d'un message sur le bus
             * @param {String} msg nom du topic
             * @param {Object} data objet passé
             */
            sharedService.prepForBroadcast = function (msg, data) {
                this.message = msg;
                this.data = data;
                this.broadcastItem();
            };
            /**
             * @memberOf qaobee.components.services.qeventbus
             * @function broadcastItem
             * @description Propagation du message
             * @private
             */
            sharedService.broadcastItem = function () {
                $rootScope.$broadcast('qeventbus');
            };

            return sharedService;
        });

}());