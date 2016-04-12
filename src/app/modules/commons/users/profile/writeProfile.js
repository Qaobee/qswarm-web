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

        .config(function ($routeProvider, metaDatasProvider) {
            $routeProvider.when('/private/profile/writeProfile', {
                controller: 'WriteProfileCtrl',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/modules/commons/users/profile/writeProfile.html'
            });
        })
        /**
         * @class qaobee.user.profile.WriteProfileCtrl
         * @description Main controller of app/modules/commons/users/profile/writeProfile.html
         */
        .controller('WriteProfileCtrl', function ($scope, $filter, EnvironmentConfig, $timeout, $window, $translatePartialLoader,
                                                  $translate, $rootScope, $log, personSrv, profileRestAPI, user, meta) {
            $translatePartialLoader.addPart('profile');
            $translatePartialLoader.addPart('user');
            $translatePartialLoader.addPart('commons');
            $scope.optionsAdr = null;
            $scope.detailsAdr = '';
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
                $scope.month = translations['commons.format.date.listMonth'].split(',');
                $scope.monthShort = translations['commons.format.date.listMonthShort'].split(',');
                $scope.weekdaysFull = translations['commons.format.date.listWeekdaysFull'].split(',');
                $scope.weekdaysShort = translations['commons.format.date.listWeekdaysShort'].split(',');
                $scope.weekdaysLetter = translations['commons.format.date.listWeekdaysLetter'].split(',');
                $scope.today = translations['commons.format.date.today'];
                $scope.clear = translations['commons.format.date.clear'];
                $scope.close = translations['commons.format.date.close'];
                $scope.formatDate = translations['commons.format.date.label'];
                $scope.formatDateSubmit = translations['commons.format.date.pattern'];

                $scope.datePicker = angular.element('#profilBirthdate').pickadate({
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
                    })
                    .pickadate('picker')
                    .set('select', $scope.user.birthdate.valueOf());
            });

            /**
             * @name $scope.updateUser
             * @function
             * @param profileForm the form
             * @memberOf qaobee.prive.profile.ProfileCtrl
             * @description update the current user
             */
            $scope.updateProfilUser = function () {
                var updUser = {};
                angular.copy($scope.user, updUser);
                updUser.birthdate = moment($scope.user.birthdate, 'DD/MM/YYYY').valueOf();
                delete updUser.isAdmin;
                // address management
                personSrv.formatAddress($scope.user.address).then(function (adr) {
                    $scope.user.address = adr;

                    profileRestAPI.update(updUser).success(function (data) {
                        toastr.success(data.firstname + ' ' + data.name + $filter('translate')('popup.success.updated'));
                        $window.history.back();
                    });
                });
            };
        });
}());