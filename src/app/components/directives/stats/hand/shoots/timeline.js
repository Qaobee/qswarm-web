(function () {
    'use strict';
    /**
     * Created by cke on 24/12/17.
     *
     * timeline directive<br />
     *
     * @author christophe Kervella
     * @copyright &lt;b&gt;QaoBee&lt;/b&gt;.
     *
     */

    angular.module('qaobee.widget.timelineShoot', ['statsRestAPI', 'qaobee.eventbus'])

        .directive('statsTimelineShoot', function ($translatePartialLoader, statsRestAPI, qeventbus, $q, effectiveSrv, filterCalendarSrv, $log) {
            return {
                restrict: 'AE',
                scope: {
                    user: '=',
                    meta: '='
                },
                controller: function ($scope, $timeout) {
                    $translatePartialLoader.addPart('stats');
                    $scope.noStat = true;
                    $scope.shoots = [];
                    $scope.players = [];
                    $scope.goalConceded = 0;
                    $scope.goalScored = 0;
                    
                    $scope.interval5 = [];
                    $scope.interval10 = [];
                    $scope.interval15 = [];
                    $scope.interval20 = [];
                    $scope.interval25 = [];
                    $scope.interval30 = [];
                    $scope.interval35 = [];
                    $scope.interval40 = [];
                    $scope.interval45 = [];
                    $scope.interval50 = [];
                    $scope.interval55 = [];
                    $scope.interval60 = [];

                    /* efficiency */
                    var getStats = function () {
                        var deferred = $q.defer();
                        var search = {};
                        
                        var listId = [];

                        $scope.players.forEach(function (e) {
                            listId.push(e._id);
                        });

                        search = {
                            listIndicators: ['originShootAtt', 'originShootDef', 'impactShootAtt', 'impactShootDef', 'goalScored', 'goalConceded'],
                            listOwners: listId,
                            startDate: $scope.periodicityActive.startDate.valueOf(),
                            endDate: $scope.periodicityActive.endDate.valueOf(),
                            aggregat: 'COUNT',
                            listFieldsGroupBy: ['owner', 'code']
                        };

                        var listShootSeqId = [];

                        statsRestAPI.getListDetailValue(search).success(function (dataOri) {
                            if (dataOri && dataOri.length) {
                                $scope.noStat = true;
                                
                                dataOri.sortBy(function (n) {
                                    return n.chrono;
                                });
                                
                                dataOri.forEach(function (e) {
                                    listShootSeqId.push(e._id.shootSeqId);
                                    
                                    if(e.code==='goalScored' || e.code ==='goalConceded'){
                                        
                                        if(e.code==='goalScored'){
                                            $scope.goalScored++;
                                        } else {
                                            $scope.goalConceded++;
                                        }
                                        e.scoreUs = $scope.goalScored;
                                        e.scoreThem = $scope.goalConceded;
                                        
                                        var i = -1;
                                        e.owner.forEach(function (b) {
                                            i = $scope.players.findIndex(function (n) {
                                                return n._id === b;
                                            });
                                        });
                                        e.name = $scope.players[i].name;
                                        e.firstname = $scope.players[i].firstname;
                                        
                                        var mm = moment().minute(Math.floor(e.chrono/60));
                                        var ss = moment().second((e.chrono-(mm.minute()*60)));
                                        var timeChrono = moment(mm).format('mm')+':'+moment(ss).format('ss');
                                        
                                        if(e.chrono<300){
                                            $scope.interval5.push(e);
                                        } else {
                                            if(e.chrono>=301 && e.chrono<600){
                                                $scope.interval10.push(e);
                                            } else {
                                                if(e.chrono>=601 && e.chrono<900){
                                                    $scope.interval15.push(e);
                                                } else {
                                                    if(e.chrono>=901 && e.chrono<1200){
                                                        $scope.interval20.push(e);
                                                    } else {
                                                        if(e.chrono>=1201 && e.chrono<1500){
                                                            $scope.interval25.push(e);
                                                        } else {
                                                            if(e.chrono>=1501 && e.chrono<1800){
                                                                $scope.interval30.push(e);
                                                            } else {
                                                                if(e.chrono>=1801 && e.chrono<2100){
                                                                    $scope.interval35.push(e);
                                                                } else {
                                                                    if(e.chrono>=2101 && e.chrono<2400){
                                                                        $scope.interval40.push(e);
                                                                    } else {
                                                                        if(e.chrono>=2401 && e.chrono<2700){
                                                                            $scope.interval45.push(e);
                                                                        } else {
                                                                            if(e.chrono>=2701 && e.chrono<3000){
                                                                                $scope.interval50.push(e);
                                                                            } else {
                                                                                if(e.chrono>=3001 && e.chrono<3300){
                                                                                    $scope.interval55.push(e);
                                                                                } else {
                                                                                    if(e.chrono>=3301){
                                                                                        $scope.interval60.push(e);
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                            
                                        e.chrono = timeChrono;
                                        
                                        $scope.shoots.push(e);
                                    }
                                });
                            } else {
                                $scope.noStat = false;
                                deferred.reject('getStats -> problem for : ' + search);
                            }
                        });
                        return deferred.promise;
                    };
                    
                    var buildGraph = function () {
                        if(angular.isUndefined($scope.periodicityActive) || angular.isUndefined($scope.players)) {
                            return;
                        }
                        $scope.loading = true;
                        getStats();
                    };

                    $scope.$on('qeventbus:periodicityActive', function () {
                        if (!angular.equals($scope.periodicityActive, qeventbus.data.periodicityActive)) {
                            $scope.noStat = false;
                            $scope.periodicityActive = qeventbus.data.periodicityActive;
                            buildGraph();
                        }
                    });

                    $scope.$on('qeventbus:playerList', function () {
                        $scope.players = qeventbus.data.playerList;
                        $log.debug('statsTimelineShoot - players',$scope.players);
                        buildGraph();
                    });

                    $timeout(function () {
                        if (angular.isDefined(filterCalendarSrv.getValue())) {
                            $scope.periodicityActive = filterCalendarSrv.getValue().periodicityActive;
                            buildGraph();
                        }
                    });
                },
                templateUrl: 'app/components/directives/stats/hand/shoots/timeline.html'
            };
        });
}());