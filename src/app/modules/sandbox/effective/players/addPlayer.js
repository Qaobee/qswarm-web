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
                                                    activityCfgRestAPI, personSrv, userRestAPI) {

            $translatePartialLoader.addPart('commons');
            $translatePartialLoader.addPart('effective');

            $scope.effectiveId = $routeParams.effectiveId;

            $scope.user = user;
            $scope.meta = meta;
            $scope.positionsType = {};
            $scope.addPlayerTitle = true;

            // return button
            $scope.doTheBack = function () {
                $window.history.back();
            };

            //i18n datepicker
            var month = $filter('translate')('commons.format.date.listMonth');
            $scope.month = month.split(',');

            var monthShort = $filter('translate')('commons.format.date.listMonthShort');
            $scope.monthShort = monthShort.split(',');

            var weekdaysFull = $filter('translate')('commons.format.date.listWeekdaysFull');
            $scope.weekdaysFull = weekdaysFull.split(',');

            var weekdaysShort = $filter('translate')('commons.format.date.listWeekdaysShort');
            $scope.weekdaysShort = weekdaysShort.split(',');

            var weekdaysLetter = $filter('translate')('commons.format.date.listWeekdaysLetter');
            $scope.weekdaysLetter = weekdaysLetter.split(',');

            $scope.today = $filter('translate')('commons.format.date.today');
            $scope.clear = $filter('translate')('commons.format.date.clear');
            $scope.close = $filter('translate')('commons.format.date.close');
            $scope.formatDate = $filter('translate')('commons.format.date.label');
            $scope.formatDateSubmit = $filter('translate')('commons.format.date.pattern');

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

            var $inputDate = null;
            $timeout(function () {
                $inputDate = $('#playerBirthdate').pickadate({
                    format: $scope.formatDate,
                    formatSubmit: $scope.formatDateSubmit,
                    monthsFull: $scope.month,
                    weekdaysFull: $scope.weekdaysFull,
                    weekdaysLetter: $scope.weekdaysLetter,
                    weekdaysShort: $scope.weekdaysShort,
                    selectYears: 100,
                    selectMonths: true,
                    today: $scope.today,
                    clear: $scope.clear,
                    close: $scope.close
                });

                $scope.datePicker = $inputDate.pickadate('picker');
            }, 100);

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
                });
            };

            /* add player */
            $scope.checkAndformatPerson = function () {
                $scope.player.birthdate = moment($scope.player.birthdate, 'DD/MM/YYYY').valueOf();
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
