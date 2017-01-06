(function () {
    'use strict';
    /**
     * Module statistic
     *
     * @class qaobee.modules.stats.effectiveStats
     * @author Christophe Kervella
     * @copyright <b>QaoBee</b>.
     * @requires {@link https://docs.angularjs.org/api/ngRoute|ngRoute}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.effectiveRestAPI|qaobee.components.restAPI.sandbox.effective.effectiveRestAPI}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.personRestAPI|qaobee.components.restAPI.sandbox.effective.personRestAPI}
     */
    angular.module('qaobee.effectiveStats', [
        /* qaobee Rest API */
        'effectiveRestAPI',
        'personRestAPI',
        'userRestAPI'
    ])

        .config(function ($routeProvider, metaProvider, userProvider) {
            $routeProvider.when('/private/effectiveStats/:effectiveId', {
                controller: 'EffectiveStats',
                resolve: {
                    user: userProvider.$get,
                    meta: metaProvider.$get
                },
                templateUrl: 'app/modules/sandbox/stats/effective/effectiveStats.html'
            });
        })
        /**
         * @class qaobee.modules.home.HomeControler
         */
        .controller('EffectiveStats', function ($log, $scope, $routeParams, $window, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta,
                                                effectiveRestAPI, personRestAPI, userRestAPI) {
            $translatePartialLoader.addPart('home');
            $translatePartialLoader.addPart('stats');

            $scope.user = user;
            $scope.meta = meta;
            $scope.effectiveId = $routeParams.effectiveId;

            // return button
            $scope.doTheBack = function () {
                $window.history.back();
            };

            $scope.effective = {};
            /* Retrieve list effective */
            $scope.getEffective = function () {

                effectiveRestAPI.getEffective($scope.effectiveId).success(function (data) {
                    $scope.effective = data;
                });
            };

            /* Primary, check if user connected */
            $scope.getEffective();
        });
}());