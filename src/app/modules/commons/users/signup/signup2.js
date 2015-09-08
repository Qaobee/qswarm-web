(function () {
    'use strict';
    /**
     * N'EST PAS APPELE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
     * 
     * Signup module
     *
     * @class qaobee.public.publicSignup
     * @author Xavier MARIN
     * @copyright <b>QaoBee</b>.
     * @requires {@link qaobee.components.restAPI.commons.users.user.signupRestAPI|qaobee.components.restAPI.commons.users.user.signupRestAPI}
     * @requires {@link qaobee.components.restAPI.commons.users.user.paymentRestAPI|qaobee.components.restAPI.commons.users.user.paymentRestAPI}
     */
    angular.module('qaobee.signup', [
        
        /* qaobee Rest API */
        'signupRestAPI',
        'publicRestAPI',
        
        /* qaobee Services */
        'locationAPI' ])

        .config(function ($routeProvider) {
            $routeProvider.when('/signup/:captcha?', {
                controller: 'SignupCtrl',
                templateUrl: 'commons/users/signup/signup2.html'
            });
        })
    
        /**
         * @class qaobee.public.publicSignup.SignupCtrl
         * @description Begining of the registration process
         */
        .controller('SignupCtrl', function ($scope, $http, $translatePartialLoader, $routeParams, $filter, $location, reCAPTCHA, $window, $log, locationAPI, publicRestAPI, signupRestAPI ) {
            $log.debug("plop1");
            $translatePartialLoader.addPart('user');
            $translatePartialLoader.addPart('commons');
            $log.debug("plop2");
            $scope.activities = Array.create();
            publicRestAPI.getActivities().success(function (data) {
                $log.debug(data);
                $scope.activities = data.sortBy(function(n) {
                    return n.label; 
                });
            });
        
            $scope.$on('$destroy', function () {
                delete $scope.user;
            });
        });
}());