(function () {
    'use strict';
    angular.module('qaobee.radar', [
            'chart.js',
            'statsRestAPI'
        ])

        .directive('qaobeeRadarChart', function (statsRestAPI, $log, $q, $filter, $translatePartialLoader, qaobeeUtils) {
            return {
                restrict: 'E',
                scope: {
                    indicators: '=',
                    owners: '=',
                    startDate: '=',
                    endDate: '=',
                    title: '@',
                    series: '=',
                    meta: '='
                },
                controller: function ($scope) {
                    $translatePartialLoader.addPart('stats');
                    $scope.stats = {};
                    $scope.rgbaColors = qaobeeUtils.getChartColours();
                    $scope.buildDatas = function () {
                        $scope.loading = true;
                        $scope.data = [];
                        $scope.labels = $scope.indicators.map(function (i) {
                            return $filter('translate')('stats.label.' + i);
                        });
                        var search = {
                            listIndicators: $scope.indicators,
                            listOwners: $scope.owners,
                            startDate: $scope.startDate.valueOf(),
                            endDate: $scope.endDate.valueOf(),
                            aggregat: "COUNT",
                            listFieldsGroupBy: ['code']
                        };
                        var promises = [];
                        $scope.owners.forEach(function (id) {
                            var tSearch = angular.copy(search);
                            tSearch.listOwners = Array.create(id);
                            $scope.stats[id] = {};
                            promises.push(statsRestAPI.getStatGroupBy(tSearch).success(function (data, status, headers, config) {
                                if (angular.isArray(data) && data.length > 0) {
                                    angular.forEach(data, function (value) {
                                        $scope.stats[config.data.listOwners[0]][value._id.code] = value.value;
                                    });
                                }
                            }));
                        });

                        $q.all(promises).then(function () {
                            $scope.data = [];
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
                            $scope.loading = false;
                        });
                    };
                },
                link: function ($scope) {
                    $scope.$watchGroup(['indicators', 'owners', 'startDate', 'endDate', 'title'], function (n, o, scope) {
                        if (!!$scope.startDate && !!$scope.endDate) {
                            $scope.buildDatas();
                        }
                    });
                },
                templateUrl: 'app/components/directives/stats/hand/radarChart.html'
            };
        });
})();