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
        'effectiveRestAPI',
        'eventsRestAPI',
        'personRestAPI',
        'userRestAPI',
        
        /* qaobee widget */
    ])

    .config(function ($routeProvider, metaDatasProvider) {
        $routeProvider.when('/private/eventStats/:eventId', {
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
                                            effectiveRestAPI, personRestAPI, eventsRestAPI, userRestAPI) {
        $translatePartialLoader.addPart('home');
        $translatePartialLoader.addPart('stats');

        $scope.user = user;
        $scope.meta = meta;
        $scope.eventId = $routeParams.eventId;
        
        // return button
        $scope.doTheBack = function() {
            $window.history.back();
        };
        
        //Initialization event
        $scope.event = {};
        
        /* Retrieve current event */
        $scope.getEvent = function () {
            
            eventsRestAPI.getEvent($scope.eventId).success(function (data) {
                $scope.event = data;
                
                /* Formatage des dates et heures */
                if(angular.isDefined($scope.event.startDate)) {
                    
                    $scope.startDate = new Date(moment($scope.event.startDate));
                    $scope.startHours = $scope.startDate;
                }
            });
        };    
        
        
        /* check user connected */
        $scope.checkUserConnected = function () {
            
            userRestAPI.getUserById(user._id).success(function (data) {
                $scope.getEvent();
            }).error(function (data) {
                $log.error('EventStats : User not Connected')
            });
        }; 
        
        /* Primary, check if user connected */
        $scope.checkUserConnected();
    });
}());