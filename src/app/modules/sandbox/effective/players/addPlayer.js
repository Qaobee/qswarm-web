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
        'personRestAPI'])


        .config(function ($routeProvider, metaDatasProvider) {

            $routeProvider.when('/private/addPlayer/:effectiveId', {
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
        .controller('AddPlayerControler', function ($log, $http, $scope, $routeParams, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta, activityCfgRestAPI, effectiveRestAPI, personRestAPI) {

        $translatePartialLoader.addPart('commons');
        $translatePartialLoader.addPart('effective');
        
        $scope.effectiveId = $routeParams.effectiveId;

        $scope.user = user;
        $scope.meta = meta;
        $scope.effective = [];
        $scope.currentCategory = {};
        $scope.positionsType = {};
        
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
        
        $log.debug($scope.meta);
        $log.debug($scope.user);
        
        /* Retrieve list of positions type */
        activityCfgRestAPI.getParamFieldList(moment().valueOf(), $scope.meta.activity._id, $scope.meta.structure.country._id, 'listPositionType').success(function (data) {
            $scope.positionsType = data;
        });
        
        /* Create a new person and add to effective */
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
