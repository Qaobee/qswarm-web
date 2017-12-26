(function () {
    'use strict';
    /**
     * Module statistic
     *
     * @class qaobee.modules.stats.eventStats
     * @author Christophe Kervella
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.eventStats', [
        /* qaobee services */
        'effectifSRV',
        'statsSRV',
        'qaobee.eventbus',
        /* qaobee Rest API */
        'collecteRestAPI',
        'personRestAPI',
        'statsRestAPI',
        'userRestAPI'
    ])

        .config(function ($routeProvider, metaProvider, userProvider) {
            $routeProvider.when('/private/eventStats/:collecteId', {
                controller: 'EventStats',
                resolve: {
                    user: userProvider.$get,
                    meta: metaProvider.$get
                },
                templateUrl: 'app/modules/sandbox/stats/event/eventStats.html'
            });
        })
        /**
         * @class qaobee.modules.home.HomeControler
         */
        .controller('EventStats', function ($log, $scope, $routeParams, $window, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta,
                                            collecteRestAPI, personRestAPI, statsRestAPI, effectiveSrv, statsSrv, userRestAPI, qeventbus, $timeout) {
            $translatePartialLoader.addPart('home');
            $translatePartialLoader.addPart('stats');
            $scope.user = user;
            $scope.meta = meta;
            $scope.instance = {};
            $scope.ownersId = [];
            $scope.players = [];
            $scope.teamHome = false;
            $scope.teamVisitor = true;
            $scope.collecte = {
                event: {},
                players: [],
                startDate: 0,
                endDate: 0,
                startDateLabel: "",
                endDateLabel: ""
            };
        
            if (user.eventStatTabId) {
                $scope.activeTabIndex = user.eventStatTabId;
            } else {
                $scope.activeTabIndex = 0;
            }
            
            /* keep in memory tab by default */
            $scope.changeTabDefault = function (tabId) {
                user.eventStatTabId = tabId;
            };

            // return button
            $scope.doTheBack = function () {
                $window.history.back();
            };
        
            /* */
            $scope.getNotePlayer = function (player) {
                return player.stats.goalScored - (player.stats.originShootAtt-player.stats.goalScored) + player.stats.actAttPos + player.stats.actDefPos - player.stats.actAttNeg - player.stats.actDefNeg;
            };
        
            /* */
            $scope.getNoteGoalKeeper = function (player) {
                return player.stats.originShootDef - (player.stats.originShootDef-player.stats.goalConceded) + player.stats.actAttPos + player.stats.actDefPos - player.stats.actAttNeg - player.stats.actDefNeg;
            };

            /* get collect */
            $scope.getCollecte = function () {
                /* get collect */
                collecteRestAPI.getCollecte($routeParams.collecteId).success(function (data) {
                    if (angular.isDefined(data)) {
                        
                        $scope.collecte.event = data.eventRef;
                        $scope.collecte.startDate = moment(data.startDate).subtract(5,'m').valueOf();
                        $scope.collecte.endDate = moment(data.endDate).add(5,'m').valueOf();
                        
                        $scope.collecte.startDateLabel = moment(data.startDate).format('LLLL');
                        $scope.collecte.endDateLabel = moment(data.endDate).format('LLLL');
                        
                        $scope.goalScored = 0;
                        $scope.goalConceded = 0;
                        
                        if ($scope.collecte.event.owner.teamId === $scope.collecte.event.participants.teamHome._id) {
                            $scope.teamHome = true;
                            $scope.teamVisitor = false;
                        } else {
                            $scope.teamHome = false;
                            $scope.teamVisitor = true;
                        }
                        var listField = ['_id', 'name', 'firstname', 'avatar', 'status'];
                        
                        effectiveSrv.getPersons(data.players, listField).then(function (players) {
                            $scope.players = players;
                            $scope.players = $scope.players.sortBy(function (n) {
                                return n.name;
                            });
                            
                            qeventbus.prepForBroadcast('playerList', {
                                playerList: $scope.players
                            });
                            $scope.players.forEach(function (player) {
                                if (angular.isDefined(player.status.positionType)) {
                                    player.positionType = $filter('translate')('stats.positionType.value.' + player.status.positionType);
                                } else {
                                    player.positionType = '';
                                }
                                player.stats = {
                                    originShootAtt: 0,
                                    originShootDef: 0,
                                    goalScored: 0,
                                    goalConceded: 0,
                                    yellowCard: 0,
                                    exclTmp: 0,
                                    redCard: 0,
                                    holder: '',
                                    totalPlayTime : 0,
                                    actAttPos : 0,
                                    actAttNeg : 0,
                                    actDefPos : 0,
                                    actDefNeg : 0,
                                    note : 0,
                                    duelLoose : 0,
                                    duelWon : 0,
                                    forceDef : 0,
                                    interceptionOk : 0,
                                    looseball : 0,
                                    marcher : 0,
                                    neutralization : 0,
                                    passDec : 0,
                                    penaltyConceded : 0
                                };
                            });
                            $scope.instance.refresh();
                            var listFieldsGroupBy = ['owner'];
                            var search = {
                                listIndicators: ['totalPlayTime'],
                                listOwners: data.players,
                                startDate: $scope.collecte.startDate,
                                endDate: $scope.collecte.endDate,
                                aggregat: 'SUM',
                                listFieldsGroupBy: listFieldsGroupBy
                            };
                            /* Appel stats API */
                            statsRestAPI.getStatGroupBy(search).success(function (dataTime) {
                                if (angular.isArray(dataTime) && dataTime.length > 0) {
                                    dataTime.forEach(function (a) {
                                        var i = -1;
                                        a._id.owner.forEach(function (b) {
                                            i = $scope.players.findIndex(function (n) {
                                                return n._id === b;
                                            });
                                        });
                                        $scope.players[i].stats['totalPlayTime'] = a.value;
                                    });
                                }
                            });
                            
                            /* Appel stats API */
                            listFieldsGroupBy = ['owner', 'code'];
                            statsRestAPI.getListDetailValue({
                                listIndicators: ['originShootAtt', 'impactShootAtt', 'goalScored', 'yellowCard',
                                                 'exclTmp', 'redCard', 'originShootDef', 'impactShootDef','goalConceded', 'impactShootDef', 'holder', 
                                                 'neutralization', 'forceDef', 'contre', 'interceptionOk',
                                                 'penaltyConceded', 'interceptionKo', 'duelLoose', 'badPosition',
                                                 'penaltyObtained', 'exclTmpObtained', 'shift', 'duelWon', 'passDec',
                                                 'forceAtt', 'marcher', 'doubleDribble', 'looseball', 'foot', 'zone', 'stopGKAtt'
                                                ],
                                listOwners: data.players,
                                startDate: $scope.collecte.startDate,
                                endDate: $scope.collecte.endDate,
                                aggregat: 'COUNT',
                                listFieldsGroupBy: listFieldsGroupBy
                            }).success(function (dataStats) {
                                if (angular.isArray(dataStats) && dataStats.length > 0) {
                                    
                                    $scope.stats = dataStats.sortBy(function (n) {
                                        return n.chrono;
                                    });
                                    
                                    dataStats.forEach(function (a) {
                                        var i = -1;
                                        a.owner.forEach(function (b) {
                                            i = $scope.players.findIndex(function (n) {
                                                return n._id === b;
                                            });
                                        });
                                        
                                        if(a.code ==='goalScored') {
                                            $scope.players[i].stats['goalScored'] = $scope.players[i].stats['goalScored']+1;
                                            $scope.goalScored++;
                                            a.scoreUs = $scope.goalScored;
                                        }else{
                                            if(a.code ==='originShootAtt') {
                                                $scope.players[i].stats['originShootAtt'] = $scope.players[i].stats['originShootAtt']+1;
                                            }else{
                                                if(a.code ==='goalConceded') {
                                                    $scope.players[i].stats['goalConceded'] = $scope.players[i].stats['goalConceded']+1;
                                                    $scope.goalConceded++;
                                                }else{
                                                    if(a.code ==='originShootDef') {
                                                        $scope.players[i].stats['originShootDef'] = $scope.players[i].stats['originShootDef']+1;
                                                    }else{
                                                        $scope.players[i].stats[a.code] += a.value;
                                                    }
                                                }
                                            }
                                        }
                                        
                                        if(a.code ==='neutralization' || a.code ==='forceDef' || a.code ==='contre' || a.code ==='interceptionOk') {
                                            $scope.players[i].stats.actDefPos += a.value;
                                        }
                                        
                                        if(a.code ==='penaltyConceded' || a.code ==='interceptionKo' || a.code ==='duelLoose' || a.code ==='badPosition') {
                                            $scope.players[i].stats.actDefNeg += a.value;
                                        }
                                        
                                        if(a.code ==='penaltyObtained' || a.code ==='exclTmpObtained' || a.code ==='shift' || a.code ==='duelWon' || a.code ==='passDec') {
                                            $scope.players[i].stats.actAttPos += a.value;
                                        }
                                        
                                        if(a.code ==='forceAtt' || a.code ==='marcher' || a.code ==='doubleDribble' || a.code ==='looseball' || a.code ==='foot' || a.code ==='zone' || a.code ==='stopGKAtt') {
                                            $scope.players[i].stats.actAttNeg = a.value;
                                        }
                                    });
                                }
                            });
                        });

                        $scope.ownersId.push(data.eventRef._id);
                        qeventbus.prepForBroadcast('ownersId', {
                            ownersId: $scope.ownersId
                        });
                    }
                });
            };
            $timeout(function () {
                $scope.getCollecte();
            });
        });
}());
