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

        .directive('statsActionsPosNeg', function ($translatePartialLoader, qeventbus, statsSrv) {
            return {
                restrict: 'E',
                scope: {
                    bindToId: "@",
                    padding: "=?"
                },
                controller: function ($scope) {
                    $translatePartialLoader.addPart('stats');
                    $scope.noStat = false;

                    $scope.defenseCol = [{"id": "Positive", "index": 0, "type": 'donut', "color": '#9ccc65'},
                        {"id": "Negative", "index": 1, "type": 'donut', "color": '#ef5350'}];
                    $scope.defenseData = [{"Positive": 0}, {"Negative": 0}];

                    $scope.attackCol = [{"id": "Positive", "index": 0, "type": 'donut', "color": '#9ccc65'},
                        {"id": "Negative", "index": 1, "type": 'donut', "color": '#ef5350'}];
                    $scope.attackData = [{"Positive": 0}, {"Negative": 0}];


                    /* actions */
                    var getActions = function (ownersId, startDate, endDate) {


                        /* Search parameters Efficiently global */
                        var listFieldsGroupBy = ['owner'];

                        /* ALL PERS-ACT-DEF-POS */
                        var indicators = ['neutralization', 'forceDef', 'contre', 'interceptionOk'];
                        statsSrv.countAllInstanceIndicators(indicators, ownersId, startDate, endDate, listFieldsGroupBy).then(function (result) {
                            if (!$scope.noStat && result > 0) {
                                $scope.noStat = true;
                            }
                            $scope.defenseData.push({"Positive": result});
                            $scope.defenseCol.push({"id": "Positive", "index": 0, "type": 'donut', "color": '#9ccc65'});
                        });

                        /* ALL PERS-ACT-DEF-NEG */
                        indicators = ['penaltyConceded', 'interceptionKo', 'duelLoose', 'badPosition'];
                        statsSrv.countAllInstanceIndicators(indicators, ownersId, startDate, endDate, listFieldsGroupBy).then(function (result) {
                            if (!$scope.noStat && result > 0) {
                                $scope.noStat = true;
                            }
                            $scope.defenseData.push({"Negative": result});
                            $scope.defenseCol.push({"id": "Negative", "index": 1, "type": 'donut', "color": '#ef5350'});
                        });

                        /* ALL PERS-ACT-OFF-POS */
                        indicators = ['penaltyObtained', 'exclTmpObtained', 'shift', 'duelWon', 'passDec'];
                        statsSrv.countAllInstanceIndicators(indicators, ownersId, startDate, endDate, listFieldsGroupBy).then(function (result) {
                            if (!$scope.noStat && result > 0) {
                                $scope.noStat = true;
                            }
                            $scope.attackData.push({"Positive": result});
                            $scope.attackCol.push({"id": "Positive", "index": 0, "type": 'donut', "color": '#9ccc65'});
                        });

                        /* ALL PERS-ACT-OFF-NEG */
                        indicators = ['forceAtt', 'marcher', 'doubleDribble', 'looseball', 'foot', 'zone', 'stopGKAtt'];
                        statsSrv.countAllInstanceIndicators(indicators, ownersId, startDate, endDate, listFieldsGroupBy).then(function (result) {
                            if (!$scope.noStat && result > 0) {
                                $scope.noStat = true;
                            }
                            $scope.attackData.push({"Negative": result});
                            $scope.attackCol.push({"id": "Negative", "index": 1, "type": 'donut', "color": '#ef5350'});
                        });
                    };


                    var buildGraph = function () {
                        if(angular.isUndefined($scope.startDate) || angular.isUndefined($scope.ownersId)) {
                            return;
                        }
                        $scope.defenseCol = [{"id": "Positive", "index": 0, "type": 'donut', "color": '#9ccc65'},
                            {"id": "Negative", "index": 1, "type": 'donut', "color": '#ef5350'}];
                        $scope.defenseData = [{"Positive": 0}, {"Negative": 0}];

                        $scope.attackCol = [{"id": "Positive", "index": 0, "type": 'donut', "color": '#9ccc65'},
                            {"id": "Negative", "index": 1, "type": 'donut', "color": '#ef5350'}];
                        $scope.attackData = [{"Positive": 0}, {"Negative": 0}];

                        $scope.noStat = false;

                        getActions($scope.ownersId, $scope.startDate, $scope.endDate);
                    };

                    $scope.$on('qeventbus:ownersId', function () {
                        $scope.ownersId = qeventbus.data.ownersId;
                        buildGraph();
                    });
                    $scope.$on('qeventbus:periodicityActive', function () {
                        if (!angular.equals($scope.periodicityActive, qeventbus.data.periodicityActive)) {
                            $scope.noStat = false;
                            $scope.periodicityActive = qeventbus.data.periodicityActive;
                            $scope.startDate = $scope.periodicityActive.startDate;
                            $scope.endDate = $scope.periodicityActive.endDate;
                            buildGraph();
                        }
                    });
                },
                templateUrl: 'app/components/directives/stats/hand/actionsPosNeg.html'
            };
        });
}());