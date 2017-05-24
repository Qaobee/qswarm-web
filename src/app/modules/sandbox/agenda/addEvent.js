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
        'personSRV',
        /* qaobee Rest API */
        'activityCfgRestAPI',
        'eventsRestAPI',
        'effectiveRestAPI',
        'teamRestAPI',
        'locationAPI'])


        .config(function ($routeProvider, metaProvider, userProvider) {
            $routeProvider.when('/private/addEvent/:effectiveId', {
                controller: 'AddEventControler',
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
        .controller('AddEventControler', function ($log, $scope, $routeParams, $window, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta,
                                                   eventsRestAPI, effectiveRestAPI, activityCfgRestAPI, teamRestAPI, locationAPI, personSrv) {

            $translatePartialLoader.addPart('commons').addPart('agenda').addPart('effective');
            $scope.effectiveId = $routeParams.effectiveId;
            $scope.user = user;
            $scope.meta = meta;
            $scope.listEventType = {};
            $scope.listTeamHome = {};
            $scope.data = {teamId: '', adversaryLabel : ''};
            $scope.listTeamAdversary = {};
            $scope.adversaryLabel = '';
            $scope.chooseAdversary = false;
            $scope.chooseHome = false;
            $scope.startDate = '';
            $scope.startHours = '';
            $scope.location = 'home';
            $scope.addEventTitle = true;
            $scope.options = {};
            $scope.options.watchEnter = true;
            $scope.optionsAdr = null;
            $scope.detailsAdr = '';

            // return button
            $scope.doTheBack = function () {
                $window.history.back();
            };

            //Initialization new event
            $scope.event = {
                activityId: $scope.meta.sandbox.activityId,
                owner: {
                    sandboxId: $scope.meta.sandbox._id,
                    effectiveId: $scope.effectiveId
                },
                address: {},
                link: {}
            };

            /* Retrieve list of team of effective */
            $scope.getListTeamHome = function () {
                teamRestAPI.getListTeamHome($scope.meta.sandbox._id, $scope.meta.sandbox.effectiveDefault, 'true').success(function (data) {
                    $scope.listTeamHome = data.sortBy(function (n) {
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
                });
            };

            /* on change event type, calculate the value for chooseAdversary */
            $scope.changeTeamHome = function () {
                console.log($scope.data.teamId)
                $scope.data.adversaryLabel = '';
                $scope.chooseHome = true;
                teamRestAPI.getListTeamAdversary($scope.meta.sandbox._id, $scope.meta.sandbox.effectiveDefault, 'true', $scope.data.teamId).success(function (data) {
                    $scope.listTeamAdversary = data.sortBy(function (n) {
                        return n.label;
                    });
                });
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

            /* Create a new event and add to effective */
            $scope.writeEvent = function () {

                /* get effective */
                effectiveRestAPI.getEffective($scope.effectiveId).success(function (data) {
                    var effective = data;
                    if (angular.isDefined(effective)) {
                        /* add event */
                        eventsRestAPI.addEvent($scope.event).success(function (event) {
                            $scope.event = event;
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
                var start = moment($scope.startDate, 'DD/MM/YYYY');
                start.hour(moment($scope.startHours, 'HH').hour());
                start.minutes(moment($scope.startHours, 'm mm').minutes());
                $scope.event.startDate = moment(start).valueOf();
                console.log($scope.data.teamId)
                /* add team Id to owner */
                if (angular.isDefined($scope.data.teamId)) {
                    $scope.event.owner.teamId = $scope.data.teamId;
                }

                /* add participants event */
                var participants = {};
                var team = {};
                var adversary = {};

                angular.forEach($scope.listTeamHome, function (item) {
                    if (item._id === $scope.data.teamId) {
                        team = item;
                    }
                });
                console.log($scope.data.adversaryLabel)
                angular.forEach($scope.listTeamAdversary, function (item) {
                    if (item.label === $scope.data.adversaryLabel) {
                        adversary = item;
                    }
                });
                //new adversary
                if (angular.isUndefined(adversary.label)) {
                    adversary = {
                        "label": $scope.data.adversaryLabel,
                        "sandboxId": $scope.meta.sandbox._id,
                        "effectiveId": $scope.meta.sandbox.effectiveDefault,
                        "linkTeamId": [team._id],
                        "enable": true,
                        "adversary": true
                    };

                    console.log('add team',adversary)
                    /* add team */
                    teamRestAPI.addTeam(adversary).success(function (data) {
                        adversary = data;
                        if ($scope.location === 'home') {
                            participants = {
                                teamHome: {_id: team._id, label: team.label},
                                teamVisitor: {_id: adversary._id, label: adversary.label}
                            };
                        } else {
                            participants = {
                                teamVisitor: {_id: team._id, label: team.label},
                                teamHome: {_id: adversary._id, label: adversary.label}
                            };
                        }

                        $scope.event.participants = participants;
                        personSrv.formatAddress($scope.event.address).then(function (adr) {
                            $scope.event.address = adr;
                            $scope.writeEvent();
                        });

                    });
                } else {

                    console.log('existing team',adversary)
                    if ($scope.location === 'home') {
                        participants = {
                            teamHome: {_id: team._id, label: team.label},
                            teamVisitor: {_id: adversary._id, label: adversary.label}
                        };
                    } else {
                        participants = {
                            teamVisitor: {_id: team._id, label: team.label},
                            teamHome: {_id: adversary._id, label: adversary.label}
                        };
                    }

                    $scope.event.participants = participants;
                    $scope.event.seasonCode = meta.season.code;
                    personSrv.formatAddress($scope.event.address).then(function (adr) {
                        $scope.event.address = adr;
                        $scope.writeEvent();
                    });
                }
            };

            $scope.getListTeamHome();
            $scope.getListEventType();
        })
    //
    ;
}());
