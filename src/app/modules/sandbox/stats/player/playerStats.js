(function () {
    'use strict';
    /**
     * Module statistic
     *
     * @class qaobee.modules.stats.playerStats
     * @author Christophe Kervella
     * @copyright <b>QaoBee</b>.
     * @requires {@link https://docs.angularjs.org/api/ngRoute|ngRoute}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.effectiveRestAPI|qaobee.components.restAPI.sandbox.effective.effectiveRestAPI}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.personRestAPI|qaobee.components.restAPI.sandbox.effective.personRestAPI}
     */
    angular.module('qaobee.playerStats', [
        'statsSRV',
        'qaobee.eventbus',
        'personRestAPI',
        'qaobee.playerStatsComp'
    ])

        .config(function ($routeProvider, metaProvider, userProvider) {
            $routeProvider.when('/private/playerStats/:playerId', {
                controller: 'PlayerStats',
                resolve: {
                    user: userProvider.$get,
                    meta: metaProvider.$get
                },
                templateUrl: 'app/modules/sandbox/stats/player/playerStats.html'
            });
        })
        /**
         * @class qqaobee.playerStats.PlayerStats
         */
        .controller('PlayerStats', function ($scope, $routeParams, $window, $translatePartialLoader, personRestAPI, user, meta) {
            $translatePartialLoader.addPart('home');
            $translatePartialLoader.addPart('stats');
            $scope.user = user;
            $scope.meta = meta;
            personRestAPI.getPerson($routeParams.playerId).success(function (player) {
                $scope.player = player;
            });
            $scope.doTheBack = function () {
                $window.history.back();
            };
        });
}());