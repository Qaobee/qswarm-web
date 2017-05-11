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
                    address: {}
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
            function mobileAndTabletcheck() {
                var check = false;
                (function (a) {
                    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
                })(navigator.userAgent || navigator.vendor || window.opera);
                return check;
            };
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
                    if (mobileAndTabletcheck()) {
                        $window.location.href = 'qaobee://qaobee/signup/end/#Intent;scheme=qaobee;package=com.qaobee.hand;end';
                    } else {
                        qeventbus.prepForBroadcast('login', data);
                    }
                }
            }).error(function (error) {
                if (error !== null) {
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

