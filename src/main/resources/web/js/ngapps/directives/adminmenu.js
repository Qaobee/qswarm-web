/**
 * Directive gérant le menu de la zone d'administration<br />
 *
 * Usage : <pre>&lt;adminmenu level="0"&gt;&lt;/adminmenu&gt;</pre>
 *
 *
 * @author Xavier MARIN
 * @class qaobee.directives.adminmenu
 * @copyright <b>QaoBee</b>.
 */
angular.module('adminmenu', [])

    .directive("adminmenu", function ($http, eventbus) {
        'use strict';
        return {
            restrict: 'E',
            scope: {
                level: '='
            },
            controller: function ($scope) {
                $scope.isopen = [false, false, false];
                $scope.isopen[$scope.level] = true;
            },
            templateUrl: 'templates/directives/adminmenu.html'
        };
    })

//
;