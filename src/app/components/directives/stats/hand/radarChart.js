(function () {
    'use strict';
    angular.module('qaobee.radar', [
        'chart.js',
        'statsRestAPI'
    ])

        .directive('qaobeeRadarChart', function (statsRestAPI, $translatePartialLoader, effectiveSrv, qeventbus, $filter, $q, filterCalendarSrv) {
            return {
                restrict: 'E',
                scope: {
                    indicators: '=',
                    title: '@',
                    meta: '=',
                    distinct: '=?',
                    series: '=?',
                    owners: '=?'
                },
                controller: function ($scope, $timeout) {
                    $translatePartialLoader.addPart('stats');
                    $scope.stats = {};
                    $scope.noStat = false;
                    $scope.distinct = $scope.distinct || false;
                    $scope.radarOpts = {
                        scale: {
                            ticks: {
                                fixedStepSize: 1,
                                beginAtZero: true
                            }
                        },
                        legend: {display: $scope.distinct}
                    };
                    /**
                     * Build graphs
                     */
                    $scope.buildDatas = function () {
                        $scope.noStat = false;
                        if (angular.isUndefined($scope.periodicityActive) || angular.isUndefined($scope.owners)) {
                            return;
                        }
                        $scope.stats = {};
                        $scope.loading = true;
                        $scope.data = [];
                        $scope.labels = $scope.indicators.map(function (i) {
                            return $filter('translate')('stats.label.' + i);
                        });
                        var search = {
                            listIndicators: $scope.indicators,
                            listOwners: $scope.owners,
                            startDate: $scope.periodicityActive.startDate.valueOf(),
                            endDate: $scope.periodicityActive.endDate.valueOf(),
                            aggregat: "COUNT",
                            listFieldsGroupBy: ['code']
                        };
                        var promises = [];
                        if ($scope.distinct) {
                            $scope.owners.forEach(function (id) {
                                var tSearch = angular.copy(search);
                                tSearch.listOwners = [id];
                                promises.push(statsRestAPI.getStatGroupBy(tSearch).success(function (data, status, headers, config) {
                                    if (angular.isArray(data) && data.length > 0) {
                                        data.forEach(function (value) {
                                            $scope.stats[config.data.listOwners[0]] = $scope.stats[config.data.listOwners[0]] || {};
                                            $scope.stats[config.data.listOwners[0]][value._id.code] = value.value;
                                        });
                                    }
                                }));
                            });
                        } else {
                            var tSearch = angular.copy(search);
                            promises.push(statsRestAPI.getStatGroupBy(tSearch).success(function (data) {
                                if (angular.isArray(data) && data.length > 0) {
                                    data.forEach(function (value) {
                                        $scope.stats[0] = $scope.stats[0] || {};
                                        $scope.stats[0][value._id.code] = value.value;
                                    });
                                }
                            }));
                        }
                        $q.all(promises).then(function () {
                            $scope.data = [];
                            if ($scope.distinct) {
                                $scope.owners.forEach(function (id) {
                                    var datas = [];
                                    $scope.indicators.forEach(function (i) {
                                        if (!$scope.stats[id]) {
                                            datas.push(0);
                                        } else {
                                            if (!$scope.stats[id][i]) {
                                                datas.push(0);
                                            } else {
                                                datas.push($scope.stats[id][i]);
                                            }
                                        }
                                    });
                                    $scope.data.push(datas);
                                });
                            } else {
                                var datas = [];
                                $scope.indicators.forEach(function (i) {
                                    if (!$scope.stats[0]) {
                                        datas.push(0);
                                    } else {
                                        if (!$scope.stats[0][i]) {
                                            datas.push(0);
                                        } else {
                                            datas.push($scope.stats[0][i]);
                                        }
                                    }
                                });
                                $scope.data.push(datas);
                            }
                            $scope.radarOpts.scale.ticks.fixedStepSize = Math.ceil($scope.data.flatten().max() / 10);
                            $scope.loading = false;
                            $scope.noStat = !Object.isEmpty($scope.stats);
                        });
                    };
                    $timeout(function () {
                        if (angular.isDefined(filterCalendarSrv.getValue())) {
                            $scope.periodicityActive = filterCalendarSrv.getValue().periodicityActive;
                            $scope.buildDatas();
                        }
                    });

                    $scope.$on('qeventbus:periodicityActive', function () {
                        if (angular.isDefined(qeventbus.data.periodicityActive)) {
                            $scope.noStat = false;
                            $scope.periodicityActive = qeventbus.data.periodicityActive;
                            $scope.buildDatas();
                        }
                    });
                    $scope.$on('qeventbus:ownersId', function () {
                        $scope.owners = qeventbus.data.ownersId;
                        $scope.buildDatas();
                    });
                },
                templateUrl: 'app/components/directives/stats/hand/radarChart.html'
            };
        });
})();