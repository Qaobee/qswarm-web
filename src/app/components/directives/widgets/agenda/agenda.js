(function () {
    'use strict';


    /**
     * Created by xavier on 09/07/14.
     */
    /**
     * Directive widget calendar<br />
     *
     * Usage :
     *
     * <pre>
     * &lt;widget-calendar effectiveId user meta /&gt;
     * @author Xavier MARIN
     * @class qaobee.directives.widgets.calendar
     * @copyright &lt;b&gt;QaoBee&lt;/b&gt;.
     *
     */
    angular.module('qaobee.widgets.agenda', [])

        .directive('widgetCalendar', function ($filter, $translatePartialLoader, qeventbus, eventsRestAPI) {
            return {
                restrict: 'AE',
                scope: {
                    user: '=',
                    meta: '='
                },
                controller: function ($scope) {
                    $translatePartialLoader.addPart('commons');
                    $translatePartialLoader.addPart('agenda');
                    $scope.events = [];
                    $scope.owners = [];
                    $scope.effectives = [];
                    $scope.currentEffective = {};
                    if (!$scope.user.periodicity) {
                        $scope.periodicity = 'season';
                        $scope.periodicityActive = {
                            startDate: moment().valueOf(),
                            endDate: moment($scope.meta.season.endDate),
                            ownersId: $scope.ownersId
                        };
                    } else {
                        $scope.periodicityActive = $scope.user.periodicityActive;
                    }

                    $scope.startDate = $scope.periodicityActive.startDate;
                    $scope.endDate = $scope.periodicityActive.endDate;


                    /* Refresh widget on periodicity change */
                    $scope.$on('qeventbus:periodicityActive', function () {
                        $scope.startDate = qeventbus.data.periodicityActive.startDate;
                        $scope.endDate = qeventbus.data.periodicityActive.endDate;
                        $scope.ownersId = qeventbus.data.periodicityActive.ownersId;
                        $scope.periodicityActive = qeventbus.data.periodicityActive;
                        $scope.getEvents($scope.startDate.valueOf(), $scope.endDate.valueOf());
                    });

                    /* Retrieve list events */
                    $scope.getEvents = function (startDate, endDate) {
                        var requestEvent = {
                            activityId: $scope.meta.sandbox.activityId,
                            startDate: startDate,
                            endDate: endDate,
                            ownersandboxId: $scope.meta.sandbox._id,
                            ownereffectiveId: $scope.meta.sandbox.effectiveDefault,
                            type: ['cup', 'friendlyGame', 'championship', 'training']
                        };


                        eventsRestAPI.getListEvents(requestEvent).success(function (data) {
                            $scope.events = data.sortBy(function (n) {
                                return n.startDate;
                            });

                            $scope.events.forEach(function (a) {
                                switch (a.link.type) {
                                    case 'cup' :
                                        a.icon = 'album';
                                        a.title = 'mainAgenda.eventType.cup';
                                        break;
                                    case 'friendlyGame':
                                        a.icon = 'flare';
                                        a.title = 'mainAgenda.eventType.friendlyGame';
                                        break;
                                    case 'championship':
                                        a.icon = 'stars';
                                        a.title = 'mainAgenda.eventType.championship';
                                        break;
                                    case 'training':
                                        a.icon = 'timer';
                                        a.title = 'mainAgenda.eventType.training';
                                        break;
                                    default:
                                        a.icon = 'timer';
                                        a.title = '';
                                        break;
                                }
                            });
                        });
                    };
                    $scope.getEvents($scope.startDate.valueOf(), $scope.endDate.valueOf());
                },
                templateUrl: 'app/components/directives/widgets/agenda/agenda.html'
            };
        });
})();