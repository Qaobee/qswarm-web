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
        'personRestAPI',
        'userRestAPI',
        'qaobee.playerInfos'])

        .config(function ($routeProvider, metaProvider, userProvider) {
            $routeProvider.when('/private/viewPlayer/:playerId', {
                controller: 'ViewPlayerControler',
                resolve: {
                    user: userProvider.$get,
                    meta: metaProvider.$get
                },
                templateUrl: 'app/modules/sandbox/effective/players/viewPlayer.html'
            });
        })

        /**
         * @class qaobee.modules.sandbox.effective.ViewPlayerControler
         * @description Main controller for view viewPlayer.html
         */
        .controller('ViewPlayerControler', function ($log, $scope, $document, $timeout, $routeParams, $window, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta,
                                                     effectiveRestAPI, personRestAPI, userRestAPI) {

            $translatePartialLoader.addPart('commons');
            $translatePartialLoader.addPart('effective');
            $translatePartialLoader.addPart('stats');

            $scope.playerId = $routeParams.playerId;

            $scope.user = user;
            $scope.meta = meta;

            personRestAPI.getPerson($routeParams.playerId).success(function (person) {
                $scope.player = person;
            });


            // return button
            $scope.doTheBack = function () {
                $window.history.back();
            };
        });
}());
