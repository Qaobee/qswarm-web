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
        
        /* qaobee Rest API */
        'collecteRestAPI',
        'personRestAPI',
        'statsRestAPI',
        'userRestAPI',
        
        /* qaobee widget */
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
                                            collecteRestAPI, personRestAPI, statsRestAPI, effectiveSrv, statsSrv, userRestAPI) {
        $translatePartialLoader.addPart('home');
        $translatePartialLoader.addPart('stats');

        $scope.user = user;
        $scope.meta = meta;
        $scope.collecteId = $routeParams.collecteId;
        $scope.ownerId = "";
        $scope.teamHome = false;
        $scope.teamVisitor = true;
        $scope.collecte = {
            event : {},
            nbGame:0,
            players: [{}],
            totalTime:0,
            startDate : 0,
            endDate : 0,
            startDateLabel : "",
            endDateLabel : ""
        };
        
        $scope.players = [];
        
        // return button
        $scope.doTheBack = function() {
            $window.history.back();
        };
        
        //Initialization event
        $scope.initStats = function() {
            $scope.stats = {};
        
            $scope.efficientlyGlobalCol = [{id: 'data', type: 'gauge', color: '#42a5f5'}];
            $scope.efficientlyGlobalData = [{data:0}];
            $scope.efficiently9mCol = [{id: 'data', type: 'gauge', color: '#42a5f5'}];
            $scope.efficiently9mData = [{data:0}];
            $scope.efficiently6mCol = [{id: 'data', type: 'gauge', color: '#42a5f5'}];
            $scope.efficiently6mData = [{data:0}];
            $scope.efficiently7mCol = [{id: 'data', type: 'gauge', color: '#42a5f5'}];
            $scope.efficiently7mData = [{data:0}];

            $scope.values9m =  ['BACKLEFT9', 'CENTER9', 'BACKRIGHT9'];
            $scope.values6m =  ['BACKLEFT6', 'CENTER6', 'BACKRIGHT6', 'LWING', 'RWING'];
            $scope.values7m =  ['PENALTY'];
            
            $scope.nbShootGlobal = 0;
            $scope.nbGoalGlobal = 0;
            $scope.nbShoot9m = 0;
            $scope.nbGoal9m = 0;
            $scope.nbShoot7m = 0;
            $scope.nbGoal7m = 0;
            $scope.nbShoot6m = 0;
            $scope.nbGoal6m = 0;

            $scope.defenseCol = [{"id": "Positive", "index":0 ,"type": 'donut', "color": '#9ccc65'},
                                    {"id": "Negative", "index":1 ,"type": 'donut', "color": '#ef5350'}];
            $scope.defenseData = [{"Positive":0}, {"Negative":0}];

            $scope.attackCol = [{"id": "Positive", "index":0 ,"type": 'donut', "color": '#9ccc65'},
                               {"id": "Negative", "index":1 ,"type": 'donut', "color": '#ef5350'}];
            $scope.attackData = [{"Positive":0}, {"Negative":0}];
        };
        
        //Initialization event
        
        /* get collect */
        $scope.getCollecte = function () {
            
            /* get collect */
            collecteRestAPI.getCollecte($scope.collecteId).success(function (data) {
                if (angular.isDefined(data)) {
                    $scope.collecte.event = data.eventRef;
                    $scope.collecte.nbGame = 1;
                    $scope.collecte.totalTime += (data.parametersGame.periodDuration * data.parametersGame.nbPeriod);
                    
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
                    effectiveSrv.getPersons(data.players, listField).then(function(players){
                        $scope.players = players;
                        $scope.players.forEach(function (e) {
                            if (angular.isDefined(e.status.positionType)) {
                                e.positionType = $filter('translate')('stats.positionType.value.' + e.status.positionType);
                            } else {
                                e.positionType = '';
                            }
                        });    
                    });
                    
                    $scope.ownerId = data.eventRef._id;
                    $scope.getStats($scope.ownerId, $scope.collecte.startDate, $scope.collecte.endDate);
                }
            });
        };
        
        /* get statistic for one collect */
        $scope.getStats = function (ownerId, startDate, endDate) {
            
            $scope.initStats();

            var ownersId = [];
            ownersId.push(ownerId);
            
            /* Search parameters Efficiently Global */ 
            $scope.efficientlyGlobalCol = [{id: 'data', type: 'gauge', color: '#42a5f5'}];
            $scope.efficientlyGlobalData = [{data:0}];

            statsSrv.getEfficiently(ownersId, startDate, endDate).then(function (result) {
                $scope.nbShootGlobal = result.nbShoot;
                $scope.nbGoalGlobal = result.nbGoal;
                $scope.efficientlyGlobalData.push({data : result.efficiently});
                statsSrv.getColorGauge(result.efficiently).then(function (color) {
                    $scope.efficientlyGlobalCol[0].color = color;
                });
            });

            /* Search parameters Efficiently 9m */
            $scope.efficiently9mCol = [{id: 'data', type: 'gauge', color: '#42a5f5'}];
            $scope.efficiently9mData = [{data:0}];

            statsSrv.getEfficiently(ownersId, startDate, endDate, $scope.values9m).then(function (result) {
                $scope.nbShoot9m = result.nbShoot;
                $scope.nbGoal9m = result.nbGoal;
                $scope.efficiently9mData.push({data : result.efficiently});
                statsSrv.getColorGauge(result.efficiently).then(function (color) {
                    $scope.efficiently9mCol[0].color = color;
                });
            });

            /* Search parameters Efficiently 6m */
            $scope.efficiently6mCol = [{id: 'data', type: 'gauge', color: '#42a5f5'}];
            $scope.efficiently6mData = [{data:0}];

            statsSrv.getEfficiently(ownersId, startDate, endDate, $scope.values6m).then(function (result) {
                $scope.nbShoot6m = result.nbShoot;
                $scope.nbGoal6m = result.nbGoal;
                $scope.efficiently6mData.push({data : result.efficiently});
                statsSrv.getColorGauge(result.efficiently).then(function (color) {
                    $scope.efficiently6mCol[0].color = color;
                });
            });

            /* Search parameters Efficiently 7m */
            $scope.efficiently7mCol = [{id: 'data', type: 'gauge', color: '#42a5f5'}];
            $scope.efficiently7mData = [{data:0}];

            statsSrv.getEfficiently(ownersId, startDate, endDate, $scope.values7m).then(function (result) {
                $scope.nbShoot7m = result.nbShoot;
                $scope.nbGoal7m = result.nbGoal;
                $scope.efficiently7mData.push({data : result.efficiently});
                statsSrv.getColorGauge(result.efficiently).then(function (color) {
                    $scope.efficiently7mCol[0].color = color;
                });
            });

            var listFieldsGroupBy = Array.create('owner');

            /* ALL PERS-ACT-DEF-POS */
            var indicators =  Array.create('neutralization', 'forceDef', 'contre', 'interceptionOk');
            statsSrv.countAllInstanceIndicators(indicators, ownersId, startDate, endDate, listFieldsGroupBy).then(function (result) {
                $scope.defenseData.push({"Positive": result});
                $scope.defenseCol.push({"id": "Positive", "index":0 ,"type": 'donut', "color": '#9ccc65'});
            });

            /* ALL PERS-ACT-DEF-NEG */
            var indicators =  Array.create('penaltyConceded', 'interceptionKo', 'duelLoose', 'badPosition');
            statsSrv.countAllInstanceIndicators(indicators, ownersId, startDate, endDate, listFieldsGroupBy).then(function (result) {
                $scope.defenseData.push({"Negative": result});
                $scope.defenseCol.push({"id": "Negative", "index":1 ,"type": 'donut', "color": '#ef5350'});
            });

            /* ALL PERS-ACT-OFF-POS */
            var indicators =  Array.create('penaltyObtained', 'exclTmpObtained', 'shift', 'duelWon', 'passDec');
            statsSrv.countAllInstanceIndicators(indicators, ownersId, startDate, endDate, listFieldsGroupBy).then(function (result) {
                $scope.attackData.push({"Positive": result});
                $scope.attackCol.push({"id": "Positive", "index":0 ,"type": 'donut', "color": '#9ccc65'});
            });

            /* ALL PERS-ACT-OFF-NEG */
            var indicators =  Array.create('forceAtt', 'marcher', 'doubleDribble', 'looseball', 'foot', 'zone', 'stopGKAtt');
            statsSrv.countAllInstanceIndicators(indicators, ownersId, startDate, endDate, listFieldsGroupBy).then(function (result) {
                $scope.attackData.push({"Negative": result});
                $scope.attackCol.push({"id": "Negative", "index":1 ,"type": 'donut', "color": '#ef5350'});
            });

            /* Stats Count by indicator */
            var indicators =  Array.create('yellowCard', 'exclTmp', 'redCard', 'originShootAtt', 'goalScored', 'holder', 'substitue', 'goalConceded');
            listFieldsGroupBy = Array.create('code');

            angular.forEach(indicators, function (value) {
                $scope.stats[value] = {sum: 0, avg: 0, count: 0, freq: 0};
            });

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
                    data.forEach(function(a){
                        $scope.stats[a._id.code].count = a.value;
                    });
                }
            })

            /* Stats SUM by indicator */
            var indicators =  Array.create('playTime');
            listFieldsGroupBy = Array.create('code');

            angular.forEach(indicators, function (value) {
                $scope.stats[value] = {sum: 0, avg: 0, count: 0, freq: 0};
            });

            var search = {
                listIndicators: indicators,
                listOwners: ownersId,
                startDate: startDate.valueOf(),
                endDate: endDate.valueOf(),
                aggregat: 'SUM',
                listFieldsGroupBy: listFieldsGroupBy
            };

            /* Appel stats API */
            statsRestAPI.getStatGroupBy(search).success(function (data) {
                if (angular.isArray(data) && data.length > 0) {
                    data.forEach(function(a){
                        $scope.stats[a._id.code].sum = a.value;
                    });
                }
            })

            /* Stats AVG by indicator */
            var indicators =  Array.create('playTime');
            listFieldsGroupBy = Array.create('code');

            angular.forEach(indicators, function (value) {
                $scope.stats[value] = {sum: 0, avg: 0, count: 0, freq: 0};
            });

            var search = {
                listIndicators: indicators,
                listOwners: ownersId,
                startDate: startDate.valueOf(),
                endDate: endDate.valueOf(),
                aggregat: 'AVG',
                listFieldsGroupBy: listFieldsGroupBy
            };

            /* Appel stats API */
            statsRestAPI.getStatGroupBy(search).success(function (data) {
                if (angular.isArray(data) && data.length > 0) {
                    data.forEach(function(a){
                        $scope.stats[a._id.code].avg = a.value;
                    });
                }
            })
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
        $scope.initStats();
    });
}());