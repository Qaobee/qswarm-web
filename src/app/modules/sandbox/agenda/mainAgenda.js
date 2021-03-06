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


        .config(function ($routeProvider, metaProvider, userProvider) {
            $routeProvider.when('/private/agenda/:effectiveId', {
                controller: 'MainAgendaController',
                resolve: {
                    user: userProvider.$get,
                    meta: metaProvider.$get
                },
                templateUrl: 'app/modules/sandbox/agenda/mainAgenda.html'
            });
        })

        /**
         * @class qaobee.modules.sandbox.agenda.MainAgendaControler
         * @description Main controller for view mainAgenda.html
         */
        .controller('MainAgendaController', function (qeventbus, $filter, meta, eventCompareService, effectiveRestAPI, eventsRestAPI,
                                                      $scope, $routeParams, $translatePartialLoader, $location) {
            $scope.meta = meta;
            $translatePartialLoader.addPart('effective').addPart('commons').addPart('agenda');
            $scope.effectiveId = $routeParams.effectiveId;
            $scope.events = [];
            $scope.owners = [];
            $scope.effectives = [];
            $scope.currentEffective = {};
            $scope.compareList = {};

            $scope.compare = function () {
                if (Object.keys($scope.compareList).length > 0) {
                    $location.path('/private/agenda/compare/' + $scope.effectiveId);
                    return false;
                } else {
                    toastr.info($filter('translate')('compare.event-min'));
                }
            };

            $scope.updateEventToCompare = function (id) {
                var count = 0;
                if ($scope.compareList[id]) {
                    eventCompareService.add(id);
                } else {
                    eventCompareService.remove(id);
                }
                Sugar.Object.keys($scope.compareList, function () {
                    count++;
                });
                if (count > 3) {
                    toastr.error($filter('translate')('compare.event-max', {'max': 3}));
                    eventCompareService.remove(id);
                    $scope.compareList[id] = false;
                }
            };

            $scope.$on('qeventbus:event.reload', function () {
                $scope.getEvents(moment($scope.periodicityActive.startDate, 'DD/MM/YYYY').valueOf(), moment($scope.periodicityActive.endDate, 'DD/MM/YYYY').valueOf());
            });

            $scope.$on('qeventbus:event.compare', function () {
                $scope.compareList[qeventbus.data.id] = qeventbus.data.value;
                $scope.updateEventToCompare(qeventbus.data.id);
            });

            $scope.$on('qeventbus:periodicityActive', function () {
                if ($scope.periodicityActive || !angular.equals($scope.periodicityActive, qeventbus.data.periodicityActive)) {
                    $scope.periodicityActive = qeventbus.data.periodicityActive;
                    $scope.getEvents(moment($scope.periodicityActive.startDate, 'DD/MM/YYYY').valueOf(), moment($scope.periodicityActive.endDate, 'DD/MM/YYYY').valueOf());
                }
            });

            $scope.getEvents = function (startDate, endDate) {
                var requestEvent = {
                    activityId: $scope.meta.sandbox.activityId,
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

            $scope.getEffectives = function () {
                effectiveRestAPI.getListEffective($scope.meta.sandbox._id, $scope.currentCategory).success(function (data) {
                    $scope.effectives = data.sortBy(function (n) {
                        return n.label;
                    });
                    data.forEach(function (a) {
                        if (a._id === $scope.effectiveId) {
                            $scope.currentEffective = a;
                        }
                    });
                });
            };

            $scope.getEffectives();
        });
}());

