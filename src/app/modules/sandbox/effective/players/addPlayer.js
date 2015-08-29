(function () {
    'use strict';
    /**
     * Module add player
     *
     * @author Christophe Kervella
     * @class qaobee.modules.sandbox.effective.player.addPlayer
     * @namespace qaobee.modules.sandbox.effective.player
     *
     * @requires {@link qaobee.components.restAPI.sandbox.effective.effectiveRestAPI|qaobee.components.restAPI.sandbox.effective.effectiveRestAPI}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.personRestAPI|qaobee.components.restAPI.sandbox.effective.personRestAPI}
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.addPlayer', [
        /* angular modules*/
        'mgo-angular-wizard',
        
        /* qaobee Rest API */
        'activityCfgRestAPI',
        'effectiveRestAPI', 
        'personRestAPI',
        'locationAPI'])


        .config(function ($routeProvider, metaDatasProvider) {

            $routeProvider.when('/private/addPlayer/:effectiveId', {
                controller: 'AddPlayerControler',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/modules/sandbox/effective/players/writePlayer.html'

            });
        })

    /**
     * @class qaobee.modules.sandbox.effective.AddPlayerControler
     * @description Main controller for view addPlayer.html
     */
        .controller('AddPlayerControler', function ($log, $http, $scope, $routeParams, $window, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta, activityCfgRestAPI, effectiveRestAPI, personRestAPI, locationAPI) {

        $translatePartialLoader.addPart('commons');
        $translatePartialLoader.addPart('effective');
        
        $scope.effectiveId = $routeParams.effectiveId;

        $scope.user = user;
        $scope.meta = meta;
        $scope.effective = [];
        $scope.currentCategory = {};
        $scope.positionsType = {};
        
        $scope.addPlayerTitle = true;
        
        // return button
        $scope.doTheBack = function() {
            $window.history.back();
        };
        
        //Initialisation du nouveau joueur
        $scope.player = {
            status: {
                availability : {
                    value : 'available',
                    cause : 'available'
                },
                squadnumber: '',
                weight: '',
                height: '',
                laterality: '',
                stateForm: 'good'
            }, 
            address: {}, 
            contact: {}
        };
        
        /* init ngAutocomplete*/
        $scope.options = {};
        $scope.options.watchEnter = true;
        $scope.optionsCountry = {
            types: 'geocode'
        };
        $scope.detailsCountry = '';
        
        $scope.optionsCity = {
            types: '(cities)'
        };
        $scope.detailsCity = '';
        
        $scope.optionsAdr = null;
        $scope.detailsAdr = '';
        
        /* Retrieve list of positions type */
        activityCfgRestAPI.getParamFieldList(moment().valueOf(), $scope.meta.activity._id, $scope.meta.structure.country._id, 'listPositionType').success(function (data) {
            $scope.positionsType = data;
        });
        
        /* Create a new person and add to effective */
        $scope.writePerson = function () {
            
            $scope.player.name = $scope.player.name.capitalize(true);
            $scope.player.firstname = $scope.player.firstname.capitalize(true);
            $scope.player.sandboxId = $scope.meta.sandbox._id ;
            $scope.player.birthdate = moment($scope.player.birthdate).valueOf();
            
            var dataContainer = {
                person: $scope.player
            };

            /* add person */
            personRestAPI.addPerson(dataContainer).success(function (person) {
                
                /* add player in effective*/
                effectiveRestAPI.getEffective($scope.user.effectiveDefault).success(function (data) {
                    
                    var effective = data;
                    
                    if(angular.isDefined(effective)) {
                        var roleMember = {code : 'player', label: 'Joueur'};
                        var member = {personId : person._id,
                                     role: roleMember};
                        effective.members.push(member);
                        
                        /* Update effective members list */
                        effectiveRestAPI.update(effective).success(function (data) {
                            toastr.success($filter('translate')('addPlayer.toastSuccess', {
                            firstname: person.firstname,
                            name: person.name,
                            effective: effective.categoryAge.label
                        }));

                        $window.history.back();
                        });
                    }
                });
            });
        };
        
        /* Format address */
        $scope.checkAndformatPerson = function () {
            if (angular.isDefined($scope.player.address.formatedAddress) && !$scope.player.address.formatedAddress.isBlank()) {
                locationAPI.get($scope.player.address.formatedAddress).then(function (adr) {
                    $scope.player.address.lat = adr.data.results[0].geometry.location.lat;
                    $scope.player.address.lng = adr.data.results[0].geometry.location.lng;
                    angular.forEach(adr.data.results[0].address_components, function (item) {
                        if (item.types.count('street_number') > 0) {
                            $scope.player.address.place = item.long_name + ' ';
                        }
                        if (item.types.count('route') > 0) {
                            $scope.player.address.place += item.long_name;
                        }
                        if (item.types.count('locality') > 0) {
                            $scope.player.address.city = item.long_name;
                        }
                        if (item.types.count('postal_code') > 0) {
                            $scope.player.address.zipcode = item.long_name;
                        }
                        if (item.types.count('country') > 0) {
                            $scope.player.address.country = item.long_name;
                        }
                    });
                    
                    $scope.writePerson();
                });
            } else {
                $scope.writePerson();
            }
        };
    })
    
    //
    ;
}());
