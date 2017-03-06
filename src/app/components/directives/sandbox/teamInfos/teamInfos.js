(function () {
    'use strict';
    angular.module('qaobee.teamInfos', [])

        .directive('teamInfos', function ($filter, $timeout) {
            return {
                restrict: 'E',
                scope: {
                    team: "="
                },
                controller: function ($scope, $document) {
                    
                },
                templateUrl: 'app/components/directives/sandbox/teamInfos/teamInfos.html'
            };
        });
}());