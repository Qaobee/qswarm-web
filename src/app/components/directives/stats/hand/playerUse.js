(function () {
    'use strict';
    /**
     * Created by cke on 22/12/15.
     *
     * statsPlayerUse directive<br />
     *
     * @author christophe Kervella
     * @copyright &lt;b&gt;QaoBee&lt;/b&gt;.
     *
     */

    angular.module('statsPlayerUse', ['statsSRV', 'statsRestAPI', 'qaobee.eventbus'])

        .directive('statsPlayerUse', function ($translatePartialLoader, $log, $q, $filter, statsRestAPI, statsSrv, qeventbus) {
            return {
                restrict: 'E',
                scope: {
                    sandboxId: "=?"
                },
                controller: function ($scope) {
                    $translatePartialLoader.addPart('stats');
                    $scope.noStat = false;
                    /* getStats */
                    var getStats = function (ownersId, startDate, endDate) {
                        var deferred = $q.defer();
                        var result = {
                            nbGame: 0,
                            nbHolder: 0,
                            playTimeAvg: 0
                        };

                        /* get nbCollecte */
                        statsSrv.getMatchsPlayer(startDate, endDate, $scope.sandboxId, ownersId[0]).then(function (data) {
                            if (angular.isArray(data) && data.length > 0) {
                                result.nbGame = data.length;
                                $scope.noStat = true;
                                var indicators = ['totalPlayTime'];
                                var listFieldsGroupBy = ['owner', 'code'];

                                var search = {
                                    listIndicators: indicators,
                                    listOwners: ownersId,
                                    startDate: startDate.valueOf(),
                                    endDate: endDate.valueOf(),
                                    aggregat: 'AVG',
                                    listFieldsGroupBy: listFieldsGroupBy
                                };
                                /* Appel stats API */
                                statsRestAPI.getStatGroupBy(search).success(function (playtime) {
                                    if (angular.isArray(playtime) && playtime.length > 0) {
                                        playtime.forEach(function (a) {
                                            result.playTimeAvg = a.value;
                                        });
                                        /* Stats Count by indicator */
                                        var indicators = [];
                                        indicators.push('holder');
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
                                        statsRestAPI.getStatGroupBy(search).success(function (holder) {
                                            if (angular.isArray(holder) && holder.length > 0) {
                                                holder.forEach(function (a) {
                                                    result.nbHolder = a.value;
                                                });
                                            }
                                            deferred.resolve(result);
                                        });
                                    }
                                });
                            } else {
                                $scope.noStat = false;
                            }
                        });
                        return deferred.promise;
                    };

                    var buildWidget = function () {
                        if(angular.isUndefined($scope.startDate) || angular.isUndefined($scope.ownersId)) {
                            return;
                        }
                        $scope.nbHolder = 0;
                        $scope.nbGame = 0;
                        $scope.playTimeAvg = 0;
                        $scope.title = 'stats.resumeTab.' + $scope.label;
                        getStats($scope.ownersId, $scope.startDate, $scope.endDate).then(function (result) {
                            $log.debug('result', result);
                            $scope.nbHolder = result.nbHolder;
                            $scope.nbGame = result.nbGame;
                            $scope.playTimeAvg = result.playTimeAvg;
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
                            $scope.startDate = $scope.periodicityActive.startDate;
                            $scope.endDate = $scope.periodicityActive.endDate;
                            buildWidget();
                        }
                    });
                },
                templateUrl: 'app/components/directives/stats/hand/playerUse.html'
            };
        });
}());