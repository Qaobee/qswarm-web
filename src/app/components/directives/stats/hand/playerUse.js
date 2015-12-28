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
                bindToId: "@",
                label: "@",
                sandboxId: "=?"
            },
            controller: function ($scope) {
                $translatePartialLoader.addPart('stats');

                /* Refresh widget on periodicity change */
                $scope.$on('qeventbus', function () {
                    if ("periodicityActive" === qeventbus.message) {
                        $scope.startDate = qeventbus.data.startDate;
                        $scope.endDate = qeventbus.data.endDate;
                        $scope.ownersId = qeventbus.data.ownersId;
                        buildWidget();
                    }
                });
                
                /* getStats */  
                var getStats = function (ownersId, startDate, endDate, values) {
                    var deferred = $q.defer(); 
                    var search = {};
                    var result = {
                        nbGame : 0,
                        nbHolder : 0,
                        playTimeAvg : 0
                    };
                    
                    /* get nbCollecte */
                    statsSrv.getMatchsTeams(startDate, endDate, $scope.sandboxId).then(function (data) {
                        if (angular.isArray(data) && data.length > 0) {
                            result.nbGame = data.length;
                            
                            var indicators =  Array.create('playTime');
                            listFieldsGroupBy = Array.create('owner', 'code');

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
                                    playtime.forEach(function(a){
                                        result.playTimeAvg = a.value;
                                    });
                                    
                                    /* Stats Count by indicator */
                                    var indicators =  []
                                    indicators.push('holder');

                                    var listFieldsGroupBy = Array.create('code');

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
                                            holder.forEach(function(a){
                                                result.nbHolder = a.value;
                                            });
                                            
                                            deferred.resolve(result);  
                                        } else {
                                            deferred.reject('getStats -> problem for : ' + search);
                                        }
                                    })
                                }
                            })
                        }
                    })

                    return deferred.promise;
                }; 
                
                var buildWidget= function (){
                    $scope.nbHolder = 0;
                    $scope.nbGame = 0;
                    $scope.playTimeAvg = 0;
                    
                    $scope.title = 'stats.resumeTab.'+$scope.label;
                    
                    getStats($scope.ownersId, $scope.startDate, $scope.endDate, $scope.values).then(function (result) {
                        $scope.nbHolder = result.nbHolder;
                        $scope.nbGame = result.nbGame;
                        $scope.playTimeAvg = result.playTimeAvg;
                    });
                }
            },
            templateUrl: 'app/components/directives/stats/hand/playerUse.html'
        };
    });
}());