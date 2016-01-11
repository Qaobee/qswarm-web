(function () {
    'use strict';
    /**
     * Module dashboard agenda
     *
     * @author Christophe Kervella
     * @class qaobee.modules.sandbox.agenda.mainAgenda
     * @namespace qaobee.modules.sandbox.agenda
     *
     * @requires {@link qaobee.components.restAPI.sandbox.effective.agenda.eventsRestAPI|qaobee.components.restAPI.sandbox.agenda.eventsRestAPI}
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.agenda', [
        /* angular qaobee */
        'ngAutocomplete',
        
        /* qaobee modules */
        'qaobee.addEvent',
        'qaobee.updateEvent',
        
        /* qaobee Rest API */
        'eventsRestAPI',
        'effectiveRestAPI',
        'userRestAPI'])


        .config(function ($routeProvider, metaDatasProvider) {
                
            $routeProvider.when('/private/agenda/:effectiveId', {
                controller: 'MainAgendaControler',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/modules/sandbox/agenda/mainAgenda.html'

            });
        })

    /**
     * @class qaobee.modules.sandbox.agenda.MainAgendaControler
     * @description Main controller for view mainAgenda.html
     */
        .controller('MainAgendaControler', function ($log, $scope, $routeParams, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta, 
                                                     eventsRestAPI, effectiveRestAPI, userRestAPI) {

        $translatePartialLoader.addPart('commons');
        $translatePartialLoader.addPart('agenda');
        
        $scope.effectiveId = $routeParams.effectiveId;
        $scope.user.effectiveDefault = $scope.effectiveId;
        
        $scope.user = user;
        $scope.meta = meta;
        $log.debug('load', user.periodicity);
        
        if(!user.periodicity){
            $scope.periodicity = 'quarter';
            $scope.periodicityActive = {};
        }

        $scope.events = [];
        $scope.owners = [];
        $scope.effectives = [];
        $scope.currentEffective = {};
        
        /* watch if periodicity change */
        $scope.$watch('periodicityActive', function (newValue, oldValue) {
            if (angular.isDefined(newValue) && !angular.equals(newValue, oldValue)) {
                user.periodicity = $scope.periodicity;
                user.periodicityActive = $scope.periodicityActive;
                $log.debug('watch', user.periodicityActive);
                $scope.getEvents(moment($scope.periodicityActive.startDate,'DD/MM/YYYY').valueOf(), moment($scope.periodicityActive.endDate,'DD/MM/YYYY').valueOf());
            }
        });
        
        $scope.initAgenda = function () {
            if(user.periodicityActive){
                $log.debug('initAgenda',user.periodicityActive)
                $scope.getEvents(moment(user.periodicityActive.startDate,'DD/MM/YYYY').valueOf(), moment(user.periodicityActive.endDate,'DD/MM/YYYY').valueOf());
            }
        }
        
        /* Retrieve list events */
        $scope.getEvents = function (startDate, endDate) {
            
            var requestEvent = {
                activityId : $scope.meta.activity._id,
                startDate : startDate,
                endDate : endDate,
                ownersandboxId : $scope.meta.sandbox._id,
                ownereffectiveId : $scope.effectiveId,
                type : ['cup', 'friendlyGame','championship','training']
                
            };
   
            eventsRestAPI.getListEvents(requestEvent).success(function (data) {
                $scope.events = data.sortBy(function(n) {
                    return n.startDate; 
                });

                $scope.events.forEach(function (a) {
                    a.startDate = moment(a.startDate).format('LLLL');
                });
            });
        };
        
        /* Retrieve list effective */
        $scope.getEffectives = function () {
            
            effectiveRestAPI.getListEffective($scope.meta._id, $scope.currentCategory).success(function (data) {
                $scope.effectives = data.sortBy(function(n) {
                    return n.label; 
                });

                /* retrieve the current effective */ 
                data.forEach(function (a) {
                    if(a._id===$scope.effectiveId) {
                        $scope.currentEffective = a;
                    } 
                });
            });
        };
        
        /* check user connected */
        $scope.checkUserConnected = function () {
            
            userRestAPI.getUserById(user._id).success(function (data) {
                $scope.getEffectives();
                $scope.initAgenda();
            }).error(function (data) {
                $log.error('MainAgendaControler : User not Connected');
            });
        }; 
        
        /* Primary, check if user connected */
        $scope.checkUserConnected();

    })
    //
    ;
}());

