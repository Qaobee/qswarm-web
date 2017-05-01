(function () {
    'use strict';
    /**
     * Created by cke on 13/04/16.
     *
     * efficiencyGoalkeeper directive<br />
     *
     * @author christophe Kervella
     * @copyright &lt;b&gt;QaoBee&lt;/b&gt;.
     *
     */

    angular.module('qaobee.widgets.efficiencyGoalkeeper', ['effectifSRV', 'statsRestAPI', 'qaobee.eventbus'])

        .directive('widgetEfficiencyGoalkeeper', function ($log, $translatePartialLoader, statsRestAPI, effectiveSrv, qeventbus, $q, $timeout, filterCalendarSrv) {
            return {
                restrict: 'AE',
                scope: {
                    user: '=',
                    meta: '=',
                    bindtoid: '@',
                    label: '@',
                    padding: '@',
                    values: "=?",
                    widgetTitle: '=?'
                },
                controller: function ($scope) {
                    $translatePartialLoader.addPart('stats');
                    $scope.noStat = false;
                    $scope.widgetTitle = $scope.widgetTitle || 'stats.efficiency.efficiencyTotal';

                    /* efficiency */
                    var getEfficiency = function (ownersId, startDate, endDate) {
                        var deferred = $q.defer();
                        var result = {
                            nbShoot: 0,
                            nbGoal: 0,
                            efficiency: 0
                        };
                        var search = {
                            listIndicators: ['originShootDef'],
                            listOwners: ownersId,
                            startDate: startDate.valueOf(),
                            endDate: endDate.valueOf(),
                            aggregat: 'COUNT',
                            listFieldsGroupBy: ['owner', 'code', 'shootSeqId']
                        };
                        
                        $log.debug('search',search);
                        
                        if (!!$scope.values) {
                            search.values = $scope.values;
                        }
                        var listShootSeqId = [];

                        statsRestAPI.getStatGroupBy(search).success(function (dataOri) {
                            $log.debug('dataOri',dataOri);
                            if (dataOri && dataOri.length) {
                                $scope.noStat = true;
                                result.nbShoot = dataOri.length;
                                dataOri.forEach(function (e) {
                                    listShootSeqId.push(e._id.shootSeqId);
                                });

                                search = {};
                                search = {
                                    listIndicators: ['goalConceded'],
                                    listOwners: ownersId,
                                    startDate: startDate.valueOf(),
                                    endDate: endDate.valueOf(),
                                    listShootSeqId: listShootSeqId,
                                    aggregat: 'COUNT',
                                    listFieldsGroupBy: ['code']
                                };
                                statsRestAPI.getStatGroupBy(search).success(function (dataGoal) {
                                    if (angular.isDefined(dataGoal) && dataGoal.length > 0) {
                                        result.nbGoal = dataGoal[0].value;
                                        result.efficiency = (result.nbGoal / result.nbShoot) * 100;
                                        deferred.resolve(result);
                                    } else {
                                        result.nbGoal = 0;
                                        result.efficiency = 0;
                                        deferred.resolve(result);
                                    }
                                });
                            } else {
                                $scope.noStat = false;
                            }
                        });
                        $scope.loading = false;
                        return deferred.promise;
                    };

                    var buildGraph = function () {
                        if(angular.isUndefined($scope.periodicityActive) || angular.isUndefined($scope.ownersId)) {
                            return;
                        }
                        $scope.loading = true;
                        $scope.efficiency = 0;
                        $scope.nbShoot = 0;
                        $scope.nbGoal = 0;
                        $scope.title = 'stats.efficiency.' + $scope.label;
                        getEfficiency($scope.ownersId, $scope.periodicityActive.startDate, $scope.periodicityActive.endDate).then(function (result) {
                            $scope.nbShoot = result.nbShoot;
                            $scope.nbGoal = result.nbShoot - result.nbGoal;
                            $scope.efficiency = 100 - result.efficiency;
                        });
                    };
                    /* Refresh widget on periodicity change */
                    $scope.$on('qeventbus:periodicityActive', function () {
                        if (angular.isUndefined($scope.periodicityActive) || !angular.equals($scope.periodicityActive, qeventbus.data.periodicityActive)) {
                            $scope.periodicityActive = qeventbus.data.periodicityActive;
                            buildGraph();
                        }
                    });
                    $scope.$on('qeventbus:ownersId', function () {
                        $scope.ownersId = qeventbus.data.ownersId;
                        buildGraph();
                    });

                    $timeout(function () {
                        if (angular.isDefined(filterCalendarSrv.getValue())) {
                            $scope.periodicityActive = filterCalendarSrv.getValue().periodicityActive;
                            buildGraph();
                        }
                    });
                },
                templateUrl: 'app/components/directives/stats/hand/shoots/efficiencyGoalkeeper.html'
            };
        });
}());