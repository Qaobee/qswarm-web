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
        
        /* qaobee Rest API */
        'effectiveRestAPI',
        'personRestAPI',
        'eventsRestAPI',
        
        /* qaobee widget */
        'widget.nextEvent'])

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
                                            effectiveRestAPI, personRestAPI, eventsRestAPI) {
        $translatePartialLoader.addPart('home');
        $translatePartialLoader.addPart('stats');

        $scope.user = user;
        $scope.meta = meta;
        $scope.effective = [];
        $scope.currentCategory = {};
        
        /* Events */
        $scope.events = [];
        $scope.owners = [];
        $scope.indexEvent = 0;
        $scope.currentEvent = {};
        $scope.mapShow = false;

        $('.collapsible').collapsible({accordion: false});
    
        /* Retrieve list player */
        $scope.getEffective = function () {
            effectiveRestAPI.getEffective($scope.user.effectiveDefault).success(function (data) {
                
                $scope.currentEffective = data;
                /* build list id for request API person */   
                var listId = [];
                
                $scope.currentCategory = $scope.currentEffective.categoryAge;
                $scope.currentEffective.members.forEach(function (b) {
                    if (b.role.code==='player') {
                        listId.push(b.personId);
                    }    
                });
                
                var listField = Array.create('_id', 'name', 'firstname', 'avatar', 'status');
                /* retrieve person information */
                personRestAPI.getListPerson(listId, listField).success(function (data) {

                    data.forEach(function (e) {
                        if (angular.isDefined(e.status.positionType)) {
                            e.positionType = $filter('translate')('stat.positionType.value.' + e.status.positionType);
                        } else {
                            e.positionType = '';
                        }
                    });
                    $scope.effective = data;
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
        
        $scope.getEvents();
        $scope.getEffective();
    });
}());