
(function () {
    'use strict';
    /**
     * Module qaobee services
     * 
     * @class app.components.services.person
     * @author Christophe Kervella
     * @copyright <b>QaoBee</b>.
     */
    angular.module('personSRV', [
        
        /* qaobee Rest API */
        'effectiveRestAPI',
        'personRestAPI',
        'locationAPI'])

    .factory('personSrv', function($log, $q, locationAPI, personRestAPI, effectiveRestAPI) {

        /* Format address */
        var formatAddress = function (address) {
            var deferred = $q.defer(); 
            
            // TODO : à factoriser sur les conditions address.formatedAddress et address.formatted_address
            // Formattage de l'adresse à partir du FormatedAddress
            if (angular.isDefined(address.formatedAddress) && !address.formatedAddress.isBlank()) {
                locationAPI.get(address.formatedAddress).then(function (adr) {
                    $log.debug(adr);
                    address.lat = adr.data.results[0].geometry.location.lat;
                    address.lng = adr.data.results[0].geometry.location.lng;
                    angular.forEach(adr.data.results[0].address_components, function (item) {
                        if (item.types.count('street_number') > 0) {
                            address.place = item.long_name + ' ';
                        }
                        if (item.types.count('route') > 0) {
                            address.place += item.long_name;
                        }
                        if (item.types.count('locality') > 0) {
                            address.city = item.long_name;
                        }
                        if (item.types.count('postal_code') > 0) {
                            address.zipcode = item.long_name;
                        }
                        if (item.types.count('country') > 0) {
                            address.country = item.long_name;
                        }
                    });

                    deferred.resolve(address);
                });
            } else if (angular.isDefined(address.formatted_address) && !address.formatted_address.isBlank()) {
                // Formattage de l'adresse à partir du résultat de l'API Google
            	var adr = {};
            	adr.lat = address.geometry.location.lat();
            	adr.lng = address.geometry.location.lng();
            	adr.formatedAddress = address.formatted_address;
            	angular.forEach(address.address_components, function (item) {
                    if (item.types.count('street_number') > 0) {
                    	adr.place = item.long_name + ' ';
                    }
                    if (item.types.count('route') > 0) {
                    	adr.place += item.long_name;
                    }
                    if (item.types.count('locality') > 0) {
                    	adr.city = item.long_name;
                    }
                    if (item.types.count('postal_code') > 0) {
                    	adr.zipcode = item.long_name;
                    }
                    if (item.types.count('country') > 0) {
                    	adr.country = item.long_name;
                    }
                });
                deferred.resolve(adr);
                
            } else {
                deferred.resolve(address);
            }
            return deferred.promise;
        };
        
        /* Create a new SB_Person */
        var addPlayer = function (player, sandboxId) {
            var deferred = $q.defer(); 
            
            player.name = player.name.capitalize(true);
            player.firstname = player.firstname.capitalize(true);
            player.sandboxId = sandboxId ;
            player.birthdate = moment(player.birthdate).valueOf();
            
            var dataContainer = {
                person: player
            };

            /* add person */
            personRestAPI.addPerson(dataContainer).success(function (person) {    
                deferred.resolve(person);
            });
            
            return deferred.promise;
        };
        
        /* update a SB_Person */
        var updatePlayer = function (player) {
            var deferred = $q.defer(); 
            
            player.name = player.name.capitalize(true);
            player.firstname = player.firstname.capitalize(true);
            player.birthdate = moment(player.birthdate).valueOf();

            /* update person */
            personRestAPI.updatePerson(player).success(function (person) {    
                deferred.resolve(person);
            });
            
            return deferred.promise;
        };
        
        /* add a member to SB_Effective */
        var addEffectiveMember = function (person, effectiveId) {
            var deferred = $q.defer(); 
            
            effectiveRestAPI.getEffective(effectiveId).success(function (data) {   
                var effective = data;

                if(angular.isDefined(effective)) {
                    var roleMember = {code : 'player', label: 'Joueur'};
                    var member = {personId : person._id, role: roleMember};
                    var memberList = effective.members;
    
                    if(memberList){
                        effective.members.push(member);
                    } else {
                        effective.members = [];
                        effective.members.push(member);
                    }

                    /* Update effective members list */
                    effectiveRestAPI.update(effective).success(function (data) {
                        deferred.resolve(data);
                    });
                }
            });
            
            return deferred.promise;
        };
             
        return {
            formatAddress : formatAddress,
            addPlayer : addPlayer,
            updatePlayer : updatePlayer,
            addEffectiveMember : addEffectiveMember
        };
    });

}());