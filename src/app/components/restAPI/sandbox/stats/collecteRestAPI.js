(function () {
   'use strict';
   /**
    * Created by xavier on 22/03/15.
    * @class qaobee.components.restAPI.sandbox.stats.collecteRestAPI
    * @author Xavier MARIN
    * @copyright <b>QaoBee</b>.
    */
    angular.module('collecteRestAPI', []).value('collecteAPIURL', '/api/1/sandbox/stats/collecte')

        .factory('collecteRestAPI', function ($http, collecteAPIURL) {
            return {

            /**
             * @description Retrieve all collectes match to parameters filter
             * @function getListCollectes()
             * @memberOf qaobee.components.restAPI.sandbox.stats.collecteRestAPI
             * @param   {long}     startDate  Start date
             * @param   {long}     endDate    End date
             * @param   {String}   sandboxId  sandboxId
             * @param   {String}   effectiveId effectiveId
             * @param   {String}   teamId teamId
             * @param   {String}   eventId Event id
             * @returns {Array}    list of collectes
             */
                getListCollectes: function (request) {
                    return $http({
                        url: collecteAPIURL + '/list',
                        method: 'POST',
                        data: request
                    });
                },
          
            /**
             * @description Retrieve Collecte by this Id
             * @function getCollecte()
             * @memberOf qaobee.components.restAPI.sandbox.stats.collecteRestAPI
             * @param   {String} id Collecte id
             * @returns {Object} collecte com.qaobee.hive.business.model.sandbox.stats.collecte;
             */
                getCollecte: function (id) {
                    return $http({
                        url: collecteAPIURL + '/get?_id=' + id,
                        method: 'GET'
                    });
                },
          
            /**
             * @memberOf qaobee.components.restAPI.sandbox.stats.collecteRestAPI
             * @function addCollecte()
             * @description add collecte
             * @param {SB_Collecte}
             *            collecte : event to add
             * @returns {SB_Collecte} com.qaobee.hive.business.model.sandbox.stats.SB_Collecte
             */
                addCollecte : function(collecte) {
                    return $http({
                        url : collecteAPIURL + '/add',
                        method : 'POST',
                        data : collecte
                    });
                },

            /**
             * @memberOf qaobee.components.restAPI.sandbox.stats.collecteRestAPI
             * @function updateCollecte()
             * @description update a collecte
             * @param {SB_Collecte}
             *            collecte : collecte to update
             * @returns {SB_Collecte} com.qaobee.hive.business.model.sandbox.stats.SB_Collecte
             */
                updateCollecte : function(collecte) {
                    return $http({
                        url : collecteAPIURL + '/update',
                        method : 'POST',
                        data : collecte
                    });
                }
        };
    });
}());
