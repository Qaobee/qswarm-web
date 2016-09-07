(function () {
    'use strict';
    angular.module('qaobee.radar', [
            'chart.js',
            'statsRestAPI'
        ])

        .directive('qaobeeRadarChart', function (statsRestAPI, $log, $q, $filter, $translatePartialLoader, qeventbus) {
            return {
                restrict: 'E',
                scope: {
                    indicators: '=',
                    owners: '=',
                    periodicityActive: '=',
                    title: '@',
                    series: '=',
                    meta: '='
                },
                controller: function ($scope) {
                    $translatePartialLoader.addPart('stats');
                    $scope.stats = {};
                    $scope.buildDatas = function () {
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
                        $scope.owners.forEach(function (id) {
                            var tSearch = angular.copy(search);
                            tSearch.listOwners = Array.create(id);
                            promises.push(statsRestAPI.getStatGroupBy(tSearch).success(function (data, status, headers, config) {
                                if (angular.isArray(data) && data.length > 0) {
                                    angular.forEach(data, function (value) {
                                        $scope.stats[config.data.listOwners[0]] = {};
                                        $scope.stats[config.data.listOwners[0]][value._id.code] = value.value;
                                    });
                                }
                                $scope.noData = Object.isEmpty($scope.stats);
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
                    $scope.$on('qeventbus', function () {
                       if(qeventbus.message === 'periodicityActive')  {
                           $scope.periodicityActive = qeventbus.data;
                           $scope.buildDatas();
                       }
                    });
                },
                link: function ($scope) {
                    $scope.$watchGroup(['indicators', 'owners', 'title'], function () {
                        if (angular.isDefined($scope.periodicityActive) && !!$scope.periodicityActive.startDate && !!$scope.periodicityActive.endDate) {
                            $scope.buildDatas();
                        }
                    });
                },
                templateUrl: 'app/components/directives/stats/hand/radarChart.html'
            };
        });
})();