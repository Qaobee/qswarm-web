(function () {
    'use strict';
    /**
     * Module qaobee services
     *
     * @class app.components.services.stats
     * @author Christophe Kervella
     * @copyright <b>QaoBee</b>.
     */
    angular.module('statsSRV', [

        /* qaobee Rest API */
        'statsRestAPI',
        'collecteRestAPI'])

        .factory('statsSrv', function ($log, $q, $filter, statsRestAPI, collecteRestAPI) {

            /* Nb SB_Collecte player*/
            /**
             *
             * @param startDate
             * @param endDate
             * @param sandboxId
             * @param playerId
             * @returns {deferred.promise|{then, catch, finally}}
             */
            var getMatchsPlayer = function (startDate, endDate, sandboxId, playerId) {
                var deferred = $q.defer();
                var collectes = [];

                var search = {
                    startDate: startDate.valueOf(),
                    endDate: endDate.valueOf(),
                    sandboxId: sandboxId
                };

                /* Search playerId in all player's list of collecte */
                collecteRestAPI.getListCollectes(search).success(function (data) {
                    if (data && data.length > 0) {
                        data.forEach(function (collect) {
                            collect.players.forEach(function (player) {
                                if (player === playerId) {
                                    collectes.push(collect);
                                }
                            });
                        });
                    }
                    deferred.resolve(collectes);
                }).error(function () {
                    deferred.reject('Cant get SB_Collecte' + search);
                });
                return deferred.promise;
            };

            /* Nb SB_Collecte teams*/
            /**
             *
             * @param startDate
             * @param endDate
             * @param sandboxId
             * @param teamId
             * @returns {deferred.promise|{then, catch, finally}}
             */
            var getMatchsTeams = function (startDate, endDate, sandboxId, teamId) {
                var deferred = $q.defer();
                var collectes = [];

                var search = {
                    startDate: startDate.valueOf(),
                    endDate: endDate.valueOf(),
                    sandboxId: sandboxId,
                    teamId: teamId
                };

                collecteRestAPI.getListCollectes(search).success(function (data) {
                    collectes = data;
                    deferred.resolve(collectes);
                }).error(function () {
                    deferred.reject('Cant get SB_Collecte' + search);
                });
                return deferred.promise;
            };

            /* Nb SB_Collecte teams*/
            /**
             *
             * @param startDate
             * @param endDate
             * @param sandboxId
             * @param effectiveId
             * @returns {deferred.promise|{then, catch, finally}}
             */
            var getMatchsEffective = function (startDate, endDate, sandboxId, effectiveId) {
                var deferred = $q.defer();
                var collectes = [];

                var search = {
                    startDate: startDate.valueOf(),
                    endDate: endDate.valueOf(),
                    sandboxId: sandboxId,
                    effectiveId: effectiveId
                };

                collecteRestAPI.getListCollectes(search).success(function (data) {
                    collectes = data;
                    deferred.resolve(collectes);
                }).error(function () {
                    deferred.reject('Cant get SB_Collecte' + search);
                });
                return deferred.promise;
            };

            /* Return counter for all indicators list */
            /**
             *
             * @param indicators
             * @param ownersId
             * @param startDate
             * @param endDate
             * @param listFieldsGroupBy
             * @returns {deferred.promise|{then, catch, finally}}
             */
            var countAllInstanceIndicators = function (indicators, ownersId, startDate, endDate, listFieldsGroupBy) {
                var deferred = $q.defer();
                var counter = 0;

                var search = {
                    listIndicators: indicators,
                    listOwners: ownersId,
                    startDate: startDate.valueOf(),
                    endDate: endDate.valueOf(),
                    aggregat: 'COUNT',
                    listFieldsGroupBy: listFieldsGroupBy
                };

                /* Appel stats API */
                statsRestAPI.getStatGroupBy(search).success(function (data) {
                    if (angular.isArray(data) && data.length > 0) {
                        counter = data[0].value;
                    }
                    deferred.resolve(counter);
                }).error(function () {
                    deferred.reject('countAllInstanceIndicators -> problem for : ' + search);
                });
                return deferred.promise;
            };

            return {
                getMatchsPlayer: getMatchsPlayer,
                getMatchsTeams: getMatchsTeams,
                getMatchsEffective: getMatchsEffective,
                countAllInstanceIndicators: countAllInstanceIndicators
            };
        });
}());