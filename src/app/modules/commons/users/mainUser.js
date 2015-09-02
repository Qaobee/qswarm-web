(function () {
    'use strict';
    
    angular.module('qaobee.user', [
        /* angular qaobee */
        'ngAutocomplete',
        
        /* qaobee modules */
        /*'qaobee.signup',*/
        
        /* qaobee Rest API */
        'publicRestAPI' 
        ])


        .config(function ($routeProvider) {
            $routeProvider.when('/signup/:captcha?', {
                controller: 'SignupCtrl',
                templateUrl: 'app/modules/commons/users/signup/signup.html'
            });
        })

        .controller('SignupCtrl', function ($translatePartialLoader) {
            $translatePartialLoader.addPart('user');
        });
}());

