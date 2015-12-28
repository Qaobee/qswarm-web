(function () {
    'use strict';
    /**
     * Module dashboard agenda, update event
     *
     * @author Christophe Kervella
     * @class qaobee.modules.sandbox.agenda.updateEvent
     * @namespace qaobee.modules.sandbox.agenda
     *
     * @requires {@link qaobee.components.restAPI.sandbox.effective.agenda.eventsRestAPI|qaobee.components.restAPI.sandbox.agenda.eventsRestAPI}
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.updateEvent', [
        /* angular qaobee */
        'ngAutocomplete',
        
        /* qaobee modules */
        
        /* qaobee Rest API */
        'activityCfgRestAPI',
        'eventsRestAPI',
        'effectiveRestAPI',
        'teamRestAPI',
        'locationAPI',
        'userRestAPI'])


        .config(function ($routeProvider, metaDatasProvider) {

            $routeProvider.when('/private/updateEvent/:eventId', {
                controller: 'UpdateEventControler',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/modules/sandbox/agenda/writeEvent.html'

            });
        })

    /**
     * @class qaobee.modules.sandbox.agenda.MainAgendaControler
     * @description Main controller for view mainAgenda.html
     */
        .controller('UpdateEventControler', function ($log, $scope, $routeParams, $window, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta, 
                                                     eventsRestAPI, effectiveRestAPI, activityCfgRestAPI, teamRestAPI, locationAPI, userRestAPI) {

        $translatePartialLoader.addPart('commons');
        $translatePartialLoader.addPart('agenda');
        $translatePartialLoader.addPart('effective');
        
        $scope.eventId = $routeParams.eventId;
        
        $scope.user = user;
        $scope.meta = meta;
        $scope.listEventType = {};
        $scope.listTeamHome = {};
        $scope.teamId = '';
        $scope.listTeamAdversary = {};
        $scope.adversaryId = '';
        $scope.chooseAdversary = false;
        $scope.chooseHome = false;
        $scope.startDate = '';
        $scope.startHours = '';
        $scope.location = 'home';
        
        //i18n datepicker
        var month = $filter('translate')('commons.format.date.listMonth');
        $scope.month = month.split(',');

        var monthShort = $filter('translate')('commons.format.date.listMonthShort');
        $scope.monthShort = monthShort.split(',');

        var weekdaysFull = $filter('translate')('commons.format.date.listWeekdaysFull');
        $scope.weekdaysFull = weekdaysFull.split(',');

        var weekdaysShort = $filter('translate')('commons.format.date.listWeekdaysShort');
        $scope.weekdaysShort = weekdaysShort.split(',');

        var weekdaysLetter = $filter('translate')('commons.format.date.listWeekdaysLetter');
        $scope.weekdaysLetter = weekdaysLetter.split(',');

        $scope.today = $filter('translate')('commons.format.date.today');
        $scope.clear = $filter('translate')('commons.format.date.clear');
        $scope.close = $filter('translate')('commons.format.date.close');
        $scope.formatDate = $filter('translate')('commons.format.date.label');
        $scope.formatDateSubmit = $filter('translate')('commons.format.date.pattern');

        var $inputDate = $('.datepicker').pickadate({
            format: $scope.formatDate,
            formatSubmit: $scope.formatDateSubmit,
            monthsFull: $scope.month,
            weekdaysFull: $scope.weekdaysFull,
            weekdaysLetter: $scope.weekdaysLetter,
            weekdaysShort: $scope.weekdaysShort,
            today: $scope.today,
            clear: $scope.clear,
            close: $scope.close
        });

        $log.debug('$inputDate',$inputDate);

        $scope.datePicker = $inputDate.pickadate('picker');

        //i18n timepicker
        $scope.formatTime = $filter('translate')('commons.format.hours.label');
        $scope.formatTimeSubmit = $filter('translate')('commons.format.hours.pattern');

        var $inputTimer = $('.timepicker').pickatime({
            format: $scope.formatTime,
            formatSubmit: $scope.formatTimeSubmit,
            clear: $scope.clear,
            min: [13,30],
            max: [21,30]
        });
        $scope.timerPicker = $inputTimer.pickatime('picker');

        $scope.addEventTitle = false;
        
        // return button
        $scope.doTheBack = function() {
            $window.history.back();
        };
        
        //Initialization event
        $scope.event = {};
        
        /* init ngAutocomplete*/
        $scope.options = {};
        $scope.options.watchEnter = true;
        
        $scope.optionsAdr = null;
        $scope.detailsAdr = '';
        
        /* Retrieve list of team of effective */
        $scope.getListTeamHome = function () {
            teamRestAPI.getListTeamHome($scope.meta.sandbox._id, $scope.user.effectiveDefault, 'true').success(function (data) {
                $scope.listTeamHome = data.sortBy(function(n) {
                    return n.label; 
                });
                
                $scope.getListEventType();
            });
        }; 
        
        /* Retrieve list of adversary of effective */
        $scope.getListAdversary = function (teamId) {
            teamRestAPI.getListTeamAdversary($scope.meta.sandbox._id, $scope.user.effectiveDefault, 'true', teamId).success(function (data) {
                $scope.listTeamAdversary = data.sortBy(function(n) {
                    return n.label; 
                });
            });
        };
        
        /* Retrieve list of event type */
        $scope.getListEventType = function () {
            activityCfgRestAPI.getParamFieldList(moment().valueOf(), $scope.meta.activity._id, $scope.meta.structure.country._id, 'listEventType').success(function (data) {
                $scope.listEventType = data.sortBy(function(n) {
                    return n.order; 
                });
                
                $scope.getEvent();
            });
        };
        
        /* on change event type, calculate the value for chooseAdversary */
        $scope.changeTeamHome = function () {
            
            teamRestAPI.getListTeamAdversary($scope.meta.sandbox._id, $scope.user.effectiveDefault, 'true', $scope.teamId).success(function (data) {
                $scope.listTeamAdversary = data.sortBy(function(n) {
                    return n.label; 
                });
            });
            $scope.chooseHome = true;
        };
        
        /* on change event type, calculate the value for chooseAdversary */
        $scope.changeEventType = function () {
            
            if($scope.event.link.type==='training'  || $scope.event.link.type==='other') {
                 $scope.chooseAdversary = false;
                $scope.chooseHome = false;
            } else {
                $scope.chooseAdversary = true;
            }
        };
        
        /* Retrieve current event */
        $scope.getEvent = function () {
            
            eventsRestAPI.getEvent($scope.eventId).success(function (data) {
                $scope.event = data;
                
                /* Formatage des dates et heures */
                if(angular.isDefined($scope.event.startDate)) {
                    
                    $scope.startDate = $scope.event.startDate;
                    $scope.startHours = $scope.startDate;

                    $scope.datePicker.set('select', $scope.startDate.valueOf());
                    $scope.timerPicker.set('select', [moment($scope.startHours).hour(),moment($scope.startHours).minute()]);
                }
                
                if($scope.event.link.type==='training'  || $scope.event.link.type==='other') {
                     $scope.chooseAdversary = false;
                } else {
                    $scope.chooseAdversary = true;
                    $scope.chooseHome = true;
                }
                
                /* alimentation des listes des équipes */
                if(angular.isDefined($scope.event.participants.teamHome.id)) {
                    $scope.teamId = $scope.event.participants.teamHome.id;
                    
                    var teamFound = $scope.listTeamHome.find(function(n) {
                        return n._id === $scope.teamId;
                    });
                    
                    if(angular.isDefined(teamFound)) {
                        $scope.location = 'home';
                        $scope.adversaryId = $scope.event.participants.teamVisitor.id;
                    } else {
                        $scope.location = 'outside';
                        $scope.teamId = $scope.event.participants.teamVisitor.id;
                        $scope.adversaryId = $scope.event.participants.teamHome.id;
                    }
                    $scope.getListAdversary($scope.teamId);
                }
                
            });
        };    

        /* Create a new event and add to effective */
        $scope.writeEvent = function () {
                
            /* get effective */
            effectiveRestAPI.getEffective($scope.user.effectiveDefault).success(function (data) {

                var effective = data;

                if(angular.isDefined(effective)) {
                    /* update event */
                    eventsRestAPI.updateEvent($scope.event).success(function (event) {
                        $scope.event = event;
                        toastr.success($filter('translate')('updateEvent.toastSuccess', {
                            label: event.label,
                            effective: effective.categoryAge.label
                        }));

                        $window.history.back();
                    });
                }
            });
        };
        
        /* Format event */
        $scope.checkAndformatEvent = function () {

            /* Convert start event to long */
            var start = moment($scope.startDate,'DD/MM/YYYY');
            start.hour(moment($scope.startHours,'HH').hour());
            start.minutes(moment($scope.startHours,'m mm').minutes());
            $scope.event.startDate = moment(start).valueOf();

            /* add team Id to owner */
            if (angular.isDefined($scope.teamId)) {
                $scope.event.owner.teamId = $scope.teamId ;
            }
            
            /* add participants event */
            var participants = {};
            var team = {};
            var adversary = {};
            
            angular.forEach($scope.listTeamHome, function (item) {
                if(item._id === $scope.teamId) {
                    team = item;
                }   
            });
            
            angular.forEach($scope.listTeamAdversary, function (item) {
                if(item._id === $scope.adversaryId) {
                    adversary = item;
                }   
            });
            
            if ($scope.location === 'home') {
                participants = { 
                    teamHome: {id:team._id, label:team.label},
                    teamVisitor: {id:adversary._id, label:adversary.label}
                };
            } else {
                participants = { 
                    teamVisitor: {id:team._id, label:team.label},
                    teamHome: {id:adversary._id, label:adversary.label}
                };
            }
                
            $scope.event.participants = participants ;

            
            if (angular.isDefined($scope.event.address) && angular.isDefined($scope.event.address.formatedAddress) && !$scope.event.address.formatedAddress.isBlank()) {
                locationAPI.get($scope.event.address.formatedAddress).then(function (adr) {
                    $scope.event.address.lat = adr.data.results[0].geometry.location.lat;
                    $scope.event.address.lng = adr.data.results[0].geometry.location.lng;
                    angular.forEach(adr.data.results[0].address_components, function (item) {
                        if (item.types.count('street_number') > 0) {
                            $scope.event.address.place = item.long_name + ' ';
                        }
                        if (item.types.count('route') > 0) {
                            $scope.event.address.place += item.long_name;
                        }
                        if (item.types.count('locality') > 0) {
                            $scope.event.address.city = item.long_name;
                        }
                        if (item.types.count('postal_code') > 0) {
                            $scope.event.address.zipcode = item.long_name;
                        }
                        if (item.types.count('country') > 0) {
                            $scope.event.address.country = item.long_name;
                        }
                    });
                    
                    $scope.writeEvent();
                });
            } else {
                $scope.writeEvent();
            }
        };
        
        /* check user connected */
        $scope.checkUserConnected = function () {
            
            userRestAPI.getUserById(user._id).success(function (data) {
                $scope.getListTeamHome();
            }).error(function (data) {
                $log.error('UpdateEventControler : User not Connected');
            });
        }; 
        
        /* Primary, check if user connected */
        $scope.checkUserConnected();
    })
    //
    ;
}());


