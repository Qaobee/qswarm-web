(function () {
    'use strict';
    /**
     * Module Gérant la partie publique du site
     *
     * @class qaobee.modules.home.mainHome
     * @author Christophe Kervella
     * @copyright <b>QaoBee</b>.
     * @requires {@link https://docs.angularjs.org/api/ngRoute|ngRoute}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.effectiveRestAPI|qaobee.components.restAPI.sandbox.effective.effectiveRestAPI}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.personRestAPI|qaobee.components.restAPI.sandbox.effective.personRestAPI}
     * @requires {@link qaobee.components.widgets.event.widget.nextEvent|qaobee.components.widgets.event.widget.nextEvent}
     */
    angular.module('qaobee.home', [
        
        /* qaobee services */
        'effectifSRV',
        
        /* qaobee Rest API */
        'eventsRestAPI',
        'teamRestAPI',
        'userRestAPI'])

    .config(function ($routeProvider, metaDatasProvider) {
        $routeProvider.when('/private', {
            controller: 'HomeControler',
            resolve: {
                user: metaDatasProvider.checkUser,
                meta: metaDatasProvider.getMeta
            },
            templateUrl: 'app/modules/home/mainHome.html'

        });
    })
/**
 * @class qaobee.modules.home.HomeControler
 */
    .controller('HomeControler', function ($log, $scope, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta, 
                                            effectiveSrv, eventsRestAPI, teamRestAPI, userRestAPI) {
        $translatePartialLoader.addPart('home');
        $translatePartialLoader.addPart('stats');
        $translatePartialLoader.addPart('agenda');
        $translatePartialLoader.addPart('effective');

        $scope.user = user;
        $scope.meta = meta;
        $scope.currentEffective = {};
        $scope.effective = [];
        $scope.currentCategory = {};
        
        /* Events */
        $scope.events = [];
        $scope.owners = [];
        $scope.indexEvent = 0;
        $scope.currentEvent = {};
        $scope.mapShow = false;
        
        /* teams */
        $scope.listTeamHome = {};
        
        /* Collecte */
        $scope.collecte = {};

        
        /* Retrieve list of team of effective */
        $scope.getListTeamHome = function () {
            teamRestAPI.getListTeam($scope.meta.sandbox._id, user.effectiveDefault, 'all', 'false').success(function (data) {
                $scope.listTeamHome = data.sortBy(function(n) {
                    return n.label; 
                });
            });
        }; 
    
        /* Retrieve list player */
        $scope.getEffective = function () { 
            effectiveSrv.getEffective($scope.user.effectiveDefault).then(function(data){
                $scope.currentEffective = data;
                
                effectiveSrv.getListId($scope.currentEffective, 'player').then(function(listId){
                    var listField = Array.create('_id', 'name', 'firstname', 'avatar', 'status');
                    
                    effectiveSrv.getPersons(listId, listField).then(function(players){
                        $scope.effective = players;
                        $scope.effective.forEach(function (e) {
                            if (angular.isDefined(e.status.positionType)) {
                                e.positionType = $filter('translate')('stat.positionType.value.' + e.status.positionType);
                            } else {
                                e.positionType = '';
                            }
                        });    
                    });
                });  
            });                                                                                      
        };
        
        /* Retrieve list events */
        $scope.getEvents = function () {
            var requestEvent = {
                activityId : $scope.meta.activity._id,
                startDate : moment().valueOf(),
                endDate : $scope.meta.season.endDate,
                ownersandboxId : $scope.meta.sandbox._id,
                ownereffectiveId : $scope.user.effectiveDefault,
                type : ['cup', 'friendlyGame','championship']
                
            };

            eventsRestAPI.getListEvents(requestEvent).success(function (data) {
                $scope.events = data.sortBy(function(n) {
                    return n.startDate; 
                });
                
                $scope.getCurrentEvent();
            });
        };
        
        /* get currentEvent */
        $scope.getCurrentEvent = function () {
            $scope.mapShow = false;
            $scope.currentEvent = {};
            
            if(angular.isDefined($scope.events[$scope.indexEvent])) {
                
                $scope.currentEvent = $scope.events[$scope.indexEvent];
                if(angular.isDefined($scope.currentEvent.address)) {
                    $scope.mapShow = true;
                }  
                $log.debug($scope.currentEvent);
            }
        };
        
        /* Next event */
        $scope.nextEvent = function () {
            
            if($scope.indexEvent < $scope.events.length){
                $scope.indexEvent++;
            }
            $scope.getCurrentEvent();
        };
        
        /* Previous event */
        $scope.previousEvent = function () {
            
            if($scope.indexEvent > 0){
                $scope.indexEvent--;
            }
            $scope.getCurrentEvent();
        };
        
        /* check user connected */
        $scope.checkUserConnected = function () {
            
            userRestAPI.getUserById(user._id).success(function (data) {
                $scope.getEvents();
                $scope.getEffective();
                $scope.getListTeamHome();
            }).error(function (data) {
                $log.error('HomeControler : User not Connected');
            });
        }; 
        
        /* Primary, check if user connected */
        $scope.checkUserConnected();
    });
}());