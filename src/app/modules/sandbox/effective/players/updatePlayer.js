(function () {
    'use strict';
    /**
     * Module add player
     *
     * @author Christophe Kervella
     * @class qaobee.modules.sandbox.effective.player.updatePlayer
     * @namespace qaobee.modules.sandbox.effective.player
     *
     * @requires {@link qaobee.components.restAPI.commons.settings.activityCfgRestAPI|qaobee.components.restAPI.commons.settings.activityCfgRestAPI}
     * @requires {@link qaobee.components.restAPI.commons.users.userRestAPI|qaobee.components.restAPI.commons.users.userRestAPI}
     * @requires {@link qaobee.components.services.personSRV|qaobee.components.services.personSRV}
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.updatePlayer', [

        /* qaobee Rest API */
        'effectiveRestAPI',
        'personRestAPI',
        'userRestAPI',
        'countryRestAPI'
    ])

        .config(function ($routeProvider, metaProvider, userProvider) {

            $routeProvider.when('/private/updatePlayer/:playerId', {
                controller: 'UpdatePlayerControler',
                resolve: {
                    user: userProvider.$get,
                    meta: metaProvider.$get
                },
                templateUrl: 'app/modules/sandbox/effective/players/writePlayer.html'
            });
        })

        /**
         * @class qaobee.modules.sandbox.effective.UpdatePlayerControler
         * @description Main controller for view updatePlayer.html
         */
        .controller('UpdatePlayerControler', function ($log, $scope, $timeout, $routeParams, $window, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta,
                                                       activityCfgRestAPI, personRestAPI, personSrv, countryRestAPI) {
            $translatePartialLoader.addPart('commons');
            $translatePartialLoader.addPart('effective');
            $translatePartialLoader.addPart('stats');
            $scope.maxDate = new Date().toISOString();
            $scope.playerId = $routeParams.playerId;
            $scope.user = user;
            $scope.meta = meta;
            $scope.player = {};
            $scope.countryList = [];
            $scope.positionsType = {};
            $scope.addPlayerTitle = false;
            // return button
            $scope.doTheBack = function () {
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
            countryRestAPI.getList().then(function (data) {
                data.data.forEach(function (item) {
                    $scope.countryList.push(item);
                });
            });
            /* Retrieve list of positions type */
            $scope.getListPositionType = function () {
                activityCfgRestAPI.getParamFieldList(moment().valueOf(), $scope.meta.sandbox.activityId, $scope.meta.sandbox.structure.country._id, 'listPositionType').success(function (data) {
                    $scope.positionsType = data;
                });
            };
            $scope.getToday = function () {
                return new Date().toISOString().slice(0, 10);
            };
            /* get person */
            $scope.getPerson = function () {
                personRestAPI.getPerson($scope.playerId).success(function (person) {
                    $scope.player = person;
                    $scope.birthdate = $scope.player.birthdate || moment().valueOf();
                    $scope.birthdate = moment($scope.birthdate).toDate();
                    $scope.showBirthdate = true;
                    $timeout(function () {
                        angular.element('#playerBirthdate').pickadate('picker').set('select', $scope.birthdate.valueOf());
                        $scope.datePicker = angular.element('#playerBirthdate').pickadate('picker');
                    }, 1000);
                });
            };

            /* update person */
            $scope.checkAndformatPerson = function () {
                $scope.player.birthdate = moment($scope.birthdate, 'DD/MM/YYYY').valueOf();
                personSrv.formatAddress($scope.player.address).then(function (adr) {
                    $scope.player.address = adr;

                    /* update player*/
                    personSrv.updatePlayer($scope.player).then(function (person) {
                        toastr.success($filter('translate')('updatePlayer.toastSuccess', {
                            firstname: person.firstname,
                            name: person.name
                        }));

                        $window.history.back();
                    });
                });

            };

            $scope.getListPositionType();
            $scope.getPerson();
        });
}());
