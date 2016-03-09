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
            'qaobee.compare.events',

            /* qaobee modules */
            'qaobee.addEvent',
            'qaobee.updateEvent',

            /* qaobee Rest API */
            'eventsRestAPI',
            'effectiveRestAPI',
            'userRestAPI'])


        .config(function ($routeProvider, metaDatasProvider) {

            $routeProvider.when('/private/agenda/:effectiveId', {
                controller: 'MainAgendaController',
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
        .controller('MainAgendaController', function ($log, $scope, $routeParams, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta,
                                                      eventsRestAPI, effectiveRestAPI, userRestAPI, eventCompareService, qeventbus) {
            $translatePartialLoader.addPart('effective');
            $translatePartialLoader.addPart('commons');
            $translatePartialLoader.addPart('agenda');

            $scope.effectiveId = $routeParams.effectiveId;
            $scope.user.effectiveDefault = $scope.effectiveId;

            $scope.user = user;
            $scope.meta = meta;

            if (!user.periodicity) {
                $scope.periodicity = 'quarter';
                $scope.periodicityActive = {};
            } else {
                $scope.periodicity = user.periodicity;
                $scope.periodicityActive = user.periodicityActive;
            }

            $scope.events = [];
            $scope.owners = [];
            $scope.effectives = [];
            $scope.currentEffective = {};
            $scope.compareList = {};

            /**
             * open compare screen
             *
             * @returns {boolean}
             */
            $scope.compare = function () {
                if (Object.keys($scope.compareList).length > 0) {
                    $location.path('/private/agenda/compare/' + $scope.effectiveId);
                    return false;
                } else {
                    toastr.info($filter('translate')('compare.event-min'));
                }
            };
            /**
             * Update ids in compare list
             *
             * @param id
             */
            $scope.updateEventToCompare = function (id) {
                var count = 0;
                if ($scope.compareList[id]) {
                    eventCompareService.add(id);
                } else {
                    eventCompareService.remove(id);
                }
                Object.keys($scope.compareList, function () {
                    count++;
                });
                if (count > 3) {
                    toastr.error($filter('translate')('compare.event-max', {'max': 3}));
                    eventCompareService.remove(id);
                    $scope.compareList[id] = false;
                }
            };

            $scope.$on('qeventbus', function () {
                if ('event.compare' === qeventbus.message) {
                    $scope.compareList[qeventbus.data.id] = qeventbus.data.value;
                    $scope.updateEventToCompare(qeventbus.data.id)
                }
            });

            /* watch if periodicity change */
            $scope.$watch('periodicityActive', function (newValue, oldValue) {
                if (angular.isDefined(newValue) && !angular.equals(newValue, oldValue)) {
                    user.periodicity = $scope.periodicity;
                    user.periodicityActive = $scope.periodicityActive;

                    $scope.getEvents(moment($scope.periodicityActive.startDate, 'DD/MM/YYYY').valueOf(), moment($scope.periodicityActive.endDate, 'DD/MM/YYYY').valueOf());
                }
            });

            $scope.initAgenda = function () {
                if (user.periodicityActive) {
                    $scope.getEvents(moment(user.periodicityActive.startDate, 'DD/MM/YYYY').valueOf(), moment(user.periodicityActive.endDate, 'DD/MM/YYYY').valueOf());
                }
            }

            /* Retrieve list events */
            $scope.getEvents = function (startDate, endDate) {

                var requestEvent = {
                    activityId: $scope.meta.activity._id,
                    startDate: startDate,
                    endDate: endDate,
                    ownersandboxId: $scope.meta.sandbox._id,
                    ownereffectiveId: $scope.effectiveId,
                    type: ['cup', 'friendlyGame', 'championship', 'training']

                };

                eventsRestAPI.getListEvents(requestEvent).success(function (data) {
                    $scope.events = data.sortBy(function (n) {
                        return n.startDate;
                    });

                    $scope.events.forEach(function (a) {
                        a.startDate = moment(a.startDate).format('LLLL');
                    });
                });
            };

            /* Retrieve list effective */
            $scope.getEffectives = function () {

                effectiveRestAPI.getListEffective($scope.meta._id, $scope.currentCategory).success(function (data) {
                    $scope.effectives = data.sortBy(function (n) {
                        return n.label;
                    });

                    /* retrieve the current effective */
                    data.forEach(function (a) {
                        if (a._id === $scope.effectiveId) {
                            $scope.currentEffective = a;
                        }
                    });
                });
            };

            /* check user connected */
            $scope.checkUserConnected = function () {

                userRestAPI.getUserById(user._id).success(function (data) {
                    $scope.getEffectives();
                    $scope.initAgenda();
                }).error(function (data) {
                    $log.error('MainAgendaControler : User not Connected');
                });
            };

            /* Primary, check if user connected */
            $scope.checkUserConnected();

        })
        //
    ;
}());

