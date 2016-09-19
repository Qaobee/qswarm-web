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
        'locationAPI',
        'userRestAPI'])


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
                                                   $translate, eventsRestAPI, effectiveRestAPI, activityCfgRestAPI, teamRestAPI, locationAPI, userRestAPI, personSrv) {

            $translatePartialLoader.addPart('commons');
            $translatePartialLoader.addPart('agenda');
            $translatePartialLoader.addPart('effective');

            $scope.effectiveId = $routeParams.effectiveId;

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

            //i18n datepicker
            $translate(['commons.format.date.listMonth',
                'commons.format.date.listMonthShort',
                'commons.format.date.listWeekdaysFull',
                'commons.format.date.listWeekdaysShort',
                'commons.format.date.listWeekdaysLetter',
                'commons.format.date.today',
                'commons.format.date.clear',
                'commons.format.date.close',
                'commons.format.date.label',
                'commons.format.date.pattern'
            ]).then(function (translations) {
                $scope.format = translations['commons.format.date.label'];
                $scope.formatSubmit = translations['commons.format.date.pattern'];
                $scope.monthsFull = translations['commons.format.date.listMonth'].split(',');
                $scope.monthShort = translations['commons.format.date.listMonthShort'].split(',');
                $scope.weekdaysFull = translations['commons.format.date.listWeekdaysFull'].split(',');
                $scope.weekdaysLetter = translations['commons.format.date.listWeekdaysLetter'].split(',');
                $scope.weekdaysShort = translations['commons.format.date.listWeekdaysShort'].split(',');
                $scope.selectYears = 3;
                $scope.selectMonths = true;
                $scope.today = translations['commons.format.date.today'];
                $scope.clear = translations['commons.format.date.clear'];
                $scope.close = translations['commons.format.date.close'];
            });
        
            //i18n timepicker
            $scope.close = $filter('translate')('commons.format.date.close');

            $scope.addEventTitle = true;

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


                /* add team Id to owner */
                if (angular.isDefined($scope.teamId)) {
                    $scope.event.owner.teamId = $scope.teamId;
                }

                /* add participants event */
                var participants = {};
                var team = {};
                var adversary = {};

                angular.forEach($scope.listTeamHome, function (item) {
                    if (item._id === $scope.teamId) {
                        team = item;
                    }
                });

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

                    /* add team */
                    teamRestAPI.addTeam(adversary).success(function (data) {
                        adversary = data;
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
                        personSrv.formatAddress($scope.event.address).then(function (adr) {
                            $scope.event.address = adr;
                            $scope.writeEvent();
                        });

                    });
                } else {
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
                    $scope.getListEventType();
                }).error(function () {
                    $log.error('AddEventControler : User not Connected');
                });
            };
            /* Primary, check if user connected */
            $scope.checkUserConnected();
        })
    //
    ;
}());


