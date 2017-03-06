(function () {
    'use strict';
    /**
     * Module statistic
     *
     * @class qaobee.modules.stats.mainStats
     * @author Christophe Kervella
     * @copyright <b>QaoBee</b>.
     * @requires {@link https://docs.angularjs.org/api/ngRoute|ngRoute}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.effectiveRestAPI|qaobee.components.restAPI.sandbox.effective.effectiveRestAPI}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.personRestAPI|qaobee.components.restAPI.sandbox.effective.personRestAPI}
     */
    angular.module('qaobee.stats', [

        /* qaobee Rest API */
        'effectiveRestAPI',
        'eventsRestAPI',
        'personRestAPI',
        'userRestAPI',

        /* qaobee module */
        'qaobee.effectiveStats',
        'qaobee.eventStats',
        'qaobee.teamStats',

        /* c3 angular directive */
        'gridshore.c3js.chart',

        /* qaobee widget */
        'statsEfficiency',
        'statsGoals',
        'statsPlayerUse',
        'statsSanction',
        'statsActionsPosNeg'
    ])

        .config(function ($routeProvider, metaProvider, userProvider) {
            $routeProvider.when('/private/mainStats', {
                controller: 'MainStats',
                resolve: {
                    user: userProvider.$get,
                    meta: metaProvider.$get
                },
                templateUrl: 'app/modules/sandbox/stats/mainStats.html'

            });
        })
        /**
         * @class qaobee.modules.home.HomeControler
         */
        .controller('MainStats', function ($log, $scope, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta,
                                           effectiveRestAPI, personRestAPI, eventsRestAPI, userRestAPI) {
            $translatePartialLoader.addPart('home');
            $translatePartialLoader.addPart('stats');

            $scope.user = user;
            $scope.meta = meta;

            $scope.showGraph = function () {
                $scope.chart = c3.generate({
                    bindto: '#chart',
                    data: {
                        columns: [
                            ['data1', 30, 200, 100, 400, 150, 250],
                            ['data2', 50, 20, 10, 40, 15, 25]
                        ]
                    }
                });
            };

            /* check user connected */
            $scope.checkUserConnected = function () {
                userRestAPI.getUserById(user._id).success(function () {
                    $scope.showGraph();
                }).error(function () {
                    $log.error('MainStats : User not Connected');
                });
            };
            /* Primary, check if user connected */
            $scope.checkUserConnected();
        });
}());