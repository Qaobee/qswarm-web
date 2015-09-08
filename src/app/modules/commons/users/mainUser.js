(function () {
    'use strict';
    
    angular.module('qaobee.user', [
        /* angular qaobee */
        'ngAutocomplete',
        
        /* qaobee modules */
        /*'qaobee.signup',*/
        
        /* qaobee Rest API */
        'activityRestAPI' 
        ])


        .config(function ($routeProvider) {
            $routeProvider.when('/signup/:captcha?', {
                controller: 'SignupCtrl',
                templateUrl: 'app/modules/commons/users/signup/signup.html'
            });
        })

        .controller('SignupCtrl', function ($scope, $translatePartialLoader, $log, activityRestAPI) {
            $translatePartialLoader.addPart('user');
            $translatePartialLoader.addPart('commons');
            $scope.activities = Array.create();
            activityRestAPI.getListActive().success(function (data) {
                $log.debug(data);
                $scope.activities = data.sortBy(function(n) {
                    return n.label; 
                });
            });
            
        });
}());

