(function () {
    'use strict';
    angular.module('qaobee.compare.team', [
        'effectifSRV',
        'statsSRV',
        'statsRestAPI',
        'qaobee.commonsConfig'
    ]).config(function ($routeProvider, metaDatasProvider) {

            $routeProvider.when('/private/team/compare/:effectiveId', {
                controller: 'TeamCompareController',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/modules/sandbox/effective/team/compare.html'

            });
        })

        .factory('teamCompareService', function () {
            var compareList = [];
            return {
                get: function () {
                    return compareList;
                },
                add: function (pId) {
                    compareList.push(pId);
                },
                remove: function (pId) {
                    compareList.remove(pId);
                }
            };
        })

        .controller('TeamCompareController', function ($scope, $translatePartialLoader, $log, $q, $filter, teamRestAPI, statsRestAPI, statsSrv, teamCompareService, user, meta, $window, $routeParams) {
            $scope.loading = true;
            $scope.effectiveId = $routeParams.effectiveId;
            $scope.teams = [];
            $scope.teamsIds = [];
            $scope.meta = meta;
            $scope.stats = {
                goals: {},
                sanctions: {},
                originShoot: {}
            };
            $scope.series = [];
            $scope.selectedIds = teamCompareService.get();
            if ($scope.selectedIds.length > 0) {
                getTeams($scope.selectedIds, function (data) {
                    $scope.teams = data;
                    $scope.series = $scope.teams.map(function (p) {
                        return p.label;
                    });
                    $scope.teamsIds = $scope.teams.map(function (p) {
                        return p._id;
                    });
                    $scope.buildWidget();
                });
            } else {
                $scope.loading = false;
            }

            $scope.doTheBack = function () {
                $window.history.back();
            };

            $scope.buildWidget = function () {
                $scope.periodicity = $scope.periodicity || 'season';
                $scope.periodicityActive = $scope.periodicityActive || {
                        label: moment($scope.meta.season.startDate).format('MMMM YYYY') + ' - ' + moment($scope.meta.season.endDate).format('MMMM YYYY'),
                        startDate: moment($scope.meta.season.startDate),
                        endDate: moment($scope.meta.season.endDate),
                        ownersId: $scope.ownersId
                    };
                $scope.periodicityActive.ownersId = $scope.periodicityActive.ownersId || $scope.ownersId;
                if ($scope.teamsIds.length === 0) {
                    return;
                }
                var listFieldsGroupBy = Array.create('code');
                var promises = [];
                var startDate = $scope.periodicityActive.startDate.valueOf();
                var endDate = $scope.periodicityActive.endDate.valueOf();
                $scope.selectedIds.forEach(function (id) {
                    promises.push(statsSrv.countAllInstanceIndicators(Array.create('goalScored', 'goalConceded'), Array.create(id), startDate, endDate, listFieldsGroupBy).then(function (data) {
                        if (angular.isArray(data.data) && data.data.length > 0) {
                            data.data.forEach(function (a) {
                                $scope.stats.goals[data.config.data.listOwners[0]] = a.value;
                            });
                        }
                    }));
                    promises.push(statsSrv.countAllInstanceIndicators(Array.create('originShootAtt', 'originShootDef'), Array.create(id), startDate, endDate, listFieldsGroupBy).then(function (data) {
                        if (angular.isArray(data.data) && data.data.length > 0) {
                            data.data.forEach(function (a) {
                                $scope.stats.originShoot[data.config.data.listOwners[0]] = a.value;
                            });
                        }
                    }));
                    promises.push(statsSrv.countAllInstanceIndicators(Array.create('yellowCard', 'exclTmp', 'redCard'), Array.create(id), startDate, endDate, listFieldsGroupBy).then(function (data) {
                        if (angular.isArray(data.data) && data.data.length > 0) {
                            data.data.forEach(function (a) {
                                $scope.stats.sanctions[data.config.data.listOwners[0]] = a.value;
                            });
                        }
                    }));
                });
                $q.all(promises).then(function () {
                    $scope.loading = false;
                });
            };

            /* Retrieve current effective and list player */
            function getTeams(selectedIds, callback) {
                teamRestAPI.getListTeamHome($scope.meta.sandbox._id, $scope.effectiveId, 'all').then(function (data) {
                    var teams = [];
                    if (angular.isArray(data.data) && data.data.length > 0) {
                        data.data.forEach(function (t) {
                            if (selectedIds.any(t._id)) {
                                teams.push(t);
                            }
                        });
                    }
                    callback(teams);
                });
            }

        });
})();

