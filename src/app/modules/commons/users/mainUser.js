(function () {
    'use strict';

    angular.module('qaobee.user', [
        /* angular qaobee */
        'ngAutocomplete',
       
        /* qaobee modules */
        'qaobee.user.profile',
        /* services */
        'locationAPI',

        /* qaobee Rest API */
        'activityRestAPI',
        'activityCfgRestAPI',
        'countryRestAPI',
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
        
        .controller('SignupCtrl', function ($rootScope, $scope, $timeout, $translatePartialLoader, $log, $routeParams, $window, $location, $filter, WizardHandler, activityRestAPI, activityCfgRestAPI, countryRestAPI, structureRestAPI, signupRestAPI, locationAPI) {
            $translatePartialLoader.addPart('user');
            $translatePartialLoader.addPart('commons');

            $scope.isStructureCityChanged = false;
            $scope.isStructureReload = false;
            
            $scope.signup = {};
            $scope.signup.detailsStructureCity = {};
            
            $scope.structure = {};
            $scope.newStructure = {};
            $scope.newStructure.address = {};
            
            $scope.temp = {};
            $scope.temp.detailsCountry = {};
            $scope.temp.createStructure = false;
            $scope.temp.referencialId = -1;
            
            $scope.temp.skipSportSection = true;
            
            $scope.creationFinished = false;

            var $inputDate = null;
            $timeout(function() {
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
        
            $log.debug('label', $scope.weekdaysLetter);
                $inputDate = $('#signupBirthdate').pickadate({
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
            }, 500);
                        
           signupRestAPI.firstConnectionCheck($routeParams.id, $routeParams.code).success(function (data) {
                if (true === data.error) {
                    $rootScope.messageErreur = data.message;
                    $location.path('/signup/error');
                } else {
                    $scope.signup = data;
                    if($scope.signup.birthdate!=null && $scope.signup.birthdate!=0) {
                    	$scope.signup.birthdateInput = new Date(moment($scope.signup.birthdate));
                    }
                    $scope.signup.categoryAge = '';
                    
                    $scope.valuesStructures = [{
                    	'_id': -1, 
                    	label: $filter('translate')('structureSection.list.empty'),
                    	address: ''}];
                    
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
                if (angular.isUndefined($scope.signup.birthdateInput) || $scope.signup.birthdateInput === null || $scope.signup.birthdateInput === 0) {
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
                	$scope.signup.birthdate = Date.parse($scope.signup.birthdateInput);
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

            // Change city name and reset structure
            $scope.resetStructure = function() {
            	$scope.valuesStructures = [{
                    _id: -1,
                    label: $filter('translate')('structureSection.list.empty'),
                    address: ''
                }];
                $scope.isStructureCityChanged = false;
                $scope.isStructureReload = true;
                $scope.temp.zipcode = '';
                $scope.temp.referencialId = -1;
                $scope.temp = {};
                $scope.newStructure = {};
            }
            
            // Surveillance de la modification du retour de l'API Google sur l'adresse
            $scope.$watch('signup.detailsStructureCity', function(newValue, oldValue) {
            	if(angular.isUndefined(newValue) || newValue==='' || angular.equals({}, newValue)) {
            		return;
            	}
            	//place_changed
            	$scope.loadStructures();
            });

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
                    	
                    	// Recherche du pays et liste des category age
                    	countryRestAPI.getAlpha2($scope.temp.countryAlpha2).success(function (data) {
                    		activityCfgRestAPI.getParamFieldList(moment().valueOf(), $scope.signup.account.listPlan[0].activity._id, data._id,'listCategoryAge').success(function (data2) {
                    			$scope.categoryAgeResult = data2;
                    			$scope.valuesCategoryAge = [];
                    			
                    			var dataSort = data2.sortBy(function(o) {
                                	return -1 * o.order;
                                });

                    			dataSort.forEach(function(i) {
                    				var tempAge = '';
                    				if(i.ageMax > 80) {
                    					tempAge = i.ageMin + '+';
                    				} else if(i.ageMin===i.ageMax) {
                    					tempAge = i.ageMin;
                    				} else {
                    					tempAge = i.ageMin + '/' + i.ageMax;
                    				}
                    				
                                    $scope.valuesCategoryAge.push({
                                        _id: i.code,
                                        label: i.label + ' (' + tempAge + ')'
                                    });
                                });
                    			$scope.signup.categoryAge = '';
                    		});
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
                        }).error(function (data) {
                        	
                        });
                    	
                    });
                    
                }
            };

            // Puts structure selected in a hidden input 
            $scope.applyChangeStructure = function () {
                $scope.structure.referencialId = $window.document.getElementById('userStructureSelect').value;
                $scope.temp.referencialId = $scope.structure.referencialId;
                
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
                		toastr.warning($filter('translate')('structureSection.ph.createLabelMandatory'));
                        validateOk = false;
                	}
                	if(angular.isUndefined($scope.newStructure.address.place) || $scope.newStructure.address.place===null || $scope.newStructure.address.place==='') {
                		toastr.warning($filter('translate')('structureSection.ph.createAddressMandatory'));
                        validateOk = false;
                	}
                }
                
                if($scope.signup.categoryAge===null || $scope.signup.categoryAge==='') {
                	toastr.warning('category age nécessaire');
                    validateOk = false;
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
                // Récupération CategoryAge
                var catAge = {};
                if(!angular.isUndefined($scope.categoryAgeResult)) {
	                $scope.categoryAgeResult.forEach(function(item) {
	                	if(item.code===$scope.signup.categoryAge._id) {
	                		catAge = item;
	                	}
	                });
                }
                
                // Ouverture Modal creation compte
                $scope.openModalCreate();

                signupRestAPI.finalizeSignup(user, $routeParams.code, $scope.structure, $scope.signup.account.listPlan[0].activity._id, catAge).success(function (data) {
                    if (false === data.status) {
                        toastr.error('Pb');
                    } else {
                    	$scope.creationFinished = true;
                    }
                }).error(function (data) {
                	$('#modalCreate').closeModal();
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
            
            $scope.owlOptions = {
        			items : 1,
        			loop : false,
        			mouseDrag : false,
        			touchDrag : false,
        			pullDrag : false,
        			freeDrag : false,
        			dots : false,
        			autoplay : true,
        			autoplaySpeed : 1500,
        			autoplayTimeout : 1500,
        			animateIn : 'rotateInDownLeft',
        			animateOut : 'rotateOutDownLeft',
        			onTranslated : nextStep
        	};
        	
        	$scope.openModalCreate = function () {
        		$('#modalCreate').openModal({dismissible: false});
        		$('.owl-carousel').owlCarousel($scope.owlOptions);
        	};
        	
        	function nextStep(event) {
        	    if (event.item.count === event.item.index + 1) {
        	    	while(!$scope.creationFinished) {
        	    		// Attente fin de la création en base Mongo
        	    	}
        	    	$('#modalCreate').closeModal();
        	    	$window.location.href = '/#/signup/end';
        	    }
        	}

        })

        .controller('SignupEndCtrl', function ($scope, $rootScope, $translatePartialLoader, $location) {
            $translatePartialLoader.addPart('user');

            $rootScope.user = $scope.signup;
            $scope.user = $scope.signup;
            
            $scope.goHome = function () {
                $location.path('/private');
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

