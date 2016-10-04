(function () {
    'use strict';
    /**
     * Created by cke on 03/10/16.
     *
     * Title page Bar directive<br />
     *
     * @author christophe Kervella
     * @copyright &lt;b&gt;QaoBee&lt;/b&gt;.
     *
     */

    angular.module('qaobee.titlePageBar', [])

        .directive('titlePageBar', function ($translatePartialLoader, $log, $window) {
            return {
                restrict: 'E',
                scope: {
                    icon: '@',
                    title: '@',
                },
                controller: function ($scope) {
                    $translatePartialLoader.addPart('commons');

                    $scope.icon = '';
                    $scope.title = '';
                    
                    // return button
                    $scope.doTheBack = function () {
                        $window.history.back();
                    };
                    
                },
                templateUrl: 'app/components/directives/commons/titlePageBar/titlePageBar.html'
            };
        });
}());