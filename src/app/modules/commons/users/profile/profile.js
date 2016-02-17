(function () {
    'use strict';
    /**
     * user profile
     *
     * @author Xavier MARIN
     * @class qaobee.user.profile
     * @copyright <b>QaoBee</b>.
     */
    angular.module('qaobee.user.profile', [
            'profileRestAPI',
            'userRestAPI',
            'structureCfgRestAPI',
            'locationAPI',
            'qaobee.eventbus',
            'ngAutocomplete',
            'ngPasswordStrength'])

        .config(function ($routeProvider, metaDatasProvider) {
            $routeProvider.when('/private/profil', {
                controller: 'ProfileCtrl',
                resolve: {
                    user: metaDatasProvider.checkUser,
                    meta: metaDatasProvider.getMeta
                },
                templateUrl: 'app/modules/commons/users/profile/profil.html'
            });
        })
        /**
         * @class qaobee.user.profile.ProfileCtrl
         * @description Main controller of app/modules/commons/users/profile/profil.html
         */
        .controller('ProfileCtrl', function ($scope, $timeout, qeventbus, profileRestAPI, userRestAPI, $filter, structureCfgRestAPI, EnvironmentConfig, $translatePartialLoader, $translate, $rootScope, $location, $window, locationAPI, $log, user, meta) {
            $translatePartialLoader.addPart('profile');
            $translatePartialLoader.addPart('commons');
            $translatePartialLoader.addPart('user');
            
            $scope.user = user;
            $scope.renew = {};
        
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
            $scope.$on('$destroy', function () {
                delete $scope.user;
                delete $scope.renew;
                //delete $scope.pdfUrl;
                //delete $scope.billPdfUrl;
                delete $scope.dateOption;
            });
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
                if (angular.isDefined(updUser.address.formatedAddress) && updUser.address.formatedAddress !== '') {
                    locationAPI.get(updUser.address.formatedAddress).then(function (adr) {
                            updUser.address.lat = adr.data.results[0].geometry.location.lat;
                            updUser.address.lng = adr.data.results[0].geometry.location.lng;
                            // parsing infos
                            angular.forEach(adr.data.results[0].address_components, function (item) {
                                if (item.types.count('street_number') > 0) {
                                    updUser.address.place = item.long_name + ' ';
                                }
                                if (item.types.count('route') > 0) {
                                    updUser.address.place += item.long_name;
                                }
                                if (item.types.count('locality') > 0) {
                                    updUser.address.city = item.long_name;
                                }
                                if (item.types.count('postal_code') > 0) {
                                    updUser.address.zipcode = item.long_name;
                                }
                                if (item.types.count('country') > 0) {
                                    updUser.address.country = item.long_name;
                                }
                            });

                            profileRestAPI.update(updUser).success(function (data) {
                                toastr.success(data.firstname + ' ' + data.name + $filter('translate')('popup.success.updated'));
                                qeventbus.prepForBroadcast('refreshUser', data);
                            });
                        }
                    );
                } else {
                    profileRestAPI.update(updUser).success(function (data) {
                        toastr.success(data.firstname + ' ' + data.name + $filter('translate')('popup.success.updated'));
                        qeventbus.prepForBroadcast('refreshUser', data);
                    });
                }

            };
        
            $scope.resetPasswd = function() {
                $scope.renew.id = user._id;
                $scope.renew.code = user.account.activationCode;

                if($scope.renew.passwd !== $scope.renew.passwdConfirm) {
                    toastr.warning($filter('translate')('profile.message.passwd.different'));
                    $window.Recaptcha.reload();
                    $scope.renew = {};
                    return;
                }
                userRestAPI.resetPasswd($scope.renew).success(function () {
                    $window.Recaptcha.reload();
                    toastr.success($filter('translate')('profile.message.updPasswd.success'));
                }).error(function (error) {
                    $window.Recaptcha.reload();
                    if (error) {
                        if (error.code && error.code === 'CAPTCHA_EXCEPTION') {
                            toastr.error($filter('translate')('popup.error.' + error.code));
                        } else {
                            toastr.error(error.message);
                        }
                        $scope.renew = {};
                    }
                });
            }
            
            $scope.resetPwdUser = function (pwdForm) {
                $scope.renew = {};
            }
                
        });
}());