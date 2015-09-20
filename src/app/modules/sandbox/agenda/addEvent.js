(function () {
    'use strict';
    /**
     * Module dashboard agenda, add event
     *
     * @author Christophe Kervella
     * @class qaobee.modules.sandbox.agenda.mainAgenda
     * @namespace qaobee.modules.sandbox.agenda
     *
     * @requires {@link qaobee.components.restAPI.sandbox.effective.agenda.eventsRestAPI|qaobee.components.restAPI.sandbox.agenda.eventsRestAPI}
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.addEvent', [
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

            $routeProvider.when('/private/addEvent/:effectiveId', {
                controller: 'AddEventControler',
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
        .controller('AddEventControler', function ($log, $scope, $routeParams, $window, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta, 
                                                     eventsRestAPI, effectiveRestAPI, activityCfgRestAPI, teamRestAPI, locationAPI, userRestAPI) {

        $translatePartialLoader.addPart('commons');
        $translatePartialLoader.addPart('agenda');
        
        $scope.effectiveId = $routeParams.effectiveId;
        
        $scope.user = user;
        $scope.meta = meta;
        $scope.listEventType = {};
        $scope.listTeamHome = {};
        $scope.teamId = '';
        $scope.listTeamAdversary = {};
        $scope.adversaryId = '';
        $scope.chooseAdversary = false;
        $scope.startDate = '';
        $scope.endDate = '';
        $scope.startHours = '';
        $scope.endHours = '';
        $scope.location = 'home';
        
        $scope.addEventTitle = true;
        
        // return button
        $scope.doTheBack = function() {
            $window.history.back();
        };
        
        //Initialization new event
        $scope.event = {
            activityId: $scope.meta.activity._id,
            owner: {
                sandboxId : $scope.meta.sandbox._id,
                effectiveId : $scope.effectiveId
            }, 
            address: {}, 
            link: {}
        };
        
        /* init ngAutocomplete*/
        $scope.options = {};
        $scope.options.watchEnter = true;
        
        $scope.optionsAdr = null;
        $scope.detailsAdr = '';
        
        /* Retrieve list of team of effective */
        $scope.getListTeamHome = function () {
            teamRestAPI.getListTeam($scope.meta.sandbox._id, $scope.user.effectiveDefault, 'true', 'false').success(function (data) {
                $scope.listTeamHome = data.sortBy(function(n) {
                    return n.label; 
                });
            });
        }; 
        
        /* Retrieve list of adversary of effective */
        $scope.getListTeamAdversary = function () {
            teamRestAPI.getListTeam($scope.meta.sandbox._id, $scope.user.effectiveDefault, 'true', 'true').success(function (data) {
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
            });
        };
        
        /* on change event type, calculate the value for chooseAdversary */
        $scope.changeEventType = function () {
            
            if($scope.event.link.type==='training'  || $scope.event.link.type==='other') {
                 $scope.chooseAdversary = false;
            } else {
                $scope.chooseAdversary = true;
            }
        };

        /* Create a new event and add to effective */
        $scope.writeEvent = function () {
                
            /* get effective */
            effectiveRestAPI.getEffective($scope.effectiveId).success(function (data) {

                var effective = data;

                if(angular.isDefined(effective)) {
                    /* add event */
                    eventsRestAPI.addEvent($scope.event).success(function (person) {
                        toastr.success($filter('translate')('addEvent.toastSuccess', {
                            label: $scope.event.label,
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
            var start = moment($scope.startDate).add(((moment($scope.startHours).hour()*60)+moment($scope.startHours).minute()),'m');         
            $scope.event.startDate = moment(start).valueOf();
            
            /* Convert end event to long */
            if (angular.isDefined($scope.endDate) && $scope.endDate!=null && $scope.endDate.isBlank() && angular.isDefined($scope.endHours) && $scope.endHours!=null && !$scope.endHours.isBlank()) {
                var end = moment($scope.endDate).add(((moment($scope.endHours).hour()*60)+moment($scope.endHours).minute()),'m');
                $scope.event.endDate = moment(end).valueOf();
            }
            
            /* add team Id to owner */
            if (angular.isDefined($scope.teamId)) {
                $scope.event.owner['teamId'] = $scope.teamId ;
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

            
            if (angular.isDefined($scope.event.address.formatedAddress) && !$scope.event.address.formatedAddress.isBlank()) {
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
                $scope.getListTeamAdversary();
                $scope.getListEventType();
            }).error(function (data) {
                $log.error('AddEventControler : User not Connected')
            });
        }; 
        
        /* Primary, check if user connected */
        $scope.checkUserConnected();
    })
    //
    ;
}());


