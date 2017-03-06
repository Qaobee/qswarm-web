(function () {
    'use strict';
    angular.module('qaobee.playerStats', [
        'statsSRV',
        'statsRestAPI',
        'qaobee.eventbus',
        'qaobee.filterCalendar'
    ])

        .directive('playerStats', function ($filter, qeventbus, $timeout) {
            return {
                restrict: 'E',
                scope: {
                    player: "=",
                    meta : '=',
                    user : '='
                },
                controller: function ($scope) {
                    $scope.ownersId = [];
                    $scope.series = [];

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
                            $timeout(function() {
                                qeventbus.prepForBroadcast('ownersId', {
                                    ownersId: $scope.ownersId
                                });
                                qeventbus.prepForBroadcast('periodicityActive', {
                                    periodicityActive: $scope.periodicityActive,
                                    periodicity: $scope.periodicity,
                                    self: 'playerStats'
                                });
                            });


                        }
                    });
                },
                templateUrl: 'app/components/directives/sandbox/playerStats/playerStats.html'
            };
        });
}());