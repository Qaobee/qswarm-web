(function () {
    'use strict';
    /**
     * Module dashboard effective
     *
     * @author Christophe Kervella
     * @class qaobee.modules.sandbox.effective.mainPlayer
     * @namespace qaobee.modules.sandbox.effective
     *
     * @requires {@link qaobee.components.restAPI.sandbox.effective.effectiveRestAPI|qaobee.components.restAPI.sandbox.effective.effectiveRestAPI}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.personRestAPI|qaobee.components.restAPI.sandbox.effective.personRestAPI}
     * @requires {@link qaobee.modules.sandbox.effective.addEffective|qaobee.modules.sandbox.effective.addEffective}
     * @requires {@link qaobee.modules.sandbox.effective.updateEffective|qaobee.modules.sandbox.effective.updateEffective}
     * @requires {@link qaobee.modules.sandbox.effective.players.addPlayer|qaobee.modules.sandbox.effective.players.addPlayer}
     * @requires {@link qaobee.modules.sandbox.effective.players.updatePlayer|qaobee.modules.sandbox.effective.players.updatePlayer}
     * @requires {@link qaobee.modules.sandbox.effective.players.viewPlayer|qaobee.modules.sandbox.effective.players.viewPlayer}
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.players', [
            /* angular qaobee */
            'ngAutocomplete',

            /* qaobee modules */
            'qaobee.addPlayer',
            'qaobee.updatePlayer',
            'qaobee.viewPlayer',
            'qaobee.compare',

            /* qaobee services */
            'effectifSRV',

            /* qaobee Rest API */
            'effectiveRestAPI',
            'teamRestAPI',
            'userRestAPI'])


        .config(function ($routeProvider, metaDatasProvider) {

            $routeProvider.when('/private/players/:effectiveId', {
                controller: 'MainPlayerControler',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/modules/sandbox/effective/players/mainPlayer.html'

            });
        })

        /**
         * @class qaobee.modules.sandbox.effective.MainPlayerControler
         * @description Main controller for view mainPlayer.html
         */
        .controller('MainPlayerControler', function ($log, $scope, $routeParams, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta,
                                                     effectiveRestAPI, effectiveSrv, userRestAPI) {

            $translatePartialLoader.addPart('effective');
            $translatePartialLoader.addPart('commons');
            $translatePartialLoader.addPart('stats');

            $scope.effectiveId = $routeParams.effectiveId;
            $scope.user.effectiveDefault = $scope.effectiveId;

            $scope.user = user;
            $scope.meta = meta;
            $scope.players = [];
            $scope.effectives = [];
            $scope.compareList = {};
            $scope.currentEffective = {};
            $scope.currentCategory = null;
            $scope.updatePlayerToCompare = function (id) {
                var count = 0;
                Object.keys($scope.compareList, function (n) {
                    if ($scope.compareList[n]) {
                        count++;
                    }
                });
                if (count > 3) {
                    toastr.error($filter('translate')('compare.player-max', {'max':3}));
                    $scope.compareList[id] = false;
                }
            };

            /* Retrieve current effective and list player */
            $scope.getPlayers = function () {
                effectiveSrv.getEffective($scope.user.effectiveDefault).then(function (data) {
                    $scope.currentEffective = data;

                    effectiveSrv.getListId($scope.currentEffective, 'player').then(function (listId) {
                        var listField = Array.create('_id', 'name', 'firstname', 'avatar', 'status', 'birthdate', 'contact');

                        effectiveSrv.getPersons(listId, listField).then(function (players) {
                            $scope.players = players;
                            $scope.players.forEach(function (e) {
                                if (angular.isDefined(e.status.positionType)) {
                                    e.positionType = $filter('translate')('stats.positionType.value.' + e.status.positionType);
                                } else {
                                    e.positionType = '';
                                }

                                e.birthdate = $filter('date')(e.birthdate, 'yyyy');
                                e.age = moment().format('YYYY') - e.birthdate;
                            });
                        });
                    });
                });
            };

            /* check user connected */
            $scope.checkUserConnected = function () {
                userRestAPI.getUserById(user._id).success(function (/* data */) {
                    $scope.getPlayers();
                }).error(function (/* data */) {
                    $log.error('MainPlayerControler : User not Connected');
                });
            };

            /* Primary, check if user connected */
            $scope.checkUserConnected();


        })
        //
    ;
}());