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
        .controller('AddPlayerControler', function ($log, $scope, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta, effectiveRestAPI, personRestAPI) {

        $translatePartialLoader.addPart('commons');
        $translatePartialLoader.addPart('effective');

        $scope.user = user;
        $scope.meta = meta;
        $scope.effective = [];
        $scope.currentCategory = {};
        
        //Initialisation du nouveau joueur
        $scope.player = {
            status: {
                squadnumber: 0, availability: {
                    value: "available",
                    cause: "available"
                },
                weight: '',
                height: '',
                laterality: "right-footed",
                stateForm: "good"
            }, address: {}, contact: {}
        };
        $scope.licence = {};
        $scope.birthcityFormatedAddress = '';

        $scope.dateOption = {
            minDate: new Date(1900, 0, 1, 1, 0, 1),
            maxDate: new Date()
        };
        $scope.dateOption2 = {
            minDate: new Date(1900, 0, 1, 1, 0, 1),
            maxDate: new Date(2999, 0, 0, 0, 0, 0)
        };
        $scope.dateOption3 = {
            minDate: new Date(1900, 0, 1, 1, 0, 1),
            maxDate: new Date(2999, 0, 0, 0, 0, 0)
        };


    })
    //
    ;
}());
