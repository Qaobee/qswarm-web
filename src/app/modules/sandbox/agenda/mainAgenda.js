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
        
        /* qaobee Rest API */
        'eventsRestAPI'])


        .config(function ($routeProvider, metaDatasProvider) {
        
            $routeProvider.when('/private/agenda/:sandBoxId', {
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
                                                     eventsRestAPI) {

        $translatePartialLoader.addPart('commons');
        
        $scope.sandBoxId = $routeParams.sandBoxId;
        
        $scope.user = user;
        $scope.meta = meta;
        $scope.events = [];
        $scope.owners = [];
        
        /* Retrieve list effective */
        $scope.getEvents = function () {
            
            $scope.owners.push($scope.user.effectiveDefault);
            eventsRestAPI.getListEvents($scope.meta.season.startDate, $scope.meta.season.endDate, 'championship', $scope.meta.activity._id, $scope.owners).success(function (data) {
                $scope.events = data.sortBy(function(n) {
                    return n.participants.startdate; 
                });
                
                $scope.events.forEach(function (a) {
                    a.startdate = moment(a.startdate).format('LLLL');
                });
                

                
                $log.debug($scope.events);
            });
        };
        
        $scope.getEvents();
    })
    //
    ;
}());

