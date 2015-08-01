(function () {
    'use strict';
    /**
     * Module add player
     *
     * @author Christophe Kervella
     * @class qaobee.modules.sandbox.effective.player.updatePlayer
     * @namespace qaobee.modules.sandbox.effective.player
     *
     * @requires {@link qaobee.components.restAPI.sandbox.effective.effectiveRestAPI|qaobee.components.restAPI.sandbox.effective.effectiveRestAPI}
     * @requires {@link qaobee.components.restAPI.sandbox.effective.personRestAPI|qaobee.components.restAPI.sandbox.effective.personRestAPI}
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.updatePlayer', [
        
        /* qaobee Rest API */
        'effectiveRestAPI', 
        'personRestAPI'])


        .config(function ($routeProvider, metaDatasProvider) {

            $routeProvider.when('/private/updatePlayer/:playerId', {
                controller: 'UpdatePlayerControler',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/modules/sandbox/effective/players/updatePlayer.html'

            });
        })

    /**
     * @class qaobee.modules.sandbox.effective.UpdatePlayerControler
     * @description Main controller for view updatePlayer.html
     */
        .controller('UpdatePlayerControler', function ($log, $scope, $routeParams, $window, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta, activityCfgRestAPI, personRestAPI) {

        $translatePartialLoader.addPart('commons');
        $translatePartialLoader.addPart('effective');
        $translatePartialLoader.addPart('stats');
        
        $scope.playerId = $routeParams.playerId;

        $scope.user = user;
        $scope.meta = meta;
        $scope.player = {};
        $scope.currentCategory = {};
        $scope.positionsType = {};
        
        // return button
        $scope.doTheBack = function() {
            $window.history.back();
        };
        
        /* init ngAutocomplete*/
        $scope.options = {};
        $scope.options.watchEnter = true;
        $scope.optionsCountry = {
            types: 'geocode'
        };
        $scope.detailsCountry = '';
        
        $scope.optionsCity = {
            types: '(cities)'
        };
        $scope.detailsCity = '';
        
        $scope.optionsAdr = null;
        $scope.detailsAdr = '';
        
        /* Retrieve list of positions type */
        activityCfgRestAPI.getParamFieldList(moment().valueOf(), $scope.meta.activity._id, $scope.meta.structure.country._id, 'listPositionType').success(function (data) {
            $scope.positionsType = data;
        });
        
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
