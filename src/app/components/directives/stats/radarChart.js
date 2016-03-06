(function () {
    'use strict';
    angular.module('qaobee.radar', [
            'chart.js'
    ])

        .directive('qaobeeRadarChart', function ($log, $q, $filter) {
            return {
                restrict: 'E',
                scope: {
                },
                controller: function ($scope) {
                    $scope.labels =["Eating", "Drinking", "Sleeping", "Designing", "Coding", "Cycling", "Running"];

                    $scope.data = [
                        [65, 59, 90, 81, 56, 55, 40],
                        [28, 48, 40, 19, 96, 27, 100]
                    ];
                },
                templateUrl: 'app/components/directives/stats/radarChart.html'
            };
        });
})();