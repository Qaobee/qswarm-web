(function () {
    'use strict';
    /**
     * Created by cke on 13/04/16.
     *
     * efficiencyPlayer directive<br />
     *
     * @author christophe Kervella
     * @copyright &lt;b&gt;QaoBee&lt;/b&gt;.
     *
     */

    angular.module('qaobee.widgets.efficiencyPlayer', ['effectifSRV', 'statsRestAPI', 'qaobee.eventbus'])

        .directive('widgetEfficiencyPlayer', function ($translatePartialLoader, $log, $q, $filter, statsRestAPI, effectiveSrv, qeventbus) {
            return {
                restrict: 'AE',
                scope: {
                    user: '=',
                    meta: '=',
                    bindtoid: '@',
                    label: '@',
                    padding: '@',
                    values: "=?"
                },
                controller: function ($scope) {
                    $translatePartialLoader.addPart('stats');
                    $scope.noStat = true;

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
                        if (angular.isDefined(values)) {
                            var valuesDist = '';

                            //OriginShoot
                            if (values === 'values9m') {
                                valuesDist = ['BACKLEFT9', 'CENTER9', 'BACKRIGHT9'];
                            }
                            if (values === 'values7m') {
                                valuesDist = ['PENALTY'];
                            }
                            if (values === 'values6m') {
                                valuesDist = ['BACKLEFT6', 'CENTER6', 'BACKRIGHT6', 'LWING', 'RWING'];
                            }

                            search = {
                                listIndicators: ['originShootAtt'],
                                listOwners: ownersId,
                                startDate: startDate.valueOf(),
                                endDate: endDate.valueOf(),
                                values: valuesDist,
                                aggregat: 'COUNT',
                                listFieldsGroupBy: ['owner', 'code', 'shootSeqId']
                            };
                        } else {
                            search = {
                                listIndicators: ['originShootAtt'],
                                listOwners: ownersId,
                                startDate: startDate.valueOf(),
                                endDate: endDate.valueOf(),
                                aggregat: 'COUNT',
                                listFieldsGroupBy: ['owner', 'code', 'shootSeqId']
                            };
                        }
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

                    var buildGraph = function () {
                        $scope.efficiency = 0;
                        $scope.nbShoot = 0;
                        $scope.nbGoal = 0;
                        $scope.title = 'stats.efficiency.' + $scope.label;
                        getEfficiency($scope.ownersId, $scope.startDate, $scope.endDate).then(function (result) {
                            $scope.nbShoot = result.nbShoot;
                            $scope.nbGoal = result.nbGoal;
                            $scope.efficiency = result.efficiency;
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
                templateUrl: 'app/components/directives/widgets/stats/efficiency/efficiencyPlayer.html'
            };
        });
}());