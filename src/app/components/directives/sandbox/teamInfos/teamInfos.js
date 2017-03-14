(function () {
    'use strict';
    angular.module('qaobee.teamInfos', [])

        .directive('teamInfos', function () {
            return {
                restrict: 'E',
                scope: {
                    team: "="
                },
                controller: function () {},
                templateUrl: 'app/components/directives/sandbox/teamInfos/teamInfos.html'
            };
        });
}());