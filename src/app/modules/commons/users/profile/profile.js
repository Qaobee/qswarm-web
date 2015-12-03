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
        .controller('ProfileCtrl', function ($scope, qeventbus, profileRestAPI, userRestAPI, $filter, structureCfgRestAPI, $translatePartialLoader, $translate, $rootScope, $location, $window, locationAPI, $log, user, meta) {
            $translatePartialLoader.addPart('profile');
            $translatePartialLoader.addPart('commons');
            $translatePartialLoader.addPart('effective');
            $scope.season = meta.season;
            $scope.activity = meta.activity;
            $scope.structure = meta.structure;
            $scope.user = user;
            $scope.birthdate = new Date(user.birthdate);
            $scope.pdfUrl = '/rest/prive/profile/pdf?token=' + $window.sessionStorage.qaobeesession;
            $scope.billPdfUrl = '/rest/prive/profile/billpdf?token=' + $window.sessionStorage.qaobeesession;
            $rootScope.$on('$translateChangeSuccess', function () {
                $translate(['commons.format.date.today',
                    'commons.format.date.clear',
                    'commons.format.date.close',
                    'commons.format.date.label',
                    'commons.format.date.listMonth',
                    'commons.format.date.listMonthShort',
                    'commons.format.date.listWeekdaysFull',
                    'commons.format.date.listWeekdaysLetter'
                ]).then(function (translations) {
                    $scope.today = translations['commons.format.date.today'];
                    $scope.clear = translations['commons.format.date.clear'];
                    $scope.close = translations['commons.format.date.close'];
                    $scope.format = translations['commons.format.date.label'];
                    $scope.month = translations['commons.format.date.listMonth'].split(',');
                    $scope.monthShort = translations['commons.format.date.listMonthShort'].split(',');
                    $scope.weekdaysFull = translations['commons.format.date.listWeekdaysFull'].split(',');
                    $scope.weekdaysLetter = translations['commons.format.date.listWeekdaysLetter'].split(',');
                });
            });
            $scope.optionsAdr = null;
            $scope.detailsAdr = '';
            $scope.$on('$destroy', function () {
                delete $scope.user;
                delete $scope.pdfUrl;
                delete $scope.billPdfUrl;
                delete $scope.dateOption;
                delete $scope.birthdate;
            });
            /**
             * @name $scope.updateUser
             * @function
             * @param profileForm
             *            the form
             * @memberOf qaobee.prive.profile.ProfileCtrl
             * @description update the current user
             */
            $scope.updateUser = function (profileForm) {
                if (profileForm.$valid) {
                    var updUser = {};
                    angular.copy($scope.user, updUser);
                    updUser.birthdate = moment($scope.birthdate).valueOf();
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
                                updUser.birthdate = $scope.dateOption.val;
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

                }
            };
        });
}());