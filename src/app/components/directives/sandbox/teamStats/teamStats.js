(function () {
    'use strict';
    angular.module('qaobee.teamStats', [
        'statsSRV',
        'statsRestAPI',
        'qaobee.eventbus',
        'qaobee.filterCalendar'
    ])

        .directive('teamStats', function ($filter, qeventbus, $timeout, $log) {
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
                    $scope.ownersId.push($scope.team._id);
                    $log.debug('cou',$scope.ownersId);
                    
                    $scope.$watch('team', function (newValue, oldValue) {
                        $scope.ownersId = [];
                        $log.debug('coucou',$scope.ownersId);
                        if (oldValue || !angular.equals(oldValue, newValue)) {
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
                            });
                        }
                    });
                },
                templateUrl: 'app/components/directives/sandbox/teamStats/teamStats.html'
            };
        });
}());