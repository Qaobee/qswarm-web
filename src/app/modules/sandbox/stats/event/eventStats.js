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
            players: [{}],
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
        
        //Initialization event
        $scope.initStats = function() {

            $scope.defenseCol = [{"id": "Positive", "index":0 ,"type": 'donut', "color": '#9ccc65'},
                                    {"id": "Negative", "index":1 ,"type": 'donut', "color": '#ef5350'}];
            $scope.defenseData = [{"Positive":0}, {"Negative":0}];

            $scope.attackCol = [{"id": "Positive", "index":0 ,"type": 'donut', "color": '#9ccc65'},
                               {"id": "Negative", "index":1 ,"type": 'donut', "color": '#ef5350'}];
            $scope.attackData = [{"Positive":0}, {"Negative":0}];
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
                    
                    $scope.ownersId.push(data.eventRef._id);
                    
                    var periodicity = {
                        startDate: data.startDate,
                        endDate: data.endDate,
                        ownersId : $scope.ownersId
                    };
                    $scope.periodicityActive = periodicity;
                    
                    $scope.getStats($scope.ownersId, $scope.collecte.startDate, $scope.collecte.endDate);
                }
            });
        };
        
        /* get statistic for one collect */
        $scope.getStats = function (ownersId, startDate, endDate) {
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