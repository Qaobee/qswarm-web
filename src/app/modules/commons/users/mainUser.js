(function () {
    'use strict';
    
    angular.module('qaobee.user', [
        /* angular qaobee */
        'ngAutocomplete',
        
        /* qaobee modules */
        /*'qaobee.signup',*/
        
        /* qaobee Rest API */
        'activityRestAPI',
        'structureRestAPI',
        'signupRestAPI'
        ])


        .config(function ($routeProvider) {
            $routeProvider.when('/signup/:id/:code?', {
                controller: 'SignupCtrl',
                templateUrl: 'app/modules/commons/users/signup/signup.html'
            });
        })

        .controller('SignupCtrl', function ($scope, $translatePartialLoader, $log, $routeParams, $window, $filter, WizardHandler, activityRestAPI, structureRestAPI, signupRestAPI) {
            $translatePartialLoader.addPart('user');
            $translatePartialLoader.addPart('commons');
            
            $scope.isStructureCityChanged = false;
            $scope.isStructureReload = false;
            $scope.valuesStructures = [{_id : -1, label : 'Aucune donnée trouvée', address:''}];
                       
            signupRestAPI.firstConnectionCheck($routeParams.id, $routeParams.code).success(function(data) {
            	if (false === data.status) {           		
            		toastr.error('Pb');
            	} else {
            		$scope.signup = data;
            	}
            }).error(function(data) {
//            	$location.path() = 'app/modules/commons/users/signup/signupDone.html';
        		toastr.error(data.message);
            });
            
            
            $scope.activities = Array.create();
            
            activityRestAPI.getListActive().success(function (data) {
                $scope.activities = data.sortBy(function(n) {
                    return n.label; 
                });
            });
            
            /* Validate userCivilSection */
            $scope.validateUserCivilSection = function() {
            	var validateOk = true;
            	if($scope.signup.gender===null) {
            		toastr.warning($filter('translate')('civilSection.ph.genderMandatory'));
            		validateOk = false;
            	}
            	if($scope.signup.birthdate===null || $scope.signup.birthdate===0) {
            		toastr.warning($filter('translate')('civilSection.ph.birthdateMandatory'));
            		validateOk = false;
            	}
            	if(($scope.signup.contact.home===null || $scope.signup.contact.home==='') && 
            			($scope.signup.contact.office===null || $scope.signup.contact.office==='') && 
            			($scope.signup.contact.cellphone===null || $scope.signup.contact.cellphone==='')) {
            		toastr.warning($filter('translate')('civilSection.ph.phoneNumberMandatory'));
            		validateOk = false;
            	}
            	
            	if(validateOk) {
            		WizardHandler.wizard().next();
            	}
            }
            
            /* Validate sportSection */
            $scope.validateSportSection = function() {
            	var validateOk = true;
            	if(angular.isUndefined($scope.signup.activity) || $scope.signup.activity===null) {
            		toastr.warning($filter('translate')('sportSection.ph.sportMandatory'));
            		validateOk = false;
            	}
            	if(validateOk) {
            		WizardHandler.wizard().next();
            	}
            }
            
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
            $scope.changeCityName = function() {
            	$scope.isStructureCityChanged = true
            };
            
            // User blurs city name input
            $scope.resetStructure = function() {
            	if($scope.isStructureCityChanged) {
            		$scope.valuesStructures = [{_id : -1, label : 'Aucune donnée trouvée', address:''}];
            		$scope.isStructureCityChanged = false;
            		$scope.isStructureReload = true;
            	}
            };
            
            // Update structure list
            $scope.loadStructures = function() {
            	if($scope.isStructureReload) {
            		$scope.isStructureReload = false;

            		var addressCity = $scope.signup.detailsStructureCity.name;
            		
            		structureRestAPI.getList($scope.signup.activity, 'CNTR-250-FR-FRA', addressCity).success(function(data) {
                    	$scope.valuesStructures = [];
                    	$scope.structure2 = "";
                    	if(data.status===false) {
                    		$scope.valuesStructures = [{_id : -2, label : 'Aucune donnée trouvée', address:''}];
                    	} else {
                    		if(data.length > 0) {
                    			$scope.structuresResult = data;
	                    		for(var i in data) {
	                        		$scope.valuesStructures.push({_id : data[i]._id, label : data[i].label, address: ' (' + data[i].address.place + ')'});
	                        	}
                    		} else {
                    			$scope.valuesStructures = [{_id : -3, label : 'Aucune donnée trouvée', address:''}];
                    		}
                    	}
                    });
            	}
            };

            // Puts structure selected in a hidden input 
            $scope.applyChangeStructure = function() {
            	if(angular.isUndefined($scope.structure)) {
            		$scope.structure = new Object();
            	}
            	$scope.structure.referencialId = $window.document.getElementById('userStructureSelect').value;
            };
            
            /* Validate structureSection */
            $scope.validateStructureSection = function() {
            	var validateOk = true;
            	
            	if(angular.isUndefined($scope.structure2) || $scope.structure2 < 0) {
            		toastr.warning($filter('translate')('structureSection.ph.structureMandatory'));
            		validateOk = false;
            	}
            	
            	if(validateOk) {
            		WizardHandler.wizard().next();
            	}
            }
            
            /* Creates sandbox */
            $scope.createSandBox = function() {
            	$log.debug($scope.signup);
            	$log.debug($scope.structure);
            	$log.debug($scope.signup.activity);
            	var user = $scope.signup;
            	delete(user.detailsStructureCity);
            	
            	signupRestAPI.finalizeSignup(user, $routeParams.code, $scope.structure, $scope.signup.activity).success(function(data) {
            		if (false === data.status) {
            			$log.debug(data);
                		toastr.error('Pb');
                	} else {
                		toastr.info('Compte créé');
                	}
            	}).error(function(data) {
//                	$location.path() = 'app/modules/commons/users/signup/signupDone.html';
            		toastr.error(data.message);
                });
            };
            
        });
}());

