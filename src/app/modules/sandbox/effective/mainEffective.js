(function () {
    'use strict';
    /**
     * Module dashboard effective
     *
     * @author Christophe Kervella
     * @class qaobee.modules.sandbox.effective.mainEffective
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
    angular.module('qaobee.effective', [
        /* angular qaobee */
        'ngAutocomplete',

        /* qaobee modules */
        'qaobee.addEffective',
        'qaobee.updateEffective',
        'qaobee.addPlayer',
        'qaobee.updatePlayer',
        'qaobee.viewPlayer',
        'qaobee.addTeam',
        'qaobee.updateTeam',

        /* qaobee services */
        'effectifSRV',

        /* qaobee Rest API */
        'effectiveRestAPI',
        'teamRestAPI',
        'userRestAPI'])


        .config(function ($routeProvider, metaProvider, userProvider) {
            $routeProvider.when('/private/effective/:effectiveId', {
                controller: 'MainEffectiveControler',
                resolve: {
                    user: userProvider.$get,
                    meta: metaProvider.$get
                },
                templateUrl: 'app/modules/sandbox/effective/mainEffective.html'
            });
        })

        /**
         * @class qaobee.modules.sandbox.effective.MainEffectiveControler
         * @description Main controller for view mainEffective.html
         */
        .controller('MainEffectiveControler', function ($log, $scope, $routeParams, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta,
                                                        effectiveRestAPI, effectiveSrv, teamRestAPI, userRestAPI, $timeout) {

            $translatePartialLoader.addPart('effective');
            $translatePartialLoader.addPart('stats');
            $translatePartialLoader.addPart('commons');

            $scope.effectiveId = $routeParams.effectiveId;
            $scope.user.effectiveDefault = $scope.effectiveId;

            $scope.user = user;
            $scope.meta = meta;
            $scope.players = [];
            $scope.effectives = [];
            $scope.currentEffective = {};
            $scope.currentCategory = null;
            $scope.listTeamHome = {};


            /* Retrieve list of team of effective */
            $scope.getListTeamHome = function () {
                teamRestAPI.getListTeamHome($scope.meta.sandbox._id, $scope.effectiveId, 'all').success(function (data) {
                    $scope.listTeamHome = data.sortBy(function (n) {
                        return n.label;
                    });
                });
            };

            /* Retrieve list effective */
            $scope.getEffectives = function () {

                effectiveRestAPI.getListEffective($scope.meta._id, $scope.currentCategory).success(function (data) {
                    $scope.effectives = data.sortBy(function (n) {
                        return n.label;
                    });

                    /* retrieve the current effective */
                    data.forEach(function (a) {
                        if (a._id === $scope.effectiveId) {
                            $scope.currentEffective = a;
                        }
                    });

                    $scope.getEffective();
                });
            };

            /* Retrieve current effective and list player */
            $scope.getEffective = function () {
                effectiveSrv.getEffective($scope.user.effectiveDefault).then(function (data) {
                    $scope.currentEffective = data;

                    effectiveSrv.getListId($scope.currentEffective, 'player').then(function (listId) {
                        var listField = ['_id', 'name', 'firstname', 'avatar', 'status', 'birthdate', 'contact'];

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

            /* keep in memory tab by default */
            $scope.changeTabDefault = function (tabId) {
                user.effectiveTabId = tabId;
            };

            $scope.getEffectives();
            $scope.getListTeamHome();
            $timeout(function () {
                if (user.effectiveTabId) {
                    angular.element('ul.tabs').tabs('select_tab', user.effectiveTabId);
                } else {
                    angular.element('ul.tabs').tabs('select_tab', 'playerList');
                }
            }, 100);

        });
}());

