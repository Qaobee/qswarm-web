(function () {
    'use strict';
    /**
     * Module statistic
     *
     * @class qaobee.modules.stats.teamStats
     * @author Christophe Kervella
     * @copyright <b>QaoBee</b>.
     * @requires {@link https://docs.angularjs.org/api/ngRoute|ngRoute}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.effectiveRestAPI|qaobee.components.restAPI.sandbox.effective.effectiveRestAPI}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.personRestAPI|qaobee.components.restAPI.sandbox.effective.personRestAPI}
     */
    angular.module('qaobee.teamStats', [
        'statsSRV',
        'qaobee.eventbus',
        'personRestAPI',
        'statsRestAPI',
        'teamRestAPI',
        'userRestAPI'
    ])

        .config(function ($routeProvider, metaProvider, userProvider) {
            $routeProvider.when('/private/teamStats/:teamId', {
                controller: 'TeamStats',
                resolve: {
                    user: userProvider.$get,
                    meta: metaProvider.$get
                },
                templateUrl: 'app/modules/sandbox/stats/team/teamStats.html'
            });
        })
        /**
         * @class qaobee.modules.home.HomeControler
         */
        .controller('TeamStats', function (qeventbus, teamRestAPI, meta, user, $log, $scope, $routeParams, $window, $translatePartialLoader) {
            $translatePartialLoader.addPart('home');
            $translatePartialLoader.addPart('stats');
            $translatePartialLoader.addPart('agenda');

            $scope.user = user;
            $scope.meta = meta;
            $scope.ownersId = [];
            $scope.collectes = [];
            $scope.ownersId.push($routeParams.teamId);

            // return button
            $scope.doTheBack = function () {
                $window.history.back();
            };

            teamRestAPI.getTeam($routeParams.teamId).success(function (team) {
                $scope.team = team;
                qeventbus.prepForBroadcast('ownersId', {
                    ownersId: $scope.ownersId
                });
            });
        });
}());