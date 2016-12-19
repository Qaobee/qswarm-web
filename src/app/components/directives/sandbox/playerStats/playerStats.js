(function () {
    'use strict';
    angular.module('qaobee.playerStatsComp', [
        'statsSRV',
        'statsRestAPI',
        'qaobee.eventbus',
        'qaobee.filterCalendar'
    ])

        .directive('playerStats', function ($filter, statsSrv) {
            return {
                restrict: 'E',
                scope: {
                    player: "=",
                    meta : '=',
                    user : '='
                },
                controller: function ($scope, qeventbus) {
                    $scope.ownersId = [];
                    $scope.series = [];
                    /**
                     * Init stats
                     */
                    $scope.initStats = function () {
                        $scope.collectes = [];
                        if (!$scope.user.periodicity) {
                            $scope.periodicity = 'season';
                            $scope.periodicityActive = {
                                label: moment($scope.meta.season.startDate).format('MMMM YYYY') + ' - ' + moment($scope.meta.season.endDate).format('MMMM YYYY'),
                                startDate: moment($scope.meta.season.startDate),
                                endDate: moment($scope.meta.season.endDate),
                                ownersId: $scope.ownersId
                            };
                        } else {
                            $scope.periodicity = $scope.user.periodicity;
                            $scope.periodicityActive = $scope.user.periodicityActive;
                        }
                        $scope.periodicityActive.ownersId = $scope.ownersId;
                    };

                    /**
                     * Get statistic for one player
                     *
                     * @param ownersId
                     * @param startDate
                     * @param endDate
                     */
                    $scope.getStats = function (ownersId, startDate, endDate) {
                        $scope.collectes = [];
                        statsSrv.getMatchsPlayer(startDate, endDate, $scope.meta.sandbox._id, $scope.player._id).then(function (data) {
                            if (angular.isArray(data) && data.length > 0) {
                                data.forEach(function (e) {
                                    e.eventRef.startDate = moment(e.eventRef.startDate).format('LLLL');
                                    $scope.collectes.push(e);
                                });
                            }
                        });
                    };

                    /* watch if periodicity change */
                    $scope.$watch('periodicityActive', function (newValue, oldValue) {
                        if (angular.isDefined(newValue) && !angular.equals(newValue, oldValue)) {
                            $scope.periodicityActive.ownersId = $scope.ownersId;
                            $scope.user.periodicity = $scope.periodicity;
                            $scope.user.periodicityActive = $scope.periodicityActive;
                            qeventbus.prepForBroadcast('periodicityActive', {
                                periodicityActive: $scope.periodicityActive,
                                periodicity: $scope.periodicity,
                                ownersId: $scope.ownersId
                            });
                            if($scope.player) {
                                $scope.getStats($scope.ownersId, $scope.periodicityActive.startDate, $scope.periodicityActive.endDate);
                            }
                        }
                    });

                    $scope.$watch('player', function (newValue, oldValue) {
                        if (oldValue || !angular.equals(oldValue, newValue)) {
                            $scope.ownersId.push($scope.player._id);
                            $scope.playersIds = $scope.ownersId;
                            $scope.player.birthdate = new Date(moment($scope.player.birthdate));
                            if (angular.isDefined($scope.player.status.positionType)) {
                                $scope.player.positionType = $filter('translate')('stats.positionType.value.' + $scope.player.status.positionType);
                            } else {
                                $scope.player.positionType = '';
                            }
                            $scope.series.push($scope.player.firstname + ' ' + $scope.player.name);
                            $scope.initStats();
                        }
                    });
                },
                templateUrl: 'app/components/directives/sandbox/playerStats/playerStats.html'
            };
        });
}());