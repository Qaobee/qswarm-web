(function () {
    'use strict';
    angular.module('qaobee.cnil.module', [])
        .config(function ($routeProvider, metaProvider, userProvider) {
            $routeProvider.when('/cnil', {
                controller: 'CnilControler',
                templateUrl: 'app/modules/commons/cnil/cnil.html'
            });
        })
        .controller('CnilControler', function () {
        console.log('ici')
        });
}());