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
        'userRestAPI'])

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
                                                       activityCfgRestAPI, personRestAPI, personSrv, userRestAPI, $translate) {

            $translatePartialLoader.addPart('commons');
            $translatePartialLoader.addPart('effective');
            $translatePartialLoader.addPart('stats');

            $scope.playerId = $routeParams.playerId;

            $scope.user = user;
            $scope.meta = meta;
            $scope.player = {};
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

            /* Retrieve list of positions type */
            $scope.getListPositionType = function () {
                activityCfgRestAPI.getParamFieldList(moment().valueOf(), $scope.meta.sandbox.activityId, $scope.meta.sandbox.structure.country._id, 'listPositionType').success(function (data) {
                    $scope.positionsType = data;
                });
            };
            $scope.getToday = function() {
                return new Date().toISOString().slice(0, 10);
            };
            /* get person */
            $scope.getPerson = function () {
                personRestAPI.getPerson($scope.playerId).success(function (person) {
                    $scope.player = person;
                    $scope.player.birthdate = $scope.player.birthdate || moment().valueOf();
                    $scope.player.birthdate = moment($scope.player.birthdate).toDate();
                    $scope.showBirthdate = true;
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
                        $scope.datePicker = angular.element('#playerBirthdate')
                            .pickadate({
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
                            .pickadate('picker')
                            .set('select',$scope.player.birthdate.valueOf());
                    });
                });
            };

            /* update person */
            $scope.checkAndformatPerson = function () {
                $scope.player.birthdate = moment($scope.player.birthdate, $scope.formatDateMoment).valueOf();
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

            /* check user connected */
            $scope.checkUserConnected = function () {
                userRestAPI.getUserById(user._id).success(function () {
                    $scope.getListPositionType();
                    $scope.getPerson();
                }).error(function () {
                    $log.error('UpdatePlayerControler : User not Connected');
                });
            };
            /* Primary, check if user connected */
            $scope.checkUserConnected();
        });
}());
