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
                                                  $translate, $rootScope, $log, personSrv, profileRestAPI) {
            $translatePartialLoader.addPart('profile');
            $translatePartialLoader.addPart('user');
            $translatePartialLoader.addPart('commons');

            // return button
            /**
             * Do the back
             */
            $scope.doTheBack = function () {
                $window.history.back();
            };
            $scope.dateOptions = {
                minDate: -1000,
                maxDate: "+1M +10D"
            };


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
                if (angular.isUndefined(newValue) || newValue === '' || angular.equals({}, newValue) || newValue === null || newValue.length === 1) {
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
                updUser.birthdate = moment($scope.user.birthdate, 'DD/MM/YYYY').valueOf();
                delete updUser.isAdmin;

                if ($scope.temp.addr !== '' && angular.equals({}, $scope.user.address)) {
                    toastr.error("Adresse inconnue");
                    return;
                }

                profileRestAPI.update(updUser).success(function (data) {
                    $translate('profile.popup.update.success').then(function (mess) {
                        toastr.success(mess, data.firstname + ' ' + data.name);
                        $scope.doTheBack();
                    });
                });
            };
        });
}());