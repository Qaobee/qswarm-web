(function () {
    'use strict';
    /**
     * Module add player
     *
     * @author Christophe Kervella
     * @class qaobee.modules.sandbox.effective.player.addPlayer
     * @namespace qaobee.modules.sandbox.effective.player
     *
     * @requires {@link qaobee.components.restAPI.commons.settings.activityCfgRestAPI|qaobee.components.restAPI.commons.settings.activityCfgRestAPI}
     * @requires {@link qaobee.components.restAPI.commons.users.userRestAPI|qaobee.components.restAPI.commons.users.userRestAPI}
     * @requires {@link qaobee.components.services.personSRV|qaobee.components.services.personSRV}
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.addPlayer', [
        /* angular modules*/
        'mgo-angular-wizard',

        /* qaobee Rest API */
        'activityCfgRestAPI',
        'personSRV',
        'userRestAPI'])


        .config(function ($routeProvider, metaProvider, userProvider) {

            $routeProvider.when('/private/addPlayer/:effectiveId', {
                controller: 'AddPlayerControler',
                resolve: {
                    user: userProvider.$get,
                    meta: metaProvider.$get
                },
                templateUrl: 'app/modules/sandbox/effective/players/writePlayer.html'

            });
        })

        /**
         * @class qaobee.modules.sandbox.effective.AddPlayerControler
         * @description Main controller for view addPlayer.html
         */
        .controller('AddPlayerControler', function ($log, $http, $scope, $routeParams, $window, $translatePartialLoader,
                                                    $location, $rootScope, $q, $filter, user, meta, activityCfgRestAPI, countryRestAPI, personSrv) {

            $translatePartialLoader.addPart('commons');
            $translatePartialLoader.addPart('effective');

            $scope.maxDate = new Date().toISOString();
            $scope.effectiveId = $routeParams.effectiveId;
            $scope.showBirthdate = true;
            $scope.user = user;
            $scope.meta = meta;

            $scope.positionsType = {};
            $scope.addPlayerTitle = true;
            $scope.countryList = [];
        
            // return button
            $scope.doTheBack = function () {
                $window.history.back();
            };

            $scope.getToday = function () {
                return new Date().toISOString().slice(0, 10);
            };

            //Initialisation du nouveau joueur
            $scope.player = {
                status: {
                    availability: {
                        value: 'available',
                        cause: 'available'
                    },
                    squadnumber: '',
                    weight: '',
                    height: '',
                    laterality: '',
                    stateForm: 'good'
                },
                address: {},
                contact: {}
            };
            /* init ngAutocomplete*/
            $scope.options = {};
            $scope.options.watchEnter = true;
            $scope.optionsCountry = {
                types: 'geocode'
            };
                
            $scope.detailsCountry = '';
            $scope.optionsAdr = null;
            $scope.detailsAdr = '';
            
            countryRestAPI.getList().then(function (data) {
                data.data.forEach(function (item) {
                    $scope.countryList.push(item);
                });
                
                $scope.countryList = $scope.countryList.sortBy(function (n) {
                    return n.label;
                });
            });

        
            /* Retrieve list of positions type */
            $scope.getListPositionType = function () {
                activityCfgRestAPI.getParamFieldList(moment().valueOf(), $scope.meta.sandbox.activityId, $scope.meta.sandbox.structure.country._id, 'listPositionType').success(function (data) {
                    $scope.positionsType = data;
                    
                    $scope.positionsType = $scope.positionsType.sortBy(function (n) {
                        return n.label;
                    });
                });
            };

            /* add player */
            $scope.checkAndformatPerson = function () {
                
                $scope.player.birthdate = moment($scope.birthdate, 'DD/MM/YYYY').valueOf();
                personSrv.formatAddress($scope.player.address).then(function (adr) {
                    $scope.player.address = adr;

                    /* Write player*/
                    personSrv.addPlayer($scope.player, $scope.meta.sandbox._id).then(function (person) {

                        /* add member*/
                        if ($scope.meta.sandbox.effectiveDefault !== 'EFFECTIVE-TEMPO') {
                            personSrv.addEffectiveMember(person, $scope.meta.sandbox.effectiveDefault).then(function (effective) {
                                toastr.success($filter('translate')('addPlayer.toastSuccess', {
                                    firstname: person.firstname,
                                    name: person.name,
                                    effective: effective.categoryAge.label
                                }));

                                $window.history.back();
                            });
                        } else {
                            toastr.success($filter('translate')('addPlayer.toastSuccess', {
                                firstname: person.firstname,
                                name: person.name,
                                effective: user.newEffective.categoryAge.label
                            }));

                            $window.history.back();
                        }

                    });
                });
            };
            $scope.getListPositionType();
        });
}());
