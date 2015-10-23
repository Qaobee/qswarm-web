(function () {
    'use strict';

    angular.module('qaobee.test.adminUser', [
        /* angular qaobee */

        /* qaobee modules */

        /* qaobee Rest API */
        'userRestAPI',
        'sandboxRestAPI',
        'sandboxCfgRestAPI',
        'personRestAPI',
        'effectiveRestAPI',
        'teamRestAPI'
    ])
    
    .config(function ($routeProvider) {
        $routeProvider.when('/test/adminUser/get/:id?', {
            controller: 'adminUserCtrl',
            templateUrl: 'app/modules/test/admin/adminUser.html'
        });
    })
    
    .controller('adminUserCtrl', function ($scope, $routeParams, $log, userRestAPI, sandboxRestAPI, sandboxCfgRestAPI, personRestAPI, effectiveRestAPI, teamRestAPI){
    	// Recherche du User
    	userRestAPI.getUserById($routeParams.id).success(function (data) {
            if (true === data.error) {
            	toastr.error(data);
            } else {
                $scope.user = data;
                if(!($scope.user.account.listPlan===null)) {
                	$scope.currentPlan = $scope.user.account.listPlan[0];
                	$scope.planSelected = $scope.user.account.listPlan[0];
                }
                // Recherche SandBox
                $scope.searchSandbox($scope.user);
            }
        }).error(function (error) {
            if (error != null) {
            	toastr.error(error);
            } else {
            	toastr.error('Problème getUserById');
            }
        });
    	
    	
    	$scope.searchSandbox = function(userObj) {
    		$scope.sandboxes = [];
    		$scope.currentSB = {};
    		sandboxRestAPI.getListByOwner($scope.user._id).success(function (data) {
                if (true === data.error) {
                	toastr.error(data);
                } else {
                    $scope.sandboxes = data;
                    $scope.currentSB = $scope.sandboxes[0];
                    $scope.sandboxSelected = $scope.currentSB;
                    
                    // Recherche de SandBoxCfg
                    $scope.searchSandboxCfg($scope.currentSB);
                    // Recherche de SB_Personn
                    $scope.searchSandboxPerson($scope.currentSB);
                }
            }).error(function (error) {
                if (error != null) {
                	toastr.error(error);
                } else {
                	toastr.error('Problème getListByOwner');
                }
            });
    	}
    	
    	$scope.searchSandboxCfg = function(sandboxObj) {
    		sandboxCfgRestAPI.getList($scope.currentSB._id,'').success(function (data3) {
                if (true === data3.error) {
                	toastr.error(data3);
                } else {
                	$scope.sandboxCfgs = data3;
                	$scope.currentSBCfg = $scope.sandboxCfgs[0];
                	$scope.sandboxCfgSelected = $scope.currentSBCfg;
                	
                	// Recherche effective
                	$scope.searchSandboxEffective($scope.currentSBCfg);
                }
            }).error(function (error) {
                if (error != null) {
                	toastr.error(error);
                } else {
                	toastr.error('Problème getList');
                }
            });
    	};
    	
    	$scope.searchSandboxPerson = function(sandboxObj) {
    		$scope.SBPersons = [];
    		personRestAPI.getListPersonSandbox(sandboxObj._id).success(function (data) {
                if (true === data.error) {
                	toastr.error(data);
                } else {
                	$scope.SBPersons = data;
                }
            }).error(function (error) {
                if (error != null) {
                	toastr.error(error);
                } else {
                	toastr.error('Problème getListPersonSandbox');
                }
            });
    	};
    	
    	$scope.searchSandboxEffective = function(sandboxCfgObj) {
    		effectiveRestAPI.getListMemberEffective(sandboxCfgObj._id, null).success(function (data) {
                if (true === data.error) {
                	toastr.error(data);
                } else {
                	$scope.SBListEffectives = data;
                	$scope.currentSBEffective = $scope.SBListEffectives[0];
                	$scope.sandboxEffectiveSelected = $scope.currentSBEffective;
                	
                	// Recherche Teams
                	$scope.searchSandboxTeam(sandboxCfgObj, $scope.currentSBEffective);
                }
            }).error(function (error) {
                if (error != null) {
                	toastr.error(error);
                } else {
                	toastr.error('Problème getListMemberEffective');
                }
            });
    	};
    	
    	$scope.searchSandboxTeam = function(sandboxCfgObj, effectiveObj) {
    		$scope.SBListTeams = [];
    		teamRestAPI.getListTeam(sandboxCfgObj.sandbox._id, effectiveObj._id, 'all', false).success(function (data) {
                if (true === data.error) {
                	toastr.error(data);
                } else {
                	data.forEach(function(element){
                		$scope.SBListTeams.push(element);
                	});
                }
            }).error(function (error) {
                if (error != null) {
                	toastr.error(error);
                } else {
                	toastr.error('Problème getListTeam - all / false');
                }
            });
    		
    		teamRestAPI.getListTeam(sandboxCfgObj.sandbox._id, effectiveObj._id, 'all', true).success(function (data) {
                if (true === data.error) {
                	toastr.error(data);
                } else {
                	data.forEach(function(element){
                		$scope.SBListTeams.push(element);
                	});
                }
            }).error(function (error) {
                if (error != null) {
                	toastr.error(error);
                } else {
                	toastr.error('Problème getListTeam - all / false');
                }
            });
    	};
    	
    	$scope.changePlan = function() {
    		$scope.currentPlan = $scope.planSelected;
    	};
    	
    	$scope.changeSandbox = function() {
    		$scope.currentSB = $scope.sandboxSelected;
    		$scope.searchSandboxCfg($scope.currentSB);
    		$scope.searchSandboxPerson($scope.currentSB);
    	};
    	
    	$scope.changeSandboxCfg =function() {
    		$scope.currentSBCfg = $scope.sandboxCfgSelected;
    	}
    });
    
}());