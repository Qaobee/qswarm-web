(function () {
    'use strict';
    /**
     * Administration Area directive<br /> *
     *
     * @author Xavier MARIN
     * @class qaobee.components.directives.adminmenu
     * @copyright <b>QaoBee</b>.
     */
    angular.module(
        'qaobee.adminmenu', [])
        .directive('qadminmenu', function () {
        return {
            restrict: 'E',
            scope: {
                level: '='
            },
            controller: function ($scope) {
                $scope.isopen = [false, false, false];
                $scope.isopen[$scope.level] = true;
            },
            templateUrl: 'app/components/directives/adminmenu.html'
        };
    });
}());