(function () {
    'use strict';
    angular.module('qaobee.cnil.module', [])
        .config(function ($routeProvider) {
            $routeProvider.when('/cnil', {
                controller: 'CnilControler',
                templateUrl: 'app/modules/commons/cnil/cnil.html'
            });
        })
        .controller('CnilControler', function () {});
}());