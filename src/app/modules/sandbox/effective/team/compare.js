(function () {
    'use strict';
    angular.module('qaobee.compare.team', [
        'effectifSRV',
        'statsSRV',
        'statsRestAPI',
        'qaobee.commonsConfig'
    ]).config(function ($routeProvider, metaProvider, userProvider) {

            $routeProvider.when('/private/team/compare/:effectiveId', {
                controller: 'TeamCompareController',
                resolve: {
                    user: userProvider.$get,
                    meta: metaProvider.$get
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
                },
                init: function () {
                    compareList = [];
                }
            };
        })

        .controller('TeamCompareController', function ($scope, $translatePartialLoader, $log, $q, $filter, teamRestAPI, statsRestAPI, teamCompareService, user, meta, $window, $routeParams) {
            $scope.loading = true;
            $scope.effectiveId = $routeParams.effectiveId;
            $scope.teams = [];
            $scope.teamsIds = [];
            $scope.meta = meta;
            $scope.series = [];
            $scope.selectedIds = teamCompareService.get();
            $scope.periodicity = $scope.periodicity || 'season';
            $scope.periodicityActive = $scope.periodicityActive || {
                    label: moment($scope.meta.season.startDate).format('MMMM YYYY') + ' - ' + moment($scope.meta.season.endDate).format('MMMM YYYY'),
                    startDate: moment($scope.meta.season.startDate),
                    endDate: moment($scope.meta.season.endDate),
                    ownersId: $scope.ownersId
                };
            $scope.periodicityActive.ownersId = $scope.periodicityActive.ownersId || $scope.ownersId;

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

            $scope.$watch('periodicityActive', function () {
                $scope.buildWidget();
            });

            $scope.buildWidget = function () {
                $scope.stats = {
                    goals: {},
                    sanctions: {},
                    originShoot: {}
                };
                if ($scope.teamsIds.length === 0) {
                    return;
                }
                var listFieldsGroupBy = ['code'];
                var promises = [];
                var startDate = $scope.periodicityActive.startDate.valueOf();
                var endDate = $scope.periodicityActive.endDate.valueOf();
                $scope.selectedIds.forEach(function (id) {
                    promises.push(statsRestAPI.getStatGroupBy({
                        listIndicators: ['goalScored', 'goalConceded'],
                        listOwners: [id],
                        startDate: startDate.valueOf(),
                        endDate: endDate.valueOf(),
                        aggregat: 'COUNT',
                        listFieldsGroupBy: listFieldsGroupBy
                    }).then(function (data) {
                        if (angular.isArray(data.data) && data.data.length > 0) {
                            data.data.forEach(function (a) {
                                $scope.stats.goals[data.config.data.listOwners[0]] = a.value;
                            });
                        }
                    }));
                    promises.push(statsRestAPI.getStatGroupBy({
                        listIndicators: ['originShootAtt', 'originShootDef'],
                        listOwners: [id],
                        startDate: startDate.valueOf(),
                        endDate: endDate.valueOf(),
                        aggregat: 'COUNT',
                        listFieldsGroupBy: listFieldsGroupBy
                    }).then(function (data) {
                        if (angular.isArray(data.data) && data.data.length > 0) {
                            data.data.forEach(function (a) {
                                $scope.stats.originShoot[data.config.data.listOwners[0]] = a.value;
                            });
                        }
                    }));
                    promises.push(statsRestAPI.getStatGroupBy({
                        listIndicators: ['yellowCard', 'exclTmp', 'redCard'],
                        listOwners: [id],
                        startDate: startDate.valueOf(),
                        endDate: endDate.valueOf(),
                        aggregat: 'COUNT',
                        listFieldsGroupBy: listFieldsGroupBy
                    }).then(function (data) {
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

