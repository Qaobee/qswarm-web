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