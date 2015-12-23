/**
 * Created by xavier on 03/11/14.
 */
/**
 * palmares effective directive<br />
 *
 * @author Xavier MARIN
 * @class qaobee.directives.widget.palmaresEffective
 * @copyright &lt;b&gt;QaoBee&lt;/b&gt;.
 *
 */

angular.module('statsEfficiency', ['statsRestAPI'])

    .directive('statsEfficiency', function ($translatePartialLoader, $log, $q, $filter, statsRestAPI) {
        return {
            restrict: 'E',
            scope: {
                bindToId: "@",
                ownersId: "=?",
                values: "=?",
                label: "@",
                startDate: "=?",
                endDate: "=?",
                padding: "=?"
            },
            controller: function ($scope) {
                $translatePartialLoader.addPart('stats');
                
                $scope.efficiencyGlobalCol = [{id: 'dataG', type: 'gauge', color: '#42a5f5'}];
                $scope.efficiencyGlobalData = [{dataG:0}];
                $scope.efficiency9mCol = [{id: 'data9', type: 'gauge', color: '#42a5f5'}];
                $scope.efficiency9mData = [{data9:0}];
                $scope.efficiency6mCol = [{id: 'data6', type: 'gauge', color: '#42a5f5'}];
                $scope.efficiency6mData = [{data6:0}];
                $scope.efficiency7mCol = [{id: 'data7', type: 'gauge', color: '#42a5f5'}];
                $scope.efficiency7mData = [{data7:0}];
                
                $scope.nbShoot = 0;
                $scope.nbGoal = 0;
                $scope.title = 'stats.efficiency.'+$scope.label;
                
                $log.debug('owners',$scope.ownersId);
                
                /* efficiency */  
                var getEfficiency = function (ownersId, startDate, endDate, values) {
                    var deferred = $q.defer(); 
                    var search = {};
                    var result = {
                        nbShoot : 0,
                        nbGoal : 0,
                        efficiency : 0
                    };

                    /* Search parameters Efficiently global */
                    if(angular.isDefined(values)) {
                        search = {
                            listIndicators: ['originShootAtt'],
                            listOwners: ownersId,
                            startDate: startDate.valueOf(),
                            endDate: endDate.valueOf(),
                            values: values,
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
                            var efficacite = 0;

                            if (angular.isDefined(dataGoal[0]) && dataGoal !== null) {
                                result.nbGoal = dataGoal[0].value;
                                result.efficiency = (result.nbGoal / result.nbShoot) * 100;
                                deferred.resolve(result);  
                            } else {
                                deferred.reject('getEfficiency -> problem for : ' + search);
                            }
                        });
                    });
                    return deferred.promise;
                };

                /* color gauge */  
                var getColorGauge = function (efficiently) {
                    var deferred = $q.defer(); 

                    if (efficiently<25) {
                        deferred.resolve('#ef5350');
                    } else if(efficiently>=25 && efficiently<50) {
                         deferred.resolve('#ffb74d');
                    } else if(efficiently>=50 && efficiently<75) {
                         deferred.resolve('#29b6f6');
                    } else if(efficiently>75) {
                         deferred.resolve('#9ccc65');
                    } else {
                        deferred.reject('');
                    }
                    return deferred.promise;
                };
                
                if(angular.isDefined($scope.values)) {
                    getEfficiency($scope.ownersId, $scope.startDate, $scope.endDate, $scope.values).then(function (result) {
                        $scope.nbShoot = result.nbShoot;
                        $scope.nbGoal = result.nbGoal;
                        
                        if($scope.bindToId==='gaugeEfficiency9m'){
                            $scope.efficiency9mData.push({data9 : result.efficiency});
                            getColorGauge(result.efficiency).then(function (color) {
                                $scope.efficiency9mCol[0].color = color;
                            });
                        }
                        
                        if($scope.bindToId==='gaugeEfficiency7m'){
                            $scope.efficiency7mData.push({data7 : result.efficiency});
                            getColorGauge(result.efficiency).then(function (color) {
                                $scope.efficiency7mCol[0].color = color;
                            });
                        }
                        
                        if($scope.bindToId==='gaugeEfficiency6m'){
                            $scope.efficiency6mData.push({data6 : result.efficiency});
                            getColorGauge(result.efficiency).then(function (color) {
                                $scope.efficiency6mCol[0].color = color;
                            });
                        }
                        
                    });
                } else {
                    getEfficiency($scope.ownersId, $scope.startDate, $scope.endDate).then(function (result) {
                        $scope.nbShoot = result.nbShoot;
                        $scope.nbGoal = result.nbGoal;
                        
                        $scope.efficiencyGlobalData.push({dataG : result.efficiency});
                        getColorGauge(result.efficiency).then(function (color) {
                            $scope.efficiencyGlobalCol[0].color = color;
                        });
                    });
                }
                
            },
            templateUrl: 'app/components/directives/stats/hand/efficiency.html'
        };
    });