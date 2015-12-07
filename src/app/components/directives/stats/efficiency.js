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

angular.module('statsEfficiency', ['statsSRV'])

    .directive('statsEfficiency', function ($translatePartialLoader, $log, $filter, statsSrv) {
        return {
            restrict: 'E',
            scope: {
                bindToId: "@",
                ownersId: "=?",
                values: "=?",
                label: "@",
                startDate: "=?",
                endDate: "=?"
            },
            controller: function ($scope) {
                $translatePartialLoader.addPart('stats');
                
                $scope.efficientlyCol = [{id: 'data', type: 'gauge', color: '#42a5f5'}];
                $scope.efficientlyData = [{data:0}];
                $scope.nbShoot = 0;
                $scope.nbGoal = 0;
                $scope.title = 'stats.efficiently.'+$scope.label;
                
                $log.debug('bindToId', $scope.bindToId);
                $log.debug('$scope.title', $scope.title);
                
                if(angular.isDefined($scope.values)) {
                    statsSrv.getEfficiently($scope.ownersId, $scope.startDate, $scope.endDate, $scope.values).then(function (result) {
                        $scope.nbShoot = result.nbShoot;
                        $scope.nbGoal = result.nbGoal;
                        $scope.efficientlyData.push({data : result.efficiently});
                        statsSrv.getColorGauge(result.efficiently).then(function (color) {
                            $scope.efficientlyCol[0].color = color;
                        });
                    });
                } else {
                    statsSrv.getEfficiently($scope.ownersId, $scope.startDate, $scope.endDate).then(function (result) {
                        $scope.nbShoot = result.nbShoot;
                        $scope.nbGoal = result.nbGoal;
                        $scope.efficientlyData.push({data : result.efficiently});
                        statsSrv.getColorGauge(result.efficiently).then(function (color) {
                            $scope.efficientlyCol[0].color = color;
                        });
                    });
                }
                
            },
            templateUrl: 'app/components/directives/stats/efficiency.html'
        };
    });