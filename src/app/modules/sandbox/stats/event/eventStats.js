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
                                            collecteRestAPI, personRestAPI, statsRestAPI, effectiveSrv, statsSrv, userRestAPI, qeventbus) {
            $translatePartialLoader.addPart('home');
            $translatePartialLoader.addPart('stats');
            $scope.user = user;
            $scope.meta = meta;

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

            // return button
            $scope.doTheBack = function () {
                $window.history.back();
            };

            /* get collect */
            $scope.getCollecte = function () {
                /* get collect */
                collecteRestAPI.getCollecte($routeParams.collecteId).success(function (data) {
                    if (angular.isDefined(data)) {
                        $scope.collecte.event = data.eventRef;
                        $scope.collecte.startDate = data.startDate;
                        $scope.collecte.endDate = data.endDate;
                        $scope.collecte.startDateLabel = moment(data.startDate).format('LLLL');
                        $scope.collecte.endDateLabel = moment(data.endDate).format('LLLL');
                        if ($scope.collecte.event.owner.teamId === $scope.collecte.event.participants.teamHome._id) {
                            $scope.teamHome = true;
                            $scope.teamVisitor = false;
                        } else {
                            $scope.teamHome = false;
                            $scope.teamVisitor = true;
                        }
                        var listField = ['_id', 'name', 'firstname', 'avatar', 'status'];
                        $scope.stats = [];
                        effectiveSrv.getPersons(data.players, listField).then(function (players) {
                            $scope.players = players;

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
                                    holder: 0,
                                    totalPlayTime : 0,
                                    actAttPos : 0,
                                    actAttNeg : 0,
                                    actDefPos : 0,
                                    actDefNeg : 0,
                                    note : 0
                                };
                            });
                            var listFieldsGroupBy = ['owner'];
                            var search = {
                                listIndicators: ['totalPlayTime'],
                                listOwners: data.players,
                                startDate: data.startDate.valueOf(),
                                endDate: data.endDate.valueOf(),
                                aggregat: 'SUM',
                                listFieldsGroupBy: listFieldsGroupBy
                            }
                            /* Appel stats API */
                            statsRestAPI.getStatGroupBy(search).success(function (dataShoot) {
                                
                                if (angular.isArray(dataShoot) && dataShoot.length > 0) {
                                    
                                    dataShoot.forEach(function (a) {
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
                            statsRestAPI.getStatGroupBy({
                                listIndicators: ['originShootAtt', 'goalScored', 'yellowCard',
                                    'exclTmp', 'redCard', 'originShootDef', 'goalConceded',
                                    'actDefPos', 'actDefNeg', 'actAttPos', 'actAttNeg', 'holder'],
                                listOwners: data.players,
                                startDate: data.startDate.valueOf(),
                                endDate: data.endDate.valueOf(),
                                aggregat: 'COUNT',
                                listFieldsGroupBy: listFieldsGroupBy
                            }).success(function (dataShoot) {
                                if (angular.isArray(dataShoot) && dataShoot.length > 0) {
                                    
                                    dataShoot.forEach(function (a) {
                                        var i = -1;
                                        a._id.owner.forEach(function (b) {
                                            i = $scope.players.findIndex(function (n) {
                                                return n._id === b;
                                            });
                                        });
                                        $scope.players[i].stats[a._id.code] += a.value;
                                    });
                                }
                            });

                            /* ALL PERS-ACT-DEF-POS */
                            statsRestAPI.getStatGroupBy({
                                listIndicators: ['neutralization', 'forceDef', 'contre', 'interceptionOk'],
                                listOwners: data.players,
                                startDate: data.startDate.valueOf(),
                                endDate: data.endDate.valueOf(),
                                aggregat: 'COUNT',
                                listFieldsGroupBy: listFieldsGroupBy
                            }).success(function (dataActDefPos) {
                                if (angular.isArray(dataActDefPos) && dataActDefPos.length > 0) {
                                    dataActDefPos.forEach(function (a) {
                                        var i = -1;
                                        a._id.owner.forEach(function (b) {
                                            i = $scope.players.findIndex(function (n) {
                                                return n._id === b;
                                            });
                                        });
                                        $scope.players[i].stats.actDefPos += a.value;
                                    });
                                }
                            });

                            /* ALL PERS-ACT-DEF-NEG */
                            statsRestAPI.getStatGroupBy({
                                listIndicators: ['penaltyConceded', 'interceptionKo', 'duelLoose', 'badPosition'],
                                listOwners: data.players,
                                startDate: data.startDate.valueOf(),
                                endDate: data.endDate.valueOf(),
                                aggregat: 'COUNT',
                                listFieldsGroupBy: listFieldsGroupBy
                            }).success(function (dataActDefNeg) {
                                if (angular.isArray(dataActDefNeg) && dataActDefNeg.length > 0) {

                                    dataActDefNeg.forEach(function (a) {
                                        var i = -1;
                                        a._id.owner.forEach(function (b) {
                                            i = $scope.players.findIndex(function (n) {
                                                return n._id === b;
                                            });
                                        });
                                        $scope.players[i].stats.actDefNeg += a.value;
                                    });
                                }
                            });

                            /* ALL PERS-ACT-OFF-POS */
                            statsRestAPI.getStatGroupBy({
                                listIndicators: ['penaltyObtained', 'exclTmpObtained', 'shift', 'duelWon', 'passDec'],
                                listOwners: data.players,
                                startDate: data.startDate.valueOf(),
                                endDate: data.endDate.valueOf(),
                                aggregat: 'COUNT',
                                listFieldsGroupBy: listFieldsGroupBy
                            }).success(function (dataActAttPos) {
                                if (angular.isArray(dataActAttPos) && dataActAttPos.length > 0) {
                                    dataActAttPos.forEach(function (a) {
                                        var i = -1;
                                        a._id.owner.forEach(function (b) {
                                            i = $scope.players.findIndex(function (n) {
                                                return n._id === b;
                                            });
                                        });
                                        $scope.players[i].stats.actAttPos += a.value;
                                    });
                                }
                            });

                            /* ALL PERS-ACT-OFF-NEG */
                            statsRestAPI.getStatGroupBy({
                                listIndicators: ['forceAtt', 'marcher', 'doubleDribble', 'looseball', 'foot', 'zone', 'stopGKAtt'],
                                listOwners: data.players,
                                startDate: data.startDate.valueOf(),
                                endDate: data.endDate.valueOf(),
                                aggregat: 'COUNT',
                                listFieldsGroupBy: listFieldsGroupBy
                            }).success(function (dataActAttNeg) {
                                if (angular.isArray(dataActAttNeg) && dataActAttNeg.length > 0) {

                                    dataActAttNeg.forEach(function (a) {
                                        var i = -1;
                                        a._id.owner.forEach(function (b) {
                                            i = $scope.players.findIndex(function (n) {
                                                return n._id === b;
                                            });
                                        });
                                        $scope.players[i].stats.actAttNeg = a.value;
                                    });
                                }
                            });

                            $scope.players = $scope.players.sortBy(function (n) {
                                return n.positionType;
                            });
                            
                        });
                        
                        $scope.ownersId = [];
                        $scope.ownersId.push(data.eventRef._id);
                        qeventbus.prepForBroadcast('ownersId', {
                            ownersId: $scope.ownersId
                        });
                    }
                });
            };

            $scope.getCollecte();
        });
}());
