(function () {
    'use strict';
    /**
     * Created by cke on 22/12/15.
     *
     * statsGoals directive<br />
     *
     * @author christophe Kervella
     * @copyright &lt;b&gt;QaoBee&lt;/b&gt;.
     *
     */

    angular.module('qaobee.widget.statsGoals', ['statsSRV', 'statsRestAPI', 'qaobee.eventbus'])

        .directive('statsGoals', function ($translatePartialLoader, statsRestAPI, statsSrv, qeventbus, $q, filterCalendarSrv) {
            return {
                restrict: 'E',
                scope: {
                    bindToId: "@",
                    label: "@",
                    sandboxId: "=?"
                },
                controller: function ($scope, $timeout) {
                    $translatePartialLoader.addPart('stats');
                    $scope.noStat = false;


                    /* getStats */
                    var getStats = function (ownersId, startDate, endDate) {
                        var deferred = $q.defer();
                        var result = {
                            nbGame: 0,
                            nbGoal: 0,
                            totalPlayTime: 0
                        };

                        /* get nbCollecte */
                        statsSrv.getMatchsTeams(startDate, endDate, $scope.sandboxId).then(function (data) {
                            if (angular.isArray(data) && data.length > 0) {
                                result.nbGame = data.length;

                                var totalTime = 0;
                                data.forEach(function (e) {
                                    totalTime += (e.parametersGame.periodDuration * e.parametersGame.nbPeriod);
                                });
                                result.totalPlayTime = totalTime;

                                /* Stats Count by indicator */
                                var indicators;
                                if ($scope.bindToId === 'goalScored') {
                                    indicators = ['goalScored','originShootAtt'];
                                } else {
                                    indicators = ['goalConceded','originShootDef'];
                                }

                                var listFieldsGroupBy = ['code'];

                                var search = {
                                    listIndicators: indicators,
                                    listOwners: ownersId,
                                    startDate: startDate.valueOf(),
                                    endDate: endDate.valueOf(),
                                    aggregat: 'COUNT',
                                    listFieldsGroupBy: listFieldsGroupBy
                                };

                                /* Appel stats API */
                                statsRestAPI.getStatGroupBy(search).success(function (data) {
                                    if (angular.isArray(data) && data.length > 0) {
                                        data.forEach(function (a) {
                                            $scope.noStat = true;
                                            if(a._id.code ==='goalScored' || a._id.code ==='goalConceded' ){
                                                result.nbGoal = a.value;
                                            } else {
                                                result.nbShoot = a.value;
                                            }
                                            
                                            
                                        });
                                        deferred.resolve(result);
                                    } else {
                                        deferred.reject('getStats -> problem for : ' + search);
                                    }
                                });
                            } else {
                                $scope.noStat = false;
                            }
                        });

                        return deferred.promise;
                    };

                    var buildWidget = function () {
                        if(angular.isUndefined($scope.periodicityActive) || angular.isUndefined($scope.ownersId)) {
                            return;
                        }
                        $scope.nbGoal = 0;
                        $scope.nbGame = 0;
                        $scope.goalAvg = 0;
                        $scope.totalPlayTime = 0;
                        $scope.title = 'stats.resumeTab.' + $scope.label;
                        getStats($scope.ownersId, $scope.periodicityActive.startDate, $scope.periodicityActive.endDate).then(function (result) {
                            $scope.nbGoal = result.nbGoal;
                            $scope.nbGame = result.nbGame;
                            $scope.goalAvg = $scope.nbGoal / $scope.nbGame;
                            $scope.totalPlayTime = result.totalPlayTime;
                        });
                    };
                    $scope.$on('qeventbus:ownersId', function () {
                        $scope.ownersId = qeventbus.data.ownersId;
                        buildWidget();
                    });
                    $scope.$on('qeventbus:periodicityActive', function () {
                        if (!angular.equals($scope.periodicityActive, qeventbus.data.periodicityActive)) {
                            $scope.noStat = false;
                            $scope.periodicityActive = qeventbus.data.periodicityActive;
                            buildWidget();
                        }
                    });

                    $timeout(function () {
                        if (angular.isDefined(filterCalendarSrv.getValue())) {
                            $scope.periodicityActive = filterCalendarSrv.getValue().periodicityActive;
                            buildWidget();
                        }
                    });
                },
                templateUrl: 'app/components/directives/stats/hand/playerStatus/goals.html'
            };
        });
}());