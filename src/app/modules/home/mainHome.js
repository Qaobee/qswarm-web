(function () {
    'use strict';
    /**
     * Module Gérant la partie publique du site
     *
     * @class qaobee.modules.home.mainHome
     * @author Christophe Kervella
     * @copyright <b>QaoBee</b>.
     * @requires {@link https://docs.angularjs.org/api/ngRoute|ngRoute}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.effectiveRestAPI|qaobee.components.restAPI.sandbox.effective.effectiveRestAPI}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.personRestAPI|qaobee.components.restAPI.sandbox.effective.personRestAPI}
     * @requires {@link qaobee.components.widgets.event.widget.nextEvent|qaobee.components.widgets.event.widget.nextEvent}
     */
    angular.module('qaobee.home', [
        /* qaobee services */
        'effectifSRV',
        /* qaobee Rest API */
        'userRestAPI'])

        .config(function ($routeProvider, metaProvider, userProvider) {
            $routeProvider.when('/private', {
                controller: 'HomeControler',
                resolve: {
                    user: userProvider.$get,
                    meta: metaProvider.$get
                },
                templateUrl: 'app/modules/home/mainHome.html'

            });
        })
        /**
         * @class qaobee.modules.home.HomeControler
         */
        .controller('HomeControler', function ($log, $scope, $translatePartialLoader, $filter, user, meta, effectiveSrv, effectiveRestAPI, sandboxRestAPI, qeventbus) {
            $translatePartialLoader.addPart('home');
            $translatePartialLoader.addPart('stats');
            $translatePartialLoader.addPart('agenda');
            $translatePartialLoader.addPart('effective');
            $scope.user = user;
            $scope.meta = meta;
            $scope.activeTabIndex = 0;
            $scope.listId = [];

            $scope.getEffective = function (id) {
                effectiveSrv.getEffective(id).then(function (data) {
                    effectiveSrv.getListId(data, 'player').then(function (listId) {
                        $scope.listId = listId.union($scope.listId);
                        qeventbus.prepForBroadcast('ownersId', {
                            ownersId: $scope.listId
                        });
                    });
                });
            };
            $scope.getEffective($scope.meta.sandbox.effectiveDefault);
        });
}());