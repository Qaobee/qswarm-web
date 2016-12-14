(function () {
    'use strict';

    angular.module('qaobee.user.signup.end', [
        /* qaobee modules */
        'personSRV',
        /* services */
        'locationAPI',
        /* qaobee Rest API */
        'activityRestAPI',
        'activityCfgRestAPI',
        'countryRestAPI',
        'structureRestAPI',
        'signupRestAPI',
        'userRestAPI'
    ])

        .config(function ($routeProvider) {
            $routeProvider.when('/signup/end/:id/:code?', {
                controller: 'SignupEndCtrl',
                templateUrl: 'app/modules/commons/users/signup/signupEndDone.html'
            }).when('/signupStartDone', {
                controller: 'SignupStartDoneCtrl',
                templateUrl: 'app/modules/commons/users/signup/signupStartDone.html'
            }).when('/signup/cancel', {
                controller: 'SignupCancelCtrl',
                templateUrl: 'app/modules/commons/users/signup/signupEndCancel.html'
            }).when('/signup/error', {
                controller: 'SignupErrorCtrl',
                templateUrl: 'app/modules/commons/users/signup/signupEndError.html'
            }).when('/signup/:id/:code?', {
                controller: 'SignupCtrl',
                templateUrl: 'app/modules/commons/users/signup/signupEnd.html'
            });
        })

        .controller('SignupCtrl', function ($rootScope, $scope, $translatePartialLoader, $log,
                                            $routeParams, $window, $location, $filter,
                                            activityRestAPI, activityCfgRestAPI, countryRestAPI, structureRestAPI,
                                            signupRestAPI, locationAPI, personSrv) {
            $translatePartialLoader.addPart('user');
            $translatePartialLoader.addPart('commons');
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
            $scope.optionsAdr = null;
            $scope.detailsAdr = '';

            $scope.initForm = function () {
                $scope.listStructures = [];
                $scope.structure = {
                    address : {}
                };
                $scope.detailsSearchCity = '';
                $scope.detailsCreateCity = '';
                $scope.creationFinished = false;
            };
            $scope.initForm();

            $scope.checkUser = function () {
                if (angular.isDefined($rootScope.user)
                    && $routeParams.id === $rootScope.user._id
                    && $routeParams.code === $rootScope.user.account.activationCode
                    && $rootScope.user.account.active === false) {
                    $scope.user = $rootScope.user;

                    $scope.user.account.listPlan[0].activity = {};
                    $scope.user.account.listPlan[0].activity._id = 'ACT-HAND';

                    // Déclaration du user en mode connecté
                    $window.sessionStorage.qaobeesession = $scope.user.account.token;

                } else {
                    $rootScope.messageErreur = $filter('translate')('errorPage.ph.unknown');
                    $location.path('/signup/error');
                }
            };
            $scope.checkUser();

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

            // Recherche du pays et liste des category age
            $scope.loadCategories = function () {
                countryRestAPI.getAlpha2($scope.structure.address.country.alpha2).success(function (data) {
                    $scope.structure.country = data;
                    activityCfgRestAPI.getParamFieldList(moment().valueOf(), $scope.user.account.listPlan[0].activity._id, data._id, 'listCategoryAge').success(function (data2) {
                        $scope.categoryAgeResult = data2;
                        $scope.valuesCategoryAge = [];

                        var dataSort = data2.sortBy(function (o) {
                            return -1 * o.order;
                        });

                        dataSort.forEach(function (i) {
                            var tempAge;
                            if (i.ageMax > 80) {
                                tempAge = i.ageMin + '+';
                            } else if (i.ageMin === i.ageMax) {
                                tempAge = i.ageMin;
                            } else {
                                tempAge = i.ageMin + '/' + i.ageMax;
                            }

                            $scope.valuesCategoryAge.push({
                                _id: i.code,
                                label: i.label + ' (' + tempAge + ')'
                            });
                        });
                        delete $scope.categoryAge;
                    });
                });
            };

            // Update structure list
            $scope.loadStructures = function () {

                // Recherche en cours...
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
                    $scope.loadCategories();

                    // Recherche des structures
                    structureRestAPI.getList($scope.user.account.listPlan[0].activity._id, $scope.structure.address).success(function (data) {
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
                                $scope.messageErreur = $filter('translate')('signupEndPage.tabFindClub.list.empty');
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

            /* Creates sandbox */
            $scope.createSandBox = function () {
                // Récupération CategoryAge
                var catAge = {};
                if (!angular.isUndefined($scope.categoryAgeResult)) {
                    catAge = $scope.categoryAgeResult.filter(function (item) {
                        return item.code === $scope.categoryAge._id;
                    })[0];
                }
                // Ouverture Modal creation compte
                $scope.openModalCreate();
                signupRestAPI.finalizeSignup($scope.user, $routeParams.code, $scope.structure, $scope.user.account.listPlan[0].activity._id, catAge).success(function (data) {
                    if (false === data.status) {
                        toastr.error('Pb');
                    } else {
                        $scope.creationFinished = true;
                        delete $rootScope.user;
                        delete $rootScope.meta;
                        delete $scope.user;
                    }
                }).error(function (data) {
                    angular.element('#modalCreate').modal('close');
                    $scope.messageErreur = data.message;
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

            /* Carrousel option */
            $scope.owlOptions = {
                items: 1,
                loop: false,
                mouseDrag: false,
                touchDrag: false,
                pullDrag: false,
                freeDrag: false,
                dots: false,
                autoplay: true,
                autoplaySpeed: 1500,
                autoplayTimeout: 1500,
                animateIn: 'rotateInDownLeft',
                animateOut: 'rotateOutDownLeft',
                onTranslated: nextStep
            };

            $scope.openModalCreate = function () {
                angular.element('#modalCreate').modal('open');
                angular.element('.owl-carousel').owlCarousel($scope.owlOptions);
            };

            function nextStep(event) {
                if (event.item.count === event.item.index + 1) {
                    while (!$scope.creationFinished) {
                        // Attente fin de la création en base Mongo
                    }
                    angular.element('#modalCreate').modal('close');
                    $window.location.href = '/#/signupStartDone';
                }
            }

            angular.element(document).ready(function () {
                angular.element('#modalCreate').modal({dismissible: false});
                angular.element('#modalCancel').modal();
            });

        })


        .controller('SignupStartDoneCtrl', function ($rootScope, $scope, $log, $translatePartialLoader, $window, $location, EnvironmentConfig) {
            $translatePartialLoader.addPart('user');
            $scope.url = EnvironmentConfig.appMobile;
            $scope.goHome = function () {
                delete($rootScope.user);
                $location.path('/');
            };
        })

        .controller('SignupEndCtrl', function ($rootScope, $scope, $window, $routeParams, $log, $translatePartialLoader, $location, EnvironmentConfig, signupRestAPI, qeventbus) {
            $translatePartialLoader.addPart('user');
            // Verification user signup
            signupRestAPI.firstConnectionCheck($routeParams.id, $routeParams.code).success(function (data) {
                if (data === null) {
                    $rootScope.messageErreur = '';
                    $location.path('/signup/error');
                } else if (true === data.error) {
                    $rootScope.messageErreur = data.message;
                    $location.path('/signup/error');
                } else {
                    $rootScope.user = data;
                    $scope.user = data;
                    $log.debug('user', data);

                    $scope.user.account.listPlan[0].activity = {};
                    $scope.user.account.listPlan[0].activity._id = 'ACT-HAND';

                    // Déclaration du user en mode connecté
                    $window.sessionStorage.qaobeesession = data.account.token;

                    $rootScope.notLogged = false;
                    qeventbus.prepForBroadcast('login', data);

                }
            }).error(function (error) {
                if (error != null) {
                    $rootScope.messageErreur = error.message;
                } else {
                    $rootScope.messageErreur = $filter('translate')('errorPage.ph.unknown');
                }
                $location.path('/signup/error');
            });

        })

        .controller('SignupCancelCtrl', function () {
        })

        .controller('SignupErrorCtrl', function ($rootScope, $scope, $location, $translatePartialLoader, $log, $filter) {
            $translatePartialLoader.addPart('user');

            $scope.message = $rootScope.messageErreur;
            if (angular.isUndefined($rootScope.messageErreur) || $scope.message === null || "" === $scope.message) {
                $scope.message = $filter('translate')('errorPage.ph.noMessage');
            }
            delete $rootScope.messageErreur;

            $scope.goHome = function () {
                $location.path('/');
            };
        });

}());

