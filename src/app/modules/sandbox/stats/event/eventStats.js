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
        
        /* qaobee Rest API */
        'collecteRestAPI',
        'effectiveRestAPI',
        'eventsRestAPI',
        'personRestAPI',
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
                                            collecteRestAPI, effectiveRestAPI, personRestAPI, eventsRestAPI, userRestAPI) {
        $translatePartialLoader.addPart('home');
        $translatePartialLoader.addPart('stats');

        $scope.user = user;
        $scope.meta = meta;
        $scope.collecteId = $routeParams.collecteId;
        
        // return button
        $scope.doTheBack = function() {
            $window.history.back();
        };
        
        //Initialization event
        $scope.event = {};
        $scope.collecte = {};
        
        /* Retrieve current event */
        $scope.getCollecte = function () {
            $log.debug($scope.collecteId);
            collecteRestAPI.getCollecte($scope.collecteId).success(function (data) {
                $scope.collecte = data;
                
                /* Formatage des dates et heures */
                if(angular.isDefined($scope.collecte.startDate)) {
                    
                    $scope.startDate = new Date(moment($scope.event.startDate));
                    $scope.startHours = $scope.startDate;
                    $scope.event = $scope.collecte.eventRef;
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