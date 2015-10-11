(function () {
    'use strict';
    /**
     * Module statistic
     *
     * @class qaobee.modules.stats.mainStats
     * @author Christophe Kervella
     * @copyright <b>QaoBee</b>.
     * @requires {@link https://docs.angularjs.org/api/ngRoute|ngRoute}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.effectiveRestAPI|qaobee.components.restAPI.sandbox.effective.effectiveRestAPI}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.personRestAPI|qaobee.components.restAPI.sandbox.effective.personRestAPI}
     */
    angular.module('qaobee.stats', [
        
        /* qaobee Rest API */
        'effectiveRestAPI',
        'eventsRestAPI',
        'personRestAPI',
        'userRestAPI',
        
        /* qaobee module */
        'qaobee.effectiveStats',
        'qaobee.eventStats',
        'qaobee.playerStats',
        'qaobee.teamStats'
    ])

    .config(function ($routeProvider, metaDatasProvider) {
        $routeProvider.when('/private/mainStats', {
            controller: 'MainStats',
            resolve: {
                user: metaDatasProvider.checkUser,
                meta: metaDatasProvider.getMeta
            },
            templateUrl: 'app/modules/sandbox/stats/mainStats.html'

        });
    })
/**
 * @class qaobee.modules.home.HomeControler
 */
    .controller('MainStats', function ($log, $scope, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta, 
                                            effectiveRestAPI, personRestAPI, eventsRestAPI, userRestAPI) {
        $translatePartialLoader.addPart('home');
        $translatePartialLoader.addPart('stats');

        $scope.user = user;
        $scope.meta = meta;
        
        
        /* check user connected */
        $scope.checkUserConnected = function () {
            
            userRestAPI.getUserById(user._id).success(function (data) {
                $log.debug('ok');
            }).error(function (data) {
                $log.error('MainStats : User not Connected')
            });
        }; 
        
        /* Primary, check if user connected */
        $scope.checkUserConnected();
    });
}());