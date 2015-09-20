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
        
            $('.dropdown-button').dropdown();
        
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
        $scope.periodicity = 'month';
        $scope.periodicityActive = {};
        $scope.events = [];
        $scope.owners = [];
        $scope.effectives = [];
        $scope.currentEffective = {};
        
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
        $scope.getCurrentMonth = function () {
            $scope.periodicity = 'month';
            var start = moment('01/'+moment().format('MM/YYYY'),'DD/MM/YYYY');
            var end = moment(start).add(1,'months').subtract(1, 'ms');
            
            $scope.periodicityActive = {
                label: moment(start,'DD/MM/YYYY').format('MMMM YYYY'),
                startDate: start,
                endDate: end,
            };
            
            $scope.getEvents(moment($scope.periodicityActive.startDate,'DD/MM/YYYY').valueOf(), moment($scope.periodicityActive.endDate,'DD/MM/YYYY').valueOf());
        };
        
        /* Previous month */
        $scope.previousMonth = function (index) {
            $scope.periodicity = 'month';
            var start = moment($scope.periodicityActive.startDate,'DD/MM/YYYY').subtract(1, 'month');
            var end = moment($scope.periodicityActive.endDate,'DD/MM/YYYY').subtract(1, 'month');
            
            $scope.periodicityActive = {
                label: moment(start,'DD/MM/YYYY').format('MMMM YYYY'),
                startDate: start,
                endDate: end,
            };
            
            $scope.getEvents(moment($scope.periodicityActive.startDate,'DD/MM/YYYY').valueOf(), moment($scope.periodicityActive.endDate,'DD/MM/YYYY').valueOf());
        };
        
        /* Next month */
        $scope.nextMonth = function (index) {
            $scope.periodicity = 'month';
            var start = moment($scope.periodicityActive.startDate,'DD/MM/YYYY').add(1,'month');
            var end = moment($scope.periodicityActive.endDate,'DD/MM/YYYY').add(1,'month');
            
            $scope.periodicityActive = {
                label: moment(start,'DD/MM/YYYY').format('MMMM YYYY'),
                startDate: start,
                endDate: end,
            };
            
            $scope.getEvents(moment($scope.periodicityActive.startDate,'DD/MM/YYYY').valueOf(), moment($scope.periodicityActive.endDate,'DD/MM/YYYY').valueOf());
        };
        
        /* generate calendar by quarter */
        $scope.getCurrentQuarter = function () {
            $scope.periodicity = 'quarter';
            var quarter = {};
            var currentQuarter = moment().quarter();
            var year = moment().year();
            
            switch(currentQuarter) {
                case 1:
                    quarter = {
                        label: moment('01/01/'+year,'DD/MM/YYYY').format('MMMM YYYY') +' - ' +moment('01/04/'+year,'DD/MM/YYYY').subtract(1, 'ms').format('MMMM YYYY'),
                        startDate: moment('01/01/'+year,'DD/MM/YYYY').format('MMMM YYYY'),
                        endDate: moment('/01/04/'+year,'DD/MM/YYYY').subtract(1, 'ms')
                    };
                    break;
                case 2:
                    quarter = {
                        label: moment('01/04/'+year,'DD/MM/YYYY').format('MMMM YYYY') +' - ' +moment('/01/07/'+year,'DD/MM/YYYY').subtract(1, 'ms').format('MMMM YYYY'),
                        startDate: moment('/01/04/'+year,'DD/MM/YYYY'),
                        endDate: moment('/01/07/'+year,'DD/MM/YYYY').subtract(1, 'ms')
                    };
                    break;
                case 3:
                    quarter = {
                        label: moment('/01/07/'+year,'DD/MM/YYYY').format('MMMM YYYY') +' - ' +moment('/01/10/'+year,'DD/MM/YYYY').subtract(1, 'ms').format('MMMM YYYY'),
                        startDate: moment('/01/07/'+year,'DD/MM/YYYY'),
                        endDate: moment('/01/10/'+year,'DD/MM/YYYY').subtract(1, 'ms')
                    };
                    break;
                case 4:
                    quarter = {
                        label: moment('/01/10/'+year,'DD/MM/YYYY').format('MMMM YYYY') +' - ' +moment('/01/01/'+(year+1),'DD/MM/YYYY').subtract(1, 'ms').format('MMMM YYYY'),
                        startDate: moment('/01/10/'+year,'DD/MM/YYYY'),
                        endDate: moment('/01/01/'+(year+1),'DD/MM/YYYY').subtract(1, 'ms')
                    };
                    break;
                default:
                    quarter = {
                        label: moment('01/01/'+year,'DD/MM/YYYY').format('MMMM YYYY') +' - ' +moment('01/04/'+year,'DD/MM/YYYY').subtract(1, 'ms').format('MMMM YYYY'),
                        startDate: moment('01/01/'+year,'DD/MM/YYYY'),
                        endDate: moment('/01/04/'+year,'DD/MM/YYYY').subtract(1, 'ms')
                    };
            }
            
            /* Current quarter */
            $scope.periodicityActive = quarter;
            
            $scope.getEvents(moment($scope.periodicityActive.startDate,'DD/MM/YYYY').valueOf(), moment($scope.periodicityActive.endDate,'DD/MM/YYYY').valueOf());
        };
        
        /* Previous quarter */
        $scope.previousQuarter = function () {
            $scope.periodicity = 'quarter';
            var start = moment($scope.periodicityActive.startDate,'DD/MM/YYYY').subtract(3,'month');
            var end = moment($scope.periodicityActive.endDate,'DD/MM/YYYY').subtract(3,'month');
            
            $scope.periodicityActive = {
                label: moment(start,'DD/MM/YYYY').format('MMMM YYYY')+' - ' +moment(end,'DD/MM/YYYY').format('MMMM YYYY'),
                startDate: start,
                endDate: end,
            };
            
            $scope.getEvents(moment($scope.periodicityActive.startDate,'DD/MM/YYYY').valueOf(), moment($scope.periodicityActive.endDate,'DD/MM/YYYY').valueOf());
        };
        
        /* Next quarter */
        $scope.nextQuarter = function () {
            $scope.periodicity = 'quarter';
            var start = moment($scope.periodicityActive.startDate,'DD/MM/YYYY').add(3,'month');
            var end = moment($scope.periodicityActive.endDate,'DD/MM/YYYY').add(3,'month');
            
            $scope.periodicityActive = {
                label: moment(start,'DD/MM/YYYY').format('MMMM YYYY')+' - ' +moment(end,'DD/MM/YYYY').format('MMMM YYYY'),
                startDate: start,
                endDate: end,
            };
            
            $scope.getEvents(moment($scope.periodicityActive.startDate,'DD/MM/YYYY').valueOf(), moment($scope.periodicityActive.endDate,'DD/MM/YYYY').valueOf());
        };
        
        /* generate calendar by season */
        $scope.getCurrentSeason = function () {
            $scope.periodicity = 'season';
            $scope.periodicityActive = {
                index: 1,
                label: moment($scope.meta.season.startDate).format('MMMM YYYY') +' - '+ moment($scope.meta.season.endDate).format('MMMM YYYY'),
                startDate: moment($scope.meta.season.startDate),
                endDate: moment($scope.meta.season.endDate)                   
            };

            /* Current month */
            $scope.getEvents(moment($scope.periodicityActive.startDate,'DD/MM/YYYY').valueOf(), moment($scope.periodicityActive.endDate,'DD/MM/YYYY').valueOf());
        };
        
        /* Previous season */
        $scope.previousSeason = function () {
            $scope.periodicity = 'season';
            var start = moment($scope.periodicityActive.startDate,'DD/MM/YYYY').subtract(1,'year');
            var end = moment($scope.periodicityActive.endDate,'DD/MM/YYYY').subtract(1,'year');
            
            $scope.periodicityActive = {
                label: moment(start,'DD/MM/YYYY').format('MMMM YYYY') +' - '+ moment(end,'DD/MM/YYYY').format('MMMM YYYY'),
                startDate: start,
                endDate: end,
            };
            
            $scope.getEvents(moment($scope.periodicityActive.startDate,'DD/MM/YYYY').valueOf(), moment($scope.periodicityActive.endDate,'DD/MM/YYYY').valueOf());
        };
        
        /* Next season */
        $scope.nextSeason = function () {
            $scope.periodicity = 'season';
            var start = moment($scope.periodicityActive.startDate,'DD/MM/YYYY').add(1,'year');
            var end = moment($scope.periodicityActive.endDate,'DD/MM/YYYY').add(1,'year');
            
            $scope.periodicityActive = {
                label: moment(start,'DD/MM/YYYY').format('MMMM YYYY') +' - '+ moment(end,'DD/MM/YYYY').format('MMMM YYYY'),
                startDate: start,
                endDate: end,
            };
            
            $scope.getEvents(moment($scope.periodicityActive.startDate,'DD/MM/YYYY').valueOf(), moment($scope.periodicityActive.endDate,'DD/MM/YYYY').valueOf());
        };
        
        /* check user connected */
        $scope.checkUserConnected = function () {
            
            userRestAPI.getUserById(user._id).success(function (data) {
                $scope.getEffectives();
                $scope.getCurrentMonth();
            }).error(function (data) {
                $log.error('MainAgendaControler : User not Connected')
            });
        }; 
        
        /* Primary, check if user connected */
        $scope.checkUserConnected();

    })
    //
    ;
}());

