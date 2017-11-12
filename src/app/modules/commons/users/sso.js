(function () {
    'use strict';
    /**
     * user profile
     *
     * @author Christophe Kervella
     * @class qaobee.user.mainProfile
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.user.sso', [ 'userRestAPI'])

        .config(function ($routeProvider) {
            $routeProvider.when('/sso/:id/:hash', {
                controller: 'SSOCtrl',
                template: ''
            });
        })

        .controller('SSOCtrl', function ($scope, $log, $routeParams, userRestAPI, $location, $window) {
            $log.debug('[qaobee.user.sso.SSOCtrl] req params, id :', $routeParams.id, 'hash : ', $routeParams.hash);
            userRestAPI.decrypt($routeParams.id, $routeParams.hash).then(function(response) {
                $log.debug('[qaobee.user.sso.SSOCtrl] success response', response);
                $window.sessionStorage.qaobeesession = response.data.token;
                $location.path(response.data.path);
            }, function(response){
                $log.debug('[qaobee.user.sso.SSOCtrl] failed response', response);
                $location.path('/');
            });
        });
}());