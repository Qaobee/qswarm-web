(function () {
    'use strict';

    angular.module('qaobee.user', [
        /* angular qaobee */
        'ngAutocomplete',

        /* qaobee modules */

        /* qaobee Rest API */
        'activityRestAPI',
        'structureRestAPI',
        'signupRestAPI'
    ])


        .config(function ($routeProvider) {
            $routeProvider.when('/signup/end', {
                controller: 'SignupEndCtrl',
                templateUrl: 'app/modules/commons/users/signup/signupDone.html'
            }).when('/signup/cancel', {
                controller: 'SignupCancelCtrl',
                templateUrl: 'app/modules/commons/users/signup/signupCancel.html'
            }).when('/signup/error', {
                controller: 'SignupErrorCtrl',
                templateUrl: 'app/modules/commons/users/signup/signupError.html'
            }).when('/signup/:id/:code?', {
                controller: 'SignupCtrl',
                templateUrl: 'app/modules/commons/users/signup/signup.html'
            });
        })

        .controller('SignupCtrl', function ($rootScope, $scope, $translatePartialLoader, $log, $routeParams, $window, $location, $filter, WizardHandler, activityRestAPI, structureRestAPI, signupRestAPI) {
            $translatePartialLoader.addPart('user');
            $translatePartialLoader.addPart('commons');

            $scope.isStructureCityChanged = false;
            $scope.isStructureReload = false;
            $scope.valuesStructures = [{'_id': -1, label: 'Aucune donnée trouvée', address: ''}];
            signupRestAPI.firstConnectionCheck($routeParams.id, $routeParams.code).success(function (data) {
                if (true === data.error) {
                    $rootScope.messageErreur = data.message;
                    $location.path('/signup/error');
                } else {
                    $scope.signup = data;
                    $log.debug(data);
                    $scope.signup.birthdate = new Date($scope.signup.birthdate);
                }
            }).error(function (error) {
                if (error != null) {
                    $rootScope.messageErreur = error.message;
                } else {
                    $rootScope.messageErreur = $filter('translate')('errorPage.ph.unknown');
                }
                $location.path('/signup/error');
            });


            $scope.activities = Array.create();

            activityRestAPI.getListActive().success(function (data) {
                $scope.activities = data.sortBy(function (n) {
                    return n.label;
                });
            });

            /* Validate userCivilSection */
            $scope.validateUserCivilSection = function () {
                var validateOk = true;
                if ($scope.signup.gender === null) {
                    toastr.warning($filter('translate')('civilSection.ph.genderMandatory'));
                    validateOk = false;
                }
                if ($scope.signup.birthdate === null || $scope.signup.birthdate === 0) {
                    toastr.warning($filter('translate')('civilSection.ph.birthdateMandatory'));
                    validateOk = false;
                }
                if (($scope.signup.contact.home === null || $scope.signup.contact.home === '') &&
                    ($scope.signup.contact.office === null || $scope.signup.contact.office === '') &&
                    ($scope.signup.contact.cellphone === null || $scope.signup.contact.cellphone === '')) {
                    toastr.warning($filter('translate')('civilSection.ph.phoneNumberMandatory'));
                    validateOk = false;
                }

                if (validateOk) {
                    WizardHandler.wizard().next();
                }
            };

            /* Validate sportSection */
            $scope.validateSportSection = function () {
                var validateOk = true;
                if (angular.isUndefined($scope.signup.account.listPlan[0].activity._id) || $scope.signup.account.listPlan[0].activity._id === null) {
                    toastr.warning($filter('translate')('sportSection.ph.sportMandatory'));
                    validateOk = false;
                }
                if (validateOk) {
                    WizardHandler.wizard().next();
                }
            };

            /* init ngAutocomplete*/
            $scope.options = {};
            $scope.options.watchEnter = false;
            $scope.optionsCountry = {
                types: 'geocode'
            };
            $scope.detailsCountry = '';

            $scope.optionsCity = {
                types: '(cities)'
            };
            $scope.detailsCity = '';

            $scope.optionsAdr = null;
            $scope.detailsAdr = '';

            // User changes the city name
            $scope.changeCityName = function () {
                $scope.isStructureCityChanged = true
            };

            // User blurs city name input
            $scope.resetStructure = function () {
                if ($scope.isStructureCityChanged) {
                    $scope.valuesStructures = [{
                        _id: -1,
                        label: $filter('translate')('structureSection.list.empty'),
                        address: ''
                    }];
                    $scope.isStructureCityChanged = false;
                    $scope.isStructureReload = true;
                }
            };

            // Update structure list
            $scope.loadStructures = function () {
                if ($scope.isStructureReload) {
                    $scope.isStructureReload = false;

                    var addressCity = $scope.signup.detailsStructureCity.name;

                    $scope.valuesStructures = [{
                        _id: -1,
                        label: $filter('translate')('structureSection.list.inProgress'),
                        address: ''
                    }];

                    structureRestAPI.getList($scope.signup.account.listPlan[0].activity._id, 'CNTR-250-FR-FRA', addressCity).success(function (data) {
                        $scope.valuesStructures = [];
                        $scope.structure2 = "";
                        if (data.status === false) {
                            $scope.valuesStructures = [{
                                _id: -2,
                                label: $filter('translate')('structureSection.list.empty'),
                                address: ''
                            }];
                        } else {
                            if (data.length > 0) {
                                $scope.structuresResult = data;
                                $log.debug(data);
                                data.forEach(function(i) {
                                    $scope.valuesStructures.push({
                                        _id: i._id,
                                        label: i.label,
                                        address: ' (' +i.address.place + ')'
                                    });
                                });
                            } else {
                                $scope.valuesStructures = [{
                                    _id: -3,
                                    label: $filter('translate')('structureSection.list.empty'),
                                    address: ''
                                }];
                            }
                        }
                    });
                }
            };

            // Puts structure selected in a hidden input 
            $scope.applyChangeStructure = function () {
                if (angular.isUndefined($scope.structure)) {
                    $scope.structure = {};
                }
                $scope.structure.referencialId = $window.document.getElementById('userStructureSelect').value;
            };

            /* Validate structureSection */
            $scope.validateStructureSection = function () {
                var validateOk = true;

                if (angular.isUndefined($scope.structure2) || $scope.structure2 < 0) {
                    toastr.warning($filter('translate')('structureSection.ph.structureMandatory'));
                    validateOk = false;
                }

                if (validateOk) {
                    WizardHandler.wizard().next();
                }
            };

            /* Creates sandbox */
            $scope.createSandBox = function () {
                $log.debug($scope.signup);
                $log.debug($scope.structure);
                $log.debug($scope.signup.activity);
                var user = $scope.signup;
                delete(user.detailsStructureCity);

                signupRestAPI.finalizeSignup(user, $routeParams.code, $scope.structure, $scope.signup.activity).success(function (data) {
                    if (false === data.status) {
                        $log.debug(data);
                        toastr.error('Pb');
                    } else {
                        $window.location.href = '/#/signup/end';
                    }
                }).error(function (data) {
                    $scope.messageErreur = data.message;
                    $window.location.href = '/#/signup/error';
                });
            };

            $scope.openCancelModal = function () {
                $('#modalCancel').openModal();
            };

            $scope.closeCancelModal = function () {
                $('#modalCancel').closeModal();
            };

            $scope.cancelSignup = function () {
                $('#modalCancel').closeModal();
                delete($scope.signup);
                toastr.info('A bientôt !');
                $location.path('/');
            }

        })

        .controller('SignupEndCtrl', function ($scope, $translatePartialLoader, $location) {
            $translatePartialLoader.addPart('user');

            $scope.goHome = function () {
                $location.path('/');
            };
        })

        .controller('SignupCancelCtrl', function ($scope, $translatePartialLoader, $log) {
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

