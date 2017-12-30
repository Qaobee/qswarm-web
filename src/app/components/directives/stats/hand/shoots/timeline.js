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

        .directive('statsTimelineShoot', function ($translatePartialLoader, statsRestAPI, qeventbus, $q, effectiveSrv, filterCalendarSrv, $log, $filter) {
            return {
                restrict: 'AE',
                scope: {
                    user: '=',
                    meta: '='
                },
                controller: function ($scope, $timeout) {
                    $translatePartialLoader.addPart('stats');
                    $scope.noStat = true;
                    $scope.players = [];
                    
                    $scope.goalConceded1st = 0;
                    $scope.goalScored1st = 0;
                    $scope.goalConceded2nd = 0;
                    $scope.goalScored2nd = 0;
                    
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
                    
                    /* Chart canvas */
                    $scope.data = [];
                    $scope.tsgScored = [];
                    $scope.tsgConceded = [];
                    
                    $scope.labels = ['0','5', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55', '60'];
                    $scope.series = [$filter('translate')('stats.label.goalScored'), $filter('translate')('stats.label.goalConceded')];
                    $scope.colors = ['#78BE78','#ef5350'];
                    $scope.distinct = true;
                    $scope.type="line";
                    
                    $scope.radarOpts = {
                        scales: {  
                            yAxes: [{
                                ticks: {
                                    max: 50,
                                    min: 0,
                                    stepSize: 5,
                                    maxTicksLimit: 10,
                                    beginAtZero: true
                                },
                                type: 'linear'
                            }]
                        },
                        legend: {display: $scope.distinct}
                    };
                    
                    $scope.changeToBar = function () {
                      $scope.type ='bar';
                    };
                    
                    $scope.changeToLine = function () {
                      $scope.type ='line';
                    };

                    /* efficiency */
                    var getStats = function () {
                        var deferred = $q.defer();
                        var search = {};
                        
                        var listId = [];

                        $scope.players.forEach(function (e) {
                            listId.push(e._id);
                        });

                        search = {
                            listIndicators: ['goalScored', 'goalConceded'],
                            listOwners: listId,
                            startDate: $scope.periodicityActive.startDate.valueOf(),
                            endDate: $scope.periodicityActive.endDate.valueOf(),
                            aggregat: 'COUNT',
                            listFieldsGroupBy: ['owner', 'code']
                        };

                        statsRestAPI.getListDetailValue(search).success(function (dataOri) {
                            if (dataOri && dataOri.length) {
                                $scope.noStat = true;
                                
                                dataOri.sortBy(function (n) {
                                    return n.chrono;
                                });
                                
                                dataOri.forEach(function (e) {
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
                                    
                                    if(e.code==='goalScored'){
                                        if(e.chrono<1800){
                                            $scope.goalScored1st++;
                                        } else {
                                            $scope.goalScored2nd++;
                                        }
                                    } else {
                                        if(e.chrono<1800){
                                            $scope.goalConceded1st++;
                                        } else {
                                            $scope.goalConceded2nd++;
                                        }
                                    }

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
                                });
                                
                                $scope.tsgScored[0] = 0;
                                $scope.tsgScored[1] = $scope.interval5.count(function(e) {
                                    return e.code === 'goalScored';
                                });
                                $scope.tsgScored[2] = $scope.tsgScored[1] + $scope.interval10.count(function(e) {
                                    return e.code === 'goalScored';
                                });
                                $scope.tsgScored[3] = $scope.tsgScored[2] + $scope.interval15.count(function(e) {
                                    return e.code === 'goalScored';
                                });
                                $scope.tsgScored[4] = $scope.tsgScored[3] + $scope.interval20.count(function(e) {
                                    return e.code === 'goalScored';
                                });
                                $scope.tsgScored[5] = $scope.tsgScored[4] + $scope.interval25.count(function(e) {
                                    return e.code === 'goalScored';
                                });
                                $scope.tsgScored[6] = $scope.tsgScored[5] + $scope.interval30.count(function(e) {
                                    return e.code === 'goalScored';
                                });
                                $scope.tsgScored[7] = $scope.tsgScored[6] + $scope.interval35.count(function(e) {
                                    return e.code === 'goalScored';
                                });
                                $scope.tsgScored[8] = $scope.tsgScored[7] + $scope.interval40.count(function(e) {
                                    return e.code === 'goalScored';
                                });
                                $scope.tsgScored[9] = $scope.tsgScored[8] + $scope.interval45.count(function(e) {
                                    return e.code === 'goalScored';
                                });
                                $scope.tsgScored[10] = $scope.tsgScored[9] + $scope.interval50.count(function(e) {
                                    return e.code === 'goalScored';
                                });
                                $scope.tsgScored[11] = $scope.tsgScored[10] + $scope.interval55.count(function(e) {
                                    return e.code === 'goalScored';
                                });
                                $scope.tsgScored[12] = $scope.tsgScored[11] + $scope.interval60.count(function(e) {
                                    return e.code === 'goalScored';
                                });
                                
                                $scope.tsgConceded[0] = 0;
                                $scope.tsgConceded[1] = $scope.interval5.count(function(e) {
                                    return e.code === 'goalConceded';
                                });
                                $scope.tsgConceded[2] = $scope.tsgConceded[1] + $scope.interval10.count(function(e) {
                                    return e.code === 'goalConceded';
                                });
                                $scope.tsgConceded[3] = $scope.tsgConceded[2] + $scope.interval15.count(function(e) {
                                    return e.code === 'goalConceded';
                                });
                                $scope.tsgConceded[4] = $scope.tsgConceded[3] + $scope.interval20.count(function(e) {
                                    return e.code === 'goalConceded';
                                });
                                $scope.tsgConceded[5] = $scope.tsgConceded[4] + $scope.interval25.count(function(e) {
                                    return e.code === 'goalConceded';
                                });
                                $scope.tsgConceded[6] = $scope.tsgConceded[5] + $scope.interval30.count(function(e) {
                                    return e.code === 'goalConceded';
                                });
                                $scope.tsgConceded[7] = $scope.tsgConceded[6] + $scope.interval35.count(function(e) {
                                    return e.code === 'goalConceded';
                                });
                                $scope.tsgConceded[8] = $scope.tsgConceded[7] + $scope.interval40.count(function(e) {
                                    return e.code === 'goalConceded';
                                });
                                $scope.tsgConceded[9] = $scope.tsgConceded[8] + $scope.interval45.count(function(e) {
                                    return e.code === 'goalConceded';
                                });
                                $scope.tsgConceded[10] = $scope.tsgConceded[9] + $scope.interval50.count(function(e) {
                                    return e.code === 'goalConceded';
                                });
                                $scope.tsgConceded[11] = $scope.tsgConceded[10] + $scope.interval55.count(function(e) {
                                    return e.code === 'goalConceded';
                                });
                                $scope.tsgConceded[12] = $scope.tsgConceded[11] + $scope.interval60.count(function(e) {
                                    return e.code === 'goalConceded';
                                });
                                
                                $scope.data.push($scope.tsgScored);
                                $scope.data.push($scope.tsgConceded);
                                
                                $log.debug('data',$scope.data);
                                
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