
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

    .factory('statsSrv', function($log, $q, $filter, statsRestAPI, collecteRestAPI) {

        /* efficiently */  
        var getEfficiently = function (ownersId, startDate, endDate, values) {
            var deferred = $q.defer(); 
            var search = {};
            var result = {
                nbShoot : 0,
                nbGoal : 0,
                efficiently : 0
            };
            
            /* Search parameters Efficiently global */
            if(angular.isDefined(values)) {
                search = {
                    listIndicators: ['originShootAtt'],
                    listOwners: ownersId,
                    startDate: startDate.valueOf(),
                    endDate: endDate.valueOf(),
                    values: values,
                    aggregat: 'COUNT',
                    listFieldsGroupBy: ['owner', 'code', 'shootSeqId']
                };
            } else {
                search = {
                    listIndicators: ['originShootAtt'],
                    listOwners: ownersId,
                    startDate: startDate.valueOf(),
                    endDate: endDate.valueOf(),
                    aggregat: 'COUNT',
                    listFieldsGroupBy: ['owner', 'code', 'shootSeqId']
                };
            }
            
            var listShootSeqId = [];

            statsRestAPI.getStatGroupBy(search).success(function (dataOri) {
                result.nbShoot = dataOri.length;
                dataOri.forEach(function (e) {
                    listShootSeqId.push(e._id.shootSeqId);
                });

                search = {};
                search = {
                    listIndicators: ['goalScored'],
                    listOwners: ownersId,
                    startDate: startDate.valueOf(),
                    endDate: endDate.valueOf(),
                    listShootSeqId: listShootSeqId,
                    aggregat: 'COUNT',
                    listFieldsGroupBy: ['code']
                };

                statsRestAPI.getStatGroupBy(search).success(function (dataGoal) {
                    var efficacite = 0;
                    
                    if (angular.isDefined(dataGoal[0]) && dataGoal !== null) {
                        result.nbGoal = dataGoal[0].value;
                        result.efficiently = (result.nbGoal / result.nbShoot) * 100;
                        deferred.resolve(result);  
                    } else {
                        deferred.reject('getEfficiently -> problem for : ' + search);
                    }
                });
            });
            return deferred.promise;
        };
        
        /* color gauge */  
        var getColorGauge = function (efficiently) {
            var deferred = $q.defer(); 
            
            if (efficiently<25) {
                deferred.resolve('#ef5350');
            } else if(efficiently>=25 && efficiently<50) {
                 deferred.resolve('#ffb74d');
            } else if(efficiently>=50 && efficiently<75) {
                 deferred.resolve('#29b6f6');
            } else if(efficiently>75) {
                 deferred.resolve('#9ccc65');
            } else {
                deferred.reject('');
            }
            return deferred.promise;
        };
        
        /* Nb SB_Collecte teams*/  
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
            }).error(function (){
                deferred.reject('Cant get SB_Collecte' + search);
            });
            return deferred.promise;
        };
        
        /* Nb SB_Collecte teams*/  
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
            }).error(function (){
                deferred.reject('Cant get SB_Collecte' + search);
            });
            return deferred.promise;
        };
        
        /* Return counter for all indicators list */  
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
            }).error(function (){
                deferred.reject('countAllInstanceIndicators -> problem for : ' + search);
            });
            return deferred.promise;
        };
             
        return {
            getEfficiently : getEfficiently,
            getColorGauge : getColorGauge,
            getMatchsTeams : getMatchsTeams,
            getMatchsEffective : getMatchsEffective,
            countAllInstanceIndicators : countAllInstanceIndicators
        };
    });

}());