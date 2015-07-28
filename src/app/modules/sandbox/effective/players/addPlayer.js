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
        'effectiveRestAPI', 
        'personRestAPI'])


        .config(function ($routeProvider, metaDatasProvider) {

            $routeProvider.when('/private/addPlayer/:sandBoxCfgId', {
                controller: 'AddPlayerControler',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/modules/sandbox/effective/players/addPlayer.html'

            });
        })

    /**
     * @class qaobee.modules.sandbox.effective.AddPlayerControler
     * @description Main controller for view addPlayer.html
     */
        .controller('AddPlayerControler', function ($log, $http, $scope, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta, effectiveRestAPI, personRestAPI) {

        $translatePartialLoader.addPart('commons');
        $translatePartialLoader.addPart('effective');

        $scope.user = user;
        $scope.meta = meta;
        $scope.effective = [];
        $scope.currentCategory = {};
        
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
        
        $scope.finishedWizard = function () {
            
            
        };
        
        $scope.addPerson = function () {
            
            $scope.player.name = $scope.player.name.capitalize(true);
            $scope.player.firstname = $scope.player.firstname.capitalize(true);
            $log.debug($scope.player);
            
            var dataContainer = {
                person: $scope.player
            };

            /* add person */
            personRestAPI.addPerson(dataContainer).success(function (person) {
                $log.debug(person);
                
                /* add player in effective*/
                effectiveRestAPI.getListMemberEffective($scope.meta._id, $scope.currentCategory.code).success(function (data) {
                    
                    var effective = {};
                    data.forEach(function (a) {
                        $log.debug(a);
                        effective = a;                        
                    });
                    
                    if(angular.isDefined(effective)) {
                        var roleMember = {code : 'player', label: 'Joueur'};
                        var member = {personId : person._id,
                                     role: roleMember};
                        effective.members.push(member);
                        
                        /* Update effective members list */
                        effectiveRestAPI.update(effective).success(function (data) {
                            toastr.success($filter('translate')('addPlayer.toastSuccess', {
                            firstname: person.firstname,
                            name: person.name
                        }));

                        $location.path('private/effective');
                        });
                    }
                });
            });
        };
    })
    
    //
    ;
}());
