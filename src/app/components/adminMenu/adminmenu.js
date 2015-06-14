(function () {
    'use strict';
    /**
     * Administration Area directive<br /> *
     *
     * @author Xavier MARIN
     * @class qaobee.directives.adminmenu
     * @copyright <b>QaoBee</b>.
     */
    angular.module('adminmenu', []).directive('adminmenu', function () {
        return {
            restrict: 'E',
            scope: {
                level: '='
            },
            controller: function ($scope) {
                $scope.isopen = [false, false, false];
                $scope.isopen[$scope.level] = true;
            },
            templateUrl: 'components/adminMenu/adminmenu.html'
        };
    });
}());