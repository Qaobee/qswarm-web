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


            // return button
            $scope.doTheBack = function() {
                $window.history.back();
            };

            //$scope.pdfUrl = EnvironmentConfig.apiEndPoint + '/api/1/commons/users/profile/pdf?token=' + $window.sessionStorage.qaobeesession;
            //$scope.billPdfUrl = EnvironmentConfig.apiEndPoint + '/api/1/commons/users/profile/billpdf?token=' + $window.sessionStorage.qaobeesession;

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

            var $inputDate = null;
            $timeout(function() {
                $inputDate = $('#profilBirthdate').pickadate({
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
                $scope.datePicker.set('select', $scope.user.birthdate.valueOf());
            }, 0);

            $scope.optionsAdr = null;
            $scope.detailsAdr = '';

            /**
             * @name $scope.updateUser
             * @function
             * @param profileForm
             *            the form
             * @memberOf qaobee.prive.profile.ProfileCtrl
             * @description update the current user
             */
            $scope.updateProfilUser = function (profileForm) {
                var updUser = {};
                angular.copy($scope.user, updUser);
                updUser.birthdate = moment($scope.user.birthdate,'DD/MM/YYYY').valueOf();
                delete updUser.isAdmin;
                // address management
                personSrv.formatAddress($scope.user.address).then(function(adr){
                    $scope.user.address = adr;

                    profileRestAPI.update(updUser).success(function (data) {
                        toastr.success(data.firstname + ' ' + data.name + $filter('translate')('popup.success.updated'));
                        $window.history.back();
                    });
                });
            };    
        });
}());