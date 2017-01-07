(function () {
    'use strict';
    angular.module('qaobee.compare.players', [
        'effectifSRV',
        'statsSRV',
        'statsRestAPI',
        'qaobee.commonsConfig'
    ]).config(function ($routeProvider, metaProvider, userProvider) {

        $routeProvider.when('/private/players/compare', {
            controller: 'ComparePlayerController',
            resolve: {
                user: userProvider.$get,
                meta: metaProvider.$get
            },
            templateUrl: 'app/modules/sandbox/effective/players/compare.html'

        });
    })

        .factory('playerCompareService', function ($window) {
            var compareList = [];
            return {
                get: function () {
                    return $window.sessionStorage.playerCompareList ? JSON.parse($window.sessionStorage.teamCompareList) : compareList;
                },
                add: function (pId) {
                    compareList.push(pId);
                    $window.sessionStorage.playerCompareList = JSON.stringify(compareList);
                },
                remove: function (pId) {
                    compareList.remove(pId);
                    $window.sessionStorage.playerCompareList = JSON.stringify(compareList);
                },
                init: function () {
                    compareList = [];
                }
            };
        })

        .controller('ComparePlayerController', function ($scope, $translatePartialLoader, qeventbus, $log, $q, $filter, effectiveSrv,
                                                         statsRestAPI, playerCompareService, user, meta, $window) {
            $translatePartialLoader.addPart('effective');
            $translatePartialLoader.addPart('commons');
            $translatePartialLoader.addPart('stats');
            $scope.loading = true;
            $scope.players = [];
            $scope.playersIds = [];
            $scope.meta = meta;
            $scope.series = [];
            $scope.selectedPlayerids = playerCompareService.get();

            if ($scope.selectedPlayerids.length > 0) {
                qeventbus.prepForBroadcast('ownersId', {
                    ownersId: $scope.selectedPlayerids
                });
                $scope.playersIds = angular.copy($scope.selectedPlayerids);
                getPlayers($scope.selectedPlayerids, function (data) {
                    $scope.players = data;
                    $scope.series = $scope.players.map(function (p) {
                        return p.firstname + ' ' + p.name;
                    });
                    $scope.buildWidget();
                });
            } else {
                $scope.loading = false;
            }

            $scope.doTheBack = function () {
                $window.history.back();
            };

            $scope.buildWidget = function () {
                $scope.stats = {
                    goals: {},
                    sanctions: {},
                    originShoot: {}
                };
                if ($scope.selectedPlayerids.length === 0) {
                    return;
                }
                var listFieldsGroupBy = ['code'];
                var promises = [];
                var startDate = $scope.periodicityActive.startDate.valueOf();
                var endDate = $scope.periodicityActive.endDate.valueOf();
                $scope.playersIds.forEach(function (id) {
                    promises.push(statsRestAPI.getStatGroupBy({
                        listIndicators: ['goalScored', 'goalConceded'],
                        listOwners: [id],
                        startDate: startDate.valueOf(),
                        endDate: endDate.valueOf(),
                        aggregat: 'COUNT',
                        listFieldsGroupBy: listFieldsGroupBy
                    }).then(function (data) {
                        if (angular.isArray(data.data) && data.data.length > 0) {
                            data.data.forEach(function (a) {
                                $scope.stats.goals[data.config.data.listOwners[0]] = a.value;
                            });
                        }
                    }));
                    promises.push(statsRestAPI.getStatGroupBy({
                        listIndicators: ['originShootAtt', 'originShootDef'],
                        listOwners: [id],
                        startDate: startDate.valueOf(),
                        endDate: endDate.valueOf(),
                        aggregat: 'COUNT',
                        listFieldsGroupBy: listFieldsGroupBy
                    }).then(function (data) {
                        if (angular.isArray(data.data) && data.data.length > 0) {
                            data.data.forEach(function (a) {
                                $scope.stats.originShoot[data.config.data.listOwners[0]] = a.value;
                            });
                        }
                    }));
                    promises.push(statsRestAPI.getStatGroupBy({
                        listIndicators: ['yellowCard', 'exclTmp', 'redCard'],
                        listOwners: [id],
                        startDate: startDate.valueOf(),
                        endDate: endDate.valueOf(),
                        aggregat: 'COUNT',
                        listFieldsGroupBy: listFieldsGroupBy
                    }).then(function (data) {
                        if (angular.isArray(data.data) && data.data.length > 0) {
                            data.data.forEach(function (a) {
                                $scope.stats.sanctions[data.config.data.listOwners[0]] = a.value;
                            });
                        }
                    }));
                });
                $q.all(promises).then(function () {
                    $scope.loading = false;
                });
            };

            /* Retrieve current effective and list player */
            function getPlayers(selectedPlayerids, callback) {
                var listField = ['_id', 'name', 'firstname', 'avatar', 'status', 'birthdate', 'contact'];
                effectiveSrv.getPersons(selectedPlayerids, listField).then(function (players) {
                    callback(players);
                });
            }

            $scope.$on('qeventbus:periodicityActive', function () {
                if (!$scope.periodicityActive || !angular.equals($scope.periodicityActive, qeventbus.data.periodicityActive)) {
                    $scope.periodicityActive = qeventbus.data.periodicityActive;
                    $scope.buildWidget();
                }
            });
        });
})();

