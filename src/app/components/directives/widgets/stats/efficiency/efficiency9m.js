(function () {
    'use strict';
    /**
     * Created by cke on 13/04/16.
     *
     * efficiency9m directive<br />
     *
     * @author christophe Kervella
     * @copyright &lt;b&gt;QaoBee&lt;/b&gt;.
     *
     */

    angular.module('qaobee.widgets.efficiency9m', ['effectifSRV', 'statsRestAPI', 'qaobee.eventbus'])

        .directive('widgetEfficiencyNine', function ($translatePartialLoader, $log, $q, $filter, statsRestAPI, effectiveSrv, qeventbus) {
            return {
                restrict: 'AE',
                scope: {
                    user: '=',
                    meta: '=',
                    values: "=?",
                    bindtoid: '@',
                    label: '@',
                    padding: '@'
                },
                controller: function ($scope) {
                    $translatePartialLoader.addPart('stats');
                    $scope.noStat = true;

                    $scope.efficiency9mCol = [{id: 'data9', type: 'gauge', color: '#42a5f5'}];
                    $scope.efficiency9mData = [{data9: 0}];
                    

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
                        var valuesDist = ['BACKLEFT9', 'CENTER9', 'BACKRIGHT9'];
                        search = {
                            listIndicators: ['originShootAtt'],
                            listOwners: ownersId,
                            startDate: startDate.valueOf(),
                            endDate: endDate.valueOf(),
                            values: valuesDist,
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
                        
                        $scope.efficiency9mCol = [{id: 'data9', type: 'gauge', color: '#42a5f5'}];
                        $scope.efficiency9mData = [{data9: 0}];
                        

                        $scope.nbShoot9m = 0;
                        $scope.nbGoal9m = 0;
                        $scope.title = 'stats.efficiency.' + $scope.label;
                        
                        getEfficiency($scope.ownersId, $scope.startDate, $scope.endDate, $scope.values).then(function (result) {
                            $scope.nbShoot9m = result.nbShoot;
                            $scope.nbGoal9m = result.nbGoal;

                            if ($scope.bindtoid === 'gaugeEfficiency9m') {
                                $scope.efficiency9mData.push({data9: result.efficiency});
                                getColorGauge(result.efficiency).then(function (color) {
                                    $scope.efficiency9mCol[0].color = color;
                                });
                            }


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
                templateUrl: 'app/components/directives/widgets/stats/efficiency/efficiency9m.html'
            };
        });
}());