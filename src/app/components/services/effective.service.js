
(function () {
    'use strict';
    /**
     * Module qaobee services
     * 
     * @class app.components.services.effective
     * @author Christophe Kervella
     * @copyright <b>QaoBee</b>.
     */
    angular.module('effectifSRV', [
        
        /* qaobee Rest API */
        'effectiveRestAPI',
        'personRestAPI'])

    .factory('effectiveSrv', function($log, $q, effectiveRestAPI, personRestAPI) {

        /* get Effective */  
        var getEffective = function (effectiveId) {
            var deferred = $q.defer(); 
            
            effectiveRestAPI.getEffective(effectiveId).success(function (data) {
                deferred.resolve(data);
            });
            return deferred.promise;
        };
        
        /* get listId */  
        var getListId = function (effective, roleMember) {
            var deferred = $q.defer(); 
            var listId = [];
            
            if(angular.isDefined(effective.members) && effective.members.length>0) {
                effective.members.forEach(function (b) {
                    if (b.role.code===roleMember) {
                        listId.push(b.personId);
                    }
                    deferred.resolve(listId);
                });
            } else {
                deferred.reject('');
            }
            return deferred.promise;
        };
          
        /* get persons */  
        var getPersons = function (listId, listField) {
            var deferred = $q.defer();

            personRestAPI.getListPerson(listId, listField).success(function (data) {
                deferred.resolve(data);
            }).error(function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        };
             
        return {
            getEffective : getEffective,
            getListId : getListId,
            getPersons : getPersons
        };
    });

}());