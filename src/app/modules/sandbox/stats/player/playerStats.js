(function () {
    'use strict';
    /**
     * Module statistic
     *
     * @class qaobee.modules.stats.playerStats
     * @author Christophe Kervella
     * @copyright <b>QaoBee</b>.
     * @requires {@link https://docs.angularjs.org/api/ngRoute|ngRoute}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.effectiveRestAPI|qaobee.components.restAPI.sandbox.effective.effectiveRestAPI}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.personRestAPI|qaobee.components.restAPI.sandbox.effective.personRestAPI}
     */
    angular.module('qaobee.playerStats', [
        
            /* qaobee services */
            'statsSRV',
            'qaobee.eventbus',

            /* qaobee Rest API */
            'personRestAPI',
            'statsRestAPI',
            'userRestAPI'
        ])

        .config(function ($routeProvider, metaDatasProvider) {
            $routeProvider.when('/private/playerStats/:playerId', {
                controller: 'PlayerStats',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/modules/sandbox/stats/player/playerStats.html'

            });
        })
        /**
         * @class qaobee.modules.home.HomeControler
         */
        .controller('PlayerStats', function ($timeout, $log, $scope, $routeParams, $window, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta,
                                             statsRestAPI, personRestAPI, statsSrv, userRestAPI, qeventbus) {
            $translatePartialLoader.addPart('home');
            $translatePartialLoader.addPart('stats');
        
            $scope.user = user;
            $scope.meta = meta;
            $scope.ownersId = [];
            $scope.ownersId.push($routeParams.playerId);
        
            if(!user.periodicity){
                $scope.periodicity = 'season';
                $scope.periodicityActive = {};
            } else {
                $scope.periodicity = user.periodicity;
                $scope.periodicityActive = user.periodicityActive;
            }

            $scope.periodicityActive.ownersId = $scope.ownersId;
            
            // return button
            $scope.doTheBack = function () {
                $window.history.back();
            };

            //Initialization owner Object
            $scope.initStats = function() {
                $scope.player = {};

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
                    $scope.periodicityActive.ownersId = $scope.ownersId;
                    user.periodicity = $scope.periodicity;
                    user.periodicityActive = $scope.periodicityActive;
                    qeventbus.prepForBroadcast("periodicityActive", $scope.periodicityActive);
                    $scope.getStats($scope.ownersId, $scope.periodicityActive.startDate, $scope.periodicityActive.endDate);
                }
            });
        
            /* get player */
            $scope.getPlayer = function () {
                personRestAPI.getPerson($routeParams.playerId).success(function (person) {
                    $scope.player = person;
                    $scope.player.birthdate = new Date(moment($scope.player.birthdate));
                    if (angular.isDefined($scope.player.status.positionType)) {
                        $scope.player.positionType = $filter('translate')('stats.positionType.value.' + $scope.player.status.positionType);
                    } else {
                        $scope.player.positionType = '';
                    }
                });
            };

            /* get statistic for one player */
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
                    $scope.periodicityActive = {
                        label: moment($scope.meta.season.startDate).format('MMMM YYYY') + ' - ' + moment($scope.meta.season.endDate).format('MMMM YYYY'),
                        startDate: moment($scope.meta.season.startDate),
                        endDate: moment($scope.meta.season.endDate),
                        ownersId : $scope.ownersId
                    };
                    $scope.getPlayer();
                }).error(function (data) {
                    $log.error('PlayerStats : User not Connected');
                });
            };

            /* Primary, check if user connected */
            $scope.checkUserConnected();
            $scope.initStats();
        });
}());