(function () {
    'use strict';

    angular.module('qaobee.user.signup.structure', [
        /* qaobee modules */
        'personSRV',
        /* services */
        'locationAPI',
        /* qaobee Rest API */
        'structureRestAPI',
        'signupRestAPI',
        'userRestAPI'
    ])
        .value('mobileLinks', {android: 'intent://qaobee/signup/#Intent;scheme=qaobee;package=com.qaobee.hand;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.qaobee.hand;end'})

        .config(function ($routeProvider) {
            $routeProvider.when('/signup/club/structure', {
                controller: 'SignupStructureCtrl',
                templateUrl: 'app/modules/commons/users/signup/signupStructure.html'
            });
        })


        .controller('SignupStructureCtrl', function ($rootScope, $scope, $translatePartialLoader, $window, $location,
                                                     $translate, vcRecaptchaService, structureRestAPI, signupRestAPI,
                                                     locationAPI, personSrv, qeventbus) {
            $translatePartialLoader.addPart('user').addPart('commons');
            if (angular.isUndefined($window.sessionStorage.signup)) {
                $location.path('/signup/club');
            } else {
                $scope.signup = JSON.parse($window.sessionStorage.signup);
                console.log($scope.signup)
            }
            qeventbus.prepForBroadcast('menuItem', 'signup');
            $scope.vm = {};
            $scope.creatClub = false;
            /* init ngAutocomplete*/
            $scope.options = {};
            $scope.options.watchEnter = true;
            /// options pour ville structure
            $scope.optionsSearchCity = {
                types: '(cities)'
            };
            $scope.detailsSearchCity = '';
            // options pour ville nouvelle structure
            $scope.optionsCreateCity = {
                types: 'geocode'
            };
            $scope.detailsCreateCity = '';
            $scope.detailsAdr = '';

            $scope.initForm = function () {
                $scope.listStructures = [];
                $scope.structure = {
                    address: {}
                };
                $scope.detailsSearchCity = '';
                $scope.detailsCreateCity = '';
            };
            $scope.initForm();
            // Surveillance de la modification du retour de l'API Google sur l'adresse
            $scope.$watch('detailsSearchCity', function (newValue, oldValue) {
                if (angular.isDefined(newValue) && !angular.equals(newValue, oldValue)) {
                    if (angular.isUndefined(newValue) || newValue === '' || angular.equals({}, newValue)) {
                        return;
                    }
                    //place_changed
                    $scope.loadStructures();
                }
            });

            // Surveillance de la modification du retour de l'API Google sur l'adresse du club
            $scope.$watch('detailsCreateCity', function (newValue, oldValue) {
                if (angular.isDefined(newValue) && !angular.equals(newValue, oldValue)) {
                    if (angular.isUndefined(newValue) || newValue === '' || angular.equals({}, newValue)) {
                        return;
                    }
                    personSrv.formatAddress(newValue).then(function (adr) {
                        $scope.structure.address = adr;
                        angular.forEach(newValue.address_components, function (item) {
                            if (item.types.count('country') > 0) {
                                $scope.structure.address.country = {};
                                $scope.structure.address.country.label = item.long_name;
                                $scope.structure.address.country.alpha2 = item.short_name;

                                $scope.loadCategories();
                                $scope.catAgeSelectOK = true;
                            }
                        });
                    });
                }
            });
            // Update structure list
            $scope.loadStructures = function () {
                $scope.structureSearch = true;
                $scope.structure.address = {};
                var cityLocation = $scope.detailsSearchCity.geometry.location;
                locationAPI.getLatLng(cityLocation.lat(), cityLocation.lng()).then(function (adr) {
                    angular.forEach(adr.data.results[0].address_components, function (item) {
                        if (item.types.count('postal_code') > 0) {
                            $scope.structure.address.zipcode = item.long_name;
                        }
                        if (item.types.count('country') > 0) {
                            $scope.structure.address.country = {};
                            $scope.structure.address.countryAlpha2 = item.short_name;
                            $scope.structure.address.country.label = item.long_name;
                            $scope.structure.address.country.alpha2 = item.short_name;
                        }
                        if (item.types.count('locality') > 0) {
                            $scope.structure.address.city = item.long_name;
                        }
                    });
                    // Recherche des structures
                    structureRestAPI.getList($scope.signup.plan.activity._id, $scope.structure.address).success(function (data) {
                        $scope.listStructures = [];

                        if (data.status === false) {
                            $scope.messageErreur = $filter('translate')('signupEndPage.tabFindClub.list.empty');
                            $scope.listStructures = [];
                        } else {
                            if (data.length > 0) {
                                $scope.structuresResult = data;
                                var dataSort = data.sortBy(function (o) {
                                    return o.label;
                                });
                                dataSort.forEach(function (i) {
                                    $scope.listStructures.push({
                                        _id: i._id,
                                        label: i.label,
                                        address: i.address
                                    });
                                });
                                $scope.messageErreur = '';
                            } else {
                                $scope.messageErreur = $translate.instant('signupEndPage.tabFindClub.list.empty');
                                $scope.listStructures = [];
                            }
                        }
                        $scope.structureSearch = false;
                        $scope.structureSelectOK = true;
                    }).error(function () {
                        $scope.structureSearch = false;
                    });
                });

            };

            $scope.applyChangeStructure = function () {
                if (angular.isDefined($scope.listStructures)) {
                    $scope.listStructures.forEach(function (item) {
                        if (item._id === $scope.vm.selectedStructure) {
                            $scope.catAgeSelectOK = true;
                            $scope.structure = item;
                        }
                    });
                }
            };

            // resert forms
            $scope.resertForm = function () {
                $scope.creatClub = !$scope.creatClub;
                $scope.initForm();
            };

            // validate fincClubForm
            $scope.validateFindClubForm = function () {
                $scope.createSandBox();
            };

            /* Validate structureSection */
            $scope.createStructure = function () {
                if ($scope.structure.label.length > 2) {
                    $scope.createSandBox();
                } else {
                    var erreur = $filter('translate')('signupEndPage.tabCreateClub.messageControl.labelControl');
                    toastr.error(erreur);
                }
            };

            /**
             * Creates sandbox
             */
            $scope.createSandBox = function () {
                signupRestAPI.registerUserMulti($scope.signup, $scope.structure).success(function (data) {
                    if (false === data.status) {
                        if (data.message) {
                            toastr.error(data.message);
                        }
                    } else {
                        delete $scope.signup;
                        $window.location.href = '/#/signup/done';
                    }
                }).error(function (data) {
                    $rootScope.messageErreur = data.message;
                    toastr.error(data.message);
                    $window.location.href = '/#/signup/error';
                });
            };

            $scope.openCancelModal = function () {
                angular.element('#modalCancel').modal('open');
            };

            $scope.closeCancelModal = function () {
                angular.element('#modalCancel').modal('close');
            };

            $scope.cancelSignup = function () {
                angular.element('#modalCancel').modal('close');
                delete($scope.signup);
                toastr.info('A bientôt !');
                $location.path('/');
            };

            angular.element(document).ready(function () {
                angular.element('#modalCancel').modal();
            });
            $scope.widgetId = null;
            $scope.setWidgetId = function (widgetId) {
                console.info('Created widget ID: %s', widgetId);
                if (!!vcRecaptchaService && vcRecaptchaService.reset) {
                    vcRecaptchaService.reset();
                }
                $scope.widgetId = widgetId;
            };
            $scope.cbExpiration = function () {
                console.info('Captcha expired. Resetting response object');
                vcRecaptchaService.reload($scope.widgetId);
                $scope.response = null;
            };
        })
}());

