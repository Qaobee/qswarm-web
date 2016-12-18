(function () {
    'use strict';
    angular.module('qaobee.stat.detail.modal', ['statsRestAPI'])

        .directive('qaobeeStatDetailModal', function ($q, $filter, $translatePartialLoader, qaobeeUtils, statsRestAPI, ChartJs) {
            return {
                restrict: 'E',
                scope: {
                    indicators: '=',
                    title: '=',
                    meta: '=',
                    owners: '=',
                    series: '=',
                    periodicityActive: '=?',
                    periodicity: '=?'
                },
                controller: function ($scope) {
                    $scope.loaded = false;
                    $scope.dateFormat = $filter('translate')('commons.format.date.moment');
                    $scope.tabular = [];
                    $scope.loading = true;
                    $translatePartialLoader.addPart('stats');
                    $translatePartialLoader.addPart('commons');
                    $scope.uid = qaobeeUtils.guid();
                    $scope.currentIndicator = $scope.indicators[0];
                    $scope.periodicity = $scope.periodicity || 'season';
                    $scope.periodicityActive = $scope.periodicityActive || {
                            label: moment($scope.meta.season.startDate).format('MMMM YYYY') + ' - ' + moment($scope.meta.season.endDate).format('MMMM YYYY'),
                            startDate: moment($scope.meta.season.startDate),
                            endDate: moment($scope.meta.season.endDate),
                            ownersId: $scope.owners
                        };
                    $scope.periodicityActive.ownersId = $scope.periodicityActive.owners || $scope.owners;
                    $scope.stats = {};
                    $scope.legendColours = ChartJs.getOptions().colours;
                    $scope.stats = {};

                    /**
                     * Build graphs
                     */
                    $scope.buildDatas = function () {
                        $scope.loading = true;
                        $scope.noData = false;
                        $scope.stats = {};
                        $scope.tab = [];
                        $scope.data = [];
                        $scope.indicatorLabels = $scope.indicators.map(function (i) {
                            return $filter('translate')('stats.label.' + i);
                        });
                        var search = {
                            listIndicators: Array.create($scope.currentIndicator),
                            listOwners: $scope.owners,
                            startDate: $scope.periodicityActive.startDate.valueOf(),
                            endDate: $scope.periodicityActive.endDate.valueOf(),
                            listFieldsGroupBy: ['code']
                        };
                        var promises = [];
                        $scope.owners.forEach(function (id) {
                            var tSearch = angular.copy(search);
                            tSearch.listOwners = Array.create(id);
                            promises.push(statsRestAPI.getListDetailValue(tSearch).success(function (data, status, headers, config) {
                                if (angular.isArray(data) && data.length > 0) {
                                    angular.forEach(data, function (value) {
                                        var time = moment(value.timer).format($scope.dateFormat);
                                        if (!$scope.stats[time]) {
                                            $scope.stats[time] = [];
                                            $scope.stats[time][config.data.listOwners[0]] = 0;
                                        }

                                        $scope.stats[time][config.data.listOwners[0]] += parseInt(value.value);
                                    });
                                }
                            }));
                            var tSearch2 = angular.copy(tSearch);
                            $scope.tab[id] = {};
                            tSearch2.listIndicators = $scope.indicators;
                            tSearch2.aggregat = "COUNT";
                            promises.push(statsRestAPI.getStatGroupBy(tSearch2).success(function (data, status, headers, config) {
                                if (angular.isArray(data) && data.length > 0) {
                                    angular.forEach(data, function (value) {
                                        $scope.tab[config.data.listOwners[0]][value._id.code] = parseInt(value.value);
                                    });
                                }
                            }));
                        });

                        $q.all(promises).then(function () {
                            $scope.data = [];
                            $scope.labels = [];
                            $scope.tabular = [];
                            if (Object.keys($scope.stats).length === 0) {
                                $scope.noData = true;
                            } else {
                                $scope.labels = Object.keys($scope.stats).sortBy(function (n) {
                                    return moment(n, $scope.dateFormat);
                                });
                                $scope.owners.forEach(function (id) {
                                    var datas = [];
                                    $scope.labels.forEach(function (time) {
                                        if (!$scope.stats[time][id]) {
                                            datas.push(0);
                                        } else {
                                            datas.push($scope.stats[time][id]);
                                        }
                                    });
                                    $scope.data.push(datas);
                                });
                            }
                            $scope.owners.forEach(function (id) {
                                var datas = [];
                                $scope.indicators.forEach(function (i) {
                                    if (!$scope.tab[id]) {
                                        datas.push(0);
                                    } else {
                                        if (!$scope.tab[id][i]) {
                                            datas.push(0);
                                        } else {
                                            datas.push($scope.tab[id][i]);
                                        }
                                    }

                                });
                                $scope.tabular.push(datas);
                            });
                            $scope.loading = false;
                        });
                    };

                    /**
                     * Open modal
                     * @param uid
                     */
                    $scope.openDetail = function (uid) {
                        var modal = angular.element('#modal-' + uid);
                        modal.detach();
                        angular.element('body').append(modal);
                        angular.element('#modal-' + uid).modal('open');
                    };

                    /**
                     * Close modal
                     * @param uid
                     */
                    $scope.close  = function (uid) {
                        angular.element('#modal-' + uid).modal('close');
                    };

                    $scope.$watchGroup(['indicators', 'currentIndicator', 'owners', 'periodicity', 'periodicityActive'], function (newValues) {
                        $scope.indicators = newValues[0];
                        $scope.currentIndicator = newValues[1];
                        $scope.owners = newValues[2];
                        $scope.periodicity = newValues[3];
                        $scope.periodicityActive = newValues[4];
                        if (!!$scope.periodicityActive.startDate && !!$scope.periodicityActive.endDate || !!currentIndicator) {
                            $scope.buildDatas();
                        }
                    });
                },
                link: function () {
                    angular.element('select').material_select();
                    angular.element('.modal').modal();
                },
                templateUrl: 'app/components/directives/stats/hand/detailModal.html'
            };
        });
})();