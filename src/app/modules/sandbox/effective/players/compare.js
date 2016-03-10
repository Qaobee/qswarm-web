(function () {
    'use strict';
    angular.module('qaobee.compare.players', [
        'effectifSRV',
        'statsSRV',
        'statsRestAPI',
        'qaobee.commonsConfig'
    ]).config(function ($routeProvider, metaDatasProvider) {

            $routeProvider.when('/private/players/compare', {
                controller: 'ComparePlayerController',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/modules/sandbox/effective/players/compare.html'

            });
        })

        .factory('playerCompareService', function () {
            var compareList = [];
            return {
                get: function () {
                    return compareList;
                },
                add: function (pId) {
                    compareList.push(pId);
                },
                remove: function (pId) {
                    compareList.remove(pId);
                }
            };
        })

        .controller('ComparePlayerController', function ($scope, $translatePartialLoader, $log, $q, $filter, effectiveSrv, statsRestAPI, playerCompareService, user, meta, $window) {
            $translatePartialLoader.addPart('effective');
            $translatePartialLoader.addPart('commons');
            $translatePartialLoader.addPart('stats');
            $scope.loading = true;
            $scope.players = [];
            $scope.playersIds = [];
            $scope.meta = meta;
            $scope.stats = {
                goals: {},
                sanctions: {},
                originShoot: {}
            };
            $scope.series = [];
            $scope.periodicity = $scope.periodicity || 'season';
            $scope.periodicityActive = $scope.periodicityActive || {
                    label: moment($scope.meta.season.startDate).format('MMMM YYYY') + ' - ' + moment($scope.meta.season.endDate).format('MMMM YYYY'),
                    startDate: moment($scope.meta.season.startDate),
                    endDate: moment($scope.meta.season.endDate),
                    ownersId: $scope.ownersId
                };
            $scope.periodicityActive.ownersId = $scope.periodicityActive.ownersId || $scope.ownersId;
            $scope.selectedPlayerids = playerCompareService.get();
            if ($scope.selectedPlayerids.length > 0) {
                getPlayers($scope.selectedPlayerids, function (data) {
                    $scope.players = data;
                    $scope.series = $scope.players.map(function (p) {
                        return p.firstname + ' ' + p.name;
                    });
                    $scope.playersIds = $scope.players.map(function (p) {
                        return p._id;
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
                if ($scope.selectedPlayerids.length === 0) {
                    return;
                }
                var listFieldsGroupBy = Array.create('code');
                var promises = [];
                var startDate = $scope.periodicityActive.startDate.valueOf();
                var endDate = $scope.periodicityActive.endDate.valueOf();
                $scope.selectedPlayerids.forEach(function (id) {
                    promises.push(statsRestAPI.getStatGroupBy({
                        listIndicators: Array.create('goalScored', 'goalConceded'),
                        listOwners: Array.create(id),
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
                        listIndicators: Array.create('originShootAtt', 'originShootDef'),
                        listOwners: Array.create(id),
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
                        listIndicators: Array.create('yellowCard', 'exclTmp', 'redCard'),
                        listOwners: Array.create(id),
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
                var listField = Array.create('_id', 'name', 'firstname', 'avatar', 'status', 'birthdate', 'contact');

                effectiveSrv.getPersons(selectedPlayerids, listField).then(function (players) {
                    callback(players);
                });
            }

        });
})();

