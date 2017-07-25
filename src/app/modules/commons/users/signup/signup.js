(function () {
    'use strict';

    angular.module('qaobee.user.signup', [
        'qaobee.user.signup.user'
    ])

        .config(function ($routeProvider) {
            $routeProvider.when('/signup', {
                controller: 'SignupCtrl',
                templateUrl: 'app/modules/commons/users/signup/signup.html'
            });
        })

        .controller('SignupCtrl', function ($translatePartialLoader, qeventbus) {
            $translatePartialLoader.addPart('user').addPart('commons');
            qeventbus.prepForBroadcast('menuItem', 'signup');
        });

}());