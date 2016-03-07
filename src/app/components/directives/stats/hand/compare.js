(function () {
    'use strict';
    angular.module('qaobee.compare', [
            'effectifSRV',
            'statsSRV',
            'statsRestAPI',
            'qaobee.commonsConfig'
        ])

        .directive('qaobeeStatCompare', function ($translatePartialLoader, $log, $q, $filter, effectiveSrv, statsRestAPI, statsSrv) {
            return {
                restrict: 'E',
                scope: {
                    items: '=',
                    kind: '@',
                    meta: '='
                },
                controller: function ($scope) {
                    $scope.players = [];
                    $scope.stats = {
                        goals: {},
                        sanctions: {},
                        originShoot: {}
                    };
                    $scope.selectedPlayerids = [];

                    $scope.compare = function () {
                        $scope.loading = true;
                        angular.element('#modalCompare').openModal();
                        var count = 0;
                        Object.keys($scope.items, function (n) {
                            if ($scope.items[n]) {
                                count++;
                                $scope.selectedPlayerids.push(n);
                            }
                        });
                        if (count > 0) {
                            getPlayers($scope.selectedPlayerids, function (data) {
                                $scope.players = data;
                                $scope.buildWidget();
                            });
                        }
                        return false;
                    };

                    $scope.buildWidget = function() {
                        $scope.periodicity = $scope.periodicity || 'season';
                        $scope.periodicityActive = $scope.periodicityActive || {
                                label: moment($scope.meta.season.startDate).format('MMMM YYYY') + ' - ' + moment($scope.meta.season.endDate).format('MMMM YYYY'),
                                startDate: moment($scope.meta.season.startDate),
                                endDate: moment($scope.meta.season.endDate),
                                ownersId: $scope.ownersId
                            };
                        $scope.periodicityActive.ownersId = $scope.periodicityActive.ownersId || $scope.ownersId;
                        if ($scope.selectedPlayerids.length === 0) {
                            return;
                        }
                        var listFieldsGroupBy = Array.create('code');
                        var promises = [];
                        var startDate = $scope.periodicityActive.startDate.valueOf();
                        var endDate = $scope.periodicityActive.endDate.valueOf();
                        $scope.selectedPlayerids.forEach(function (id) {
                            promises.push(statsSrv.countAllInstanceIndicators(Array.create('goalScored', 'goalConceded'), Array.create(id), startDate, endDate, listFieldsGroupBy).then(function (data) {
                                if (angular.isArray(data.data) && data.data.length > 0) {
                                    data.data.forEach(function (a) {
                                        $scope.stats.goals[data.config.data.listOwners[0]] = a.value;
                                    });
                                }
                            }));
                            promises.push(statsSrv.countAllInstanceIndicators(Array.create('originShootAtt', 'originShootDef'), Array.create(id), startDate, endDate, listFieldsGroupBy).then(function (data) {
                                if (angular.isArray(data.data) && data.data.length > 0) {
                                    data.data.forEach(function (a) {
                                        $scope.stats.originShoot[data.config.data.listOwners[0]] = a.value;
                                    });
                                }
                            }));
                            promises.push(statsSrv.countAllInstanceIndicators(Array.create('yellowCard', 'exclTmp', 'redCard'), Array.create(id), startDate, endDate, listFieldsGroupBy).then(function (data) {
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
                            players.forEach(function (e) {
                                if (angular.isDefined(e.status.positionType)) {
                                    e.positionType = $filter('translate')('stats.positionType.value.' + e.status.positionType);
                                } else {
                                    e.positionType = '';
                                }

                                e.birthdate = $filter('date')(e.birthdate, 'yyyy');
                                e.age = moment().format('YYYY') - e.birthdate;
                            });
                            callback(players);
                        });
                    }
                },
                templateUrl: 'app/components/directives/stats/hand/compare.html'
            };
        });
})();

