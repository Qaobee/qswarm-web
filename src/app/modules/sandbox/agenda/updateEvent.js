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
        'personSRV',
        /* qaobee Rest API */
        'activityCfgRestAPI',
        'eventsRestAPI',
        'effectiveRestAPI',
        'teamRestAPI',
        'locationAPI',
        'userRestAPI'])

        .config(function ($routeProvider, metaProvider, userProvider) {
            $routeProvider.when('/private/updateEvent/:eventId', {
                controller: 'UpdateEventControler',
                resolve: {
                    user: userProvider.$get,
                    meta: metaProvider.$get
                },
                templateUrl: 'app/modules/sandbox/agenda/writeEvent.html'
            });
        })

        /**
         * @class qaobee.modules.sandbox.agenda.MainAgendaControler
         * @description Main controller for view mainAgenda.html
         */
        .controller('UpdateEventControler', function ($log, $scope, $routeParams, $window, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta,
                                                      eventsRestAPI, effectiveRestAPI, activityCfgRestAPI, teamRestAPI, locationAPI, userRestAPI, personSrv) {

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
            $scope.adversaryLabel = '';
            $scope.chooseAdversary = false;
            $scope.chooseHome = false;
            $scope.startDate = '';
            $scope.startHours = '';
            $scope.location = 'home';
            //$scope.minDate = new Date().toISOString();

            /****************************************
             * end Datapicker et timepicker
             ***************************************/

            $scope.addEventTitle = false;
            // return button
            $scope.doTheBack = function () {
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
                teamRestAPI.getListTeamHome($scope.meta.sandbox._id, $scope.meta.sandbox.effectiveDefault, 'true').success(function (data) {
                    $scope.listTeamHome = data.sortBy(function (n) {
                        return n.label;
                    });
                    $scope.getListEventType();
                });
            };
            /* Retrieve list of adversary of effective */
            $scope.getListAdversary = function (teamId) {
                teamRestAPI.getListTeamAdversary($scope.meta.sandbox._id, $scope.meta.sandbox.effectiveDefault, 'true', teamId).success(function (data) {
                    $scope.listTeamAdversary = data.sortBy(function (n) {
                        return n.label;
                    });
                });
            };

            /* Retrieve list of event type */
            $scope.getListEventType = function () {
                activityCfgRestAPI.getParamFieldList(moment().valueOf(), $scope.meta.sandbox.activityId, $scope.meta.sandbox.structure.country._id, 'listEventType').success(function (data) {
                    $scope.listEventType = data.sortBy(function (n) {
                        return n.order;
                    });

                    $scope.getEvent();
                });
            };

            /* on change event type, calculate the value for chooseAdversary */
            $scope.changeTeamHome = function () {

                teamRestAPI.getListTeamAdversary($scope.meta.sandbox._id, $scope.meta.sandbox.effectiveDefault, 'true', $scope.teamId).success(function (data) {
                    $scope.listTeamAdversary = data.sortBy(function (n) {
                        return n.label;
                    });
                });
                $scope.adversaryLabel = '';
                $scope.chooseHome = true;
            };

            /* on change event type, calculate the value for chooseAdversary */
            $scope.changeEventType = function () {

                if ($scope.event.link.type === 'training' || $scope.event.link.type === 'other') {
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
                    if (angular.isDefined($scope.event.startDate)) {

                        $scope.startDate = moment($scope.event.startDate).toDate();
                        $scope.startHours = moment($scope.startDate).hour()+':'+moment($scope.startDate).minute();
                        $scope.datePicker = angular.element('#EventStartDate').pickadate('picker');
                        $log.debug('datePicker',$scope.startDate.valueOf());
                        $scope.datePicker.set('select', $scope.startDate.valueOf());
                        
                        
                    }

                    /* View participants management */
                    if ($scope.event.link.type === 'training' || $scope.event.link.type === 'other') {
                        $scope.chooseAdversary = false;
                    } else {
                        $scope.chooseAdversary = true;
                        $scope.chooseHome = true;
                    }

                    /* Participant Home/Visitor management */
                    if (angular.isDefined($scope.event.participants.teamHome.id)) {
                        $scope.teamId = $scope.event.participants.teamHome.id;

                        var teamFound = $scope.listTeamHome.find(function (n) {
                            return n._id === $scope.teamId;
                        });

                        if (angular.isDefined(teamFound)) {
                            $scope.location = 'home';
                            $scope.adversaryLabel = $scope.event.participants.teamVisitor.label;
                        } else {
                            $scope.location = 'outside';
                            $scope.teamId = $scope.event.participants.teamVisitor.id;
                            $scope.adversaryLabel = $scope.event.participants.teamHome.label;
                        }
                        $scope.getListAdversary($scope.teamId);
                    }

                });
            };

            /* Create a new event and add to effective */
            $scope.writeEvent = function () {

                /* get effective */
                effectiveRestAPI.getEffective($scope.meta.sandbox.effectiveDefault).success(function (data) {

                    var effective = data;

                    if (angular.isDefined(effective)) {
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
                var start = moment($scope.startDate, 'DD/MM/YYYY');
                start.hour(moment($scope.startHours, 'HH').hour());
                start.minutes(moment($scope.startHours, 'm mm').minutes());
                $scope.event.startDate = moment(start).valueOf();

                /* add team Id to owner */
                if (angular.isDefined($scope.teamId)) {
                    $scope.event.owner.teamId = $scope.teamId;
                }

                /* add participants event */
                var participants = {};
                var adversary = {};
                var team = {};

                /* Team home */
                angular.forEach($scope.listTeamHome, function (item) {
                    if (item._id === $scope.teamId) {
                        team = item;
                    }
                });

                /* adversary */
                angular.forEach($scope.listTeamAdversary, function (item) {
                    if (item.label === $scope.adversaryLabel) {
                        adversary = item;
                    }
                });

                //new adversary
                if (angular.isUndefined(adversary.label)) {
                    adversary = {
                        "label": $scope.adversaryLabel,
                        "sandboxId": $scope.meta.sandbox._id,
                        "effectiveId": $scope.meta.sandbox.effectiveDefault,
                        "linkTeamId": [team._id],
                        "enable": true,
                        "adversary": true
                    };

                    /* add new adversary */
                    teamRestAPI.addTeam(adversary).success(function (data) {
                        adversary = data;

                        /* Participant Home/Visitor management */
                        if ($scope.location === 'home') {
                            participants = {
                                teamHome: {id: team._id, label: team.label},
                                teamVisitor: {id: adversary._id, label: adversary.label}
                            };
                        } else {
                            participants = {
                                teamVisitor: {id: team._id, label: team.label},
                                teamHome: {id: adversary._id, label: adversary.label}
                            };
                        }

                        $scope.event.participants = participants;

                        /* address management */
                        personSrv.formatAddress($scope.event.address).then(function (adr) {
                            $scope.event.address = adr;
                            $scope.writeEvent();
                        });

                    });
                } else {
                    /* Participant Home/Visitor management */
                    if ($scope.location === 'home') {
                        participants = {
                            teamHome: {id: team._id, label: team.label},
                            teamVisitor: {id: adversary._id, label: adversary.label}
                        };
                    } else {
                        participants = {
                            teamVisitor: {id: team._id, label: team.label},
                            teamHome: {id: adversary._id, label: adversary.label}
                        };
                    }

                    $scope.event.participants = participants;

                    /* address management */
                    personSrv.formatAddress($scope.event.address).then(function (adr) {
                        $scope.event.address = adr;
                        $scope.writeEvent();
                    });
                }
            };

            /* check user connected */
            $scope.checkUserConnected = function () {

                userRestAPI.getUserById(user._id).success(function () {
                    $scope.getListTeamHome();
                }).error(function () {
                    $log.error('UpdateEventControler : User not Connected');
                });
            };

            /* Primary, check if user connected */
            $scope.checkUserConnected();
        })
    //
    ;
}());


