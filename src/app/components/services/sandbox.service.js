(function () {
    'use strict';
    /**
     * Module qaobee services
     * 
     * @class app.components.services.sandbox
     * @author Christophe Kervella
     * @copyright <b>QaoBee</b>.
     */
    angular.module('sandboxSRV', [
        
        /* qaobee Rest API */
        'effectiveRestAPI',
        'eventsRestAPI',
        'personRestAPI',
        'teamRestAPI',
        'userRestAPI',])

    .factory('effectiveSrv', function($log, $q, effectiveRestAPI, personRestAPI) {
        
        var currentEffective = {};
        var listMember = [];
        var listId = [];
       
        /* sequenceur */  
        var getMembers = function(effectiveId, listField, roleMember) {
            var deferred = $q.defer(); 
            
            getEffective(effectiveId, roleMember).then(function(){
                getPersons(listId, listField).then(function(){
                    deferred.resolve(listMember);
                });
            });
            
            return deferred.promise;
        };
        
        /* get Effective */  
        var getEffective = function (effectiveId, roleMember) {
            var deferred = $q.defer(); 
            effectiveRestAPI.getEffective(effectiveId).success(function (data) {

                currentEffective = data;
                if(angular.isDefined(currentEffective.members) && currentEffective.members.length>0) {
                    currentEffective.members.forEach(function (b) {
                        if (b.role.code===roleMember) {
                            listId.push(b.personId);
                        }    
                    });
                }
                deferred.resolve(listId);

            })
            return deferred.promise;
        };
        
        
        /* get persons */  
        var getPersons = function (listId, listField) {
            var deferred = $q.defer(); 

            personRestAPI.getListPerson(listId, listField).success(function (data) {
                listMember = data;
                deferred.resolve(data);
            }).error(function (error) {
                deferred.reject(error);
            });
            
            return deferred.promise;
        };
             
        return {
            members : getMembers
        }
    });

}());