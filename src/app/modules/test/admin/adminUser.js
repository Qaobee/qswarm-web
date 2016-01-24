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
        })
        .when('/test/adminUser/getLogin/:login?', {
            controller: 'adminUserLoginCtrl',
            templateUrl: 'app/modules/test/admin/adminUser.html'
        });
    })
    
    .controller('adminUserLoginCtrl', function ($scope, $routeParams, $log, $location, userRestAPI){
    	var userLogin = $routeParams.login;
    	$log.debug("Recherche user : " + userLogin);
    	// Recherche du User
    	userRestAPI.getUserByLogin(userLogin).success(function (data) {
    		$log.debug(data);
            if (true === data.error) {
            	toastr.error(data.message);
            } else {
                $location.path('/test/adminUser/get/' + data._id);
            }
        }).error(function (error) {
            if (error != null) {
            	toastr.error(error.message);
            } else {
            	toastr.error('Problème getUserByLogin');
            }
        });
    })
    
    .controller('adminUserCtrl', function ($scope, $routeParams, $log, userRestAPI, sandboxRestAPI, sandboxCfgRestAPI, personRestAPI, effectiveRestAPI, teamRestAPI){
    	$scope.user = {};
    	$scope.currentPlan = {};
    	$scope.planSelected = {};
    	
    	$scope.searchUser = function(userId) {
    		// User
    		$scope.user = {};
    		// SB
    		$scope.sandboxes = [];
    		$scope.currentSB = {};
    		$scope.sandboxSelected = {};
    		// SB Cfg
    		$scope.sandboxCfgs = [];
    		$scope.currentSBCfg = {};
    		$scope.sandboxCfgSelected = {};
    		// SB Person
    		$scope.SBPersons = [];
    		// SB Effective
    		$scope.SBListEffectives = [];
    		$scope.currentSBEffective = {};
    		$scope.sandboxEffectiveSelected = {};
    		// SB Team
    		$scope.SBListTeams = [];
    		
    		
	    	// Recherche du User
	    	userRestAPI.getUserById(userId).success(function (data) {
	            if (true === data.error) {
	            	toastr.error(data.message);
	            } else {
	                $scope.user = data;
	                toastr.info('User refreshed');
	                if(!($scope.user.account.listPlan===null)) {
	                	$scope.currentPlan = $scope.user.account.listPlan[0];
	                	$scope.planSelected = $scope.user.account.listPlan[0];
	                }
	                // Recherche SandBox
	                $scope.searchSandbox($scope.user);
	            }
	        }).error(function (error) {
	            if (error != null) {
	            	toastr.error(error.message);
	            } else {
	            	toastr.error('Problème getUserById');
	            }
	        });
    	};
    	
    	$scope.searchUser($routeParams.id);
    	
    	$scope.searchSandbox = function(userObj) {
    		$scope.sandboxes = [];
    		$scope.currentSB = {};
    		$scope.sandboxSelected = {};
    		sandboxRestAPI.getListByOwner($scope.user._id).success(function (data) {
                if (true === data.error) {
                	toastr.error(data.message);
                } else {
                    $scope.sandboxes = data;
                    $scope.currentSB = $scope.sandboxes[0];
                    $scope.sandboxSelected = $scope.currentSB;
                    
                    toastr.info('Sandboxes refreshed');
                    
                    // Recherche de SandBoxCfg
                    $scope.searchSandboxCfg($scope.currentSB);
                    // Recherche de SB_Personn
                    $scope.searchSandboxPerson($scope.currentSB);
                }
            }).error(function (error) {
                if (error != null) {
                	toastr.error(error.message);
                } else {
                	toastr.error('Problème getListByOwner');
                }
            });
    	};
    	
    	$scope.searchSandboxCfg = function(sandboxObj) {
    		$scope.sandboxCfgs = [];
    		$scope.currentSBCfg = {};
    		$scope.sandboxCfgSelected = {};
    		sandboxCfgRestAPI.getList($scope.currentSB._id,'').success(function (data) {
                if (true === data.error) {
                	toastr.error(data.message);
                } else {
                	$scope.sandboxCfgs = data;
                	$scope.currentSBCfg = $scope.sandboxCfgs[0];
                	$scope.sandboxCfgSelected = $scope.currentSBCfg;
                	
                	toastr.info('Sandbox Cfg refreshed');
                	
                	// Recherche effective
                	$scope.searchSandboxEffective($scope.currentSBCfg);
                }
            }).error(function (error) {
                if (error != null) {
                	toastr.error(error.message);
                } else {
                	toastr.error('Problème getList');
                }
            });
    	};
    	
    	$scope.searchSandboxPerson = function(sandboxObj) {
    		$scope.SBPersons = [];
    		personRestAPI.getListPersonSandbox(sandboxObj._id).success(function (data) {
                if (true === data.error) {
                	toastr.error(data.message);
                } else {
                	$scope.SBPersons = data;
                	toastr.info('Sandbox Person refreshed');
                }
            }).error(function (error) {
                if (error != null) {
                	toastr.error(error.message);
                } else {
                	toastr.error('Problème getListPersonSandbox');
                }
            });
    	};
    	
    	$scope.searchSandboxEffective = function(sandboxCfgObj) {
    		$scope.SBListEffectives = [];
    		$scope.currentSBEffective = {};
    		$scope.sandboxEffectiveSelected = {};
    		
    		effectiveRestAPI.getListEffective(sandboxCfgObj._id, null).success(function (data) {
                if (true === data.error) {
                	toastr.error(data.message);
                } else {
                	$scope.SBListEffectives = data;
                	$scope.currentSBEffective = $scope.SBListEffectives[0];
                	$scope.sandboxEffectiveSelected = $scope.currentSBEffective;
                	
                	toastr.info('Sandbox Effectives refreshed');
                	
                	// Recherche Teams
                	$scope.searchSandboxTeam(sandboxCfgObj, $scope.currentSBEffective);
                }
            }).error(function (error) {
                if (error != null) {
                	toastr.error(error.message);
                } else {
                	toastr.error('Problème getListMemberEffective');
                }
            });
    	};
    	
    	$scope.searchSandboxTeam = function(sandboxCfgObj, effectiveObj) {
    		$scope.SBListTeams = [];
    		teamRestAPI.getListTeamHome(sandboxCfgObj.sandbox._id, effectiveObj._id, 'all').success(function (data) {
                if (true === data.error) {
                	toastr.error(data.message);
                } else {
                	var dataSort =  data.sortBy(function(o) {
                    	return o.label;
                    });
                	dataSort.forEach(function(element){
                		$scope.SBListTeams.push(element);
                		
                		teamRestAPI.getListTeamAdversary(sandboxCfgObj.sandbox._id, effectiveObj._id, 'all', element._id).success(function (data2) {
                            if (true === data2.error) {
                            	toastr.error(data2.message);
                            } else {
                            	var dataSort2 = data2.sortBy(function(o) {
                                	return o.label;
                                });
                            	dataSort2.forEach(function(element2){
                            		$scope.SBListTeams.push(element2);
                            	});
                            }
                        }).error(function (error) {
                            if (error != null) {
                            	toastr.error(error.message);
                            } else {
                            	toastr.error('Problème getListTeam - all / false');
                            }
                        });
                		
                	});
                	toastr.info('Sandbox Team refreshed');
                }
            }).error(function (error) {
                if (error != null) {
                	toastr.error(error.message);
                } else {
                	toastr.error('Problème getListTeam - all / false');
                }
            });
    		
    		
    	};
    	
    	$scope.refreshUser = function() {
    		$scope.searchUser($scope.user._id);
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