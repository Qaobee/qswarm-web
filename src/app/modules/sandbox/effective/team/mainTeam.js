(function () {
    'use strict';
    /**
     * Module dashboard team
     *
     * @author Christophe Kervella
     * @class qaobee.modules.sandbox.effective.team.Mainteam
     * @namespace qaobee.modules.sandbox.effective.team
     *
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.teams', [
            /* angular qaobee */
            'ngAutocomplete',
            'qaobee.compare.team',
            /* qaobee modules */
            'qaobee.addTeam',
            'qaobee.updateTeam',

            /* qaobee services */
            'effectifSRV',

            /* qaobee Rest API */
            'effectiveRestAPI',
            'teamRestAPI',
            'userRestAPI'])


        .config(function ($routeProvider, metaDatasProvider) {

            $routeProvider.when('/private/teams/:effectiveId', {
                controller: 'MainTeamController',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/modules/sandbox/effective/team/mainTeam.html'

            });
        })

        /**
         * @class qaobee.modules.sandbox.effective.team.MainTeamControler
         * @description Main controller for view mainTeam.html
         */
        .controller('MainTeamController', function ($log, $scope, $routeParams, $translatePartialLoader, $location, $rootScope, $q, $filter, $window, qeventbus,
                                                   user, meta, effectiveSrv, teamRestAPI, userRestAPI, teamCompareService, widgetDefinitionsMainTeam, defaultWidgetsMainTeam) {

            $translatePartialLoader.addPart('effective');
            $translatePartialLoader.addPart('commons');

            $scope.effectiveId = $routeParams.effectiveId;

            $scope.user = user;
            $scope.meta = meta;
            $scope.listTeamHome = [];
            $scope.compareList = {};
        
            if(user.mainTeamTabId){
                $scope.activeTabIndex = user.mainTeamTabId;
            } else {
                $scope.activeTabIndex = 0;
            }
        
            /* keep in memory tab by default */
            $scope.changeTabDefault = function (tabId) {
                user.mainTeamTabId = tabId;
            }
        
            $scope.dashboardOptions = {
                widgetButtons: false,
                widgetDefinitions: widgetDefinitionsMainTeam.get(),
                hideWidgetName: true,
                defaultWidgets: defaultWidgetsMainTeam,
                storage: $window.localStorage,
                storageId: 'qaobee-widgets-dashboard-MainTeam'
            };

            $scope.compare = function() {
                if(Object.keys($scope.compareList).length >0) {
                    $location.path('/private/team/compare/'+$scope.effectiveId);
                    return false;
                } else {
                    toastr.info($filter('translate')('compare.team-min'));
                }
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
                } else {
                    $scope.periodicity = user.periodicity;
                    $scope.periodicityActive = user.periodicityActive;
                }
            };

            $scope.updateTeamToCompare = function (id) {
                var count = 0;
                if ($scope.compareList[id]) {
                    teamCompareService.add(id);
                } else {
                    teamCompareService.remove(id);
                }
                Object.keys($scope.compareList, function () {
                    count++;
                });
                if (count > 3) {
                    toastr.error($filter('translate')('compare.team-max', {'max': 3}));
                    teamCompareService.remove(id);
                    $scope.compareList[id] = false;
                }
            };

            /* Retrieve list of team of effective */
            $scope.getListTeamHome = function () {
                teamRestAPI.getListTeamHome($scope.meta.sandbox._id, $scope.effectiveId, 'all').success(function (data) {
                    $scope.listTeamHome = data.sortBy(function (n) {
                        return n.label;
                    });
                });

                effectiveSrv.getEffective($scope.user.effectiveDefault).then(function (data) {
                    $scope.currentEffective = data;
                });
            };


            /* check user connected */
            $scope.checkUserConnected = function () {
                userRestAPI.getUserById(user._id).success(function (data) {
                    $scope.getListTeamHome();
                    $scope.initPeriodicityActive();
                }).error(function (data) {
                    $log.error('MainTeamControler : User not Connected');
                });
            };

            /* Primary, check if user connected */
            $scope.checkUserConnected();

        })
        //
    ;
}());

