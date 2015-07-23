(function () {
    'use strict';
    /**
     * Module add player
     *
     * @author Christophe Kervella
     * @class qaobee.modules.sandbox.effective.player.viewPlayer
     * @namespace qaobee.modules.sandbox.effective.player
     *
     * @requires {@link qaobee.components.restAPI.sandbox.effective.effectiveRestAPI|qaobee.components.restAPI.sandbox.effective.effectiveRestAPI}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.personRestAPI|qaobee.components.restAPI.sandbox.effective.personRestAPI}
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.viewPlayer', [
        
        /* qaobee Rest API */
        'effectiveRestAPI', 
        'personRestAPI'])


        .config(function ($routeProvider, metaDatasProvider) {

            $routeProvider.when('/private/viewPlayer', {
                controller: 'ViewPlayerControler',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/modules/sandbox/effective/players/viewPlayer.html'

            });
        })

    /**
     * @class qaobee.modules.sandbox.effective.ViewPlayerControler
     * @description Main controller for view viewPlayer.html
     */
        .controller('ViewPlayerControler', function ($log, $scope, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta, effectiveRestAPI, personRestAPI) {

        $translatePartialLoader.addPart('effective');

        $scope.user = user;
        $scope.meta = meta;
        $scope.effective = [];
        $scope.currentCategory = {};


    })
    //
    ;
}());
