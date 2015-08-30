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
        'eventsRestAPI',
        'effectiveRestAPI'])


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
                                                     eventsRestAPI, effectiveRestAPI) {

        $translatePartialLoader.addPart('commons');
        $translatePartialLoader.addPart('agenda');
        
        $scope.effectiveId = $routeParams.effectiveId;
        
        $scope.user = user;
        $scope.meta = meta;
        $scope.months = [];
        $scope.quarters = [];
        $scope.periodicity = 'month';
        $scope.periodicityActive = {};
        $scope.events = [];
        $scope.owners = [];
        $scope.effectives = [];
        $scope.currentEffective = {};
        
        /* Retrieve list effective */
        $scope.getEvents = function (startDate, endDate) {
            $log.debug(startDate);
            $log.debug(endDate);
            $scope.owners.push($scope.effectiveId);
            var eventTypes = ['cup', 'friendlyGame','championship'];
            eventsRestAPI.getListEvents(startDate, endDate, eventTypes, $scope.meta.activity._id, $scope.owners).success(function (data) {
                $scope.events = data.sortBy(function(n) {
                    return n.participants.startdate; 
                });

                $scope.events.forEach(function (a) {
                    a.startDate = moment(a.startDate).format('LLLL');
                });
            });
        };
        
        /* Retrieve list effective */
        $scope.getEffectives = function () {
            
            effectiveRestAPI.getListMemberEffective($scope.meta._id, $scope.currentCategory).success(function (data) {
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
        
        /* generate calendar by month */
        $scope.getCalendarMonths = function () {
            $scope.months = [];
            $scope.periodicity = 'month';
            var month = {};
            var start = moment('01/'+moment($scope.meta.season.startDate).format('MM/YYYY'),'DD/MM/YYYY');
            var currentMonth = moment().date(1);
              
            for(var i=0; i<12; i++) {
                var startDate = moment(start).add(i,'months');
                var endDate =  moment(startDate).add(1,'months').subtract(1,'seconds');

                month = {
                    index: i,
                    label: moment(startDate).format('MMMM'),
                    startDate: moment(startDate).format('L'),
                    endDate: moment(endDate).format('L'),
                    active: (moment(startDate).format('L') === moment(currentMonth).format('L') ? true : false)
                };
                
                /* Current month */
                if(month.active) {
                    $scope.periodicityActive = {
                        index: i,
                        label: moment(month.startDate,'DD/MM/YYYY').format('MMMM YYYY'),
                        startDate: moment(month.startDate,'DD/MM/YYYY'),
                        endDate: moment(month.endDate,'DD/MM/YYYY'),
                    };
                }  
                
                $scope.months.push(month);
            };
            
            $scope.getEvents(moment($scope.periodicityActive.startDate,'DD/MM/YYYY').valueOf(), moment($scope.periodicityActive.endDate,'DD/MM/YYYY').valueOf());
        };
        
        /* generate calendar by month */
        $scope.getEventMonth = function (index) {
            $scope.periodicity = 'month';
            
            for(var i=0; i<$scope.months.length; i++) {
                $scope.months[i].active = false;
                if(i === index) {
                    $scope.months[index].active = true;
                    $scope.periodicityActive = {
                        index: i,
                        label: moment($scope.months[index].startDate,'DD/MM/YYYY').format('MMMM YYYY'),
                        startDate: moment($scope.months[index].startDate,'DD/MM/YYYY'),
                        endDate: moment($scope.months[index].endDate,'DD/MM/YYYY'),
                    };
                }
            };
            
            $scope.getEvents(moment($scope.periodicityActive.startDate,'DD/MM/YYYY').valueOf(), moment($scope.periodicityActive.endDate,'DD/MM/YYYY').valueOf());
        };
        
        /* generate calendar by quarter */
        $scope.getCalendarQuarters = function () {
            $scope.periodicity = 'quarter';
            var quarter = {};
            var start = moment('01/'+moment($scope.meta.season.startDate).format('MM/YYYY'),'DD/MM/YYYY');
            var currentMonth = moment().date(1);
              
            for(var i=0; i<12; i++) {
                var startDate = moment(start).add(i,'months');
                var endDate =  moment(startDate).add(1,'months').subtract(1,'seconds');

                quarter = {
                    label: moment(startDate).format('MMM'),
                    startDate: moment(startDate).format('L'),
                    endDate: moment(endDate).format('L'),
                    active: (moment(startDate).format('L') === moment(currentMonth).format('L') ? true : false)
                };
                
                /* Current month */
                if(month.active) {
                    $scope.periodicityActive = quarter;
                }  
                
                $scope.quarters.push(quarter);
            };            
            
            $scope.getEvents(moment($scope.periodicityActive.startDate,'DD/MM/YYYY').valueOf(), moment($scope.periodicityActive.endDate,'DD/MM/YYYY').valueOf());
        };
        
        /* generate calendar by season */
        $scope.getCalendarSeason = function () {
            $scope.periodicity = 'season';
            $scope.periodicityActive = {
                index: 1,
                label: $scope.meta.season.label,
                startDate: moment($scope.meta.season.startDate,'DD/MM/YYYY').format('L'),
                endDate: moment($scope.meta.season.endDate,'DD/MM/YYYY').format('L')                   
            };

            /* Current month */
            $scope.getEvents($scope.meta.season.startDate, $scope.meta.season.endDate);
        };

        $scope.getEffectives();
        $scope.getCalendarMonths();
    })
    //
    ;
}());

