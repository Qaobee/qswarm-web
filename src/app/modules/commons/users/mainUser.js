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
            $routeProvider.when('/signup/:id/:captcha?', {
                controller: 'SignupCtrl',
                templateUrl: 'app/modules/commons/users/signup/signup.html'
            });
        })

        .controller('SignupCtrl', function ($scope, $translatePartialLoader, $log, $routeParams, $window, activityRestAPI, structureRestAPI, signupRestAPI) {
            $translatePartialLoader.addPart('user');
            $translatePartialLoader.addPart('commons');
            
            $scope.isStructureCityChanged = false;
            $scope.isStructureReload = false;
            $scope.valuesStructures = [{_id : -1, label : 'Aucune donnée trouvée', address:''}];
                       
            signupRestAPI.finalizeSignup($routeParams.id, $routeParams.captcha).success(function(data) {
            	$log.debug(data);
            	if (false === data.status) {
            		toastr.error('Pb');
            	} else {
            		$scope.signup = data;
            	}
            });
            
            
            $scope.activities = Array.create();
            
            activityRestAPI.getListActive().success(function (data) {
                $log.debug(data);
                $scope.activities = data.sortBy(function(n) {
                    return n.label; 
                });
            });
            
            
            $scope.changeCityName = function() {
            	$scope.isStructureCityChanged = true
            };
            
            $scope.resetStructure = function() {
            	if($scope.isStructureCityChanged) {
            		$scope.signup.structure = "";
            		$scope.isStructureCityChanged = false;
            		$scope.isStructureReload = true;
            	}
            };
            
            $scope.loadStructures = function() {
            	if($scope.isStructureReload) {
            		$scope.signup.structure = "ca blur";
            		
            		$log.debug($scope.signup.detailsStructureCity);
            		var addressCity = $scope.signup.detailsStructureCity.name;
            		
            		structureRestAPI.getList($scope.signup.activity, 'CNTR-250-FR-FRA', addressCity).success(function(data) {
                    	$scope.valuesStructures = [];
                    	$scope.signup.structure2 = "";
                    	if(data.status===false) {
                    		$scope.valuesStructures = [{_id : -2, label : 'Aucune donnée trouvée', address:''}];
                    	} else {
                    		if(data.length > 0) {
	                    		for(var i in data) {
	                        		$scope.valuesStructures.push({_id : data[i]._id, label : data[i].label, address: ' (' + data[i].address.place + ')'});
	                        	}
                    		} else {
                    			$scope.valuesStructures = [{_id : -3, label : 'Aucune donnée trouvée', address:''}];
                    		}
                    	}
                    	
                    });

            		
            		$scope.isStructureReload = false;
            	}
            };
            
            $scope.applyChangeStructure = function() {
            	$log.debug($scope.signup.structureTruc);
            	$log.debug($window.document.getElementById('userStructureSelect').value);
            	$scope.signup.structure2 = $window.document.getElementById('userStructureSelect').value;
            };
            
            $scope.createSandBox = function() {
            	$log.debug($scope.signup);
            };
            
        });
}());

