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
            'userRestAPI'])

        .config(function ($routeProvider, metaProvider, userProvider) {
            $routeProvider.when('/private', {
                controller: 'HomeControler',
                resolve: {
                    user: userProvider.$get,
                    meta: metaProvider.$get
                },
                templateUrl: 'app/modules/home/mainHome.html'

            });
        })
        /**
         * @class qaobee.modules.home.HomeControler
         */
        .controller('HomeControler', function ($log, $scope, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta, $window,
                                               userRestAPI, widgetDefinitionsHome, defaultWidgetsHome, qeventbus) {
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

            /* watch if periodicity change */
            $scope.$watch('periodicityActive', function (newValue, oldValue) {
                if (angular.isDefined(newValue) && !angular.equals(newValue, oldValue)) {
                    $scope.periodicityActive.ownersId = $scope.ownersId;
                    user.periodicity = $scope.periodicity;
                    user.periodicityActive = $scope.periodicityActive;
                    qeventbus.prepForBroadcast("periodicityActive", $scope.periodicityActive);
                }
            });
            /* init periodicity active */
            $scope.initPeriodicityActive = function() {
                if (!user.periodicity) {
                    $scope.periodicity = 'season';
                    $scope.periodicityActive = {
                        label: moment($scope.meta.season.startDate).format('MMMM YYYY') + ' - ' + moment($scope.meta.season.endDate).format('MMMM YYYY'),
                        startDate: moment($scope.meta.season.startDate),
                        endDate: moment($scope.meta.season.endDate),
                        ownersId: $scope.ownersId
                    };
                    user.periodicity = $scope.periodicity;
                    user.periodicityActive = $scope.periodicityActive;
                } else {
                    $scope.periodicity = user.periodicity;
                    $scope.periodicityActive = user.periodicityActive;
                }
            };

            /* check user connected */
            $scope.checkUserConnected = function () {
                userRestAPI.getUserById(user._id).success(function () {
                    $scope.initPeriodicityActive();
                }).error(function () {
                    $log.error('HomeControler : User not Connected');
                });
            };

            /* Primary, check if user connected */
            $scope.checkUserConnected();

        });
}());