(function () {
    'use strict';
    /**
     * Module add player
     *
     * @author Christophe Kervella
     * @class qaobee.modules.sandbox.effective.player.updatePlayer
     * @namespace qaobee.modules.sandbox.effective.player
     *
     * @requires {@link qaobee.components.restAPI.sandbox.effective.effectiveRestAPI|qaobee.components.restAPI.sandbox.effective.effectiveRestAPI}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.personRestAPI|qaobee.components.restAPI.sandbox.effective.personRestAPI}
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.updatePlayer', [
        
        /* qaobee Rest API */
        'effectiveRestAPI', 
        'personRestAPI',
        'locationAPI'])


        .config(function ($routeProvider, metaDatasProvider) {

            $routeProvider.when('/private/updatePlayer/:playerId', {
                controller: 'UpdatePlayerControler',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/modules/sandbox/effective/players/writePlayer.html'

            });
        })

    /**
     * @class qaobee.modules.sandbox.effective.UpdatePlayerControler
     * @description Main controller for view updatePlayer.html
     */
        .controller('UpdatePlayerControler', function ($log, $scope, $routeParams, $window, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta, activityCfgRestAPI, personRestAPI, locationAPI) {

        $translatePartialLoader.addPart('commons');
        $translatePartialLoader.addPart('effective');
        $translatePartialLoader.addPart('stats');
        
        $scope.playerId = $routeParams.playerId;

        $scope.user = user;
        $scope.meta = meta;
        $scope.player = {};
        $scope.currentCategory = {};
        $scope.positionsType = {};
        
        $scope.addPlayerTitle = false;
        
        // return button
        $scope.doTheBack = function() {
            $window.history.back();
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
        
        /* get person */
        personRestAPI.getPerson($scope.playerId).success(function (person) {
            $scope.player = person;

            if (angular.isDefined($scope.player.status.positionType)) {
                    $scope.player.positionType = $filter('translate')('stat.positionType.value.' + $scope.player.status.positionType);
            } else {
                $scope.player.positionType = '';
            }

            if (angular.isDefined($scope.player.status.stateForm)) {
                $scope.player.stateForm = $filter('translate')('stat.stateForm.value.' + $scope.player.status.stateForm);
            } else {
                $scope.player.stateForm = '';
            }

            $scope.player.birthdate = new Date(moment($scope.player.birthdate));
        });
        
        /* update person */
        $scope.writePerson = function () {
            
            $scope.player.name = $scope.player.name.capitalize(true);
            $scope.player.firstname = $scope.player.firstname.capitalize(true);
            $scope.player.birthdate = moment($scope.player.birthdate).valueOf();
            
            personRestAPI.updatePerson($scope.player).success(function (person) {
                toastr.success($filter('translate')('updatePlayer.toastSuccess', {
                    firstname: person.firstname,
                    name: person.name
                }));

                $window.history.back();
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
