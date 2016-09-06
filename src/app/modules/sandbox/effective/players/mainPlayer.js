(function () {
    'use strict';
    /**
     * Module dashboard effective
     *
     * @author Christophe Kervella
     * @class qaobee.modules.sandbox.effective.mainPlayer
     * @namespace qaobee.modules.sandbox.effective
     *
     * @requires {@link qaobee.components.restAPI.sandbox.effective.effectiveRestAPI|qaobee.components.restAPI.sandbox.effective.effectiveRestAPI}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.personRestAPI|qaobee.components.restAPI.sandbox.effective.personRestAPI}
     * @requires {@link qaobee.modules.sandbox.effective.addEffective|qaobee.modules.sandbox.effective.addEffective}
     * @requires {@link qaobee.modules.sandbox.effective.updateEffective|qaobee.modules.sandbox.effective.updateEffective}
     * @requires {@link qaobee.modules.sandbox.effective.players.addPlayer|qaobee.modules.sandbox.effective.players.addPlayer}
     * @requires {@link qaobee.modules.sandbox.effective.players.updatePlayer|qaobee.modules.sandbox.effective.players.updatePlayer}
     * @requires {@link qaobee.modules.sandbox.effective.players.viewPlayer|qaobee.modules.sandbox.effective.players.viewPlayer}
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.players', [
        /* angular qaobee */
        'ngAutocomplete',

        /* qaobee modules */
        'qaobee.addPlayer',
        'qaobee.updatePlayer',
        'qaobee.viewPlayer',
        'qaobee.compare.players',

        /* qaobee services */
        'effectifSRV',

        /* qaobee Rest API */
        'effectiveRestAPI',
        'teamRestAPI',
        'userRestAPI'])


        .config(function ($routeProvider, metaProvider, userProvider) {

            $routeProvider.when('/private/players/:effectiveId', {
                controller: 'MainPlayerController',
                resolve: {
                    user: userProvider.$get,
                    meta: metaProvider.$get
                },
                templateUrl: 'app/modules/sandbox/effective/players/mainPlayer.html'
            });
        })

        /**
         * @class qaobee.modules.sandbox.effective.MainPlayerControler
         * @description Main controller for view mainPlayer.html
         */
        .controller('MainPlayerController', function ($log, $scope, $routeParams, $translatePartialLoader, $location, $rootScope, $q, $filter, $window, user, meta,
                                                      effectiveRestAPI, effectiveSrv, userRestAPI, playerCompareService, widgetDefinitionsMainPlayer, defaultWidgetsMainPlayer, $timeout, qeventbus) {

            $translatePartialLoader.addPart('effective');
            $translatePartialLoader.addPart('commons');
            $translatePartialLoader.addPart('stats');
            $translatePartialLoader.addPart('home');

            $scope.effectiveId = $routeParams.effectiveId;

            $scope.tabOwner = [];
            $scope.tabOwner.push($scope.effectiveId);

            $scope.user = user;
            $scope.meta = meta;
            $scope.players = [];
            $scope.effectives = [];
            $scope.compareList = {};
            $scope.currentEffective = {};
            $scope.initPeriodicity = true;
            $scope.periodicityActive = null;
            $scope.periodicity = null;
            $scope.currentCategory = null;

            if (user.mainPlayerTabId) {
                $scope.activeTabIndex = user.mainPlayerTabId;
            } else {
                $scope.activeTabIndex = 0;
            }
            playerCompareService.init();
            /* keep in memory tab by default */
            $scope.changeTabDefault = function (tabId) {
                user.mainPlayerTabId = tabId;
            };

            

            $scope.compare = function () {
                if (Object.keys($scope.compareList).length > 0) {
                    $location.path('/private/players/compare/');
                    return false;
                } else {
                    toastr.info($filter('translate')('compare.player-min'), 'Title');
                }
            };

            $scope.updatePlayerToCompare = function (id) {
                var count = 0;
                if ($scope.compareList[id]) {
                    playerCompareService.add(id);
                } else {
                    playerCompareService.remove(id);
                }
                Object.keys($scope.compareList, function () {
                    count++;
                });
                if (count > 3) {
                    toastr.error($filter('translate')('compare.player-max', {'max': 3}), 'Title');
                    playerCompareService.remove(id);
                    $scope.compareList[id] = false;
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
            $scope.initPeriodicityActive = function () {
                
                if ($scope.initPeriodicity) {
                    $scope.periodicity = 'season';
                    $scope.periodicityActive = {
                        label: moment($scope.meta.season.startDate).format('MMMM YYYY') + ' - ' + moment($scope.meta.season.endDate).format('MMMM YYYY'),
                        startDate: moment($scope.meta.season.startDate),
                        endDate: moment($scope.meta.season.endDate),
                        ownersId: $scope.ownersId
                    };
                    $scope.initPeriodicity = false;
                } 
            };

            /* Retrieve current effective and list player */
            $scope.getPlayers = function () {
                
                effectiveSrv.getEffective($scope.effectiveId).then(function (data) {
                    $scope.currentEffective = data;

                    effectiveSrv.getListId($scope.currentEffective, 'player').then(function (listId) {
                        $scope.ownersId = listId;
                        $scope.initPeriodicityActive();
                        var listField = Array.create('_id', 'name', 'firstname', 'avatar', 'status', 'birthdate', 'contact');

                        effectiveSrv.getPersons(listId, listField).then(function (players) {
                            
                            $scope.players = players;
                            $scope.players.forEach(function (e) {
                                if (angular.isDefined(e.status.positionType)) {
                                    e.positionType = $filter('translate')('stats.positionType.value.' + e.status.positionType);
                                } else {
                                    e.positionType = '';
                                }

                                e.birthdate = $filter('date')(e.birthdate, 'yyyy');
                                e.age = moment().format('YYYY') - e.birthdate;
                            });
                        });
                    });
                });
            };

            /* check user connected */
            $scope.checkUserConnected = function () {
                userRestAPI.getUserById(user._id).success(function (/* data */) {
                    
                    $scope.getPlayers();
                }).error(function (/* data */) {
                    $log.error('MainPlayerControler : User not Connected');
                });
            };

            /* Primary, check if user connected */
            $scope.checkUserConnected();


        })
    //
    ;
}());