(function () {
    'use strict';
    /**
     * Created by cke on 13/04/16.
     *
     * efficiencyGB directive<br />
     *
     * @author christophe Kervella
     * @copyright &lt;b&gt;QaoBee&lt;/b&gt;.
     *
     */

    angular.module('qaobee.widgets.efficiencyGB', ['effectifSRV', 'statsRestAPI', 'qaobee.eventbus'])

        .directive('widgetEfficiencyGB', function ($translatePartialLoader, $log, $q, $filter, statsRestAPI, effectiveSrv, qeventbus) {
            return {
                restrict: 'AE',
                scope: {
                    user: '=',
                    meta: '=',
                    bindtoid: '@',
                    label: '@',
                    padding: '@'
                },
                controller: function ($scope) {
                    $translatePartialLoader.addPart('stats');
                    $scope.noStat = true;

                    $scope.efficiencyGlobalCol = [{id: 'dataG', type: 'gauge', color: '#42a5f5'}];
                    $scope.efficiencyGlobalData = [{dataG: 0}];
                    

                    /* efficiency */
                    var getEfficiency = function (ownersId, startDate, endDate, values) {
                        var deferred = $q.defer();
                        var search = {};
                        var result = {
                            nbShoot: 0,
                            nbGoal: 0,
                            efficiency: 0
                        };

                        /* Search parameters Efficiently global */
                        search = {
                            listIndicators: ['originShootAtt'],
                            listOwners: ownersId,
                            startDate: startDate.valueOf(),
                            endDate: endDate.valueOf(),
                            aggregat: 'COUNT',
                            listFieldsGroupBy: ['owner', 'code', 'shootSeqId']
                        };
                        
                        var listShootSeqId = [];

                        statsRestAPI.getStatGroupBy(search).success(function (dataOri) {
                            if (dataOri && dataOri.length) {
                                $scope.noStat = true;
                                result.nbShoot = dataOri.length;
                                dataOri.forEach(function (e) {
                                    listShootSeqId.push(e._id.shootSeqId);
                                });

                                search = {};
                                search = {
                                    listIndicators: ['goalScored'],
                                    listOwners: ownersId,
                                    startDate: startDate.valueOf(),
                                    endDate: endDate.valueOf(),
                                    listShootSeqId: listShootSeqId,
                                    aggregat: 'COUNT',
                                    listFieldsGroupBy: ['code']
                                };
                                statsRestAPI.getStatGroupBy(search).success(function (dataGoal) {
                                    if (angular.isDefined(dataGoal[0]) && dataGoal !== null) {
                                        result.nbGoal = dataGoal[0].value;
                                        result.efficiency = (result.nbGoal / result.nbShoot) * 100;
                                        deferred.resolve(result);
                                    } else {
                                        deferred.reject('getEfficiency -> problem for : ' + search);
                                    }
                                });
                            } else {
                                $scope.noStat = false;
                            }
                        });
                        return deferred.promise;
                    };

                    /* color gauge */
                    var getColorGauge = function (efficiently) {
                        var deferred = $q.defer();

                        if (efficiently < 25) {
                            deferred.resolve('#ef5350');
                        } else if (efficiently >= 25 && efficiently < 50) {
                            deferred.resolve('#ffb74d');
                        } else if (efficiently >= 50 && efficiently < 75) {
                            deferred.resolve('#29b6f6');
                        } else if (efficiently > 75) {
                            deferred.resolve('#9ccc65');
                        } else {
                            deferred.reject('');
                        }
                        return deferred.promise;
                    };

                    var buildGraph = function () {
                        
                        $scope.efficiencyGlobalCol = [{id: 'dataG', type: 'gauge', color: '#42a5f5'}];
                        $scope.efficiencyGlobalData = [{dataG: 0}];
                        

                        $scope.nbShoot = 0;
                        $scope.nbGoal = 0;
                        $scope.title = 'stats.efficiency.' + $scope.label;
                        
                        getEfficiency($scope.ownersId, $scope.startDate, $scope.endDate).then(function (result) {
                            $scope.nbShoot = result.nbShoot;
                            $scope.nbGoal = result.nbGoal;

                            $scope.efficiencyGlobalData.push({dataG: result.efficiency});

                            getColorGauge(result.efficiency).then(function (color) {
                                $scope.efficiencyGlobalCol[0].color = color;
                            });
                        });
                    };
                    /* Refresh widget on periodicity change */
                    $scope.$on('qeventbus', function () {
                        if ("periodicityActive" === qeventbus.message) {
                            $scope.startDate = qeventbus.data.startDate;
                            $scope.endDate = qeventbus.data.endDate;
                            $scope.ownersId = qeventbus.data.ownersId;
                            buildGraph();
                        }
                    });
                },
                templateUrl: 'app/components/directives/widgets/stats/efficiency/efficiencyGB.html'
            };
        });
}());