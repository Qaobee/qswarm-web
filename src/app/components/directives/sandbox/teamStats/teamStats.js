(function () {
    'use strict';
    angular.module('qaobee.teamStats', [
        'statsSRV',
        'statsRestAPI',
        'qaobee.eventbus',
        'qaobee.filterCalendar'
    ])

        .directive('teamStats', function ($filter, qeventbus, $timeout) {
            return {
                restrict: 'E',
                scope: {
                    team: "=",
                    meta : '=',
                    user : '='
                },
                controller: function ($scope) {
                    $scope.ownersId = [];
                    $scope.series = [];
                    $scope.instance = {};
                    $scope.$watch('team', function (newValue, oldValue) {
                        if (oldValue || !angular.equals(oldValue, newValue)) {
                            $scope.ownersId = [];
                            $scope.ownersId.push($scope.team._id);
                            $timeout(function() {
                                qeventbus.prepForBroadcast('ownersId', {
                                    ownersId: $scope.ownersId
                                });
                                qeventbus.prepForBroadcast('periodicityActive', {
                                    periodicityActive: $scope.periodicityActive,
                                    periodicity: $scope.periodicity,
                                    self: 'teamStats'
                                });
                                $scope.instance.refresh();
                            });
                        }
                    });
                },
                templateUrl: 'app/components/directives/sandbox/teamStats/teamStats.html'
            };
        });
}());