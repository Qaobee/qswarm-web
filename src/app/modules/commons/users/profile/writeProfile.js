(function () {
    'use strict';
    /**
     * user profile
     *
     * @author Xavier MARIN
     * @class qaobee.user.writeProfile
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.user.writeProfile', ['profileRestAPI'])

        .config(function ($routeProvider, metaProvider, userProvider) {
            $routeProvider.when('/private/profile/writeProfile', {
                controller: 'WriteProfileCtrl',
                resolve: {
                    user: userProvider.$get,
                    meta: metaProvider.$get
                },
                templateUrl: 'app/modules/commons/users/profile/writeProfile.html'
            });
        })
        /**
         * @class qaobee.user.profile.WriteProfileCtrl
         * @description Main controller of app/modules/commons/users/profile/writeProfile.html
         */
        .controller('WriteProfileCtrl', function ($scope, $filter, EnvironmentConfig, $timeout, $window, $translatePartialLoader,
                                                  $translate, $rootScope, $location, $log, personSrv, profileRestAPI, user) {
            $translatePartialLoader.addPart('user');
            $translatePartialLoader.addPart('commons');
            $scope.user = angular.copy(user);
            // return button
            /**
             * Do the back
             */
            $scope.doTheBack = function () {
                $window.history.back();
            };

            //i18n datepicker
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
                $scope.datePicker = angular.element('#profilBirthdate')
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
                        today: translations['commons.format.date.today'],
                        clear: translations['commons.format.date.clear'],
                        close: translations['commons.format.date.close']
                    })
                    .pickadate('picker')
                    .set('select', $scope.user.birthdate.valueOf());
            });

            $scope.temp = {};
            $scope.temp.optionsAdr = {
                types: 'geocode'
            };
            $scope.temp.detailsAdr = '';
            if (angular.isDefined($scope.user.address) && $scope.user.address != null && angular.isDefined($scope.user.address.formatedAddress)) {
                $scope.temp.addr = $scope.user.address.formatedAddress;
            } else {
                $scope.temp.addr = '';
            }


            // Surveillance de la modification du retour de l'API Google sur l'adresse
            $scope.$watch('temp.detailsAdr', function (newValue) {
                if (angular.isUndefined(newValue) || newValue === '' || angular.equals({}, newValue)) {
                    return;
                }
                personSrv.formatAddress(newValue).then(function (adr) {
                    $scope.user.address = adr;
                });
            });

            // Surveillance de la modification du champ adresse par l'utilisateur
            $scope.$watch('temp.addr', function (newValue) {
                if (angular.isUndefined(newValue) || '' === newValue + '' || angular.equals({}, newValue) || newValue.length === 1) {
                    $scope.user.address = {};
                }
            });

            /**
             * @name $scope.updateUser
             * @function
             * @memberOf qaobee.prive.profile.ProfileCtrl
             * @description update the current user
             */
            $scope.updateProfilUser = function () {
                var updUser = {};
                angular.copy($scope.user, updUser);
                updUser.birthdate = moment($scope.user.birthdate, $filter('translate')('commons.format.date.moment')).valueOf();
                delete updUser.isAdmin;


                profileRestAPI.update(updUser).success(function (data) {
                    $rootScope.user = $scope.user;
                    $translate('profilePage.form.success').then(function (mess) {
                        toastr.success(mess, data.firstname + ' ' + data.name);
                        $location.path('/private/profile');
                    });
                });
            };
        });
}());