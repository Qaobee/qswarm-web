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

        .config(function ($routeProvider, metaDatasProvider) {
            $routeProvider.when('/private/teamStats/:teamId', {
                controller: 'TeamStats',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/modules/sandbox/stats/team/teamStats.html'
            });
        })
        /**
         * @class qaobee.modules.home.HomeControler
         */
        .controller('TeamStats', function ($log, $scope, $routeParams, $window, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta,
                                           teamRestAPI, personRestAPI, statsRestAPI, statsSrv, userRestAPI, qeventbus) {
            $translatePartialLoader.addPart('home');
            $translatePartialLoader.addPart('stats');
            $translatePartialLoader.addPart('agenda');

            $scope.user = user;
            $scope.meta = meta;
            $scope.ownersId = [];
            $scope.ownersId.push($routeParams.teamId);

            // return button
            $scope.doTheBack = function () {
                $window.history.back();
            };

            //Initialization event
            $scope.initStats = function () {

                $scope.collectes = [];

                if (!user.periodicity) {
                    $scope.periodicity = 'season';
                    $scope.periodicityActive = {
                        label: moment($scope.meta.season.startDate).format('MMMM YYYY') + ' - ' + moment($scope.meta.season.endDate).format('MMMM YYYY'),
                        startDate: moment($scope.meta.season.startDate),
                        endDate: moment($scope.meta.season.endDate),
                        ownersId: $scope.ownersId
                    };
                } else {
                    $scope.periodicity = user.periodicity;
                    $scope.periodicityActive = user.periodicityActive;
                }

                $scope.periodicityActive.ownersId = $scope.ownersId;
                $scope.getTeam();
            };

            /* watch if periodicity change */
            $scope.$watch('periodicityActive', function (newValue, oldValue) {
                if (angular.isDefined(newValue) && !angular.equals(newValue, oldValue)) {
                    $scope.periodicityActive.ownersId = $scope.ownersId;
                    user.periodicity = $scope.periodicity;
                    user.periodicityActive = $scope.periodicityActive;
                    qeventbus.prepForBroadcast("periodicityActive", $scope.periodicityActive);
                    $scope.getStats($scope.ownersId, $scope.periodicityActive.startDate, $scope.periodicityActive.endDate);
                }
            });

            /* get team */
            $scope.getTeam = function () {

                /* get team */
                teamRestAPI.getTeam($routeParams.teamId).success(function (team) {
                    $scope.team = team;
                });
            };

            /* get statistic for one player */
            $scope.getStats = function (ownersId, startDate, endDate) {

                $scope.collectes = [];

                /* get nbCollecte */
                statsSrv.getMatchsTeams(startDate, endDate, $scope.meta.sandbox._id, $routeParams.teamId).then(function (data) {
                    if (angular.isArray(data) && data.length > 0) {
                        data.forEach(function (e) {
                            e.eventRef.startDate = moment(e.eventRef.startDate).format('LLLL');
                            $scope.collectes.push(e);
                        });
                    }
                });
            };

            /* check user connected */
            $scope.checkUserConnected = function () {
                userRestAPI.getUserById(user._id).success(function () {
                    $scope.initStats();
                }).error(function () {
                    $log.error('TeamStats : User not Connected');
                });
            };
            /* Primary, check if user connected */
            $scope.checkUserConnected();
        });
}());