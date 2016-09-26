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
        .controller('AddPlayerControler', function ($log, $http, $scope, $timeout, $routeParams, $window, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta,
                                                    activityCfgRestAPI, personSrv, userRestAPI, $translate) {

            $translatePartialLoader.addPart('commons');
            $translatePartialLoader.addPart('effective');

            $scope.effectiveId = $routeParams.effectiveId;
            $scope.showBirthdate = true;
            $scope.user = user;
            $scope.meta = meta;
            $scope.positionsType = {};
            $scope.addPlayerTitle = true;
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

            $scope.optionsCity = {
                types: '(cities)'
            };
            $scope.detailsCity = '';

            $scope.optionsAdr = null;
            $scope.detailsAdr = '';

            /* Retrieve list of positions type */
            $scope.getListPositionType = function () {
                activityCfgRestAPI.getParamFieldList(moment().valueOf(), $scope.meta.sandbox.activityId, $scope.meta.sandbox.structure.country._id, 'listPositionType').success(function (data) {
                    $scope.positionsType = data;
                    $translate(['commons.format.date.listMonth',
                        'commons.format.date.listMonthShort',
                        'commons.format.date.listWeekdaysFull',
                        'commons.format.date.listWeekdaysShort',
                        'commons.format.date.listWeekdaysLetter',
                        'commons.format.date.today',
                        'commons.format.date.clear',
                        'commons.format.date.close',
                        'commons.format.date.label',
                        'commons.format.date.pattern'
                    ]).then(function (translations) {
                        angular.element('#playerBirthdate').pickadate({
                            format: translations['commons.format.date.label'],
                            formatSubmit: translations['commons.format.date.pattern'],
                            monthsFull: translations['commons.format.date.listMonth'].split(','),
                            monthShort: translations['commons.format.date.listMonthShort'].split(','),
                            weekdaysFull: translations['commons.format.date.listWeekdaysFull'].split(','),
                            weekdaysLetter: translations['commons.format.date.listWeekdaysLetter'].split(','),
                            weekdaysShort: translations['commons.format.date.listWeekdaysShort'].split(','),
                            selectYears: 100,
                            selectMonths: true,
                            max: true,
                            today: translations['commons.format.date.today'],
                            clear: translations['commons.format.date.clear'],
                            close: translations['commons.format.date.close']
                        })
                            .pickadate('picker');
                    });
                });
            };

            /* add player */
            $scope.checkAndformatPerson = function () {
                $scope.player.birthdate = moment($scope.player.birthdate, $scope.formatDateMoment).valueOf();
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

            /* check user connected */
            $scope.checkUserConnected = function () {
                userRestAPI.getUserById(user._id).success(function () {
                    $scope.getListPositionType();
                }).error(function () {
                    $log.error('AddPlayerControler : User not Connected');
                });
            };
            /* Primary, check if user connected */
            $scope.checkUserConnected();

        });
}());
