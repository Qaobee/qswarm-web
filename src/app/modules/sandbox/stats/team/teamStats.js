(function () {
    'use strict';
    /**
     * Module statistic
     *
     * @class qaobee.modules.stats.teamStats
     * @author Christophe Kervella
     * @copyright <b>QaoBee</b>.
     * @requires {@link https://docs.angularjs.org/api/ngRoute|ngRoute}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.effectiveRestAPI|qaobee.components.restAPI.sandbox.effective.effectiveRestAPI}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.personRestAPI|qaobee.components.restAPI.sandbox.effective.personRestAPI}
     */
    angular.module('qaobee.teamStats', [
        
        /* qaobee Rest API */
        'eventsRestAPI',
        'personRestAPI',
        'teamRestAPI',
        'userRestAPI',
        
        /* qaobee widget */
    ])

    .config(function ($routeProvider, metaDatasProvider) {
        $routeProvider.when('/private/teamStats/:teamId', {
            controller: 'TeamStats',
            resolve: {
                user: metaDatasProvider.checkUser,
                meta: metaDatasProvider.getMeta
            },
            templateUrl: 'app/modules/sandbox/stats/team/teamStats.html'

        });
    })
/**
 * @class qaobee.modules.home.HomeControler
 */
    .controller('TeamStats', function ($log, $scope, $routeParams, $window, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta, 
                                            teamRestAPI, personRestAPI, eventsRestAPI, userRestAPI) {
        $translatePartialLoader.addPart('home');
        $translatePartialLoader.addPart('stats');

        $scope.user = user;
        $scope.meta = meta;
        $scope.teamId = $routeParams.teamId;
        
        // return button
        $scope.doTheBack = function() {
            $window.history.back();
        };
        
        //Initialization event
        $scope.team = {};
        
        /* get team */
        $scope.getTeam = function () {
            
            /* get team */
            teamRestAPI.getTeam($scope.teamId).success(function (team) {
                $scope.team = team;
                $scope.team.enable = $scope.team.enable?'true':'false';
            });
        };
        
        /* check user connected */
        $scope.checkUserConnected = function () {
            
            userRestAPI.getUserById(user._id).success(function (data) {
                $scope.getTeam();
            }).error(function (data) {
                $log.error('TeamStats : User not Connected')
            });
        }; 
        
        /* Primary, check if user connected */
        $scope.checkUserConnected();
    });
}());