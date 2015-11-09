(function () {
    'use strict';

    angular.module('qaobee.user', [
        /* angular qaobee */
        'ngAutocomplete',

        /* qaobee modules */
        
        /* services */
        'locationAPI',

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

        .controller('SignupCtrl', function ($rootScope, $scope, $translatePartialLoader, $log, $routeParams, $window, $location, $filter, WizardHandler, activityRestAPI, structureRestAPI, signupRestAPI, locationAPI) {
            $translatePartialLoader.addPart('user');
            $translatePartialLoader.addPart('commons');

            $scope.isStructureCityChanged = false;
            $scope.isStructureReload = false;
            
            $scope.structure = {};
            $scope.newStructure = {};
            $scope.newStructure.address = {};
            
            $scope.temp = {};
            $scope.temp.detailsCountry = {};
            $scope.temp.createStructure = false;
            
            $scope.valuesStructures = [{
            	'_id': -1, 
            	label: $filter('translate')('structureSection.list.empty'), 
            	address: ''}];
            
            signupRestAPI.firstConnectionCheck($routeParams.id, $routeParams.code).success(function (data) {
                if (true === data.error) {
                    $rootScope.messageErreur = data.message;
                    $location.path('/signup/error');
                } else {
                    $scope.signup = data;
                    $scope.signup.birthdate = new Date($scope.signup.birthdate);
                    
                    // Déclaration du user en mode connecté
                    $window.sessionStorage.qaobeesession = data.account.token;
                    $rootScope.user = data;
                    $scope.user = data;
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
                
                if($scope.temp.detailsCountry === null || $scope.temp.detailsCountry === '') {
                	if(!angular.isUndefined($scope.signup.nationality) && $scope.signup.nationality !== null) {
                		$scope.signup.nationality.alpha2 = null;
                	}
                } else {
                	angular.forEach($scope.temp.detailsCountry.address_components, function (item) {
                        if (item.types.count('country') > 0) {
                        	$scope.signup.nationality.alpha2 = item.short_name;
                        }
                    });
                }

                if (validateOk) {
                	$scope.signup.birthdate = Date.parse($scope.signup.birthdate);
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
            // options pour nationalité
            $scope.optionsCountry = {
                types: 'geocode'
            };
            $scope.detailsCountry = '';

            // options pour ville structure
            $scope.optionsStructureCity = {
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
                    $scope.temp.zipcode = '';
                }
            };

            // Update structure list
            $scope.loadStructures = function () {
                if ($scope.isStructureReload) {
                    $scope.isStructureReload = false;
                    
                    // Recherche en cours...
                    $scope.valuesStructures = [{
                        _id: -1,
                        label: $filter('translate')('structureSection.list.inProgress'),
                        address: ''
                    }];
                    
                    // Recherche des infos complémentaires de la ville à partir des coordonnées Lat/Lng
                    var cityLocation = $scope.signup.detailsStructureCity.geometry.location;
                    locationAPI.getLatLng(cityLocation.lat(), cityLocation.lng()).then(function (adr) {
                    	var address = {};
                    	angular.forEach(adr.data.results[0].address_components, function (item) {
                    		if (item.types.count('postal_code') > 0) {
                    			address.zipcode = item.long_name;
                    			$scope.temp.zipcode = address.zipcode;
                    		}
                    		if (item.types.count('country') > 0) {
                    			address.countryAlpha2 = item.short_name;
                    			$scope.temp.countryAlpha2 = address.countryAlpha2;
                    			address.country = item.long_name;
                    			$scope.temp.country = address.country;
                    		}
                    		if (item.types.count('locality') > 0) {
                    			address.city = item.long_name;
                    			$scope.temp.city = address.city;
                    		}
                    	});
                    	
                    	// Recherche des structures
                    	structureRestAPI.getList($scope.signup.account.listPlan[0].activity._id, address).success(function (data) {
                            $scope.valuesStructures = [];
                            $scope.structure2 = "";
                            $scope.temp.s = {};
                            if (data.status === false) {
                                $scope.valuesStructures = [{
                                    _id: -2,
                                    label: $filter('translate')('structureSection.list.empty'),
                                    address: ''
                                }];
                            } else {
                                if (data.length > 0) {
                                    $scope.structuresResult = data;
                                    var dataSort = data.sortBy(function(o) {
                                    	return o.label;
                                    }) ;
                                    dataSort.forEach(function(i) {
                                        $scope.valuesStructures.push({
                                            _id: i._id,
                                            label: i.label,
                                            address: ' (' +i.address.place + ' - ' + i.address.zipcode + ' ' + i.address.city + ')'
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
                            $scope.valuesStructures.push({
                                _id: 'new',
                                label: '-- ' + $filter('translate')('structureSection.list.create'),
                                address: ''
                            });
                        });
                    	
                    });
                    
                }
            };

            // Puts structure selected in a hidden input 
            $scope.applyChangeStructure = function () {
                $scope.structure.referencialId = $window.document.getElementById('userStructureSelect').value;
                
                if($scope.structure.referencialId==='new') {
                	$scope.temp.createStructure = true;
                	$scope.newStructure.label = '';
                	$scope.newStructure.address.place = '';
                	$scope.newStructure.address.zipcode = $scope.temp.zipcode;
                	$scope.newStructure.address.city = $scope.temp.city;
                	$scope.newStructure.country = {};
                	$scope.newStructure.country.label = $scope.temp.country;
                	$scope.newStructure.country.alpha2 = $scope.temp.countryAlpha2;
                } else {
                	$scope.temp.createStructure = false;
	                if(!angular.isUndefined($scope.structuresResult)) {
		                $scope.structuresResult.forEach(function(item) {
		                	if(item._id===$scope.structure.referencialId) {
		                		$scope.temp.structure = {}
		                		$scope.temp.structure._id = item._id;
		                		$scope.temp.structure.label = item.label;
		                		$scope.temp.structure.address = {};
		                		$scope.temp.structure.address.place = item.address.place;
		                		$scope.temp.structure.address.zipcode = item.address.zipcode;
		                		$scope.temp.structure.address.city = item.address.city;
		                	}
		                });
	                }
                }
            };

            /* Validate structureSection */
            $scope.validateStructureSection = function () {
                var validateOk = true;

                if (angular.isUndefined($scope.structure2) || $scope.structure2 < 0) {
                    toastr.warning($filter('translate')('structureSection.ph.structureMandatory'));
                    validateOk = false;
                }

                if ($scope.temp.createStructure) {
                	if(angular.isUndefined($scope.newStructure.label) || $scope.newStructure.label===null || $scope.newStructure.label==='') {
                		toastr.warning('label vide');
                        validateOk = false;
                	}
                	if(angular.isUndefined($scope.newStructure.address.place) || $scope.newStructure.address.place===null || $scope.newStructure.address.place==='') {
                		toastr.warning('place vide');
                        validateOk = false;
                	}
                }
                
                if (validateOk) {
            		$scope.structure = $scope.temp.createStructure ? $scope.newStructure : $scope.temp.structure;
                    WizardHandler.wizard().next();
                }
            };

            /* Creates sandbox */
            $scope.createSandBox = function () {
                var user = $scope.signup;
                delete(user.detailsStructureCity);

                signupRestAPI.finalizeSignup(user, $routeParams.code, $scope.structure, $scope.signup.account.listPlan[0].activity._id).success(function (data) {
                    if (false === data.status) {
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

