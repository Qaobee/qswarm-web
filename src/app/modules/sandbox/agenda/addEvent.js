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
        'teamRestAPI'])


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
                                                     eventsRestAPI, effectiveRestAPI, activityCfgRestAPI, teamRestAPI) {

        $translatePartialLoader.addPart('commons');
        $translatePartialLoader.addPart('agenda');
        
        $scope.effectiveId = $routeParams.effectiveId;
        
        $scope.user = user;
        $scope.meta = meta;
        $scope.listEventType = {};
        $scope.listTeamHome = {};
        $scope.listTeamAdversary = {};
        $scope.chooseAdversary = false;
        
        $scope.addEventTitle = true;
        
        // return button
        $scope.doTheBack = function() {
            $window.history.back();
        };
        
        //Initialization new event
        $scope.newEvent = {
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
        teamRestAPI.getListTeam($scope.meta.sandbox._id, $scope.effectiveId, 'true', 'false').success(function (data) {
            $scope.listTeamHome = data.sortBy(function(n) {
                    return n.label; 
                });
        });
        
        /* Retrieve list of adversary of effective */
       teamRestAPI.getListTeam($scope.meta.sandbox._id, $scope.effectiveId, 'true', 'true').success(function (data) {
            $scope.listTeamAdversary = data.sortBy(function(n) {
                    return n.label; 
                });
        });
        
        /* Retrieve list of event type */
        activityCfgRestAPI.getParamFieldList(moment().valueOf(), $scope.meta.activity._id, $scope.meta.structure.country._id, 'listEventType').success(function (data) {
            $scope.listEventType = data.sortBy(function(n) {
                    return n.order; 
                });
        });

        /* Create a new event and add to effective */
        $scope.writeEvent = function () {
                
            /* get effective */
            effectiveRestAPI.getEffective($scope.effectiveId).success(function (data) {

                var effective = data;

                if(angular.isDefined(effective)) {
                    /* add event */
                    eventsRestAPI.addEvent($scope.newEvent).success(function (person) {
                        toastr.success($filter('translate')('addEvent.toastSuccess', {
                            label: $scope.newEvent.label,
                            effective: effective.categoryAge.label
                        }));

                        $window.history.back();
                    });
                }
            });
        };
        
        /* Format address */
        $scope.checkAndformatAddress = function () {
            if (angular.isDefined($scope.newEvent.address.formatedAddress) && !$scope.newEvent.address.formatedAddress.isBlank()) {
                locationAPI.get($scope.newEvent.address.formatedAddress).then(function (adr) {
                    $scope.newEvent.address.lat = adr.data.results[0].geometry.location.lat;
                    $scope.newEvent.address.lng = adr.data.results[0].geometry.location.lng;
                    angular.forEach(adr.data.results[0].address_components, function (item) {
                        if (item.types.count('street_number') > 0) {
                            $scope.newEvent.address.place = item.long_name + ' ';
                        }
                        if (item.types.count('route') > 0) {
                            $scope.newEvent.address.place += item.long_name;
                        }
                        if (item.types.count('locality') > 0) {
                            $scope.newEvent.address.city = item.long_name;
                        }
                        if (item.types.count('postal_code') > 0) {
                            $scope.newEvent.address.zipcode = item.long_name;
                        }
                        if (item.types.count('country') > 0) {
                            $scope.newEvent.address.country = item.long_name;
                        }
                    });
                    
                    $scope.writeEvent();
                });
            } else {
                $scope.writeEvent();
            }
        };
    })
    //
    ;
}());


