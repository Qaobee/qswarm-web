(function () {
    'use strict';
    /**
     * Created by cke on 15/02/16.
     *
     * userProfilData directive<br />
     *
     * @author christophe Kervella
     * @copyright &lt;b&gt;QaoBee&lt;/b&gt;.
     *
     */

    angular.module('userProfilData', ['profileRestAPI', 'qaobee.eventbus', 'personSRV'])

        .directive('userProfilData', function ($translatePartialLoader, $timeout, $window, $log, $q, $filter, profileRestAPI, personSrv, qeventbus) {
            return {
                restrict: 'E',
                scope: {
                    user: "=?"
                },
                controller: function ($scope) {
                    $translatePartialLoader.addPart('profile');
                    $translatePartialLoader.addPart('commons');
                    $translatePartialLoader.addPart('user');


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
                                qeventbus.prepForBroadcast('refreshUser', data);
                            });
                        });
                    };
                },
                templateUrl: 'app/components/directives/user/profilData/profilData.html'
            };
        });
}());