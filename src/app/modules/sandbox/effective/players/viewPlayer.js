(function () {
    'use strict';
    /**
     * Module add player
     *
     * @author Christophe Kervella
     * @class qaobee.modules.sandbox.effective.player.viewPlayer
     * @namespace qaobee.modules.sandbox.effective.player
     *
     * @requires {@link qaobee.components.restAPI.sandbox.effective.effectiveRestAPI|qaobee.components.restAPI.sandbox.effective.effectiveRestAPI}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.personRestAPI|qaobee.components.restAPI.sandbox.effective.personRestAPI}
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.viewPlayer', [
        
        /* qaobee Rest API */
        'effectiveRestAPI', 
        'personRestAPI'])


        .config(function ($routeProvider, metaDatasProvider) {

            $routeProvider.when('/private/viewPlayer/:playerId', {
                controller: 'ViewPlayerControler',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/modules/sandbox/effective/players/viewPlayer.html'

            });
        })

    /**
     * @class qaobee.modules.sandbox.effective.ViewPlayerControler
     * @description Main controller for view viewPlayer.html
     */
        .controller('ViewPlayerControler', function ($log, $scope, $routeParams, $window, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta, effectiveRestAPI, personRestAPI) {

        $translatePartialLoader.addPart('commons');
        $translatePartialLoader.addPart('effective');
        $translatePartialLoader.addPart('stats');
        
        $scope.playerId = $routeParams.playerId;

        $scope.user = user;
        $scope.meta = meta;
        $scope.player = {};
        
        // return button
        $scope.doTheBack = function() {
            $window.history.back();
        };
        
        /* get person */
        personRestAPI.getPerson($scope.playerId).success(function (person) {
            $log.debug(person);
            $scope.player = person;

            if (angular.isDefined($scope.player.status.positionType)) {
                    $scope.player.positionType = $filter('translate')('stat.positionType.value.' + $scope.player.status.positionType);
            } else {
                $scope.player.positionType = '';
            }

            if (angular.isDefined($scope.player.status.stateForm)) {
                $scope.player.stateForm = $filter('translate')('stat.stateForm.value.' + $scope.player.status.stateForm);
            } else {
                $scope.player.stateForm = '';
            }

            $scope.player.birthdate = $filter('date')($scope.player.birthdate, 'yyyy');
            $scope.player.age = moment().format("YYYY") - $scope.player.birthdate;
        });
    })
    //
    ;
}());
