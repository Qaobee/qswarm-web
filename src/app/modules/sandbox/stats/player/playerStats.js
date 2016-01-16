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
            $scope.player = {};
            $scope.ownersId = [];
            $scope.ownersId.push($routeParams.playerId);
            
            // return button
            $scope.doTheBack = function () {
                $window.history.back();
            };

            //Initialization owner Object
            $scope.initStats = function() {
                
                $scope.collectes = [];
                
                if(!user.periodicity){
                    $scope.periodicity = 'season';
                    $scope.periodicityActive = {
                        label: moment($scope.meta.season.startDate).format('MMMM YYYY') + ' - ' + moment($scope.meta.season.endDate).format('MMMM YYYY'),
                        startDate: moment($scope.meta.season.startDate),
                        endDate: moment($scope.meta.season.endDate),
                        ownersId : $scope.ownersId
                    };
                } else {
                    $scope.periodicity = user.periodicity;
                    $scope.periodicityActive = user.periodicityActive;
                }
                $scope.periodicityActive.ownersId = $scope.ownersId;
                
                $scope.getPlayer();
            };
        
            /* get statistic for one player */
            $scope.getStats = function (ownersId, startDate, endDate) {
            
                $scope.collectes = [];

                /* get nbCollecte */
                statsSrv.getMatchsPlayer(startDate, endDate, $scope.meta.sandbox._id, $routeParams.playerId).then(function (data) {
                    if (angular.isArray(data) && data.length > 0) {
                        data.forEach(function (e) {
                            e.eventRef.startDate = moment(e.eventRef.startDate).format('LLLL');
                            $scope.collectes.push(e);
                        });    
                    }
                })
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

            /* check user connected */
            $scope.checkUserConnected = function () {
                userRestAPI.getUserById(user._id).success(function (data) {
                    $scope.initStats();
                }).error(function (data) {
                    $log.error('PlayerStats : User not Connected');
                });
            };

            /* Primary, check if user connected */
            $scope.checkUserConnected();
        });
}());