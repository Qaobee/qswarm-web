(function () {
    'use strict';
    /**
     * Module Gérant la partie publique du site
     *
     * @class qaobee.modules.home.mainHome
     * @author Christophe Kervella
     * @copyright <b>QaoBee</b>.
     * @requires {@link https://docs.angularjs.org/api/ngRoute|ngRoute}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.effectiveRestAPI|qaobee.components.restAPI.sandbox.effective.effectiveRestAPI}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.personRestAPI|qaobee.components.restAPI.sandbox.effective.personRestAPI}
     * @requires {@link qaobee.components.widgets.event.widget.nextEvent|qaobee.components.widgets.event.widget.nextEvent}
     */
    angular.module('qaobee.home', [

            /* qaobee services */
            'effectifSRV',
            /* qaobee Rest API */
            'collecteRestAPI',
            'eventsRestAPI',
            'teamRestAPI',
            'userRestAPI'])

        .config(function ($routeProvider, metaDatasProvider) {
            $routeProvider.when('/private', {
                controller: 'HomeControler',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/modules/home/mainHome.html'

            });
        })
        /**
         * @class qaobee.modules.home.HomeControler
         */
        .controller('HomeControler', function ($log, $scope, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta, $window,
                                               effectiveSrv, collecteRestAPI, eventsRestAPI, teamRestAPI, userRestAPI, widgetDefinitionsHome, defaultWidgetsHome) {
            $translatePartialLoader.addPart('home');
            $translatePartialLoader.addPart('stats');
            $translatePartialLoader.addPart('agenda');
            $translatePartialLoader.addPart('effective');
            $scope.user = user;
            $scope.meta = meta;
            $scope.activeTabIndex =0;

            $scope.dashboardOptionsHome = {
                widgetButtons: false,
                widgetDefinitions: widgetDefinitionsHome.get(),
                hideWidgetName: true,
                defaultWidgets: defaultWidgetsHome,
                storage: $window.localStorage,
                storageId: 'qaobee-widgets-dashboard-home'
            };

            $scope.currentEffective = {};
            $scope.effective = [];
            $scope.currentCategory = {};

            /* Events */
            $scope.events = [];
            $scope.owners = [];
            $scope.indexEvent = 0;
            $scope.currentEvent = {};
            $scope.mapShow = false;

            if (!user.periodicity) {
                $scope.periodicity = 'season';
                $scope.periodicityActive = {
                    label: moment($scope.meta.season.startDate).format('MMMM YYYY') + ' - ' + moment($scope.meta.season.endDate).format('MMMM YYYY'),
                    startDate: moment($scope.meta.season.startDate),
                    endDate: moment($scope.meta.season.endDate),
                    ownersId: $scope.ownersId
                };
            } else {
                $scope.periodicity = user.periodicity;
                $scope.periodicityActive = user.periodicityActive;
            }

            /* Collectes */
            $scope.collectes = [];

            /* teams */
            $scope.listTeamHome = {};


            /* Retrieve list of team of effective */
            $scope.getListTeamHome = function () {
                teamRestAPI.getListTeamHome($scope.meta.sandbox._id, $scope.user.effectiveDefault, 'all').success(function (data) {
                    $scope.listTeamHome = data.sortBy(function (n) {
                        return n.label;
                    });
                });
            };

            /* Retrieve list player */
            $scope.getEffective = function () {
                effectiveSrv.getEffective($scope.user.effectiveDefault).then(function (data) {
                    $scope.currentEffective = data;

                    effectiveSrv.getListId($scope.currentEffective, 'player').then(function (listId) {
                        var listField = Array.create('_id', 'name', 'firstname', 'avatar', 'status');

                        effectiveSrv.getPersons(listId, listField).then(function (players) {
                            $scope.effective = players;
                            $scope.effective.forEach(function (e) {
                                if (angular.isDefined(e.status.positionType)) {
                                    e.positionType = $filter('translate')('stats.positionType.value.' + e.status.positionType);
                                } else {
                                    e.positionType = '';
                                }
                            });
                        });
                    });
                });
            };

            /* Retrieve list events */
            $scope.getEvents = function () {
                var requestEvent = {
                    activityId: $scope.meta.activity._id,
                    startDate: moment().valueOf(),
                    endDate: $scope.meta.season.endDate,
                    ownersandboxId: $scope.meta.sandbox._id,
                    ownereffectiveId: $scope.user.effectiveDefault,
                    type: ['cup', 'friendlyGame', 'championship']

                };

                eventsRestAPI.getListEvents(requestEvent).success(function (data) {
                    $scope.events = data.sortBy(function (n) {
                        return n.startDate;
                    });

                    $scope.getCurrentEvent();
                });
            };

            /* Retrieve list collectes */
            $scope.getCollectes = function () {
                var requestCollecte = {
                    startDate: $scope.meta.season.startDate,
                    endDate: moment().valueOf(),
                    sandboxId: $scope.meta.sandbox._id,
                    effectiveId: $scope.user.effectiveDefault
                };

                collecteRestAPI.getListCollectes(requestCollecte).success(function (data) {
                    $scope.collectes = data.sortBy(function (n) {
                        return n.endDate;
                    });
                });
            };

            /* get currentEvent */
            $scope.getCurrentEvent = function () {
                $scope.mapShow = false;
                $scope.currentEvent = {};

                if (angular.isDefined($scope.events[$scope.indexEvent])) {

                    $scope.currentEvent = $scope.events[$scope.indexEvent];
                    if (angular.isDefined($scope.currentEvent.address)) {
                        $scope.mapShow = true;
                    }
                }
            };

            /* Next event */
            $scope.nextEvent = function () {

                if ($scope.indexEvent < $scope.events.length) {
                    $scope.indexEvent++;
                }
                $scope.getCurrentEvent();
            };

            /* Previous event */
            $scope.previousEvent = function () {

                if ($scope.indexEvent > 0) {
                    $scope.indexEvent--;
                }
                $scope.getCurrentEvent();
            };

            /* check user connected */
            $scope.checkUserConnected = function () {
                userRestAPI.getUserById(user._id).success(function () {
                    $scope.getEvents();
                    $scope.getCollectes();
                    $scope.getEffective();
                    $scope.getListTeamHome();
                }).error(function () {
                    $log.error('HomeControler : User not Connected');
                });
            };

            /* Primary, check if user connected */
            $scope.checkUserConnected();

        });
}());