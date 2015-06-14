/**
 * Created by xavier on 29/10/14.
 */

/**
 * Header menu and auth directive<br />
 *
 * @author Xavier MARIN
 * @class qaobee.directives.widget.statWidget
 * @copyright &lt;b&gt;QaoBee&lt;/b&gt;.
 *
 */
angular.module('statWidget', ['chart.js', 'statAPI', 'eventbus'])

    .directive("statWidget", function ($log, statAPI, $filter, $translatePartialLoader, eventbus) {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                data: '=?',
                statHeight: '@',
                editable: '=?',
                screen: '=?',
                meta: '='
            },
            controller: function ($scope) {
                $translatePartialLoader.addPart('stats');
                $translatePartialLoader.addPart('widgets');
                $translatePartialLoader.addPart('format');
                $scope.loaded = false;
                if (angular.isUndefined($scope.editable)) {
                    $scope.editable = false;
                }
                $scope.ownersLoaded = false;
                $scope.stats = [];
                $scope.statHeight = parseInt($scope.statHeight, 10);
                $scope.flipped = false;
                $scope.myChart = {
                    options: {
                        animation: true,
                        scaleLineColor: '#666',
                        scaleFontSize: 10,
                        scaleFontColor: '#666',
                        tooltipFontSize: 10,
                        tooltipTitleFontSize: 10,
                        maintainAspectRatio: false,
                        animationEasing: "easeOutQuart"
                    },
                    data: {
                        labels: [],
                        series: [],
                        datasets: [[]]
                    }
                };


                function buildGraph() {
                    $scope.loaded = false;
                    if ($scope.data === null) {
                        return;
                    }
                    var val = $filter('translate')('stat.' + $scope.data.stat + '.val');
                    if (!isNaN(val)) {
                        val = parseInt(val, 10);
                    }
                    
                    var search = {
                        listIndicators: Array.create($scope.data.stat),
                        listOwners: $scope.data.owners,
                        startDate: $scope.meta.season.startDate,
                        endDate: $scope.meta.season.endDate,
                        value: val,
                        aggregat: $scope.data.aggregat,
                        listFieldsGroupBy: $scope.data.listFieldsGroupBy,
                        listFieldsSortBy : $scope.data.listFieldsSortBy,
                        limitResult : $scope.data.limitResult
                    };
                    
                    var type = 1;
                    if ($scope.data.type === 'Pie' || $scope.data.type === 'PolarArea' || $scope.data.type === 'Doughnut' || $scope.data.type === 'Radar') {
                        type = 2;
                    }
                    var lineColors = '#fff';
                    if ($scope.data.color === 'muted') {
                        lineColors = '#000';
                    }
                    switch (type) {
                        case 1 :
                            $scope.myChart.data.series = Array.create($filter('translate')('stat.' + $scope.data.stat + '.libelle'));
                            statAPI.getStatGroupBy(search).success(function (data) {
                                $scope.myChart.data.labels = [];
                                $scope.myChart.data.datasets = [[]];
                                $scope.myChart.options.scaleOverride = true;
                                $scope.myChart.options.scaleStartValue = 0;
                                $scope.myChart.options.scaleStepWidth = 20;
                                $scope.myChart.options.scaleSteps = 5;
                                
                                /* Dans certains il faut inverser l'ordre du tableau (exemple l'affichage de l'assiduite */
                                var inverseSort = $scope.data.inverseSort;
                                if(inverseSort) {
                                    data.reverse();
                                }
                                
                                data.forEach(function (a) {
                                    $scope.myChart.data.labels.push(moment(a._id.timer).format($filter('translate')('date.format')));
                                    $scope.myChart.data.datasets[0].push(parseFloat($filter('number')(a.value * 100, 2)));
                                });
                                
                                if (data.length === 0) {
                                    $scope.myChart.data.series = Array.create($filter('translate')('stat.novalue', {name: $filter('translate')('stat.' + $scope.data.stat + '.libelle')}));
                                }
                                $scope.loaded = true;
                            });
                            break;
                        case 2 :
                            statAPI.getStatGroupBy(search).success(function (data) {
                                var datasets = [];
                                var labels = [];
                                data.forEach(function (a) {
                                    datasets.push(a.value);
                                    labels.push($filter('translate')('stat.' + $scope.data.stat + '.value.' + a._id.value));
                                });

                                // see http://easings.net/fr
                                $scope.myChart = {
                                    options: {
                                        scaleLineColor: lineColors,
                                        scaleFontSize: 10,
                                        scaleFontColor: lineColors,
                                        tooltipFontSize: 10,
                                        tooltipTitleFontSize: 10,
                                        maintainAspectRatio: false,
                                        animationEasing: "easeOutBack"
                                    },
                                    data: {
                                        labels: labels,
                                        datasets: datasets
                                    }
                                };
                                if (data.length === 0) {
                                    if ($scope.data.type !== 'Radar') {
                                        datasets.push(0);
                                        labels.push(Array.create($filter('translate')('stat.novalue', {name: $filter('translate')('stat.' + $scope.data.stat + '.libelle')})));
                                    } else {
                                        $scope.myChart.data.datasets = [datasets];
                                    }
                                    $scope.myChart.data.series = Array.create($filter('translate')('stat.novalue', {name: $filter('translate')('stat.' + $scope.data.stat + '.libelle')}));
                                } else {
                                    if ($scope.data.type === 'Radar' && data.length > 0) {
                                        $scope.myChart.data.datasets = [datasets];
                                        $scope.myChart.data.series = Array.create($filter('translate')('stat.' + $scope.data.stat + '.libelle'));
                                    }
                                }
                                $scope.loaded = true;
                            });
                            break;
                        case 3 :
                            statAPI.getListDetailValue(search).success(function (data) {
                                if (angular.isUndefined(data) || data === null) {
                                    return;
                                }
                                $log.debug(data);
                                var dataset = [];
                                data.forEach(function (a) {
                                    dataset.push({value: a.listParam.value, color: "#F38630"});
                                });
                                $scope.myChart = {"data": {datasets: dataset}, "options": {}};
                                $scope.loaded = true;
                            });
                            break;
                        default :
                            break;
                    }
                }

                $scope.data.prom.then(function (result) {
                        fetchStatNames();
                        $scope.data.owners = result;
                        $scope.data.color = $scope.data.color || 'muted';
                        $scope.data.type = $scope.data.type || 'Line';
                        $scope.data.stat = $scope.data.stat || '';
                        $scope.stats.forEach(function (a) {
                            if (a.code === $scope.data.stat[0]) {
                                $scope.curstat = a;
                            }
                        });
                        $scope.type = $scope.data.type;
                        buildGraph();
                    }
                );
                $scope.$on('eventbus', function () {
                    if ("ownersId" === eventbus.message) {
                        $scope.data.owners = eventbus.data;
                        buildGraph();
                    }
                });


                function fetchStatNames() {
                    statAPI.getSimpleList({
                        activityId: $scope.meta.season.activityId,
                        countryId: $scope.meta.season.countryId,
                        screen: [$scope.screen]
                    }).success(function (data) {
                        $scope.stats = data;
                        data.forEach(function (a) {
                            $log.debug('codestat ' + a.code);
                            if (a.code === $scope.data.stat[0]) {
                                $scope.curstat = a;
                            }
                        });
                    });
                }

                $scope.toggle = function () {
                    $scope.flipped = !$scope.flipped;
                    if (!$scope.flipped) {
                        $scope.data.type = $scope.type;
                        $scope.data.stat = $scope.curstat.code;
                        buildGraph();
                    }
                };

                $scope.$on('$destroy', function () {
                    delete $scope.myChart;
                });
            },
            templateUrl: 'app/components/widgets/stat/statWidget.html'
        };
    })
;
