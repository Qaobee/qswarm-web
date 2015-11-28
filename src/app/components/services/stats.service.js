
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
        'statsRestAPI'])

    .factory('statsSrv', function($log, $q, statsRestAPI) {

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
            var nbShoot = 0;

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
                    listFieldsGroupBy: ['owner', 'code']
                };

                statsRestAPI.getStatGroupBy(search).success(function (dataGoal) {
                    var efficacite = 0;
                    
                    if (angular.isDefined(dataGoal[0]) && dataGoal !== null) {
                        result.nbGoal = dataGoal[0].value;
                        result.efficiently = (result.nbGoal / result.nbShoot) * 100;
                        deferred.resolve(result);  
                    } else {
                        deferred.reject('Can t determinante efficiently');
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
                 deferred.resolve('#42a5f5');
            } else if(efficiently>75) {
                 deferred.resolve('#66bb6a');
            } else {
                deferred.reject('');
            }
            return deferred.promise;
        };
             
        return {
            getEfficiently : getEfficiently,
            getColorGauge : getColorGauge
        };
    });

}());