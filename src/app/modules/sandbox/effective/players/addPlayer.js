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

            $routeProvider.when('/private/addPlayer', {
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
                squadnumber: 0,
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
            $log.log($scope.player);
            toastr.success($filter('translate')('addPlayer.labelsfield.playerLateralityA'));
        };
    })
    
    //
    ;
}());
