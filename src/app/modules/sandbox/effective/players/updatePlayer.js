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


        .config(function ($routeProvider, metaDatasProvider) {

            $routeProvider.when('/private/updatePlayer/:playerId', {
                controller: 'UpdatePlayerControler',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/modules/sandbox/effective/players/writePlayer.html'

            });
        })

    /**
     * @class qaobee.modules.sandbox.effective.UpdatePlayerControler
     * @description Main controller for view updatePlayer.html
     */
        .controller('UpdatePlayerControler', function ($log, $scope, $timeout, $routeParams, $window, $translatePartialLoader, $location, $rootScope, $q, $filter, user, meta,
                                                        activityCfgRestAPI, personRestAPI, personSrv, userRestAPI) {

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
        $scope.doTheBack = function() {
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
            activityCfgRestAPI.getParamFieldList(moment().valueOf(), $scope.meta.activity._id, $scope.meta.structure.country._id, 'listPositionType').success(function (data) {
                $scope.positionsType = data;
            });
        };
        
        /* get person */
        $scope.getPerson = function () {
            personRestAPI.getPerson($scope.playerId).success(function (person) {
                $scope.player = person;
                $scope.player.birthdate = new Date(moment($scope.player.birthdate));
                
                var $inputDate = null;
                $timeout(function() {
                    $inputDate = $('#playerBirthdate').pickadate({
                        format: $scope.formatDate,
                        formatSubmit: $scope.formatDateSubmit,
                        monthsFull: $scope.month,
                        weekdaysFull: $scope.weekdaysFull,
                        weekdaysLetter: $scope.weekdaysLetter,
                        weekdaysShort: $scope.weekdaysShort,
                        selectYears: 80,
                        selectMonths: true,
                        today: $scope.today,
                        clear: $scope.clear,
                        close: $scope.close
                    });

                    $scope.datePicker = $inputDate.pickadate('picker');
                    $scope.datePicker.set('select', $scope.player.birthdate.valueOf());
                }, 100);
            });
        };    
        
        /* update person */
        $scope.checkAndformatPerson = function () { 
            $scope.player.birthdate = moment($scope.player.birthdate,'DD/MM/YYYY').valueOf();
            personSrv.formatAddress($scope.player.address).then(function(adr){
                $scope.player.address = adr;
                
                /* update player*/
                personSrv.updatePlayer($scope.player).then(function(person){
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
            
            userRestAPI.getUserById(user._id).success(function (data) {
                $scope.getListPositionType();
                $scope.getPerson();
            }).error(function (data) {
                $log.error('UpdatePlayerControler : User not Connected');
            });
        }; 
        
        /* Primary, check if user connected */
        $scope.checkUserConnected();
    })
    //
    ;
}());
