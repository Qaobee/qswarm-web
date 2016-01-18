(function () {
    'use strict';
    /**
     * Module statistic
     *
     * @class qaobee.modules.stats.eventStats
     * @author Christophe Kervella
     * @copyright <b>QaoBee</b>.
     * @requires {@link https://docs.angularjs.org/api/ngRoute|ngRoute}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.effectiveRestAPI|qaobee.components.restAPI.sandbox.effective.effectiveRestAPI}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.personRestAPI|qaobee.components.restAPI.sandbox.effective.personRestAPI}
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

    .config(function ($routeProvider, metaDatasProvider) {
        $routeProvider.when('/private/eventStats/:collecteId', {
            controller: 'EventStats',
            resolve: {
                user: metaDatasProvider.checkUser,
                meta: metaDatasProvider.getMeta
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
        $scope.ownersId = [];
        $scope.teamHome = false;
        $scope.teamVisitor = true;
        $scope.collecte = {
            event : {},
            players: [],
            startDate : 0,
            endDate : 0,
            startDateLabel : "",
            endDateLabel : ""
        };
        
        $scope.periodicityActive = {
            startDate: moment(new Date()),
            endDate: moment(new Date()),
            ownersId : []
        };
        
        $scope.players = [];
        
        // return button
        $scope.doTheBack = function() {
            $window.history.back();
        };
        
        /* watch if periodicity change */
        $scope.$watch('periodicityActive', function (newValue, oldValue) {
            if (angular.isDefined(newValue) && !angular.equals(newValue, oldValue)) {
                qeventbus.prepForBroadcast("periodicityActive", $scope.periodicityActive);
            }
        });
        
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
                                 
                    if($scope.collecte.event.owner.teamId === $scope.collecte.event.participants.teamHome.id) {
                        $scope.teamHome = true;
                        $scope.teamVisitor = false;
                    } else {
                        $scope.teamHome = false;
                        $scope.teamVisitor = true;
                    }
                    
                    var listField = Array.create('_id', 'name', 'firstname', 'avatar', 'status');
                    $scope.stats = [];
                    effectiveSrv.getPersons(data.players, listField).then(function(players){
                        $scope.players = players;
                        
                        $scope.players.forEach(function (player) {
                            
                            if (angular.isDefined(player.status.positionType)) {
                                player.positionType = $filter('translate')('stats.positionType.value.' + player.status.positionType);
                            } else {
                                player.positionType = '';
                            }
                            
                            //$scope.stats[player._id] = [];                            
                            
                            player.stats = {originShootAtt: 0, originShootDef: 0, goalScored: 0, goalConceded:0, yellowCard: 0, exclTmp: 0, redCard: 0};
                            
                        });
                        
                        var listFieldsGroupBy = Array.create('owner', 'code');
                        var indicators =  Array.create('originShootAtt', 'goalScored','yellowCard', 'exclTmp', 'redCard', 'originShootDef', 'goalConceded');

                        var search = {
                            listIndicators: indicators,
                            listOwners: data.players,
                            startDate: data.startDate.valueOf(),
                            endDate: data.endDate.valueOf(),
                            aggregat: 'COUNT',
                            listFieldsGroupBy: listFieldsGroupBy
                        };
                        
                        /* Appel stats API */
                        statsRestAPI.getStatGroupBy(search).success(function (data) {
                            if (angular.isArray(data) && data.length > 0) {

                                data.forEach(function (a) {
                                    var i = -1;
                                    a._id.owner.forEach(function (b) {
                                        i = $scope.players.findIndex(function (n) {
                                            return n._id === b;
                                        });
                                    });
                                    
                                    $log.debug('i',$scope.players[i]);
                                    $log.debug('a.value',a.value);
                                    if (a._id.code === 'originShootAtt') {
                                        $scope.players[i].stats.originShootAtt = a.value;
                                    }
                                    if (a._id.code === 'originShootDef') {
                                        $scope.players[i].stats.originShootDef = a.value;
                                    }
                                    if (a._id.code === 'goalScored') {
                                        $scope.players[i].stats.goalScored = a.value;
                                    }
                                    if (a._id.code === 'goalConceded') {
                                        $scope.players[i].stats.goalConceded = a.value;
                                    }
                                    if (a._id.code === 'yellowCard') {
                                        $scope.players[i].stats.yellowCard = a.value;
                                    }
                                    if (a._id.code === 'exclTmp') {
                                        $scope.players[i].stats.exclTmp = a.value;
                                    }
                                    if (a._id.code === 'redCard') {
                                        $scope.players[i].stats.redCard = a.value;
                                    }
                                    
                                });
                                $log.debug('$scope.players',$scope.players);
                            }
                        });
                        
                        /* ALL PERS-ACT-DEF-POS */
                        /*
                        var indicators =  Array.create('neutralization', 'forceDef', 'contre', 'interceptionOk');
                        angular.forEach(indicators, function (value) {
                            $scope.stats[p._id][value] = {count: 0};
                        });
                        statsSrv.countAllInstanceIndicators(indicators, data.players, data.startDate, data.endDate, listFieldsGroupBy).then(function (result) {
                            if(result>0) {
                                player.actDefPos = result;
                            }
                        });
                        */
                        /* ALL PERS-ACT-DEF-NEG */
                        /*
                        var indicators =  Array.create('penaltyConceded', 'interceptionKo', 'duelLoose', 'badPosition');
                        statsSrv.countAllInstanceIndicators(indicators, data.players, data.startDate, data.endDate, listFieldsGroupBy).then(function (result) {
                            if(result>0) {
                                player.actDefNeg = result;
                            }
                        });
                        */
                        /* ALL PERS-ACT-OFF-POS */
                        /*
                        indicators =  Array.create('penaltyObtained', 'exclTmpObtained', 'shift', 'duelWon', 'passDec');
                        statsSrv.countAllInstanceIndicators(indicators, data.players, data.startDate, data.endDate, listFieldsGroupBy).then(function (result) {
                            if(result>0) {
                                player.actAttPos = result;
                            }
                        });
                        */
                        /* ALL PERS-ACT-OFF-NEG */
                        /*
                        indicators =  Array.create('forceAtt', 'marcher', 'doubleDribble', 'looseball', 'foot', 'zone', 'stopGKAtt');
                        statsSrv.countAllInstanceIndicators(indicators, data.players, data.startDate, data.endDate, listFieldsGroupBy).then(function (result) {
                            if(result>0) {
                                player.actAttNeg = result;
                            }
                        });
                        */
                        
                        $scope.players = $scope.players.sortBy(function(n) {
                            return n.positionType; 
                        });
                    });
                    
                    $scope.ownersId.push(data.eventRef._id);
                    
                    var periodicity = {
                        startDate: data.startDate,
                        endDate: data.endDate,
                        ownersId : $scope.ownersId
                    };
                    $scope.periodicityActive = periodicity;
                }
            });
        };

        /* check user connected */
        $scope.checkUserConnected = function () {
            
            userRestAPI.getUserById(user._id).success(function (data) {
                $scope.getCollecte();
            }).error(function (data) {
                $log.error('EventStats : User not Connected');
            });
        }; 
        
        /* Primary, check if user connected */
        $scope.checkUserConnected();
    });
}());