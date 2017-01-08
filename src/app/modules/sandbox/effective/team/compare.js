(function () {
    'use strict';
    angular.module('qaobee.compare.team', [
        'effectifSRV',
        'statsSRV',
        'statsRestAPI',
        'qaobee.commonsConfig'
    ])
        .config(function ($routeProvider, metaProvider, userProvider) {
            $routeProvider.when('/private/team/compare/:effectiveId', {
                controller: 'TeamCompareController',
                resolve: {
                    user: userProvider.$get,
                    meta: metaProvider.$get
                },
                templateUrl: 'app/modules/sandbox/effective/team/compare.html'

            });
        })

        .factory('teamCompareService', function ($window) {
            var compareList = [];
            return {
                get: function () {
                    return $window.sessionStorage.teamCompareList ? JSON.parse($window.sessionStorage.teamCompareList) : compareList;
                },
                add: function (pId) {
                    compareList.push(pId);
                    $window.sessionStorage.teamCompareList = JSON.stringify(compareList);
                },
                remove: function (pId) {
                    compareList.remove(pId);
                    $window.sessionStorage.teamCompareList = JSON.stringify(compareList);
                },
                init: function () {
                    compareList = [];
                }
            };
        })

        .controller('TeamCompareController', function (qeventbus, $scope, $translatePartialLoader, $q, teamRestAPI, statsRestAPI, teamCompareService, user, meta, $window, $routeParams) {
            $scope.loading = true;
            $scope.effectiveId = $routeParams.effectiveId;
            $scope.teams = [];
            $scope.teamsIds = [];
            $scope.meta = meta;
            $scope.series = [];
            $scope.selectedIds = teamCompareService.get();

            if ($scope.selectedIds.length > 0) {
                $scope.teamsIds = angular.copy($scope.selectedIds);
                getTeams($scope.selectedIds, function (data) {
                    $scope.teams = data;
                    $scope.series = $scope.teams.map(function (p) {
                        return p.label;
                    });
                    qeventbus.prepForBroadcast('ownersId', {
                        ownersId: $scope.selectedIds
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
                            if (selectedIds.some(t._id)) {
                                teams.push(t);
                            }
                        });
                    }
                    callback(teams);
                });
            }

            $scope.$on('qeventbus:periodicityActive', function () {
                $scope.periodicityActive = qeventbus.data.periodicityActive;
                $scope.buildWidget();
            });
        });
})();

