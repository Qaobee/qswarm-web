(function () {
    'use strict';
    /**
     * Created by cke on 22/12/15.
     *
     * efficiency directive<br />
     *
     * @author christophe Kervella
     * @copyright &lt;b&gt;QaoBee&lt;/b&gt;.
     *
     */

    angular.module('statsActionsPosNeg', ['statsSRV', 'qaobee.eventbus'])

        .directive('statsActionsPosNeg', function ($translatePartialLoader, $log, $q, $filter, statsSrv, qeventbus) {
            return {
                restrict: 'E',
                scope: {
                    bindToId: "@",
                    padding: "=?"
                },
                controller: function ($scope) {
                    $translatePartialLoader.addPart('stats');
                    $scope.noStat = false;
                    
                    $scope.defenseCol = [{"id": "Positive", "index":0 ,"type": 'donut', "color": '#9ccc65'},
                                        {"id": "Negative", "index":1 ,"type": 'donut', "color": '#ef5350'}];
                    $scope.defenseData = [{"Positive":0}, {"Negative":0}];

                    $scope.attackCol = [{"id": "Positive", "index":0 ,"type": 'donut', "color": '#9ccc65'},
                                       {"id": "Negative", "index":1 ,"type": 'donut', "color": '#ef5350'}];
                    $scope.attackData = [{"Positive":0}, {"Negative":0}];
           
                    /* Refresh widget on periodicity change */
                    $scope.$on('qeventbus', function () {
                        if ("periodicityActive" === qeventbus.message) {
                            $scope.startDate = qeventbus.data.startDate;
                            $scope.endDate = qeventbus.data.endDate;
                            $scope.ownersId = qeventbus.data.ownersId;
                            buildGraph();
                        }
                    });

                    /* actions */  
                    var getActions = function (ownersId, startDate, endDate) {
                        

                        /* Search parameters Efficiently global */
                        var listFieldsGroupBy = Array.create('owner');
                        
                        /* ALL PERS-ACT-DEF-POS */
                        var indicators =  Array.create('neutralization', 'forceDef', 'contre', 'interceptionOk');
                        statsSrv.countAllInstanceIndicators(indicators, ownersId, startDate, endDate, listFieldsGroupBy).then(function (result) {
                            if(!$scope.noStat && result>0) {
                                $scope.noStat = true;
                            }
                            $scope.defenseData.push({"Positive": result});
                            $scope.defenseCol.push({"id": "Positive", "index":0 ,"type": 'donut', "color": '#9ccc65'});
                        });

                        /* ALL PERS-ACT-DEF-NEG */
                        var indicators =  Array.create('penaltyConceded', 'interceptionKo', 'duelLoose', 'badPosition');
                        statsSrv.countAllInstanceIndicators(indicators, ownersId, startDate, endDate, listFieldsGroupBy).then(function (result) {
                            if(!$scope.noStat && result>0) {
                                $scope.noStat = true;
                            }
                            $scope.defenseData.push({"Negative": result});
                            $scope.defenseCol.push({"id": "Negative", "index":1 ,"type": 'donut', "color": '#ef5350'});
                        });

                        /* ALL PERS-ACT-OFF-POS */
                        var indicators =  Array.create('penaltyObtained', 'exclTmpObtained', 'shift', 'duelWon', 'passDec');
                        statsSrv.countAllInstanceIndicators(indicators, ownersId, startDate, endDate, listFieldsGroupBy).then(function (result) {
                            if(!$scope.noStat && result>0) {
                                $scope.noStat = true;
                            }
                            $scope.attackData.push({"Positive": result});
                            $scope.attackCol.push({"id": "Positive", "index":0 ,"type": 'donut', "color": '#9ccc65'});
                        });

                        /* ALL PERS-ACT-OFF-NEG */
                        var indicators =  Array.create('forceAtt', 'marcher', 'doubleDribble', 'looseball', 'foot', 'zone', 'stopGKAtt');
                        statsSrv.countAllInstanceIndicators(indicators, ownersId, startDate, endDate, listFieldsGroupBy).then(function (result) {
                            if(!$scope.noStat && result>0) {
                                $scope.noStat = true;
                            }
                            $scope.attackData.push({"Negative": result});
                            $scope.attackCol.push({"id": "Negative", "index":1 ,"type": 'donut', "color": '#ef5350'});
                        });
                    };

                    
                    var buildGraph= function (){
                        $scope.defenseCol = [{"id": "Positive", "index":0 ,"type": 'donut', "color": '#9ccc65'},
                                        {"id": "Negative", "index":1 ,"type": 'donut', "color": '#ef5350'}];
                        $scope.defenseData = [{"Positive":0}, {"Negative":0}];

                        $scope.attackCol = [{"id": "Positive", "index":0 ,"type": 'donut', "color": '#9ccc65'},
                                           {"id": "Negative", "index":1 ,"type": 'donut', "color": '#ef5350'}];
                        $scope.attackData = [{"Positive":0}, {"Negative":0}];
                        
                        $scope.noStat = false;

                        getActions($scope.ownersId, $scope.startDate, $scope.endDate);
                    }
                },
                templateUrl: 'app/components/directives/stats/hand/actionsPosNeg.html'
            };
        });
}());