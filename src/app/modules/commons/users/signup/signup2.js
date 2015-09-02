(function () {
    'use strict';
    /**
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
                templateUrl: 'commons/users/signup/signup.html'
            });
        })
    
        /**
         * @class qaobee.public.publicSignup.SignupCtrl
         * @description Begining of the registration process
         */
        .controller('SignupCtrl', function ($scope, $http, $translatePartialLoader, signupRestAPI, $routeParams, $filter, $location, reCAPTCHA, $window, $log, locationAPI, publicRestAPI) {
        
            $translatePartialLoader.addPart('user');
            
            $scope.signup = {
                address: {}
            };
        
            $scope.$on('$destroy', function () {
                delete $scope.user;
            });
        });
}());