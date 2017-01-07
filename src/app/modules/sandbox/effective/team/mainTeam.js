(function () {
    'use strict';
    /**
     * Module dashboard team
     *
     * @author Christophe Kervella
     * @class qaobee.modules.sandbox.effective.team.Mainteam
     * @namespace qaobee.modules.sandbox.effective.team
     *
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.teams', [
        /* angular qaobee */
        'ngAutocomplete',
        'qaobee.compare.team',
        /* qaobee modules */
        'qaobee.addTeam',
        'qaobee.updateTeam',

        /* qaobee services */
        'effectifSRV',

        /* qaobee Rest API */
        'effectiveRestAPI',
        'teamRestAPI',
        'userRestAPI'])


        .config(function ($routeProvider, metaProvider, userProvider) {
            $routeProvider.when('/private/teams/:effectiveId', {
                controller: 'MainTeamController',
                resolve: {
                    user: userProvider.$get,
                    meta: metaProvider.$get
                },
                templateUrl: 'app/modules/sandbox/effective/team/mainTeam.html'
            });
        })

        /**
         * @class qaobee.modules.sandbox.effective.team.MainTeamControler
         * @description Main controller for view mainTeam.html
         */
        .controller('MainTeamController', function ($scope, $routeParams, $translatePartialLoader, $location, $filter, qeventbus,
                                                    user, meta, effectiveSrv, teamRestAPI, userRestAPI, teamCompareService) {

            $translatePartialLoader.addPart('effective');
            $translatePartialLoader.addPart('commons');
            $translatePartialLoader.addPart('home');

            $scope.effectiveId = $routeParams.effectiveId;

            $scope.user = user;
            $scope.meta = meta;
            $scope.listTeamHome = [];
            $scope.compareList = {};
            teamCompareService.init();

            if (user.mainTeamTabId) {
                $scope.activeTabIndex = user.mainTeamTabId;
            } else {
                $scope.activeTabIndex = 0;
            }

            /* keep in memory tab by default */
            $scope.changeTabDefault = function (tabId) {
                user.mainTeamTabId = tabId;
            };

            $scope.compare = function () {
                if (Object.keys($scope.compareList).length > 0) {
                    $location.path('/private/team/compare/' + $scope.effectiveId);
                    return false;
                } else {
                    toastr.error($filter('translate')('compare.team-min'));
                }
            };

            $scope.updateTeamToCompare = function (id) {
                var count = 0;
                if ($scope.compareList[id]) {
                    teamCompareService.add(id);
                } else {
                    teamCompareService.remove(id);
                }
                Object.keys($scope.compareList, function () {
                    count++;
                });
                if (count > 3 && $scope.compareList[id]) {
                    toastr.error($filter('translate')('compare.team-max', {'max': 3}));
                    teamCompareService.remove(id);
                    delete $scope.compareList[id];
                }
            };

            /* Retrieve list of team of effective */
            $scope.getListTeamHome = function () {
                teamRestAPI.getListTeamHome($scope.meta.sandbox._id, $scope.meta.sandbox.effectiveDefault, 'all').success(function (data) {
                    $scope.listTeamHome = data.sortBy(function (n) {
                        return n.label;
                    });
                });
                effectiveSrv.getEffective($scope.meta.sandbox.effectiveDefault).then(function (data) {
                    $scope.currentEffective = data;
                    effectiveSrv.getListId($scope.currentEffective, 'player').then(function (listId) {
                        $scope.ownersId = listId;
                        qeventbus.prepForBroadcast('ownersId', {
                            ownersId: listId
                        });
                    });
                });
            };

            $scope.getListTeamHome();
        });
}());

